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

/** Six editorial dimensions, each derived purely from documented features. */
export const dimensions: { id: string; label: string; short: string; features: string[] }[] = [
  { id: "language", label: "Language models", short: "Language", features: ["text", "vision", "openai"] },
  { id: "media", label: "Media generation", short: "Media", features: ["image", "video", "audio"] },
  { id: "action", label: "Acting in the world", short: "Action", features: ["browser", "code", "connectors"] },
  { id: "research", label: "Research & synthesis", short: "Research", features: ["research"] },
  { id: "control", label: "Control & ownership", short: "Control", features: ["routing", "custom", "selfhost"] },
  { id: "workflow", label: "Workflow & workspace", short: "Workflow", features: ["schedule", "visual"] },
];

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
  evidence?: { field: string; url: string; checkedAt: string; note: string; reportId: string }[];
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

export type FamilyMeta = { id: Family; name: string; short: string; color: string; description: string };

export type Catalog = {
  version: number;
  updated: string;
  tools: Tool[];
  families: FamilyMeta[];
  recipes: Recipe[];
};

export let tools: Tool[] = [];
export let families: FamilyMeta[] = [];
export let recipes: Recipe[] = [];
export let metadata = { updated: "", version: 1 };

export async function loadCatalog(): Promise<void> {
  const response = await fetch("./catalog.json", { cache: "no-cache" });
  if (!response.ok) throw new Error(`Catalogue returned HTTP ${response.status}.`);
  const c = (await response.json()) as Catalog;
  if (c.version !== 1 || !Array.isArray(c.tools) || !Array.isArray(c.families) || !Array.isArray(c.recipes) || !c.updated)
    throw new Error("The catalogue format is invalid. Restore catalog.json or run npm test.");
  const ids = new Set(c.tools.map((t) => t.id));
  const familyIds = new Set(c.families.map((f) => f.id));
  if (
    ids.size !== c.tools.length ||
    c.tools.some(
      (t) => !familyIds.has(t.family) || !Array.isArray(t.features) || !Array.isArray(t.tags) || t.features.some((f) => !featureLabels[f]),
    )
  )
    throw new Error("The catalogue contains invalid tool records.");
  if (c.recipes.some((r) => !Array.isArray(r.ids) || r.ids.some((id) => !ids.has(id))))
    throw new Error("A recipe references an unknown tool.");
  tools = c.tools;
  families = c.families;
  recipes = c.recipes;
  metadata = { updated: c.updated, version: c.version };
}

export const familyOf = (id: string): FamilyMeta => families.find((f) => f.id === id) ?? families[0];
export const toolOf = (id: string): Tool | undefined => tools.find((t) => t.id === id);

/** 0..1 coverage per dimension — the share of that dimension's documented features present. */
export function profile(t: Tool): number[] {
  return dimensions.map((d) => d.features.filter((f) => t.features.includes(f)).length / d.features.length);
}

export const has = (t: Tool, f: string) => t.features.includes(f);

/* ---------- Brief matcher (local, rule-based) ---------- */

const familyWords: Record<Family, string[]> = {
  agents: ["agent", "agents", "autonomous", "coworker", "assistant", "computer", "manus", "do the work", "delegate", "tasks", "task"],
  gateways: ["gateway", "router", "routing", "openrouter", "one api", "unified", "many models", "fallback", "switch models", "multi-model", "multimodel"],
  inference: ["inference", "fast", "latency", "tokens", "cheap", "open model", "open-weights", "open weights", "llama", "qwen", "serverless"],
  media: ["image api", "video api", "generation api", "runware", "fal", "replicate", "media api", "generate images", "generate video"],
  gpu: ["gpu", "deploy", "container", "own model", "custom model", "fine-tune", "finetune", "modal", "runpod", "baseten", "vllm"],
  cloud: ["bedrock", "vertex", "azure", "aws", "google cloud", "enterprise", "compliance", "governance", "cloud"],
  models: ["openai api", "anthropic", "claude api", "mistral", "first-party", "direct api", "frontier"],
  coding: ["code", "coding", "ide", "cursor", "codex", "claude code", "build an app", "app builder", "lovable", "prototype", "website"],
  automation: ["workflow", "automation", "automate", "zapier", "n8n", "make.com", "trigger", "integrations", "no-code"],
  creative: ["studio", "midjourney", "runway", "krea", "elevenlabs", "voice", "design", "creative", "artwork"],
};

const featureWords: Record<string, string[]> = {
  text: ["text", "chat", "llm", "writing", "summar", "translate"],
  vision: ["vision", "see images", "understand images", "ocr"],
  image: ["image", "images", "picture", "illustration", "photo"],
  video: ["video", "clip", "film"],
  audio: ["audio", "voice", "speech", "tts", "transcri", "music", "sound"],
  research: ["research", "report", "sources", "citations", "due diligence", "analysis", "web search"],
  browser: ["browser", "browse", "website", "fill forms", "navigate"],
  code: ["code", "script", "python", "execute", "terminal", "sandbox"],
  connectors: ["gmail", "notion", "slack", "calendar", "connected", "integrations", "connectors", "apps"],
  schedule: ["schedule", "recurring", "daily", "weekly", "cron", "monitor"],
  routing: ["routing", "fallback", "failover", "switch", "cheapest", "route"],
  custom: ["custom model", "own model", "deploy", "fine-tune", "finetune", "dedicated"],
  selfhost: ["self-host", "selfhost", "self host", "on-prem", "on prem", "my own server", "local", "privacy", "private"],
  openai: ["openai-compatible", "openai compatible", "drop-in", "same sdk"],
  visual: ["visual", "canvas", "drag", "no-code", "builder"],
};

export type Brief = { families: Family[]; features: string[]; names: string[]; words: string[] };

const esc = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** Whole-word / whole-phrase match, so "fal" never matches "fallback". Words ending in a stem (e.g. "summar") still match longer forms. */
const hit = (q: string, w: string) => new RegExp(`(^|[^a-z0-9])${esc(w)}(?=$|[^a-z0-9]|[a-z]{0,6}(?:$|[^a-z0-9]))`).test(q) && (w.length > 3 || new RegExp(`(^|[^a-z0-9])${esc(w)}($|[^a-z0-9])`).test(q));

export function parseBrief(text: string): Brief {
  const q = text.toLowerCase();
  const fam = (Object.keys(familyWords) as Family[]).filter((f) => familyWords[f].some((w) => hit(q, w)));
  const feats = Object.keys(featureWords).filter((f) => featureWords[f].some((w) => hit(q, w)));
  const names = tools.filter((t) => hit(q, t.name.toLowerCase()) || new RegExp(`(^|[^a-z0-9])${esc(t.id)}($|[^a-z0-9])`).test(q)).map((t) => t.id);
  const words = q.split(/[^a-z0-9+-]+/).filter((w) => w.length > 3);
  return { families: fam, features: feats, names, words };
}

export function matchScore(t: Tool, b: Brief): { score: number; why: string[] } {
  let score = 0;
  const why: string[] = [];
  if (b.names.includes(t.id)) {
    score += 6;
    why.push("Named in your brief");
  } else if (b.names.length) {
    const named = b.names.map(toolOf).filter(Boolean) as Tool[];
    if (named.some((n) => n.family === t.family)) {
      score += 3;
      why.push(`Same family as ${named.find((n) => n.family === t.family)!.name}`);
    }
  }
  if (b.families.includes(t.family)) {
    score += 3;
    why.push(familyOf(t.family).name);
  }
  for (const f of b.features)
    if (has(t, f)) {
      score += 1.5;
      why.push(featureLabels[f]);
    }
  for (const w of b.words) if (t.tags.includes(w)) score += 0.5;
  return { score, why: [...new Set(why)].slice(0, 4) };
}
