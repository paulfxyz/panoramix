# QA notes (v1.2.0)

## Automated
- `npm test`: catalogue validation, merge logic, dimension profiles, FTPS deploy script.
- `npm run check`: TypeScript.
- Playwright pass (local, 1440×900 and 390×844): no console errors, no horizontal overflow, all 45 checks open a view, each lens renders, compare verdict appears at ≥2 tools, record seal reads Intact against the dev build.

## Manual, before release
- Checks cloud: group tabs filter, counts match 45 total.
- Each lens: open, interact (hover star, tick capability, choose stack layer), close back to the cloud.
- Alternatives: every anchor chip loads; "Compare with top 3" fills the dock.
- Compare: Radar / Bars / Matrix / Facts; Matrix lists differences first; Copy text works; Escape closes.
- Record: commit link opens GitHub; SHA shown; Download catalog.json works.
- Theme toggle persists; `prefers-reduced-motion` disables motion.
- Mobile: constellation hides labels; sticky asides unstick; nav wraps.

## After deploy
- New JS bundle hash in page source; `catalog.json` hash equals the build's; seal reads Intact on the live site.
