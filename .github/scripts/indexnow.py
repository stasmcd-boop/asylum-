"""Notify IndexNow after production matches the committed content. No credentials needed."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import subprocess
import time
from urllib.error import HTTPError
from urllib.parse import urlsplit, urljoin
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
HOST = 'easy-asylum.com'
ORIGIN = 'https://' + HOST
KEY_FILE = '4de7d20ce4724ff19d0a79ce3b0d2026.txt'
ENDPOINT = 'https://yandex.com/indexnow'


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT).decode()


def canonical(html):
    match = re.search(r'<link\s+rel="canonical"\s+href="([^"]+)"', html)
    if not match:
        return None
    url = match[1]
    parts = urlsplit(url)
    if parts.scheme != 'https' or parts.netloc != HOST or parts.query or parts.fragment:
        return None
    return url


def sitemap_urls():
    return [node.text for node in ET.parse(ROOT / 'sitemap.xml').findall('.//{*}loc')]


def select_urls(before, after, all_urls=False):
    if all_urls or not before or set(before) == {'0'}:
        return sitemap_urls()
    changed = git('diff', '--name-only', '--no-renames', before, after).splitlines()
    # Bootstrap ownership once; shared resources can affect every crawlable page.
    shared = {'relocation.css', 'script.js', 'neon-motion.js', KEY_FILE, '.github/scripts/indexnow.py'}
    if shared.intersection(changed):
        return sitemap_urls()
    urls = set()
    for name in changed:
        if not name.endswith('.html'):
            continue
        for rev in (before, after):
            try:
                url = canonical(git('show', f'{rev}:{name}'))
            except subprocess.CalledProcessError:
                continue
            if url:
                urls.add(url)
    return sorted(urls)


def fetch(url):
    try:
        request = Request(url, headers={'User-Agent': 'EasyAsylum-DeploymentCheck/1.0'})
        with urlopen(request, timeout=20) as response:
            return response.status, response.read(), response.url
    except HTTPError as error:
        return error.code, b'', error.url


def expected_page(url):
    relative = urlsplit(url).path.lstrip('/')
    file = ROOT / relative / 'index.html'
    if file.exists() and canonical(file.read_text()) == url:
        return file.read_bytes()
    return None



def html_fingerprint(content, url):
    # Netlify Pretty URLs rewrites relative index.html links and attribute quotes.
    # Compare parsed content and normalized URLs, preserving text and script bodies.
    class Fingerprint(HTMLParser):
        def __init__(self):
            super().__init__(convert_charrefs=True)
            self.tokens = []
        def handle_starttag(self, tag, attrs):
            normalized = []
            for name, value in attrs:
                if value is not None and name in ('href', 'src', 'action'):
                    value = urljoin(url, value)
                    parts = urlsplit(value)
                    if parts.netloc == HOST and parts.path.endswith('/index.html'):
                        value = parts._replace(path=parts.path[:-10]).geturl()
                normalized.append((name, value))
            self.tokens.append(('start', tag, tuple(sorted(normalized))))
        def handle_startendtag(self, tag, attrs):
            self.handle_starttag(tag, attrs)
        def handle_endtag(self, tag):
            self.tokens.append(('end', tag))
        def handle_data(self, data):
            if data.strip():
                self.tokens.append(('text', data.strip()))
    parser = Fingerprint()
    parser.feed(content.decode('utf-8'))
    return parser.tokens


def production_matches(urls, get=fetch):
    key = (ROOT / KEY_FILE).read_bytes().strip()
    status, body, final = get(ORIGIN + '/' + KEY_FILE)
    if status != 200 or body.strip() != key or final != ORIGIN + '/' + KEY_FILE:
        return False
    def matches(url):
        expected = expected_page(url)
        status, body, final = get(url)
        if expected is None:  # Deleted or moved URL: confirm its removal is live.
            return status in (404, 410) or (status == 200 and final != url)
        return status == 200 and final == url and html_fingerprint(body, url) == html_fingerprint(expected, url)
    with ThreadPoolExecutor(max_workers=6) as pool:
        return all(pool.map(matches, urls))


def submit(urls):
    if not 0 < len(urls) <= 10000 or any(not u.startswith(ORIGIN + '/') for u in urls):
        raise ValueError('Invalid IndexNow URL batch')
    key = (ROOT / KEY_FILE).read_text().strip()
    payload = json.dumps({'host': HOST, 'key': key, 'keyLocation': ORIGIN + '/' + KEY_FILE, 'urlList': urls}).encode()
    request = Request(ENDPOINT, data=payload, headers={'Content-Type': 'application/json; charset=utf-8'}, method='POST')
    try:
        with urlopen(request, timeout=30) as response:
            code = response.status
    except HTTPError as error:
        raise RuntimeError(f'IndexNow returned HTTP {error.code}; no automatic resubmission.') from error
    if code not in (200, 202):
        raise RuntimeError(f'Unexpected IndexNow HTTP {code}')
    return code


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--before', default='')
    parser.add_argument('--after', default='HEAD')
    parser.add_argument('--all', action='store_true')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    urls = select_urls(args.before, args.after, args.all)
    if not urls:
        print('No changed canonical pages to notify.')
        return
    print('\n'.join(urls))
    if args.dry_run:
        return
    # Fail closed if Netlify has not published these exact files yet.
    deadline = time.monotonic() + 600
    while not production_matches(urls):
        if time.monotonic() > deadline:
            raise RuntimeError('Production does not match this commit; nothing submitted.')
        print('Waiting for production deployment...', flush=True)
        time.sleep(20)
    code = submit(urls)
    message = f'IndexNow: {len(urls)} URLs, HTTP {code}. ' + ('Received; indexing is not guaranteed.' if code == 200 else 'Received; key validation is pending. Indexing is not confirmed.')
    print(message)
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as report:
            report.write(message + '\n\n' + '\n'.join('- ' + url for url in urls) + '\n')


if __name__ == '__main__':
    main()
