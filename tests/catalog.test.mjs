import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  validateCatalog,
  validateReport,
  combineReports,
} from "../scripts/catalog-lib.mjs";
const catalog = JSON.parse(
  readFileSync(
    new URL("../client/public/catalog.json", import.meta.url),
    "utf8",
  ),
);
const example = JSON.parse(
  readFileSync(
    new URL("../reports/examples/example-report.json", import.meta.url),
    "utf8",
  ),
);
test("catalog and community example are valid", () => {
  validateCatalog(catalog);
  validateReport(example);
});
test("single report is applied without mutating the original", () => {
  const original = structuredClone(catalog),
    { catalog: updated, plan } = combineReports(catalog, [example]);
  assert.deepEqual(catalog, original);
  assert.equal(plan.length, 1);
  assert.equal(
    updated.tools.find((t) => t.id === "groq").evidence.at(-1).reportId,
    example.reportId,
  );
});
test("stale expected values are blocked", () => {
  const r = structuredClone(example);
  r.changes[0].expected.access = "A stale value";
  assert.throws(() => combineReports(catalog, [r]), /STALE/);
});
test("conflicting reports are blocked rather than silently overwritten", () => {
  const r = structuredClone(example);
  r.reportId = "conflicting-report";
  r.changes[0].set.access = "Different proposal";
  assert.throws(() => combineReports(catalog, [example, r]), /CONFLICT/);
});
test("agreeing reports combine their evidence", () => {
  const r = structuredClone(example);
  r.reportId = "second-independent-review";
  const out = combineReports(catalog, [example, r]).catalog.tools.find(
    (t) => t.id === "groq",
  );
  assert.equal(out.evidence.length, 2);
});
test("factual changes without field-level evidence are rejected", () => {
  const r = structuredClone(example);
  r.changes[0].evidence = [];
  assert.throws(() => validateReport(r), /missing field-level evidence/);
});
test("unknown fields, IDs, HTML, unsafe URLs, and unknown features are rejected", () => {
  for (const set of [
    { id: "other" },
    { source: "javascript:alert(1)" },
    { description: "<script>bad</script>" },
    { features: ["imaginary-signal"] },
  ]) {
    const r = structuredClone(example);
    r.changes[0].set = set;
    r.changes[0].expected = Object.fromEntries(
      Object.keys(set).map((k) => [
        k,
        catalog.tools.find((t) => t.id === "groq")[k] ?? null,
      ]),
    );
    r.changes[0].evidence = Object.keys(set).map((field) => ({
      field,
      url: "https://console.groq.com/docs/overview",
      checkedAt: "2026-10-22",
      note: "Test evidence.",
    }));
    assert.throws(() => combineReports(catalog, [r]));
  }
});
test("new complete tools may be proposed, with no prior-value requirements", () => {
  const sample = structuredClone(catalog.tools.find((t) => t.id === "groq"));
  delete sample.id;
  const r = structuredClone(example);
  r.reportId = "test-new-record";
  r.changes = [
    {
      toolId: "sample-inference",
      set: sample,
      expected: {},
      evidence: [
        "name",
        "description",
        "access",
        "features",
        "billing",
        "source",
      ].map((field) => ({
        field,
        url: "https://console.groq.com/docs/overview",
        checkedAt: "2026-10-22",
        note: "Schema fixture, not a real provider.",
      })),
    },
  ];
  const result = combineReports(catalog, [r]);
  assert.equal(result.catalog.tools.length, catalog.tools.length + 1);
});
test("duplicates, unknown families, and broken recipe references fail validation", () => {
  const a = structuredClone(catalog);
  a.tools.push(a.tools[0]);
  assert.throws(() => validateCatalog(a), /Duplicate/);
  const b = structuredClone(catalog);
  b.tools[0].family = "unknown";
  assert.throws(() => validateCatalog(b), /family/);
  const c = structuredClone(catalog);
  c.recipes[0].ids = ["missing"];
  assert.throws(() => validateCatalog(c), /unknown/);
});
