"""IndexNow safety checks: never notify an unpublished deployment or foreign URL."""
import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('indexnow', Path(__file__).resolve().parents[1] / '.github/scripts/indexnow.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class IndexNowTests(unittest.TestCase):
    def test_only_own_clean_canonical_urls(self):
        for url in ['https://foreign.example/', 'http://easy-asylum.com/', 'https://easy-asylum.com/?private=1', 'https://easy-asylum.com/#fragment']:
            self.assertIsNone(module.canonical(f'<link rel="canonical" href="{url}">'))
        self.assertEqual(module.canonical('<link rel="canonical" href="https://easy-asylum.com/stati/">'), module.ORIGIN + '/stati/')

    def test_added_changed_and_deleted_pages_are_selected_once(self):
        def fake_git(*args):
            if args[0] == 'diff': return 'new/index.html\nremoved/index.html\nanalytics.js\n'
            if args[1] == 'old:removed/index.html': return '<link rel="canonical" href="https://easy-asylum.com/removed/">'
            if args[1] == 'new:new/index.html': return '<link rel="canonical" href="https://easy-asylum.com/new/">'
            return ''
        with patch.object(module, 'git', side_effect=fake_git):
            self.assertEqual(module.select_urls('old', 'new'), [module.ORIGIN + '/new/', module.ORIGIN + '/removed/'])

    def test_shared_styles_trigger_full_canonical_batch(self):
        with patch.object(module, 'git', return_value='relocation.css\n'), patch.object(module, 'sitemap_urls', return_value=['one']):
            self.assertEqual(module.select_urls('old', 'new'), ['one'])

    def test_production_guard_requires_correct_key_and_exact_new_content(self):
        key = (module.ROOT / module.KEY_FILE).read_bytes()
        page = module.ORIGIN + '/stati/'
        current = module.expected_page(page)
        def get(url): return (200, key if url.endswith('.txt') else current, url)
        self.assertTrue(module.production_matches([page], get))
        self.assertFalse(module.production_matches([page], lambda u: (200, b'old production', u)))
        self.assertFalse(module.production_matches([page], lambda u: (200, key if u.endswith('.txt') else b'old html', u)))
        self.assertFalse(module.production_matches([page], lambda u: (200, key if u.endswith('.txt') else current, module.ORIGIN + '/unexpected/')))

    def test_removed_page_must_really_be_removed(self):
        key = (module.ROOT / module.KEY_FILE).read_bytes()
        removed = module.ORIGIN + '/does-not-exist/'
        self.assertTrue(module.production_matches([removed], lambda u: (200, key, u) if u.endswith('.txt') else (404, b'', u)))
        self.assertFalse(module.production_matches([removed], lambda u: (200, key, u)))

    def test_response_202_is_preserved_as_pending_and_invalid_batches_never_sent(self):
        class Response:
            status = 202
            def __enter__(self): return self
            def __exit__(self, *args): pass
        with patch.object(module, 'urlopen', return_value=Response()) as send:
            self.assertEqual(module.submit([module.ORIGIN + '/']), 202)
            payload = send.call_args.args[0].data.decode()
            self.assertIn('"keyLocation"', payload)
        with patch.object(module, 'urlopen') as send:
            with self.assertRaises(ValueError): module.submit(['https://foreign.example/'])
            send.assert_not_called()

if __name__ == '__main__': unittest.main()
