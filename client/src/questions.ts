import type { Lens } from "./lenses";
import { featureLabels, type Family, type FamilyMeta, type Tool } from "./data";

/**
 * The checks people run most often against the record. Each one opens a lens
 * with a fixed configuration, or a ready-made comparison. There is no free-text
 * input: every view is a reproducible reading of the signed catalogue.
 */
export type CompareViewKind = "radar" | "bars" | "matrix" | "facts";

export type Question = {
  id: string;
  text: string;
  group: QuestionGroup;
  lens?: Lens;
  compare?: string[];
  /** Which compare view opens first. Head-to-head checks open on the table. */
  view?: CompareViewKind;
  read: string;
  /** Hand-written, shown first in the rotating ten. */
  featured?: boolean;
  /** Extra words for the filter field. */
  tags?: string[];
};

export type QuestionGroup = "alternatives" | "agents" | "models" | "media" | "control" | "build" | "picture";

export const groupLabels: Record<QuestionGroup, string> = {
  alternatives: "Alternatives",
  agents: "Agents",
  models: "Models & APIs",
  media: "Images, video, audio",
  control: "Control & privacy",
  build: "Building",
  picture: "The big picture",
};

export const curated: Question[] = [
  // Alternatives
  { id: "alt-computer", text: "What are the alternatives to Perplexity Computer?", group: "alternatives", lens: { kind: "alternatives", anchor: "computer" }, read: "Same-family neighbours of Computer, ranked by shared documented capabilities, with exactly what each adds or lacks." },
  { id: "alt-openrouter", text: "Alternatives to OpenRouter?", group: "alternatives", lens: { kind: "alternatives", anchor: "openrouter" }, read: "Other model gateways and what they document beyond routing." },
  { id: "alt-runware", text: "Alternatives to Runware?", group: "alternatives", lens: { kind: "alternatives", anchor: "runware" }, read: "Other media APIs compared on image, video, audio and custom-model support." },
  { id: "alt-cursor", text: "Alternatives to Cursor?", group: "alternatives", lens: { kind: "alternatives", anchor: "cursor" }, read: "Coding tools and app builders next to Cursor." },
  { id: "alt-zapier", text: "Alternatives to Zapier?", group: "alternatives", lens: { kind: "alternatives", anchor: "zapier" }, read: "Workflow automation platforms, including self-hostable ones." },
  { id: "alt-midjourney", text: "Alternatives to Midjourney?", group: "alternatives", lens: { kind: "alternatives", anchor: "midjourney" }, read: "Creative studios compared on image, video, audio and workspace." },
  { id: "alt-openai", text: "Alternatives to the OpenAI API?", group: "alternatives", lens: { kind: "alternatives", anchor: "openai" }, read: "Other first-party model APIs and what they document." },
  { id: "alt-modal", text: "Alternatives to Modal?", group: "alternatives", lens: { kind: "alternatives", anchor: "modal" }, read: "GPU and deployment platforms for running your own models." },

  // Agents
  { id: "ag-browse", text: "Which agents can browse the web for me?", group: "agents", lens: { kind: "checklist", caps: ["browser"], family: "agents" }, read: "Agent workspaces whose official source documents browser actions." },
  { id: "ag-code", text: "Which agents can run code?", group: "agents", lens: { kind: "checklist", caps: ["code"], family: "agents" }, read: "Agents with documented code execution in a sandbox or on your machine." },
  { id: "ag-apps", text: "Which agents connect to my apps?", group: "agents", lens: { kind: "checklist", caps: ["connectors"], family: "agents" }, read: "Agents documenting connected apps such as mail, calendars, docs or chat tools." },
  { id: "ag-local", text: "Which agents can I run on my own machine?", group: "agents", lens: { kind: "checklist", caps: ["selfhost"], family: "agents" }, read: "Agents with a documented local or self-hosted option." },
  { id: "ag-research", text: "Which tools write research reports?", group: "agents", lens: { kind: "checklist", caps: ["research"] }, read: "Any tool documenting multi-source research and synthesis." },
  { id: "ag-schedule", text: "Which agents run on a schedule?", group: "agents", lens: { kind: "checklist", caps: ["schedule"], family: "agents" }, read: "Agents with documented recurring or scheduled work." },
  { id: "ag-compare", text: "Computer vs Manus vs Cowork vs ChatGPT agent", group: "agents", compare: ["computer", "manus", "cowork", "chatgpt-agent"], view: "matrix", read: "A side-by-side of four agent workspaces across six dimensions." },
  { id: "ag-radars", text: "Show me the shape of every agent", group: "agents", lens: { kind: "radars", family: "agents" }, read: "One small radar per agent. Taller shapes document more." },

  // Models & APIs
  { id: "mo-openai-compat", text: "Which inference APIs are OpenAI-compatible?", group: "models", lens: { kind: "checklist", caps: ["openai"], family: "inference" }, read: "Direct inference providers documenting an OpenAI-style chat endpoint." },
  { id: "mo-routing", text: "Which gateways route and fall back across providers?", group: "models", lens: { kind: "checklist", caps: ["routing"], family: "gateways" }, read: "Gateways with documented routing or fallback." },
  { id: "mo-selfhost-gw", text: "Can I self-host a model gateway?", group: "models", lens: { kind: "checklist", caps: ["routing", "selfhost"] }, read: "Tools documenting both routing and a self-host option." },
  { id: "mo-vision", text: "Which APIs accept images as input?", group: "models", lens: { kind: "checklist", caps: ["vision"] }, read: "Vision input is not image generation. These document understanding images." },
  { id: "mo-custom", text: "Where can I deploy a custom or fine-tuned model?", group: "models", lens: { kind: "checklist", caps: ["custom"] }, read: "Providers documenting custom deployment or dedicated endpoints." },
  { id: "mo-speed", text: "Which text APIs should I benchmark for speed?", group: "models", compare: ["groq", "cerebras", "fireworks", "together"], view: "matrix", read: "A shortlist to test yourself. No speed numbers are claimed here." },
  { id: "mo-gateways", text: "OpenRouter vs Requesty vs Portkey vs LiteLLM", group: "models", compare: ["openrouter", "requesty", "portkey", "litellm"], view: "matrix", read: "Four gateways side by side." },
  { id: "mo-firstparty", text: "OpenAI vs Anthropic vs Mistral APIs", group: "models", compare: ["openai", "anthropic", "mistral"], view: "matrix", read: "First-party APIs compared on documented modalities." },
  { id: "mo-radars", text: "The shape of every inference provider", group: "models", lens: { kind: "radars", family: "inference" }, read: "Small radars for all direct inference providers." },

  // Media
  { id: "me-all", text: "One API for images, video and audio?", group: "media", lens: { kind: "checklist", caps: ["image", "video", "audio"] }, read: "Tools documenting all three generation modalities." },
  { id: "me-video", text: "Which tools generate video?", group: "media", lens: { kind: "checklist", caps: ["video"] }, read: "Any tool documenting video generation, API or studio." },
  { id: "me-audio", text: "Which tools do voice and audio?", group: "media", lens: { kind: "checklist", caps: ["audio"] }, read: "Speech, music or audio generation, documented." },
  { id: "me-image-api", text: "Image generation through an API", group: "media", lens: { kind: "checklist", caps: ["image"], family: "media" }, read: "Media APIs documenting image generation." },
  { id: "me-compare", text: "Runware vs fal vs Replicate vs Novita", group: "media", compare: ["runware", "fal", "replicate", "novita"], view: "matrix", read: "Four media-generation APIs side by side." },
  { id: "me-studios", text: "Creative studios, compared", group: "media", lens: { kind: "radars", family: "creative" }, read: "Midjourney, Krea, ElevenLabs and Runway as radars." },

  // Control & privacy
  { id: "co-selfhost", text: "What can I self-host?", group: "control", lens: { kind: "checklist", caps: ["selfhost"] }, read: "Everything with a documented self-host option, grouped by family." },
  { id: "co-auto-self", text: "Self-hosted workflow automation", group: "control", lens: { kind: "checklist", caps: ["selfhost"], family: "automation" }, read: "Automation platforms you can run yourself." },
  { id: "co-map", text: "Who gives the most control with the broadest coverage?", group: "control", lens: { kind: "map" }, read: "Look near the Control pole, and at the larger stars that float toward the middle." },
  { id: "co-cloud", text: "Cloud platforms with governance", group: "control", lens: { kind: "radars", family: "cloud" }, read: "Bedrock, Vertex and Azure AI as radars." },
  { id: "co-gpu", text: "GPU platforms for my own models", group: "control", lens: { kind: "radars", family: "gpu" }, read: "Modal, Baseten and Runpod as radars." },

  // Building
  { id: "bu-app", text: "Build an app from a prompt", group: "build", lens: { kind: "radars", family: "coding" }, read: "Coding tools and app builders at a glance." },
  { id: "bu-terminal", text: "Coding agents that run in my terminal", group: "build", lens: { kind: "checklist", caps: ["code"], family: "coding" }, read: "Coding tools with documented code execution." },
  { id: "bu-nocode", text: "Automate workflows without code", group: "build", lens: { kind: "checklist", caps: ["visual", "connectors"] }, read: "Visual builders that also document connected apps." },
  { id: "bu-stack", text: "Build me a full stack", group: "build", lens: { kind: "stack" }, read: "Pick one tool per layer and see the combined shape." },
  { id: "bu-coding-compare", text: "Cursor vs Claude Code vs Codex vs Lovable", group: "build", compare: ["cursor", "claude-code", "codex", "lovable"], view: "matrix", read: "Four coding tools side by side." },

  // Big picture
  { id: "pi-map", text: "Show me the whole landscape", group: "picture", lens: { kind: "map" }, read: "Every tool pulled toward the dimensions it documents. Hover to read, click to open." },
  { id: "pi-rivers", text: "How do families map to capabilities?", group: "picture", lens: { kind: "rivers" }, read: "Ribbons from the ten families into the six dimensions." },
  { id: "pi-table", text: "Everything in one table", group: "picture", lens: { kind: "matrix", family: "all" }, read: "All tools against all capabilities. Filled dot means documented." },
  { id: "pi-broad", text: "Which tools document the most capabilities?", group: "picture", lens: { kind: "checklist", caps: [] }, read: "Every tool, grouped by family, sorted by documented capability count." },
];

const familyGroup: Record<Family, QuestionGroup> = {
  agents: "agents",
  gateways: "models",
  inference: "models",
  models: "models",
  media: "media",
  creative: "media",
  gpu: "control",
  cloud: "control",
  coding: "build",
  automation: "build",
};

const singular: Record<Family, string> = {
  agents: "agent workspace",
  gateways: "model gateway",
  inference: "inference provider",
  models: "first-party API",
  media: "media API",
  creative: "creative studio",
  gpu: "GPU platform",
  cloud: "cloud AI platform",
  coding: "coding tool",
  automation: "automation platform",
};
const plural: Record<Family, string> = {
  agents: "agents",
  gateways: "gateways",
  inference: "inference providers",
  models: "first-party APIs",
  media: "media APIs",
  creative: "creative studios",
  gpu: "GPU platforms",
  cloud: "cloud AI platforms",
  coding: "coding tools",
  automation: "automation platforms",
};

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

function signature(q: Question): string {
  if (q.compare) return "c:" + [...q.compare].sort().join("+");
  const l = q.lens!;
  return "l:" + l.kind + ":" + (l.family ?? "") + ":" + (l.anchor ?? "") + ":" + [...(l.caps ?? [])].sort().join("+");
}

export const TARGET = 500;

/**
 * Expands the hand-written checks into the 300 most common cases, built
 * deterministically from the record itself: alternatives to every tool,
 * head-to-head pairs within each family, family × capability filters,
 * capability combinations and family views. Each case opens a prepared
 * setup that can still be adjusted before running.
 */
export function buildQuestions(tools: Tool[], families: FamilyMeta[]): Question[] {
  const out: Question[] = curated.map((q) => ({ ...q, featured: true }));
  const seen = new Set(out.map(signature));
  const push = (q: Question) => {
    const sig = signature(q);
    if (seen.has(sig)) return false;
    seen.add(sig);
    out.push(q);
    return true;
  };
  const byFam = (f: Family) => tools.filter((t) => t.family === f).sort((a, b) => b.features.length - a.features.length || a.name.localeCompare(b.name));
  const famName = (f: Family) => families.find((x) => x.id === f)?.name ?? f;
  const featureIds = Object.keys(featureLabels);

  // 1. Alternatives to every tool
  for (const t of tools) {
    push({ id: `alt-${t.id}`, text: `Alternatives to ${t.name}?`, group: "alternatives", lens: { kind: "alternatives", anchor: t.id }, read: `Other ${plural[t.family]} ranked by what they share with ${t.name}, with exactly what each adds or lacks.`, tags: [t.name, famName(t.family), "alternative", "instead of", "like"] });
  }

  // 2. Whole small families side by side (≤ 4 tools)
  for (const f of families) {
    const list = byFam(f.id);
    if (list.length >= 2 && list.length <= 4) {
      push({ id: `fam-${f.id}`, text: `All ${plural[f.id]} side by side`, group: familyGroup[f.id], compare: list.map((t) => t.id), view: "matrix", read: `Every ${singular[f.id]} on one capability table. Differences first, then what they all share.`, tags: [f.name, ...list.map((t) => t.name), "compare", "table", "vs"] });
    }
  }

  // 3. Family × capability filters
  for (const f of families) {
    const list = byFam(f.id);
    for (const feat of featureIds) {
      const n = list.filter((t) => t.features.includes(feat)).length;
      if (n >= 1 && n < list.length) {
        push({ id: `fc-${f.id}-${feat}`, text: `Which ${plural[f.id]} document ${lower(featureLabels[feat])}?`, group: familyGroup[f.id], lens: { kind: "checklist", caps: [feat], family: f.id }, read: `${n} of ${list.length} ${plural[f.id]} document ${lower(featureLabels[feat])}. Add more capabilities to narrow further.`, tags: [f.name, featureLabels[feat], "which", "filter"] });
      }
    }
  }

  // 4. Every capability across the whole record
  for (const feat of featureIds) {
    const n = tools.filter((t) => t.features.includes(feat)).length;
    push({ id: `f-${feat}`, text: `Which tools document ${lower(featureLabels[feat])}?`, group: feat === "image" || feat === "video" || feat === "audio" ? "media" : feat === "selfhost" || feat === "custom" ? "control" : feat === "code" || feat === "visual" ? "build" : feat === "routing" || feat === "openai" || feat === "text" || feat === "vision" ? "models" : "agents", lens: { kind: "checklist", caps: [feat] }, read: `${n} tools across all families document ${lower(featureLabels[feat])}.`, tags: [featureLabels[feat], "which", "all"] });
  }

  // 5. Capability combinations with at least two matches
  const combos: string[][] = [
    ["research", "browser"], ["research", "code"], ["browser", "code"], ["connectors", "schedule"], ["research", "connectors"],
    ["text", "vision"], ["text", "image"], ["image", "video"], ["video", "audio"], ["image", "audio"],
    ["routing", "openai"], ["routing", "custom"], ["custom", "openai"], ["selfhost", "routing"], ["selfhost", "code"], ["selfhost", "connectors"], ["selfhost", "visual"],
    ["visual", "connectors"], ["visual", "schedule"], ["code", "connectors"],
    ["research", "browser", "code"], ["image", "video", "audio"], ["text", "image", "video"], ["text", "vision", "image"], ["routing", "openai", "custom"],
    ["connectors", "schedule", "code"], ["browser", "connectors", "schedule"], ["selfhost", "routing", "openai"], ["vision", "image", "video"], ["research", "image", "video"],
  ];
  for (const caps of combos) {
    const n = tools.filter((t) => caps.every((c) => t.features.includes(c))).length;
    if (n < 2) continue;
    const labels = caps.map((c) => lower(featureLabels[c]));
    const text = labels.length === 2 ? `${featureLabels[caps[0]]} and ${labels[1]} in one tool?` : `${featureLabels[caps[0]]}, ${labels[1]} and ${labels[2]} together?`;
    push({ id: `cc-${caps.join("-")}`, text, group: caps.includes("image") || caps.includes("video") || caps.includes("audio") ? "media" : caps.includes("selfhost") ? "control" : caps.includes("routing") || caps.includes("openai") ? "models" : caps.includes("visual") ? "build" : "agents", lens: { kind: "checklist", caps }, read: `${n} tools document all of these. Untick one to widen.`, tags: caps.map((c) => featureLabels[c]).concat("combination", "both", "together") });
  }

  // 6. Family views: radars, table, constellation
  for (const f of families) {
    push({ id: `fr-${f.id}`, text: `The shape of every ${singular[f.id]}`, group: familyGroup[f.id], lens: { kind: "radars", family: f.id }, read: `One small radar per ${singular[f.id]}. Taller shapes document more.`, tags: [f.name, "radar", "shape", "overview"] });
    push({ id: `fm-${f.id}`, text: `${f.name}: the capability table`, group: familyGroup[f.id], lens: { kind: "matrix", family: f.id }, read: `Every ${singular[f.id]} against every capability. Filled dot means documented.`, tags: [f.name, "table", "matrix", "grid"] });
    push({ id: `fk-${f.id}`, text: `${f.name} in the constellation`, group: "picture", lens: { kind: "map", family: f.id }, read: `Only the ${plural[f.id]} lit; the rest of the sky dimmed.`, tags: [f.name, "map", "constellation", "sky"] });
  }

  // 7. Head-to-head pairs within each family, strongest pairs first
  const pairs: { a: Tool; b: Tool; w: number }[] = [];
  for (const f of families) {
    const list = byFam(f.id);
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) pairs.push({ a: list[i], b: list[j], w: list[i].features.length + list[j].features.length });
  }
  pairs.sort((x, y) => y.w - x.w || x.a.name.localeCompare(y.a.name));
  for (const { a, b } of pairs) {
    if (out.length >= TARGET) break;
    push({ id: `vs-${a.id}-${b.id}`, text: `${a.name} vs ${b.name}`, group: familyGroup[a.family], compare: [a.id, b.id], view: "matrix", read: `Two ${plural[a.family]} on the capability table. Add a third or fourth before running.`, tags: [a.name, b.name, famName(a.family), "vs", "versus", "compare", "head to head"] });
  }

  // 8. If still short, cross-family trios around the most-documented tools
  if (out.length < TARGET) {
    const top = [...tools].sort((x, y) => y.features.length - x.features.length);
    for (let i = 0; i < top.length && out.length < TARGET; i++) for (let j = i + 1; j < top.length && out.length < TARGET; j++) {
      if (top[i].family === top[j].family) continue;
      push({ id: `x-${top[i].id}-${top[j].id}`, text: `${top[i].name} vs ${top[j].name} (different families)`, group: "picture", compare: [top[i].id, top[j].id], view: "matrix", read: "Across families the table shows breadth, not fit. Read with care.", tags: [top[i].name, top[j].name, "vs", "cross"] });
    }
  }
  return out.slice(0, TARGET);
}

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/** Rank checks against a free-text filter. Whole words first, then prefixes. */
export function filterQuestions(list: Question[], query: string, group: QuestionGroup | "all"): Question[] {
  const scoped = group === "all" ? list : list.filter((q) => q.group === group);
  const terms = norm(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return scoped;
  return scoped
    .map((q) => {
      const hay = norm([q.text, groupLabels[q.group], ...(q.tags ?? []), q.read].join(" "));
      const words = hay.split(/[^a-z0-9+]+/);
      let score = 0;
      for (const t of terms) {
        if (words.includes(t)) score += 3;
        else if (words.some((w) => w.startsWith(t))) score += 2;
        else if (hay.includes(t)) score += 1;
        else return { q, score: -1 };
      }
      if (q.featured) score += 0.5;
      if (norm(q.text).includes(terms.join(" "))) score += 2;
      return { q, score };
    })
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.q);
}

/** A deck that shows the hand-written checks first, six per ten, then the rest. */
export function buildDeck(list: Question[], seed: number): Question[] {
  let s = seed >>> 0 || 1;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const feat = shuffle(list.filter((q) => q.featured));
  const rest = shuffle(list.filter((q) => !q.featured));
  const deck: Question[] = [];
  while (feat.length || rest.length) {
    for (let i = 0; i < 6 && feat.length; i++) deck.push(feat.shift()!);
    for (let i = 0; i < 4 && rest.length; i++) deck.push(rest.shift()!);
    if (!feat.length) deck.push(...rest.splice(0, 10));
  }
  return deck;
}
