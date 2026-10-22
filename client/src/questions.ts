import type { Lens } from "./lenses";

/**
 * The checks people run most often against the record. Each one opens a lens
 * with a fixed configuration, or a ready-made comparison. There is no free-text
 * input: every view is a reproducible reading of the signed catalogue.
 */
export type Question = {
  id: string;
  text: string;
  group: QuestionGroup;
  lens?: Lens;
  compare?: string[];
  read: string;
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

export const questions: Question[] = [
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
  { id: "ag-compare", text: "Computer vs Manus vs Cowork vs ChatGPT agent", group: "agents", compare: ["computer", "manus", "cowork", "chatgpt-agent"], read: "A side-by-side of four agent workspaces across six dimensions." },
  { id: "ag-radars", text: "Show me the shape of every agent", group: "agents", lens: { kind: "radars", family: "agents" }, read: "One small radar per agent. Taller shapes document more." },

  // Models & APIs
  { id: "mo-openai-compat", text: "Which inference APIs are OpenAI-compatible?", group: "models", lens: { kind: "checklist", caps: ["openai"], family: "inference" }, read: "Direct inference providers documenting an OpenAI-style chat endpoint." },
  { id: "mo-routing", text: "Which gateways route and fall back across providers?", group: "models", lens: { kind: "checklist", caps: ["routing"], family: "gateways" }, read: "Gateways with documented routing or fallback." },
  { id: "mo-selfhost-gw", text: "Can I self-host a model gateway?", group: "models", lens: { kind: "checklist", caps: ["routing", "selfhost"] }, read: "Tools documenting both routing and a self-host option." },
  { id: "mo-vision", text: "Which APIs accept images as input?", group: "models", lens: { kind: "checklist", caps: ["vision"] }, read: "Vision input is not image generation. These document understanding images." },
  { id: "mo-custom", text: "Where can I deploy a custom or fine-tuned model?", group: "models", lens: { kind: "checklist", caps: ["custom"] }, read: "Providers documenting custom deployment or dedicated endpoints." },
  { id: "mo-speed", text: "Which text APIs should I benchmark for speed?", group: "models", compare: ["groq", "cerebras", "fireworks", "together"], read: "A shortlist to test yourself. No speed numbers are claimed here." },
  { id: "mo-gateways", text: "OpenRouter vs Requesty vs Portkey vs LiteLLM", group: "models", compare: ["openrouter", "requesty", "portkey", "litellm"], read: "Four gateways side by side." },
  { id: "mo-firstparty", text: "OpenAI vs Anthropic vs Mistral APIs", group: "models", compare: ["openai", "anthropic", "mistral"], read: "First-party APIs compared on documented modalities." },
  { id: "mo-radars", text: "The shape of every inference provider", group: "models", lens: { kind: "radars", family: "inference" }, read: "Small radars for all direct inference providers." },

  // Media
  { id: "me-all", text: "One API for images, video and audio?", group: "media", lens: { kind: "checklist", caps: ["image", "video", "audio"] }, read: "Tools documenting all three generation modalities." },
  { id: "me-video", text: "Which tools generate video?", group: "media", lens: { kind: "checklist", caps: ["video"] }, read: "Any tool documenting video generation, API or studio." },
  { id: "me-audio", text: "Which tools do voice and audio?", group: "media", lens: { kind: "checklist", caps: ["audio"] }, read: "Speech, music or audio generation, documented." },
  { id: "me-image-api", text: "Image generation through an API", group: "media", lens: { kind: "checklist", caps: ["image"], family: "media" }, read: "Media APIs documenting image generation." },
  { id: "me-compare", text: "Runware vs fal vs Replicate vs Novita", group: "media", compare: ["runware", "fal", "replicate", "novita"], read: "Four media-generation APIs side by side." },
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
  { id: "bu-coding-compare", text: "Cursor vs Claude Code vs Codex vs Lovable", group: "build", compare: ["cursor", "claude-code", "codex", "lovable"], read: "Four coding tools side by side." },

  // Big picture
  { id: "pi-map", text: "Show me the whole landscape", group: "picture", lens: { kind: "map" }, read: "Every tool pulled toward the dimensions it documents. Hover to read, click to open." },
  { id: "pi-rivers", text: "How do families map to capabilities?", group: "picture", lens: { kind: "rivers" }, read: "Ribbons from the ten families into the six dimensions." },
  { id: "pi-table", text: "Everything in one table", group: "picture", lens: { kind: "matrix", family: "all" }, read: "All tools against all capabilities. Filled dot means documented." },
  { id: "pi-broad", text: "Which tools document the most capabilities?", group: "picture", lens: { kind: "checklist", caps: [] }, read: "Every tool, grouped by family, sorted by documented capability count." },
];
