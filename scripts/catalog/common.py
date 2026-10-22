#!/usr/bin/env python3
"""Collect restartable, unpublished directory candidates using Python's stdlib.

Helpers for the catalog collector; this module does not publish or import data.
Network responses are cached under ignored .scratch/; only minimal facts ship.
"""
import argparse
import hashlib
import html
import ipaddress
import json
import re
import subprocess
import time
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urljoin, urlsplit, urlunsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener
from urllib.robotparser import RobotFileParser

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data/catalog"
CACHE = ROOT / ".scratch/catalog-cache"
UA = "123ChartsResearch/1.0 (+https://123charts.com)"
MAX_BYTES = 6 * 1024 * 1024
AFFILIATES = {"prf.hn", "bit.ly", "t.co", "tinyurl.com", "go2cloud.org",
              "shareasale.com", "sjv.io", "r.skimresources.com", "partnerstack.com",
              "aixploria.com", "futurepedia.io", "toolify.ai"}


def stamp():
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    temp.replace(path)


class Text(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)


def plain(value):
    parser = Text()
    parser.feed(value)
    return re.sub(r"\s+", " ", " ".join(parser.parts)).strip(" «»\u00a0")


def attrs(tag):
    class Attributes(HTMLParser):
        values = {}

        def handle_starttag(self, _, values):
            self.values = dict(values)
    parser = Attributes()
    parser.feed(tag)
    return parser.values


def clean_url(raw):
    """Keep actual product paths, strip campaign queries, refuse tracking hosts."""
    try:
        u = urlsplit(html.unescape(raw.strip()))
        host = (u.hostname or "").lower().rstrip(".")
        if u.scheme not in ("http", "https") or u.username or u.password or u.port:
            raise ValueError("invalid HTTP URL")
        if not host or "." not in host or host.endswith((".local", ".internal", ".test", ".example", ".invalid")):
            raise ValueError("not a public domain")
        try:
            ipaddress.ip_address(host)
        except ValueError:
            pass
        else:
            raise ValueError("IP addresses are not project domains")
        if any(host == h or host.endswith("." + h) for h in AFFILIATES):
            raise ValueError("directory or affiliate URL")
        # Campaigns are not project identity. Preserve functional query parameters.
        from urllib.parse import parse_qsl, urlencode
        query = urlencode([(k, v) for k, v in parse_qsl(u.query, keep_blank_values=True)
                           if not k.lower().startswith("utm_") and k.lower() not in
                           {"ref", "referral", "aff", "affiliate", "via", "fpr", "source", "irclickid", "gclid", "fbclid"}])
        return urlunsplit((u.scheme, host, u.path or "/", query, ""))
    except (ValueError, TypeError) as e:
        raise ValueError(f"Rejected URL: {raw}") from e


def guard_url(url):
    # This collector reads one fixed public directory origin only. It never
    # follows candidate website links or accepts arbitrary network destinations.
    u = urlsplit(url)
    if (u.scheme != "https" or u.username or u.password or u.port not in (None, 443)
            or u.hostname != "www.saasworthy.com"):
        raise ValueError("Unsafe fetch URL")


class PublicRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        guard_url(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def fetch(url, timeout=25):
    """Cache successful responses with their real read time; never fake a fresh date."""
    CACHE.mkdir(parents=True, exist_ok=True)
    key = hashlib.sha256(url.encode()).hexdigest()
    meta_path, body_path = CACHE / f"{key}.json", CACHE / f"{key}.html"
    if meta_path.exists() and body_path.exists():
        return json.loads(meta_path.read_text()), body_path.read_text()
    guard_url(url)
    req = Request(url, headers={"User-Agent": UA, "Accept": "text/html, text/plain;q=0.9"})
    with build_opener(PublicRedirect()).open(req, timeout=timeout) as response:
        body = response.read(MAX_BYTES + 1)
        if len(body) > MAX_BYTES:
            raise ValueError("Response exceeds body limit")
        meta = {"url": url, "final_url": response.url, "http_status": response.status,
                "read_at": stamp(), "body_sha256": hashlib.sha256(body).hexdigest(),
                "content_type": response.headers.get("Content-Type", "")}
        decoded = body.decode(response.headers.get_content_charset() or "utf-8", errors="replace")
        write_json(meta_path, meta)
        body_path.write_text(decoded)
        return meta, decoded


def domain_identities(urls):
    """Use the same PSL library as normalizeWebsite in the real application."""
    js = """import {getDomain} from 'tldts'; let s='';
    for await (const x of process.stdin) s+=x;
    console.log(JSON.stringify(JSON.parse(s).map(u=>getDomain(new URL(u).hostname,{allowPrivateDomains:true}))));"""
    result = subprocess.run(["node", "--input-type=module", "-e", js], input=json.dumps(urls),
                            text=True, capture_output=True, cwd=ROOT, check=True)
    return json.loads(result.stdout)


def select(candidates, categories, target):
    """Round robin reserves actual projects for every category before filling."""
    identities = domain_identities([r["website_url"] for rows in candidates.values() for r in rows])
    index = 0
    for rows in candidates.values():
        for row in rows:
            row["identity"] = identities[index]
            index += 1
    chosen, used, counts = [], set(), {c["slug"]: 0 for c in categories}
    # Scarce categories first, so broad lists cannot consume their only domains.
    order = sorted(categories, key=lambda c: len(candidates[c["slug"]]))
    queues = {c["slug"]: list(candidates[c["slug"]]) for c in categories}
    while len(chosen) < target:
        added = False
        for category in order:
            queue = queues[category["slug"]]
            while queue:
                row = queue.pop(0)
                if row["identity"] and row["identity"] not in used:
                    used.add(row["identity"])
                    chosen.append((category, row))
                    counts[category["slug"]] += 1
                    added = True
                    break
            if len(chosen) == target:
                break
        if not added:
            break
    return chosen, counts


class Element:
    def __init__(self, tag="root", attributes=None, parent=None):
        self.tag, self.attributes, self.parent = tag, attributes or {}, parent
        self.children = []

    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Element):
                yield from child.walk()

    def text(self):
        return re.sub(r"\s+", " ", " ".join(x.text() if isinstance(x, Element) else x for x in self.children)).strip()

    def markup(self):
        from html import escape
        values = " ".join(f'{k}="{escape(v or "", quote=True)}"' for k, v in self.attributes.items())
        inner = "".join(x.markup() if isinstance(x, Element) else escape(x) for x in self.children)
        return f"<{self.tag} {values}>{inner}</{self.tag}>"


class Document(HTMLParser):
    def __init__(self, body):
        super().__init__()
        self.root = self.current = Element()
        self.feed(body)

    def handle_starttag(self, tag, values):
        node = Element(tag, dict(values), self.current)
        self.current.children.append(node)
        if tag not in {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}:
            self.current = node

    def handle_startendtag(self, tag, values):
        self.current.children.append(Element(tag, dict(values), self.current))

    def handle_endtag(self, tag):
        node = self.current
        while node.parent is not None:
            if node.tag == tag:
                self.current = node.parent
                return
            node = node.parent

    def handle_data(self, value):
        self.current.children.append(value)
