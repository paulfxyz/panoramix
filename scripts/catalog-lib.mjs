import { createHash } from "node:crypto";

export const fields = [
  "name",
  "family",
  "description",
  "access",
  "features",
  "billing",
  "best",
  "watch",
  "source",
  "extra",
  "tags",
];
export const signals = [
  "text",
  "vision",
  "image",
  "video",
  "audio",
  "research",
  "browser",
  "code",
  "connectors",
  "schedule",
  "routing",
  "custom",
  "selfhost",
  "openai",
  "visual",
];
export const factFields = [
  "name",
  "description",
  "access",
  "features",
  "billing",
  "source",
  "extra",
];
export const hash = (text) => createHash("sha256").update(text).digest("hex");
export const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const id = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const date = /^\d{4}-\d{2}-\d{2}$/;
const plain = (v) =>
  typeof v === "string" &&
  v.length > 0 &&
  v.length <= 5000 &&
  !/[<>\u202a-\u202e\u2066-\u2069]/u.test(v);
const url = (v) => {
  try {
    const x = new URL(v);
    return x.protocol === "https:" && !x.username && !x.password;
  } catch {
    return false;
  }
};
const strings = (v) =>
  Array.isArray(v) && v.every(plain) && new Set(v).size === v.length;
const validDate = (v) =>
  typeof v === "string" &&
  date.test(v) &&
  !Number.isNaN(Date.parse(v)) &&
  new Date(v).toISOString().slice(0, 10) === v;
export function validateTool(t, families) {
  assert(
    t && typeof t === "object" && !Array.isArray(t),
    "A tool must be an object.",
  );
  assert(id.test(t.id), "Tool id must be kebab-case.");
  for (const key of [
    "name",
    "family",
    "description",
    "access",
    "billing",
    "best",
    "watch",
    "source",
  ])
    assert(plain(t[key]), `${t.id}: invalid ${key}.`);
  assert(families.includes(t.family), `${t.id}: unknown family.`);
  assert(
    strings(t.features) && t.features.every((x) => signals.includes(x)),
    `${t.id}: invalid features.`,
  );
  assert(strings(t.tags), `${t.id}: invalid tags.`);
  assert(url(t.source), `${t.id}: source must be an HTTPS URL.`);
  if (t.extra !== undefined)
    assert(url(t.extra), `${t.id}: extra must be an HTTPS URL.`);
  if (t.evidence !== undefined) {
    assert(Array.isArray(t.evidence), `${t.id}: invalid evidence.`);
    t.evidence.forEach((e) => validateEvidence(e, t.id));
  }
  return t;
}
function validateEvidence(e, context) {
  assert(
    e &&
      Object.keys(e).every((k) =>
        ["field", "url", "checkedAt", "note", "reportId"].includes(k),
      ),
    `${context}: unknown evidence property.`,
  );
  assert(e && fields.includes(e.field), `${context}: invalid evidence field.`);
  assert(url(e.url), `${context}: evidence needs an HTTPS URL.`);
  assert(
    validDate(e.checkedAt),
    `${context}: evidence needs a real YYYY-MM-DD checkedAt date.`,
  );
  assert(plain(e.note), `${context}: evidence needs a plain-text note.`);
}
export function validateCatalog(c) {
  assert(c?.version === 1, "Unsupported catalog version.");
  assert(validDate(c.updated), "Invalid catalog updated date.");
  assert(
    Array.isArray(c.families) && c.families.length > 0,
    "Missing families.",
  );
  const fs = c.families.map((f) => f.id);
  assert(
    fs.every((x) => id.test(x)) && new Set(fs).size === fs.length,
    "Invalid / duplicate families.",
  );
  c.families.forEach((f) => {
    for (const k of ["name", "short", "description"])
      assert(plain(f[k]), `Invalid family ${k}.`);
    assert(/^#[a-f0-9]{6}$/i.test(f.color), "Invalid family color.");
  });
  assert(Array.isArray(c.tools) && c.tools.length > 0, "Missing tools.");
  c.tools.forEach((t) => validateTool(t, fs));
  const ids = c.tools.map((t) => t.id);
  assert(new Set(ids).size === ids.length, "Duplicate tool IDs.");
  assert(Array.isArray(c.recipes), "Missing recipes.");
  assert(
    new Set(c.recipes.map((r) => r.id)).size === c.recipes.length,
    "Duplicate recipe IDs.",
  );
  c.recipes.forEach((r) => {
    assert(
      id.test(r.id) && ["all", ...fs].includes(r.family),
      "Invalid recipe id/family.",
    );
    for (const k of ["title", "description", "query"])
      assert(plain(r[k]), `Invalid recipe ${k}.`);
    assert(
      [
        "agent",
        "route",
        "image",
        "zap",
        "shield",
        "workflow",
        "code",
        "audio",
        "server",
      ].includes(r.icon),
      "Invalid recipe icon.",
    );
    assert(
      ["sage", "blue", "peach", "sand"].includes(r.tone),
      "Invalid recipe tone.",
    );
    assert(
      strings(r.ids) &&
        r.ids.length > 0 &&
        r.ids.length <= 4 &&
        r.ids.every((x) => ids.includes(x)),
      "Recipe references unknown or too many tools.",
    );
  });
  return c;
}
export function validateReport(r) {
  assert(
    r &&
      Object.keys(r).every((k) =>
        [
          "schemaVersion",
          "reportId",
          "submittedAt",
          "author",
          "license",
          "summary",
          "changes",
        ].includes(k),
      ),
    "Unknown report property.",
  );
  assert(r?.schemaVersion === 1, "Unsupported report schemaVersion.");
  assert(id.test(r.reportId), "reportId must be unique kebab-case.");
  assert(
    validDate(r.submittedAt),
    "submittedAt must be a real YYYY-MM-DD date.",
  );
  assert(
    plain(r.author) && r.author.length <= 200,
    "Provide a public author name or pseudonym, not an email or secret.",
  );
  assert(plain(r.summary), "Report needs a summary.");
  assert(r.license === "MIT", "Contributions must be MIT licensed.");
  assert(
    Array.isArray(r.changes) && r.changes.length > 0 && r.changes.length <= 100,
    "Provide 1–100 changes.",
  );
  r.changes.forEach((ch) => {
    assert(
      ch &&
        Object.keys(ch).every((k) =>
          ["toolId", "set", "expected", "evidence"].includes(k),
        ),
      "Unknown change property.",
    );
    assert(ch && id.test(ch.toolId), "Invalid toolId.");
    assert(
      ch.set &&
        typeof ch.set === "object" &&
        !Array.isArray(ch.set) &&
        Object.keys(ch.set).length > 0,
      "Each change needs set fields.",
    );
    assert(
      Object.keys(ch.set).every((k) => fields.includes(k)),
      "Unknown / forbidden set field. IDs, evidence, and families cannot be edited this way.",
    );
    assert(
      ch.expected &&
        typeof ch.expected === "object" &&
        !Array.isArray(ch.expected),
      "Each change needs expected values (or an empty object for a new tool).",
    );
    assert(
      Object.keys(ch.expected).every((k) => fields.includes(k)),
      "Unknown expected field.",
    );
    assert(Array.isArray(ch.evidence), "Every change needs an evidence array.");
    ch.evidence.forEach((e) => validateEvidence(e, ch.toolId));
    for (const field of Object.keys(ch.set).filter((k) =>
      factFields.includes(k),
    ))
      assert(
        ch.evidence.some((e) => e.field === field),
        `${ch.toolId}: missing field-level evidence for ${field}.`,
      );
  });
  return r;
}
export function combineReports(catalog, reports) {
  validateCatalog(catalog);
  reports.forEach(validateReport);
  const result = structuredClone(catalog),
    proposal = new Map(),
    seen = new Set(),
    plan = [];
  for (const r of reports) {
    assert(!seen.has(r.reportId), `Duplicate report ${r.reportId}.`);
    seen.add(r.reportId);
    for (const ch of r.changes) {
      let original = catalog.tools.find((t) => t.id === ch.toolId);
      const adding = !original;
      if (adding) {
        assert(
          Object.keys(ch.expected).length === 0,
          `${ch.toolId}: new tools need empty expected.`,
        );
        for (const f of fields.filter((x) => x !== "extra"))
          assert(
            Object.hasOwn(ch.set, f),
            `${ch.toolId}: new tool missing ${f}.`,
          );
      }
      for (const [field, value] of Object.entries(ch.set)) {
        if (!adding) {
          assert(
            Object.hasOwn(ch.expected, field),
            `${ch.toolId}.${field}: expected value is required.`,
          );
          const expected = Object.hasOwn(original, field)
            ? original[field]
            : null;
          assert(
            equal(expected, ch.expected[field]),
            `STALE: ${ch.toolId}.${field} no longer matches expected.`,
          );
        }
        const key = `${ch.toolId}.${field}`;
        if (proposal.has(key))
          assert(
            equal(proposal.get(key), value),
            `CONFLICT: competing proposals for ${key}. Resolve manually; nothing was applied.`,
          );
        proposal.set(key, value);
        plan.push({
          reportId: r.reportId,
          toolId: ch.toolId,
          field,
          before: original?.[field] ?? null,
          after: value,
        });
      }
      let target = result.tools.find((t) => t.id === ch.toolId);
      if (!target) {
        target = { id: ch.toolId };
        result.tools.push(target);
      }
      Object.assign(target, ch.set);
      target.evidence ??= [];
      for (const e of ch.evidence) {
        const item = { ...e, reportId: r.reportId };
        if (!target.evidence.some((v) => equal(v, item)))
          target.evidence.push(item);
      }
    }
  }
  result.updated = [catalog.updated, ...reports.map((r) => r.submittedAt)]
    .sort()
    .at(-1);
  validateCatalog(result);
  return { catalog: result, plan };
}
