import { readFileSync, readdirSync } from "node:fs";
import { validateCatalog, validateReport } from "./catalog-lib.mjs";
const c = validateCatalog(
  JSON.parse(
    readFileSync(
      new URL("../client/public/catalog.json", import.meta.url),
      "utf8",
    ),
  ),
);
for (const file of readdirSync(
  new URL("../reports/examples/", import.meta.url),
).filter((x) => x.endsWith(".json")))
  validateReport(
    JSON.parse(
      readFileSync(
        new URL(`../reports/examples/${file}`, import.meta.url),
        "utf8",
      ),
    ),
  );
console.log(
  `Valid catalog: ${c.tools.length} tools, ${c.families.length} families, ${c.recipes.length} recipes. Report examples valid.`,
);
