# Catalog research validation

Run focused policy regressions and read-only record validation with:

```bash
node --test scripts/catalog/research-validation.test.mjs
python3 -m unittest discover -s scripts/catalog -p 'test_*.py'
node scripts/catalog/validate.mjs --records-only
```

These checks validate structure, state consistency and evidence references. They
do not independently certify product ownership, source authenticity, editorial
accuracy, current prices or publication eligibility. `--records-only` continues
to check every project; only coordinator-owned aggregate counts/index writes are
deferred. An unrelated record failure is not silently excluded.

## Research and pricing are independent states

`primary_source_researched` means official product documents were read and the
profile authored. It does not require a verified price. A researched record may
retain `pricing.officially_checked: false`, status `not_verified`, `not_checked`
or `unknown`, and `price_type: unknown`. In that state:

- Normalized amount, currency and completed-check timestamp must be absent or
  null; a zero amount is still a price claim and is rejected.
- No verified pricing `source_ref` may be asserted.
- Both language snapshots must describe the remaining uncertainty. The existing
  record-level research-gap requirement still applies.

Checked pricing still requires `official_documentation_read` and a resolvable
`official_pricing` source. A checked pricing document may omit a numerical price;
for example, it can establish a custom-quote billing mechanism. Unknown pricing
does not weaken source-reference or research-status checks elsewhere.

## Cross-domain official sources

Same-registrable-domain sources retain their existing behavior. A foreign domain
must be connected to the project through observations in
`data/catalog/evidence/official-source-relationships.json`. This is a durable
provenance document, not a list of domains to exempt from validation. Project
identities, original source URLs and research facts are not rewritten.

Each observation records its project identity, actual first-party origin URL,
observed destination, bounded destination scope, read time, captured HTML or
extracted-text digest, a machine-readable observation excerpt and its digest,
plus an editorial explanation of what the observation establishes. Types are:

- `link`: excerpt `{ "document_url": "...", "href": "..." }`, captured from
  the actual read page's links. Relative links resolve against that page.
- `request_resolution`: excerpt `{ "requested_url": "...", "final_url": "..." }`,
  captured from a real HTTPS response's request/final URLs. This does not invent
  intermediate redirect status codes or infer redirects from brand text.

The first observation must start on the project's registered domain. Later
observations can start inside a previously established destination scope,
allowing a product migration followed by an external help-site link. Resolution
is order-independent; circular or unrelated claims cannot establish themselves.

Scopes match an exact HTTPS origin and either an exact path or a slash-delimited
subtree. A repository path cannot authorize all GitHub repositories, and a Help
Scout tenant cannot authorize every tenant. The researcher must select and
explain the narrow appropriate scope; a structural check cannot establish that
scope's editorial appropriateness. An official relationship also does not imply
shared plans, corporate ownership or feature equivalence.

Changing the excerpt without its matching digest, omitting provenance, claiming
a foreign origin without an anchored chain, using brand-name similarity alone,
or citing an out-of-scope URL fails validation. The validator performs no network
requests, uses no ignored scratch files and has no product-name/domain allowlist.
Evidence must come from actual reads; a search summary or a 403/login response
does not establish a relationship. Missing evidence remains an explicit failure.
