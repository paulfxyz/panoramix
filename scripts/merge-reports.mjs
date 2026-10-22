import {
  readFileSync,
  writeFileSync,
  renameSync,
  existsSync,
  mkdirSync,
  openSync,
  closeSync,
  unlinkSync,
} from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { hash, combineReports, assert } from "./catalog-lib.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
const args = process.argv.slice(2);
const reportPaths = [];
let apply = false,
  expectedHash;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--report") {
    assert(args[i + 1], "--report needs a JSON path.");
    reportPaths.push(resolve(args[++i]));
  } else if (a === "--apply") apply = true;
  else if (a === "--dry-run") {
  } else if (a === "--expect-hash") {
    assert(args[i + 1], "--expect-hash needs a SHA-256.");
    expectedHash = args[++i];
  } else
    throw new Error(
      `Unknown argument ${a}. Use --report file.json [--report another.json] [--dry-run | --apply --expect-hash SHA256].`,
    );
}
assert(
  reportPaths.length,
  "No reports specified. Use --report path/to/report.json. Default is dry-run.",
);
const path = resolve(root, "client/public/catalog.json"),
  raw = readFileSync(path, "utf8"),
  beforeHash = hash(raw);
const reports = reportPaths.map((p) => JSON.parse(readFileSync(p, "utf8")));
const { catalog, plan } = combineReports(JSON.parse(raw), reports);
for (const r of reports)
  assert(
    !existsSync(resolve(root, `reports/merged/${r.reportId}.json`)),
    `Report ${r.reportId} has already been merged.`,
  );
console.log(
  JSON.stringify(
    {
      mode: apply ? "APPLY" : "DRY RUN",
      catalogSha256: beforeHash,
      reports: reports.map((r) => r.reportId),
      plan,
    },
    null,
    2,
  ),
);
if (!apply) {
  console.log(
    `No files changed. After human review, apply with --apply --expect-hash ${beforeHash}`,
  );
  process.exit(0);
}
assert(
  expectedHash === beforeHash,
  "Expected catalog hash missing or stale. Review a fresh dry-run; nothing was written.",
);
const lock = resolve(root, ".catalog-merge.lock"),
  fd = openSync(lock, "wx");
try {
  assert(
    hash(readFileSync(path, "utf8")) === beforeHash,
    "Catalog changed during review; nothing was written.",
  );
  const archive = resolve(root, "reports/merged");
  mkdirSync(archive, { recursive: true });
  const pending = path + ".tmp";
  writeFileSync(pending, JSON.stringify(catalog, null, 2) + "\n");
  renameSync(pending, path);
  for (const r of reports)
    writeFileSync(
      resolve(archive, `${r.reportId}.json`),
      JSON.stringify(
        {
          ...r,
          mergedAt: new Date().toISOString(),
          previousCatalogSha256: beforeHash,
        },
        null,
        2,
      ) + "\n",
      { flag: "wx" },
    );
  console.log(
    "Applied locally. Review git diff, run npm test && npm run check && npm run package:site, then publish the static files.",
  );
} finally {
  closeSync(fd);
  unlinkSync(lock);
}
