export type Family =
  | "agents"
  | "gateways"
  | "inference"
  | "media"
  | "gpu"
  | "cloud"
  | "models"
  | "coding"
  | "automation"
  | "creative";
export const featureLabels: Record<string, string> = {
  text: "Text",
  vision: "Vision input",
  image: "Image generation",
  video: "Video generation",
  audio: "Audio",
  research: "Research",
  browser: "Browser actions",
  code: "Code execution",
  connectors: "Connected apps",
  schedule: "Scheduled work",
  routing: "Routing / fallback",
  custom: "Custom deployment",
  selfhost: "Self-host option",
  openai: "OpenAI-style chat",
  visual: "Visual workspace",
};
export type Tool = {
  id: string;
  name: string;
  family: Family;
  description: string;
  access: string;
  features: string[];
  billing: string;
  best: string;
  watch: string;
  source: string;
  extra?: string;
  tags: string[];
  evidence?: {
    field: string;
    url: string;
    checkedAt: string;
    note: string;
    reportId: string;
  }[];
};
export type Recipe = {
  id: string;
  title: string;
  description: string;
  query: string;
  family: string;
  icon: string;
  ids: string[];
  tone: string;
};
export type Catalog = {
  version: number;
  updated: string;
  tools: Tool[];
  families: {
    id: Family;
    name: string;
    short: string;
    color: string;
    description: string;
  }[];
  recipes: Recipe[];
};
export let tools: Tool[] = [];
export let families: Catalog["families"] = [];
export let recipes: Recipe[] = [];
export let metadata = { updated: "", version: 1 };
export async function loadCatalog(): Promise<void> {
  const response = await fetch("./catalog.json", { cache: "no-cache" });
  if (!response.ok)
    throw new Error(`Catalogue returned HTTP ${response.status}.`);
  const c = (await response.json()) as Catalog;
  if (
    c.version !== 1 ||
    !Array.isArray(c.tools) ||
    !Array.isArray(c.families) ||
    !Array.isArray(c.recipes) ||
    !c.updated
  )
    throw new Error(
      "The catalogue format is invalid. Restore catalog.json or run npm test.",
    );
  const ids = new Set(c.tools.map((t) => t.id));
  const familyIds = new Set(c.families.map((f) => f.id));
  if (
    ids.size !== c.tools.length ||
    c.tools.some(
      (t) =>
        !familyIds.has(t.family) ||
        !Array.isArray(t.features) ||
        !Array.isArray(t.tags) ||
        t.features.some((f) => !featureLabels[f]),
    )
  )
    throw new Error("The catalogue contains invalid tool records.");
  if (
    c.recipes.some(
      (r) => !Array.isArray(r.ids) || r.ids.some((id) => !ids.has(id)),
    )
  )
    throw new Error("A recipe references an unknown tool.");
  tools = c.tools;
  families = c.families;
  recipes = c.recipes;
  metadata = { updated: c.updated, version: c.version };
}
export type Brief = {
  families: Family[];
  features: string[];
  words: string[];
  names: string[];
  recognized: boolean;
};
export function parseBrief(q: string): Brief {
  const s = q.toLowerCase();
  const f = new Set<Family>();
  const features = new Set<string>();
  const add = (re: RegExp, fs: Family[], cap?: string) => {
    if (re.test(s)) {
      fs.forEach((x) => f.add(x));
      if (cap) features.add(cap);
    }
  };
  add(
    /autonom|digital coworker|computer alternative|alternative.{0,12}computer|research reports|agent workspace|connected tools|manus|cowork|genspark|gamut/,
    ["agents"],
  );
  add(
    /gateway|multi.model api|openrouter|routing|fallback|proxy/,
    ["gateways"],
    "routing",
  );
  add(/direct inference|fast text|low.latency|interactive|instant/, [
    "inference",
  ]);
  add(/media api|generation api|apis for image|runware|fal\.ai|replicate/, [
    "media",
  ]);
  add(/gpu|custom model|deploy.{0,12}model|own weights/, ["gpu"], "custom");
  add(/aws|bedrock|azure|vertex|enterprise cloud|google cloud/, ["cloud"]);
  add(
    /coding agent|code review|codebase|repository|build.{0,25}app|build.{0,25}website/,
    ["coding"],
  );
  add(
    /workflow|automat|trigger|recurring business/,
    ["automation"],
    "connectors",
  );
  add(
    /creative studio|visual creative|image editing|video editing|design studio/,
    ["creative"],
    "visual",
  );
  if (/self.host|local control|on.prem|runs locally/.test(s))
    features.add("selfhost");
  if (/image|illustrat|picture/.test(s)) features.add("image");
  if (/video/.test(s)) features.add("video");
  if (/audio|voice|speech|transcri|dubbing/.test(s)) features.add("audio");
  if (/research/.test(s)) features.add("research");
  if (/browser|websites/.test(s)) features.add("browser");
  if (/connect|integrat/.test(s)) features.add("connectors");
  if (/schedul/.test(s)) features.add("schedule");
  if (/openai.compatib|openai.style/.test(s)) features.add("openai");
  const names = tools
    .filter(
      (t) =>
        s.includes(t.name.toLowerCase()) ||
        s.includes(t.id.replaceAll("-", " ")),
    )
    .map((t) => t.id);
  const words = s
    .split(/[^a-z0-9]+/)
    .filter(
      (w) =>
        w.length > 2 &&
        ![
          "the",
          "for",
          "and",
          "with",
          "want",
          "need",
          "compare",
          "tools",
          "tool",
          "like",
          "that",
          "this",
          "from",
          "have",
          "into",
          "based",
          "best",
        ].includes(w),
    );
  return {
    families: Array.from(f),
    features: Array.from(features),
    words,
    names,
    recognized: !!(
      f.size ||
      features.size ||
      names.length ||
      tools.some((t) => t.tags.some((x) => words.includes(x)))
    ),
  };
}
export function matchScore(
  t: Tool,
  b: Brief,
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  if (b.families.includes(t.family)) {
    score += 12;
    reasons.push("Relevant family");
  }
  const caps = b.features.filter((x) => t.features.includes(x));
  score += caps.length * 5;
  caps.forEach((x) => reasons.push(featureLabels[x]));
  if (b.names.includes(t.id)) {
    score += 9;
    reasons.push("Named in brief");
  }
  const tokens = new Set(
    `${t.tags.join(" ")} ${t.name} ${t.description}`
      .toLowerCase()
      .split(/[^a-z0-9]+/),
  );
  const hits = b.words.filter((w) => tokens.has(w));
  score += Math.min(hits.length, 8);
  return { score, reasons: Array.from(new Set(reasons)) };
}
