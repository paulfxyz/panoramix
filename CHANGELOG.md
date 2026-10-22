# Changelog

## 1.1.0 · 22 October 2026

Complete redesign.

- New art direction in the spirit of calliope.agency: monochrome at rest, Space Grotesk large and bold, red only as transient interaction feedback, dark theme.
- Panoramix redrawn as an original Gaulish druid in copperplate-engraving style, plus four companion engravings (cauldron and vials, standing stones, sickle and mistletoe, village).
- Ask field rebuilt as a single large input; Enter submits, results scroll into view with "why" chips. The previous textarea swallowed Enter.
- Simpler data view: large cards with a six-dimension coverage strip replace the paginated table.
- New comparison experience: dock, then Radar / Bars / Matrix / Facts views for up to four tools; per-tool field-notes drawer with its own radar.
- Six dimensions (Language, Media, Action, Research, Control, Workflow) derived purely from documented features.
- Recipes open directly into the compare view; the landscape section links each family into the catalogue.
- Motion system: button lift, halo and sweep, animated add/check toggle, focus underline, scroll reveals, drawer and compare transitions, chart animations; all reduced-motion aware.
- Removed the cost lab and CSV export to keep the product focused. Copy-as-text remains in the compare view.
- Matcher uses whole-word matching so short IDs such as "fal" no longer match words like "fallback".
- Catalogue schema, report standard, merge tooling and deployment workflow are unchanged.

## 1.0.1 · 22 October 2026

- Corrected illustration sizing at intermediate desktop/tablet widths to prevent page-wide horizontal scrolling.
- Added a normal-browser path-verification fallback for SiteGround bot protection, without disabling host security.
- Added four deployment-proof regression tests and batch-marker cleanup.
- First SiteGround production deployment verified over certificate-checked FTPS and public HTTPS, followed by browser checks.

## 1.0.0 · 22 October 2026

Initial public, MIT-licensed release.

- Original apothecary visual identity, potion-leaf mark and illustrated landing page.
- Static, no-auth architecture with a runtime-editable JSON catalogue.
- Initial 48-tool, 10-family overview, including Computer-style agents and API infrastructure.
- Search, documented-signal filters, editorial local brief matcher, table/card layouts and four-tool comparisons.
- Ten comparison recipes, clickable landscape counts, and a conceptual AI stack.
- User-input cost scenarios for tokens, media outputs, GPU hours and seats.
- Standard community report schema, evidence requirements, deterministic merge dry-runs, stale-value and conflict rejection, reviewed-hash apply and accepted-report archive.
- CI validation, type checks, regression tests and downloadable SiteGround ZIP packaging.

Not included: live vendor pricing, live performance benchmarks, cloud inference, automatic report acceptance, database, automatic SiteGround deployment, account sync or an external submission API.
