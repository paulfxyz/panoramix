# Panoramix acceptance checks

## Static architecture

- No backend, database, service credentials, user authentication or external inference API.
- Catalogue is runtime-loaded JSON beside the HTML.
- Relative asset paths work at the document root and in a subdirectory.
- Invalid/missing JSON shows a recoverable error instead of a blank page.
- Public package contains no private account information or secrets.

## Functional inventory

- Header navigation and hero actions scroll to the intended section.
- Brief input and each sample recipe update relevant results, without making model calls.
- Family filters, search, capability filters, reset, sort and pagination work in both directions.
- Table and card views preserve filters and selections.
- Four-tool tray supports add/remove/clear and an explicit maximum; comparison and field-note dialogs close with Escape.
- Family chart drills down into the selected family.
- Recipe cards create a brief; the scale control opens the correct four-tool comparison.
- Cost modes reset incompatible rates; token, output, compute and seat formulas produce correct monthly totals.
- CSV and text exports produce usable text; manual copy fallback is visible.
- Official source links and GitHub contribution links open the expected destinations.
- Story context and independence/IP notice remain legible.
- Desktop and 375px layouts have no page-wide horizontal overflow; only the comparison tables deliberately scroll.
- Desktop → mobile → desktop retains usable controls.
- Reduced-motion preference disables decorative movement.

## Research pipeline

- Catalogue and report schemas validate.
- Factual edits require evidence; unknown fields and unsafe values are rejected.
- Stale expected values abort.
- Same-field conflicts abort; agreeing reports combine provenance.
- Dry-run never writes files.
- Apply requires the reviewed catalogue hash.
- Accepted report IDs cannot be replayed.
- GitHub CI validates/tests/typechecks and packages only; it never deploys or auto-accepts community reports.
