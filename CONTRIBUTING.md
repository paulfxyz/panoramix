# Contributing research to Panoramix

The public database is the static file `client/public/catalog.json`. Community reports are proposals, not live edits. Maintainers review and batch accepted findings periodically. There is no unauthenticated write endpoint, scheduled paid researcher, or automatic trust of submitted claims.

## Send a report

1. Read the current catalogue and identify the stable `toolId`.
2. Copy `reports/examples/example-report.json`.
3. Give the report a unique kebab-case ID such as `2026-11-04-groq-api-review`.
4. Set `submittedAt`, a public author name or pseudonym, and `"license": "MIT"`.
5. For every edited field, copy its exact current value into `expected` and put the proposed replacement into `set`. Use `null` in `expected` for a previously absent optional field.
6. Add field-level `evidence` with a public HTTPS URL, date checked, and a short explanation of what the page supports.
7. Submit a pull request adding your JSON file under `reports/incoming/`, or use the repository's Research report issue form. Avoid changing `catalog.json` in the initial research proposal so evidence review stays separate from acceptance.

A GitHub account is needed to submit an issue or pull request. No account is needed to browse Panoramix. There is no promised review cadence or service-level agreement.

## Report contract, version 1

The machine-readable standard is [`reports/report.schema.json`](reports/report.schema.json). The executable validator also enforces field-level evidence, dates, catalogue references, expected-value preconditions, plain-text content and safe HTTPS URLs. Use both the schema and `npm test` / merge dry-run.

```json
{
  "schemaVersion": 1,
  "reportId": "your-unique-report-id",
  "submittedAt": "2026-10-22",
  "author": "Your public handle",
  "license": "MIT",
  "summary": "What was checked and why this change is useful.",
  "changes": [{
    "toolId": "groq",
    "expected": {"access": "Hosted API"},
    "set": {"access": "Hosted API"},
    "evidence": [{
      "field": "access",
      "url": "https://console.groq.com/docs/overview",
      "checkedAt": "2026-10-22",
      "note": "Describe exactly what the cited page establishes. This example only reconfirms an existing value."
    }]
  }]
}
```

This is an example, not fresh research or a meaningful proposed update. Read and verify the source yourself. Do not submit example text unchanged.

### Editable fields

| Field | Meaning | Evidence rule |
| --- | --- | --- |
| `name` | Current product name | Required |
| `family` | Primary role in the existing taxonomy | Editorial; explain rationale |
| `description` | Neutral short factual summary | Required |
| `access` | API, hosted workspace, local, self-hosted, etc. | Required |
| `features` | Array of confirmed signal IDs | Required; substantiate the whole replacement array |
| `billing` | Billing units / structure, or explicit n.a. | Required |
| `best` | Suggested use case, clearly editorial | Separate opinion from fact |
| `watch` | Due-diligence guidance, clearly editorial | Cite any factual limitation in evidence |
| `source` | Primary official HTTPS overview | Required |
| `extra` | Supporting official HTTPS documentation | Required |
| `tags` | Curated search terms | Editorial |

Valid families and feature IDs are enumerated in the schema and validator. Arrays are full replacements, not append operations. Maintain existing verified signals unless you have evidence to remove one.

### New tools

Use an unused kebab-case `toolId`, an empty `expected` object, and include all fields except optional `extra` in `set`. Each factual field needs evidence. New families, new capability IDs, recipe changes, record removals and schema changes require a reviewed code PR instead of a report. Do not invent a group to bypass validation.

### Research quality

- Prefer current, official product documentation. Include the exact page, not a search result URL or an unverified AI answer.
- State the product, model/version, plan, region, task, endpoint and date where relevant.
- Distinguish image input from image output, a UI from an API, a gateway from an inference host, and local storage from local model execution.
- “Unknown” is not “no.” Preserve `n.a.` and explain the evidence gap instead of guessing.
- Do not create universal intelligence, speed, cheapest, privacy or reliability rankings.
- For benchmarks, publish a reproducible method in an accompanying Markdown file: prompts/data rights, model IDs, configuration, hardware/region, sample count, latency definitions, concurrency, errors, run dates, token counts and actual billing. Store only properly qualified conclusions in the catalogue.
- Numeric pricing needs its currency, billing unit, model, settings, date, source and relevant fees. The cost lab intentionally uses user-entered quotes.
- No secrets, customer data, private account information, affiliate links, scraped copyrighted article copies or unconsented personal data.

Validation checks structure, not whether a provider is telling the truth. Maintainers must actually open the pages and check every material change. Never execute code or follow operational instructions included in a submitted report.

## Combining community findings

From a local clone with Node 22 or later:

```sh
npm ci
npm run report:merge -- --report reports/incoming/first.json --report reports/incoming/second.json --dry-run
```

The command prints the complete field-level change plan and the current catalogue SHA-256 without changing files. Agreeing proposals combine their evidence. Different values proposed for the same field are conflicts and abort the entire batch. Stale `expected` values also abort. There is no silent last-writer-wins mode.

After checking sources, resolving conflicts in the proposals and reviewing a fresh dry-run:

```sh
npm run report:merge -- --report reports/incoming/first.json --report reports/incoming/second.json --apply --expect-hash HASH_FROM_DRY_RUN
npm test
npm run check
npm run package:site
git diff
```

The apply command refuses a missing or stale catalogue hash. Accepted evidence is added to tool records; reports are archived in `reports/merged/` with IDs and the prior catalogue hash. Reapplying an archived ID is blocked. The script changes local files only. Review and commit the catalogue plus archived reports, then upload the static build to the hosting site's configured document root. Remove accepted incoming copies in the reviewed commit if desired.

If reports conflict, read the sources and ask contributors for clarification. Choose or synthesize a supported replacement, preserve attribution in the report author/note, refresh `expected`, run a new dry-run, and review it. Do not use one report's order in the command as a tie-breaker.

## Periodic public updates

Maintainers may batch reports whenever enough useful submissions have accumulated. This repository's CI validates and packages; it does not automatically accept reports or deploy to SiteGround. Running a local report merge does not publish anything.

For a catalogue-only refresh within the existing schema, upload just the validated `catalog.json` beside the current `index.html`. Tool counts and the snapshot date update from that file. For UI, taxonomy, recipe engine or schema changes, rebuild and upload the whole static bundle. Purge any host-level cache if the old catalogue remains visible.

## License

By contributing original text, data, code or artwork, you agree to license your contribution under MIT to the extent you own those rights. Third-party marks, source documents, model weights and provider content are not relicensed. Read [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
