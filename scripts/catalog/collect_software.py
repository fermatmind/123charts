#!/usr/bin/env python3
"""Collect an English-first, bilingual software/SaaS research catalog.

python3 scripts/catalog/collect_software.py --pages 2 --target 1000
Only public HTML and JSON-LD are read. No redirect trackers, hidden APIs, browser
challenges, accounts, production databases or publication endpoints are used.
"""
import argparse
import concurrent.futures
import hashlib
import json
import re
import threading
import time
from urllib.error import HTTPError
from urllib.parse import urlsplit
from urllib.robotparser import RobotFileParser
import common as c

STOP = threading.Event()
LOCK = threading.Lock()
LAST_START = 0
ROBOTS = None
INTERVAL = 2.5


def read(url):
    global LAST_START
    if STOP.is_set():
        raise RuntimeError("Collection paused by source")
    if ROBOTS is not None and not ROBOTS.can_fetch(c.UA, url):
        raise ValueError("robots_disallow")
    key = hashlib.sha256(url.encode()).hexdigest()
    cached = (c.CACHE / (key + ".json")).exists() and (c.CACHE / (key + ".html")).exists()
    if not cached:
        with LOCK:
            time.sleep(max(0, INTERVAL - (time.monotonic() - LAST_START)))
            LAST_START = time.monotonic()
    try:
        return c.fetch(url, timeout=30)
    except HTTPError as e:
        if e.code in (403, 429):
            STOP.set()
        raise


def jsonld(body):
    values = []
    for script in re.findall(r'<script\b[^>]*type=[\"\x27]application/ld\+json[\"\x27][^>]*>(.*?)</script>', body, re.S):
        try:
            value = json.loads(script)
            values.extend(value if isinstance(value, list) else [value])
        except (ValueError, TypeError):
            pass
    return values


def listings(body):
    result = []
    for value in jsonld(body):
        if value.get("@type") == "ItemList":
            for item in value.get("itemListElement", []):
                url = item.get("url", "")
                if re.fullmatch(r"https://www\.saasworthy\.com/product/[a-zA-Z0-9_-]+", url):
                    result.append(url)
    if not result:
        # Subsequent public pages omit ItemList JSON-LD, but retain the same
        # server-rendered #products cards. Sidebar and promoted links are excluded.
        document = c.Document(body).root
        products = next((n for n in document.walk() if n.attributes.get("id") == "products"), None)
        if products:
            for node in products.walk():
                if node.tag == "a" and re.fullmatch(r"https://www\.saasworthy\.com/product/[a-zA-Z0-9_-]+", node.attributes.get("href", "")):
                    result.append(node.attributes["href"])
    return list(dict.fromkeys(result))


def unique(values):
    return list(dict.fromkeys(x for x in values if x))


def detail(body, meta):
    data = jsonld(body)
    application = next((v for v in data if v.get("@type") == "SoftwareApplication"), None)
    if not application:
        raise ValueError("No SoftwareApplication JSON-LD")
    document = c.Document(body).root
    nodes = list(document.walk())
    contact = next((n for n in nodes if n.attributes.get("id") == "contact"), None)
    websites = []
    if contact:
        for n in contact.walk():
            if n.tag in {"span", "a"} and re.fullmatch(r"https?://[^\s<>]+", n.text()):
                try:
                    websites.append(c.clean_url(n.text()))
                except ValueError:
                    pass
    if not websites:
        raise ValueError("No visible direct product website; trackers are not followed")
    facts = {}
    for n in nodes:
        if "detail-pg-sec-val" in n.attributes.get("class", "").split():
            headings = [x for x in n.walk() if "detail-pg-sec-info-head" in x.attributes.get("class", "").split()]
            if not headings:
                headings = [x for x in n.children if isinstance(x, c.Element) and x.tag == "p" and x.text() == "Pricing"]
            if headings:
                title = headings[0].text()
                value = n.text().removeprefix(title).strip()
                if title in {"Pricing", "Platforms Supported", "Organization Types Supported", "API Support", "Modes of Support"}:
                    facts[title] = value.replace("View Detailed Pricing", "").strip()
    features = []
    faq = next((v for v in data if v.get("@type") == "FAQPage"), {})
    for question in faq.get("mainEntity", []):
        if re.search(r"used for\?$", question.get("name", "")):
            text = question.get("acceptedAnswer", {}).get("text", "")
            features = unique(c.plain(v) for v in re.findall(r'<li\b[^>]*>(.*?)</li>', text, re.S))
    # Product-specific integration names only, never "related" or sponsored cards.
    integrations = []
    integration_section = next((n for n in nodes if n.attributes.get("id") == "integrations"), None)
    if integration_section:
        for n in integration_section.walk():
            if n.tag == "a" and re.fullmatch(r"https://www\.saasworthy\.com/product/[a-zA-Z0-9_-]+", n.attributes.get("href", "")):
                integrations.append({"name": n.text(), "directory_url": n.attributes["href"]})
    if not application.get("name") or not application.get("description"):
        raise ValueError("Missing product identity/purpose")
    if len(features) < 2:
        # Some categories do not publish FAQ lists. Extract only enabled feature
        # labels in the product's own features block; no category/sidebar lists.
        block = next((n for n in nodes if n.attributes.get("id") == "features"), None)
        if block:
            for n in block.walk():
                if n.tag == "span" and "feat-name" in n.attributes.get("class", ""):
                    features.append(n.text())
    return {"name": application["name"], "website_url": websites[0],
            "source_category": application.get("applicationCategory", ""),
            "source_description": c.plain(application["description"]),
            "features": unique(features), "technical": facts,
            "operating_systems": application.get("operatingSystem", ""),
            "integrations": list({i["name"]: i for i in integrations if i["name"]}.values()),
            "source": {"id": "directory-detail", "type": "competitor_detail", "site": "SaaSworthy",
                       "url": meta["url"], "read_at": meta["read_at"], "body_sha256": meta["body_sha256"],
                       "verification": "directory_reported"}}


def translate_term(term, glossary):
    return glossary.get(term, {}).get("zh", term)


def technical_zh(key, value):
    value = re.sub(r"\bFree Trial Not Available\b", "未提供免费试用", value, flags=re.I)
    for en, zh in [("Free Trial Available", "提供免费试用"), ("Offers Free-forever and Custom plan.", "另有持续免费方案和定制方案。"),
                   ("Offers Free-forever plan.", "另有持续免费方案。"), ("Offers Custom plan.", "另有定制方案。"),
                   ("Starts at", "起价为"), ("Freelancers", "自由职业者"), ("Individuals", "个人用户"),
                   ("Desktop App", "桌面应用"), ("NA", "未注明")]:
        value = value.replace(en, zh)
    value = value.replace("Not available", "未提供").replace("Available", "提供").replace("Not Supported", "不支持")
    for en, zh in [("Browser Based (Cloud)", "浏览器访问（云服务）"), ("Mobile App", "移动应用"),
                   ("Installed", "本地安装"), ("All (Small, Medium, Large)", "小型、中型与大型组织"),
                   ("Small Business", "小型企业"), ("Medium Business", "中型企业"), ("Large Enterprises", "大型企业"),
                   ("24/7 (Live rep)", "全天候人工支持"), ("Business Hours", "工作时间支持"), ("Online", "在线支持"),
                   ("Free Trial", "免费试用"), ("Free Version", "免费版本"), ("Freemium", "免费与付费方案"),
                   ("Starts at", "起价"), ("Custom", "定制报价")]:
        value = value.replace(en, zh)
    return value


def make_profile(row, category, glossary):
    features = row["features"][:30]
    first, more = features[:8], features[8:16]
    en = [f"{row['name']} is a product in the {category['name_en']} category. "
          + ("Its directory profile covers " + ", ".join(first) + "." if first else "A product-specific feature list was not available in the source.")]
    zh = [f"{row['name']} 属于{category['name_zh']}软件。" +
          ("第三方资料列出的功能包括" + "、".join(translate_term(x, glossary) for x in first) + "。" if first else "来源未提供可提取的具体功能清单。")]
    if row.get("overview_en"):
        en.insert(0, row["overview_en"])
        zh.insert(0, row["overview_zh"])
    if more:
        en.append("Additional listed capabilities include " + ", ".join(more) + ". These areas should be evaluated against the tasks, permissions and data involved in the intended workflow.")
        zh.append("资料还列出" + "、".join(translate_term(x, glossary) for x in more) + "。选择时应结合实际任务、使用权限和数据处理需求逐项评估。")
    facts = row["technical"]
    mapping = [("Platforms Supported", "Deployment is listed as", "资料所列运行方式为"),
               ("Organization Types Supported", "The listed organization sizes are", "资料所列适用组织规模为"),
               ("API Support", "API support is listed as", "API 支持情况为"),
               ("Modes of Support", "Support channels are listed as", "资料所列支持方式为")]
    technical_en, technical_cn = [], []
    for key, label_en, label_zh in mapping:
        if key in facts:
            technical_en.append(f"{label_en} {facts[key]}.")
            technical_cn.append(f"{label_zh}{technical_zh(key, facts[key])}。")
    if technical_en:
        en.append(" ".join(technical_en))
        zh.append("".join(technical_cn))
    if row["integrations"]:
        names = ", ".join(i["name"] for i in row["integrations"][:8])
        en.append(f"The directory also lists integrations with {names}. Connector availability, data access and plan requirements need confirmation with the vendor before adoption.")
        zh.append(f"第三方资料还列出与 {names} 的集成。具体连接器、数据访问范围及所需方案应在采用前向产品方核实。")
    if "Pricing" in facts:
        en.append(f"The directory's pricing snapshot states: {facts['Pricing']}. This is a dated third-party reference; current amounts, billing periods, trial conditions and regional availability require an official pricing check.")
        zh.append(f"第三方定价快照显示：{technical_zh('Pricing', facts['Pricing'])}。这属于采集时的第三方参考，实际金额、计费周期、试用条件及地区可用性仍需核对官网。")
    overview = {"en": "\n\n".join(en), "zh": "\n\n".join(zh)}
    details = []
    for feature in features:
        definition = glossary.get(feature, {})
        details.append({"name_en": feature, "name_zh": translate_term(feature, glossary),
                        "explanation_en": definition.get("en", ""), "explanation_zh": definition.get("explanation_zh", ""),
                        "explanation_scope": "general_feature_definition" if definition.get("en") else "label_only",
                        "source_ref": row.get("features_source_ref", "directory-detail"), "status": "directory_reported"})
    tasks = unique(glossary[x]["task_en"] for x in features if glossary.get(x, {}).get("task_en"))[:6]
    tasks_zh = unique(glossary[x]["task_zh"] for x in features if glossary.get(x, {}).get("task_zh"))[:6]
    if tasks:
        overview["en"] += "\n\n" + "Typical evaluation tasks associated with these feature labels include: " + "; ".join(t[0].lower() + t[1:] for t in tasks) + ". These are workflow suggestions based on the reported capabilities, rather than evidence of actual customer adoption."
        overview["zh"] += "\n\n根据这些功能，可重点评估以下任务：" + "；".join(tasks_zh) + "。这些是基于功能的使用场景建议，不能当作实际客户采用的证据。"
    return {"description_en": overview["en"], "description_zh": overview["zh"],
            "core_features": details,
            "use_cases": {"status": "editorial_inference", "en": tasks, "zh": tasks_zh,
                          "basis": "Typical tasks inferred from the reported feature labels; not observed customer adoption."},
            "technical_details": {k: {"en": v, "zh": technical_zh(k, v), "source_ref": "directory-detail", "status": "directory_reported"}
                                  for k, v in facts.items()},
            "target_audience": {"status": "directory_reported" if "Organization Types Supported" in facts else "unknown",
                                "organization_sizes_en": facts.get("Organization Types Supported"),
                                "organization_sizes_zh": technical_zh("Organization Types Supported", facts["Organization Types Supported"]) if "Organization Types Supported" in facts else None,
                                "specific_roles": [], "roles_status": "not_verified", "source_ref": "directory-detail"},
            "getting_started": {"status": "not_verified", "steps": []},
            "integrations": {"status": "directory_reported" if row["integrations"] else "unknown", "items": row["integrations"], "source_ref": "directory-detail"},
            "limitations": {"status": "not_verified", "items": []},
            "supported_languages": {"status": "not_verified", "items": []},
            "license": {"status": "not_verified", "is_open_source": None, "url": None},
            "pricing": {"status": "directory_reported" if "Pricing" in facts else "unknown", "price_type": "unknown", "officially_checked": False,
                        "source_snapshot_en": facts.get("Pricing"), "source_snapshot_zh": technical_zh("Pricing", facts["Pricing"]) if "Pricing" in facts else None,
                        "source_ref": "directory-detail"},
            "alternatives": {"status": "not_reviewed", "items": []},
            "faq": [{"question_en": f"What does {row['name']} do?", "question_zh": f"{row['name']} 用来做什么？", "answer_en": en[0], "answer_zh": zh[0]},
                    {"question_en": "Which features are listed?", "question_zh": "资料列出了哪些功能？", "answer_en": ", ".join(features), "answer_zh": "、".join(translate_term(x, glossary) for x in features)},
                    {"question_en": "Has pricing been officially verified?", "question_zh": "价格是否经过官网核实？", "answer_en": "No. Pricing is a directory-reported snapshot or unknown. Check the official pricing and terms.", "answer_zh": "尚未核实。价格属于第三方快照或未知，应核对官网定价及条款。"}]}


def enrich(url, categories):
    path = c.CACHE / "software-details-v1" / (hashlib.sha256(url.encode()).hexdigest() + ".json")
    if path.exists():
        row = json.loads(path.read_text())
    else:
        meta, body = read(url)
        row = detail(body, meta)
        c.write_json(path, row)
    row["candidate_categories"] = categories
    return row


def discover(categories, pages):
    pool, evidence = {}, []
    def get(cat, page):
        base = cat["source_category_urls"][0]
        url = base if page == 1 else base + f"?page={page}"
        meta, body = read(url)
        return cat, meta, listings(body)
    for page in range(1, pages + 1):
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            futures = [executor.submit(get, cat, page) for cat in categories]
            for f in concurrent.futures.as_completed(futures):
                cat, meta, links = f.result()
                evidence.append({**meta, "category": cat["slug"], "rows": len(links)})
                for url in links:
                    pool.setdefault(url, [])
                    if cat["slug"] not in pool[url]:
                        pool[url].append(cat["slug"])
                print(f"DISCOVER {cat['slug']} page={page} rows={len(links)} unique={len(pool)}", flush=True)
                c.write_json(c.CACHE / "software-pool.json", pool)
                c.write_json(c.DATA / "evidence/listing-pages.json", evidence)
    return pool


def materialize(results, categories, target, partial=False):
    identities = c.domain_identities([r["website_url"] for r in results])
    candidates = {cat["slug"]: [] for cat in categories}
    for row, identity in zip(results, identities):
        row["identity"] = identity
        if len(row["features"]) < 2:
            continue
        for cat in row["candidate_categories"]:
            candidates[cat].append(row)
    for rows in candidates.values():
        rows.sort(key=lambda r: r["source"]["url"])
    chosen, counts = c.select(candidates, categories, target)
    c.write_json(c.CACHE / "software-coverage.json", {"unique": len(set(i for i in identities if i)), "counts": counts})
    if not partial and (len(chosen) != target or min(counts.values()) < 5):
        raise ValueError(f"Need more real coverage: {len(chosen)}/{target}, minimum category={min(counts.values())}")
    glossary = json.loads((c.DATA / "feature-glossary.json").read_text())
    paths = set()
    for cat, row in chosen:
        slug = re.sub(r"[^a-z0-9]+", "-", row["name"].lower()).strip("-")[:55] or "software"
        slug += "-" + hashlib.sha256(row["identity"].encode()).hexdigest()[:8]
        path = c.DATA / "projects" / cat["slug"] / (slug + ".json")
        paths.add(path)
        profile = make_profile(row, cat, glossary)
        record = {"schema_version": "123charts-software-research-v1", "slug": slug, "name": row["name"],
                  "website_url": row["website_url"], "domain": urlsplit(row["website_url"]).hostname,
                  "identity_domain": row["identity"], "category": cat["slug"],
                  "secondary_categories": sorted(set(row["candidate_categories"]) - {cat["slug"]}),
                  "status": "draft", "primary_language": "en", "available_locales": ["en", "zh"],
                  "research_status": "structured_candidate",
                  **profile, "sources": [row["source"], *row.get("additional_sources", [])],
                  "official_check": {"status": "not_checked", "checked_at": None},
                  "localization": {"en": {"status": "structured_draft"}, "zh": {"status": "structured_draft",
                      "untranslated_feature_labels": [x for x in row["features"][:30] if x not in glossary]}},
                  "review_notes": ["Original bilingual descriptions summarize structured third-party facts; not owner or platform verification.",
                                   "General feature explanations describe terms, not product-specific plan limits or implementation.",
                                   "Unknown prices, licenses, languages, limitations and alternatives remain explicitly unknown."]}
        c.write_json(path, record)
    for path in (c.DATA / "projects").glob("*/*.json"):
        if path not in paths:
            path.unlink()
    c.write_json(c.DATA / "collection.json", {"schema_version": "123charts-catalog-collection-v1", "generated_at": c.stamp(),
                 "target_count": target, "project_count": len(chosen), "category_count": len(categories),
                 "counts_by_category": counts, "publication": "draft_only", "collection_complete": not partial,
                 "primary_language": "en", "locales": ["en", "zh"], "scope": "General software and SaaS; AI is one subset.",
                 "deduplication": "One project per tldts registrable domain, including private suffixes.",
                 "official_verification": "pending", "localization_review": "pending"})
    print(f"WROTE projects={len(chosen)} categories={len(categories)} minimum={min(counts.values())}", flush=True)


def main():
    global ROBOTS, INTERVAL
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pages", type=int, default=2)
    parser.add_argument("--target", type=int, default=1000)
    parser.add_argument("--reuse-discovery", action="store_true")
    parser.add_argument("--materialize-only", action="store_true")
    parser.add_argument("--cached-discovery-only", action="store_true")
    parser.add_argument("--interval", type=float, default=2.5)
    args = parser.parse_args()
    if args.interval < 2.5:
        parser.error("Minimum interval is 2.5 seconds; respect source limits")
    INTERVAL = args.interval
    categories = json.loads((c.DATA / "categories.json").read_text())["categories"]
    if args.materialize_only:
        rows = json.loads((c.CACHE / "software-results.json").read_text())
        materialize(rows, categories, args.target)
        return
    meta, body = read("https://www.saasworthy.com/robots.txt")
    ROBOTS = RobotFileParser()
    ROBOTS.parse(body.splitlines())
    c.write_json(c.DATA / "evidence/robots.json", {**meta, "text": body})
    if args.cached_discovery_only:
        pool, evidence = {}, []
        source_categories = {cat["source_category_urls"][0]: cat["slug"] for cat in categories}
        for path in sorted(c.CACHE.glob("*.json")):
            value = json.loads(path.read_text())
            url = value.get("url", "") if isinstance(value, dict) else ""
            category = source_categories.get(url.split("?")[0])
            if not category or not path.with_suffix(".html").exists():
                continue
            links = listings(path.with_suffix(".html").read_text())
            evidence.append({**value, "category": category, "rows": len(links)})
            for link in links:
                pool.setdefault(link, [])
                if category not in pool[link]:
                    pool[link].append(category)
        c.write_json(c.CACHE / "software-pool.json", pool)
        c.write_json(c.DATA / "evidence/listing-pages.json", evidence)
        print(f"CACHED DISCOVERY unique={len(pool)}", flush=True)
    else:
        pool = json.loads((c.CACHE / "software-pool.json").read_text()) if args.reuse_discovery else discover(categories, args.pages)
    # Round robin source queues so every category receives detailed research
    # before the broadest categories consume the target.
    queues = {cat["slug"]: sorted(url for url, cats in pool.items() if cat["slug"] in cats) for cat in categories}
    order, used = [], set()
    for index in range(max(map(len, queues.values()))):
        for cat in sorted(categories, key=lambda x: len(queues[x["slug"]])):
            values = queues[cat["slug"]]
            if index < len(values) and values[index] not in used:
                order.append(values[index])
                used.add(values[index])
    results, errors = [], []
    # Bounded batches avoid queuing hundreds of unnecessary fetches after the
    # target has enough unique domains and all categories have baseline coverage.
    for offset in range(0, len(order), 60):
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            futures = {executor.submit(enrich, url, pool[url]): url for url in order[offset:offset + 60]}
            for f in concurrent.futures.as_completed(futures):
                try:
                    results.append(f.result())
                    print(f"DETAIL {len(results)} {futures[f]}", flush=True)
                except Exception as e:
                    errors.append({"url": futures[f], "error": str(e)[:200]})
                    print(f"SKIP {futures[f]} {e}", flush=True)
                if STOP.is_set():
                    for pending in futures:
                        pending.cancel()
                    break
        c.write_json(c.CACHE / "software-results.json", results)
        c.write_json(c.DATA / "evidence/detail-errors.json", errors)
        if STOP.is_set():
            materialize(results, categories, args.target, partial=True)
            raise RuntimeError("Source refused/rate limited requests; cached research preserved without bypass")
        materialize(results, categories, args.target, partial=True)
        report = json.loads((c.CACHE / "software-coverage.json").read_text())
        if report["unique"] >= args.target and min(report["counts"].values()) >= 5:
            break
    materialize(results, categories, args.target)


if __name__ == "__main__":
    main()
