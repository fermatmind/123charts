import json
import unittest
import tempfile
from pathlib import Path
from unittest.mock import patch
import common
from collect_software import detail, listings, materialize
from import_browser_research import parse_browser


def excerpt(pattern, lines):
    return ('Example Desk - Features & Pricing (October 2026) '
            '(https://www.saasworthy.com/product/example-desk)\n'
            '[wordlim: 200] Source: find(' + json.dumps({"ref_id": "https://www.saasworthy.com/product/example-desk", "pattern": pattern}) + '); Total lines: 1000\n'
            + '\n'.join(f'L{n}: {value}' for n, value in lines))


class CatalogTests(unittest.TestCase):
    def test_bulk_rebuild_preserves_authored_research_before_any_write(self):
        with tempfile.TemporaryDirectory() as folder:
            data = Path(folder)
            record = data / "projects/automation/tool.json"
            record.parent.mkdir(parents=True)
            original = '{"research_status":"primary_source_researched","description_en":"Authored content"}'
            record.write_text(original)
            with patch.object(common, "DATA", data), patch.object(common, "domain_identities") as identities:
                with self.assertRaisesRegex(ValueError, "overwrite or remove authored research"):
                    materialize([], [], 0, partial=True)
                identities.assert_not_called()
            self.assertEqual(record.read_text(), original)
            self.assertEqual(list(data.rglob("*.json")), [record])

    def test_tracker_and_private_urls_are_not_project_websites(self):
        for url in ["https://aixploria.com/out/Test", "https://127.0.0.1/", "https://example.internal/", "https://user:pass@public.org/", "https://bit.ly/test"]:
            with self.subTest(url=url), self.assertRaises(ValueError):
                common.clean_url(url)
        self.assertEqual(common.clean_url("https://www.public.org/product?utm_source=directory&view=team#top"),
                         "https://www.public.org/product?view=team")

    def test_discontinuous_excerpts_do_not_turn_alternatives_into_features(self):
        text = excerpt("offers the following functionalities", [(100, "Example Desk offers the following functionalities:")])
        text += '\n' + '-' * 80 + '\n' + excerpt("Contact Details", [
            (500, "* Another Product"), (501, "Learn more about Example Desk features."),
            (502, "## Example Desk Contact"), (503, "Contact Details"), (504, "https://public.org/")])
        rows, errors = parse_browser(text)
        self.assertFalse(errors)
        self.assertEqual(rows[0]["features"], ["Another Product"])
        # Without an explicit feature-list terminator, alternatives cannot be
        # inferred from the disconnected opening sentence.
        rows, _ = parse_browser(text.replace("Learn more about Example Desk features.", "Here is another product."))
        self.assertEqual(rows[0]["features"], [])

    def test_empty_feature_list_does_not_consume_pricing_or_alternatives(self):
        text = excerpt("offers the following functionalities", [
            (100, "Example Desk offers the following functionalities:"),
            (101, ""), (102, "What are the top alternatives?"),
            (103, "* Other Desk"), (104, "## Contact"),
            (105, "Contact Details"), (106, "https://public.org/")])
        rows, errors = parse_browser(text)
        self.assertFalse(errors)
        self.assertEqual(rows[0]["name"], "Example Desk")
        self.assertEqual(rows[0]["features"], [])

    def test_complete_technical_and_feature_sections_stay_separate(self):
        text = excerpt("offers the following functionalities", [
            (100, "Example Desk offers the following functionalities:"), (101, ""),
            (102, "* Ticket Management"), (103, "* Knowledge Base"),
            (104, "Learn more about Example Desk features."),
            (105, "Platforms Supported"), (106, ""), (107, "* Browser Based (Cloud)"),
            (108, "API Support"), (109, ""), (110, "* Available"),
            (111, "## Contact"), (112, "Contact Details"), (113, "https://public.org/"),
            (114, "Social Media Handles"), (115, "https://facebook.com/example")])
        rows, _ = parse_browser(text)
        self.assertEqual(rows[0]["features"], ["Ticket Management", "Knowledge Base"])
        self.assertEqual(rows[0]["technical"]["API Support"], "Available")
        self.assertEqual(rows[0]["website_url"], "https://public.org/")

    def test_missing_official_url_does_not_use_social_profile(self):
        text = excerpt("Contact Details", [(100, "Contact Details"), (101, "Not available"),
                                           (102, "Social Media Handles"), (103, "https://facebook.com/example")])
        rows, errors = parse_browser(text)
        self.assertEqual(rows, [])
        self.assertTrue(errors)

    def test_second_listing_page_ignores_sidebar_and_pricing_links(self):
        body = '<a href="https://www.saasworthy.com/product/sidebar">Sidebar</a><div id="products"><div class="list-results-sec"><a href="https://www.saasworthy.com/product/example-desk">Desk</a><a href="https://www.saasworthy.com/product/example-desk/pricing">Price</a></div></div>'
        self.assertEqual(listings(body), ["https://www.saasworthy.com/product/example-desk"])


if __name__ == "__main__":
    unittest.main()
