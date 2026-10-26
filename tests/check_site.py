"""Validate crawlable pages, metadata, assets and navigation without dependencies."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import xml.etree.ElementTree as ET

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags, self.ids, self.json_text = [], set(), None
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, ('duplicate id', attrs['id'])
            self.ids.add(attrs['id'])
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.json_text = ''
    def handle_data(self, text):
        if self.json_text is not None:
            self.json_text += text
    def handle_endtag(self, tag):
        if tag == 'script' and self.json_text is not None:
            json.loads(self.json_text)
            self.json_text = None

root = Path(__file__).resolve().parents[1]
pages, canonical_urls = {}, set()
for loc in ET.parse(root / 'sitemap.xml').findall('.//{*}loc'):
    assert loc.text not in canonical_urls, ('duplicate sitemap URL', loc.text)
    canonical_urls.add(loc.text)
    file = root / loc.text.removeprefix('https://easy-asylum.com/') / 'index.html'
    page = Page(file.read_text())
    pages[file.resolve()] = page
    assert sum(t == 'h1' for t, a in page.tags) == 1, file
    assert sum(t == 'script' and a.get('src') == '/analytics.js' for t, a in page.tags) == 1, file
    assert next(a['href'] for t, a in page.tags if t == 'link' and a.get('rel') == 'canonical') == loc.text, file
    assert any(t == 'meta' and a.get('name') == 'description' and a.get('content') for t, a in page.tags), file
errors = []
for file, page in pages.items():
    for tag, attrs in page.tags:
        if tag not in ('a', 'link', 'script'):
            continue
        url = urlsplit(attrs.get('href', attrs.get('src', '')))
        if url.scheme or url.netloc:
            continue
        path = unquote(url.path)
        target = (root / path.lstrip('/') if path.startswith('/') else file.parent / path).resolve() if path else file
        if target.is_dir():
            target /= 'index.html'
        if not target.exists():
            errors.append((str(file.relative_to(root)), 'missing file', path))
        elif url.fragment and target.suffix == '.html':
            target_page = pages.get(target) or Page(target.read_text())
            if unquote(url.fragment) not in target_page.ids:
                errors.append((str(file.relative_to(root)), 'missing anchor', path + '#' + url.fragment))
assert not errors, errors
home = pages[root / 'index.html']
assert {'contact-form', 'f-body', 'f-msg', 'f-email', 'burger', 'main-nav'} <= home.ids
assert len([t for t, a in home.tags if t == 'section']) == 7
print(f'{len(pages)} sitemap pages: metadata, JSON-LD, unique IDs, local files and anchor targets OK')

# Every self-canonical page, including destinations outside the sitemap, shares one theme.
shared_headers, shared_footers = {}, {}
count = 0
for file in root.rglob('index.html'):
    if 'untitled folder' in file.parts:
        continue
    text = file.read_text()
    page = Page(text)
    canonical = next((a.get('href') for t, a in page.tags if t == 'link' and a.get('rel') == 'canonical'), None)
    expected = 'https://easy-asylum.com/' + (str(file.parent.relative_to(root)) + '/' if file.parent != root else '')
    if canonical != expected:
        continue
    styles = [a.get('href') for t, a in page.tags if t == 'link' and a.get('rel') == 'stylesheet']
    assert styles.count('/relocation.css') == 1, file
    assert not any('style.css' in s for s in styles), file
    assert any(t == 'script' and a.get('src') == '/neon-motion.js' for t, a in page.tags), file
    import re
    header = re.search(r'<header\b.*?</header>', text, re.S)[0]
    footer = re.search(r'<footer\b.*?</footer>', text, re.S)[0]
    language = next(a.get('lang') for t, a in page.tags if t == 'html')
    # Only the homepage carries a current-page marker on the language switch.
    header = header.replace(' hreflang="ru" aria-current="page"', ' hreflang="ru"')
    # This service keeps the shared navigation but sends enquiries to its own form.
    if file.relative_to(root).as_posix() == 'green-card-2027/index.html':
        assert header.count('href="#dv-request"') == 2
        header = header.replace('href="#dv-request"', 'href="/#contact-form-heading"')
    shared_headers.setdefault(language, header)
    shared_footers.setdefault(language, footer)
    assert header == shared_headers[language] and footer == shared_footers[language], file
    count += 1
assert count >= len(pages)
print(f'{count} self-canonical pages use the same stylesheet, navigation, footer and motion module')

# Both homepages advertise reciprocal, crawlable language alternatives.
for path in ['index.html', 'en/index.html']:
    page = Page((root / path).read_text())
    alternates = {a.get('hreflang'): a.get('href') for t, a in page.tags if t == 'link' and a.get('rel') == 'alternate'}
    assert alternates == {'ru': 'https://easy-asylum.com/', 'en': 'https://easy-asylum.com/en/', 'x-default': 'https://easy-asylum.com/'}, path
print('Russian and English homepages have reciprocal language alternatives')
