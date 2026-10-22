#!/usr/bin/env python3
"""Parse cached public-web research excerpts without fetching any network data."""
import argparse
import hashlib
import json
import re
from pathlib import Path
import common as c
from collect_software import materialize


def unmark(text):
    return re.sub(r"【\d+†([^†】]+)(?:†[^】]+)?】", r"\1", text).strip()


def parse_browser(text):
    groups = {}
    for part in re.split(r"-{30,}\s*", text):
        found = re.search(r"\((https://www\.saasworthy\.com/product/[a-zA-Z0-9_-]+)\)\n", part)
        if not found:
            continue
        url = found.group(1)
        title = part.splitlines()[0]
        name = re.split(r"\s+-\s+Features|\s+Features[, &]|\s+-\s+Reviews", title, maxsplit=1)[0].strip()
        group = groups.setdefault(url, {"lines": {}, "name": name, "source_chunks": []})
        group["source_chunks"].append(part)
        for number, value in re.findall(r"^L(\d+): ?(.*)$", part, re.M):
            group["lines"][int(number)] = unmark(value)
    results, errors = [], []
    for url, group in groups.items():
        lines, prior_number = [], None
        for number, line in sorted(group["lines"].items()):
            if prior_number is not None and number > prior_number + 1:
                lines.append("## [Unobserved source interval]")
            lines.append(line)
            prior_number = number
        website = None
        for i, line in enumerate(lines):
            if line == "Contact Details":
                for candidate in lines[i + 1:i + 12]:
                    if candidate.startswith("##") or candidate == "Social Media Handles":
                        break
                    if re.fullmatch(r"https?://[^\s]+", candidate):
                        try:
                            website = c.clean_url(candidate)
                            break
                        except ValueError:
                            pass
                if website:
                    break
        if not website:
            errors.append({"url": url, "error": "No direct website in contact excerpt"})
            continue
        features, gathering = [], False
        for line in lines:
            if "offers the following functionalities" in line:
                gathering = True
                continue
            if gathering:
                if line.startswith("*"):
                    value = line.lstrip("* ").strip()
                    if value and len(value) < 100:
                        features.append(value)
                elif line:
                    break
        if not features:
            # A contact excerpt sometimes starts midway through the explicit
            # FAQ feature list. The "Learn more ... features" terminator still
            # identifies that list without borrowing alternatives or review text.
            for i, line in enumerate(lines):
                if re.match(r"Learn more about .+ features", line):
                    prior = []
                    for value in reversed(lines[:i]):
                        if value.startswith("*"):
                            prior.append(value.lstrip("* ").strip())
                        elif value:
                            break
                    features = list(reversed(prior))
                    if features:
                        break
        technical = {}
        for i, line in enumerate(lines):
            if line in {"Platforms Supported", "Organization Types Supported", "API Support", "Modes of Support", "Pricing"}:
                values = []
                for following in lines[i + 1:]:
                    if following.startswith("*"):
                        if "View Detailed" not in following:
                            values.append(following.lstrip("* ").strip())
                    elif following and values:
                        break
                    elif following and not values:
                        break
                if values:
                    technical[line] = " ".join(values)
        overview = ""
        for i, line in enumerate(lines):
            if line.startswith("## About "):
                for value in lines[i + 1:i + 8]:
                    if value and not value.startswith(("##", "Image:", "Deep Dive")):
                        overview = value
                        break
        chunks = "\n".join(group["source_chunks"])
        results.append({"name": group["name"], "website_url": website, "source_category": "",
                        "source_description": overview, "features": list(dict.fromkeys(features)),
                        "technical": technical, "operating_systems": "", "integrations": [],
                        "source": {"id": "directory-detail", "type": "competitor_detail", "site": "SaaSworthy",
                                   "url": url, "read_at": None,
                                   "excerpt_sha256": hashlib.sha256(chunks.encode()).hexdigest(),
                                   "verification": "directory_reported", "transport": "public_web_reader"}})
    return results, errors


def import_batches(target=1000, partial=False):
    pool = json.loads((c.CACHE / "software-pool.json").read_text())
    rows, errors = {}, []
    for path in sorted((c.ROOT / ".scratch/browser-research").glob("batch-*.json")):
        packet = json.loads(path.read_text())
        parsed, failures = parse_browser(packet["text"])
        errors.extend(failures)
        for row in parsed:
            if row["source"]["url"] not in pool:
                continue
            row["source"]["read_at"] = packet["read_at"]
            row["candidate_categories"] = pool[row["source"]["url"]]
            prior = rows.get(row["source"]["url"])
            if not prior or len(row["features"]) > len(prior["features"]):
                rows[row["source"]["url"]] = row
    editorial_path = c.DATA / "evidence/editorial-extractions.json"
    if editorial_path.exists():
        for observation in json.loads(editorial_path.read_text()):
            row = rows.get(observation["url"])
            if row:
                row["features"] = observation["features"]
                row["overview_en"], row["overview_zh"] = observation["overview_en"], observation["overview_zh"]
                row["features_source_ref"] = observation["source"]["id"]
                row["additional_sources"] = [observation["source"]]
    c.write_json(c.CACHE / "software-results.json", list(rows.values()))
    c.write_json(c.DATA / "evidence/detail-errors.json", list({e["url"]: e for e in errors if e["url"] not in rows}.values()))
    categories = json.loads((c.DATA / "categories.json").read_text())["categories"]
    materialize(list(rows.values()), categories, target, partial=partial)
    print(json.dumps({"parsed": len(rows), "errors": len(errors), "no_features": sum(not r["features"] for r in rows.values())}))


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--target", type=int, default=1000)
    p.add_argument("--partial", action="store_true")
    options = p.parse_args()
    import_batches(options.target, options.partial)
