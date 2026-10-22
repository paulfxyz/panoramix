import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Moon,
  Plus,
  Scale,
  Search,
  Sun,
  X,
} from "lucide-react";
import {
  dimensions,
  familyOf,
  families,
  featureLabels,
  has,
  matchScore,
  metadata,
  parseBrief,
  profile,
  recipes,
  toolOf,
  tools,
  type Family,
  type Recipe,
  type Tool,
} from "./data";

/* ------------------------------------------------------------------ */
/* Small utilities                                                     */
/* ------------------------------------------------------------------ */

const MAX_COMPARE = 4;
const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (reduced() || !("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  });
}

function useCountUp(target: number, ms = 900) {
  const [v, setV] = useState(reduced() ? target : 0);
  useEffect(() => {
    if (reduced()) return setV(target);
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });

/* ------------------------------------------------------------------ */
/* Brand glyph: an original sickle-and-mistletoe mark                  */
/* ------------------------------------------------------------------ */

function Glyph({ size = 30 }: { size?: number }) {
  return (
    <svg className="glyph" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path
        className="glyph-blade"
        d="M22 5c-7 0-12 5-12 12 0 3 1 5 3 7-5-1-9-5-9-11C4 6 9 2 16 2c3 0 5 1 6 3Z"
        fill="currentColor"
      />
      <path className="glyph-handle" d="M18 22l9 8" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <circle className="glyph-berry" cx="24" cy="12" r="2.4" fill="currentColor" />
      <circle className="glyph-berry" cx="27.5" cy="16.5" r="2" fill="currentColor" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Radar chart                                                         */
/* ------------------------------------------------------------------ */

const RADAR_COLORS = ["var(--fg)", "var(--red)", "var(--muted)", "var(--fg-soft)"];

function Radar({
  series,
  size = 300,
  labels = true,
  animate = true,
}: {
  series: { name: string; values: number[] }[];
  size?: number;
  labels?: boolean;
  animate?: boolean;
}) {
  const n = dimensions.length;
  const cx = size / 2,
    cy = size / 2,
    r = size * (labels ? 0.34 : 0.44);
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(a) * r * v, cy + Math.sin(a) * r * v];
  };
  const ring = (v: number) =>
    Array.from({ length: n }, (_, i) => pt(i, v).join(",")).join(" ");
  return (
    <svg className={`radar ${animate ? "radar-animate" : ""}`} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Capability radar">
      {[1 / 3, 2 / 3, 1].map((v) => (
        <polygon key={v} className="radar-ring" points={ring(v)} />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} className="radar-axis" x1={cx} y1={cy} x2={x} y2={y} />;
      })}
      {series.map((s, si) => (
        <g key={s.name} className={`series-${si}`} style={{ color: RADAR_COLORS[si % RADAR_COLORS.length], ["--i" as string]: si }}>
          <polygon className="radar-shape" points={s.values.map((v, i) => pt(i, Math.max(v, 0.04)).join(",")).join(" ")} />
          {s.values.map((v, i) => {
            const [x, y] = pt(i, Math.max(v, 0.04));
            return <circle key={i} className="radar-dot" cx={x} cy={y} r={3.5} />;
          })}
        </g>
      ))}
      {labels &&
        dimensions.map((d, i) => {
          const [x, y] = pt(i, 1.26);
          return (
            <text key={d.id} className="radar-label" x={x} y={y} textAnchor={Math.abs(x - cx) < 4 ? "middle" : x > cx ? "start" : "end"} dominantBaseline="middle">
              {d.short}
            </text>
          );
        })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Capability dots                                                     */
/* ------------------------------------------------------------------ */

function Dots({ t, compact = false }: { t: Tool; compact?: boolean }) {
  const p = profile(t);
  return (
    <ul className={`dots ${compact ? "dots-compact" : ""}`} aria-label="Documented capability coverage by dimension">
      {dimensions.map((d, i) => (
        <li key={d.id} title={`${d.label}: ${Math.round(p[i] * 100)}% of documented features`}>
          <span className="dot-bar">
            <span style={{ ["--v" as string]: p[i] }} />
          </span>
          {!compact && <span className="dot-label">{d.short}</span>}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Tool card                                                           */
/* ------------------------------------------------------------------ */

function ToolCard({
  t,
  selected,
  onToggle,
  onOpen,
  why,
  index,
}: {
  t: Tool;
  selected: boolean;
  onToggle: () => void;
  onOpen: () => void;
  why?: string[];
  index: number;
}) {
  return (
    <article className={`card ${selected ? "is-selected" : ""}`} data-reveal style={{ ["--d" as string]: `${Math.min(index, 8) * 50}ms` }}>
      <header className="card-head">
        <span className="eyebrow">{familyOf(t.family).name}</span>
        <button
          type="button"
          className={`pick ${selected ? "is-on" : ""}`}
          aria-pressed={selected}
          aria-label={selected ? `Remove ${t.name} from comparison` : `Add ${t.name} to comparison`}
          onClick={onToggle}
        >
          <span className="pick-icon">
            <Plus size={18} />
            <Check size={18} />
          </span>
        </button>
      </header>
      <h3>
        <button type="button" className="card-title" onClick={onOpen}>
          {t.name}
        </button>
      </h3>
      <p className="card-desc">{t.description}</p>
      {why && why.length > 0 && (
        <ul className="why">
          {why.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}
      <Dots t={t} compact />
      <footer className="card-foot">
        <span className="meta">{t.access}</span>
        <button type="button" className="text-link" onClick={onOpen}>
          Field notes <ArrowRight size={16} />
        </button>
      </footer>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Drawer: a single tool                                               */
/* ------------------------------------------------------------------ */

function Drawer({
  t,
  onClose,
  selected,
  onToggle,
}: {
  t: Tool | null;
  onClose: () => void;
  selected: boolean;
  onToggle: () => void;
}) {
  useEffect(() => {
    if (!t) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.classList.add("no-scroll");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("no-scroll");
    };
  }, [t, onClose]);
  return (
    <div className={`drawer-root ${t ? "is-open" : ""}`} aria-hidden={!t}>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={t ? `${t.name} field notes` : "Field notes"}>
        {t && (
          <>
            <header className="drawer-head">
              <span className="eyebrow">{familyOf(t.family).name}</span>
              <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
                <X size={22} />
              </button>
            </header>
            <h2 className="drawer-title">{t.name}</h2>
            <p className="lead">{t.description}</p>
            <div className="drawer-radar">
              <Radar series={[{ name: t.name, values: profile(t) }]} size={320} />
            </div>
            <dl className="facts">
              <div>
                <dt>How you use it</dt>
                <dd>{t.access}</dd>
              </div>
              <div>
                <dt>Billing context</dt>
                <dd>{t.billing}</dd>
              </div>
              <div>
                <dt>Worth testing for</dt>
                <dd>{t.best}</dd>
              </div>
              <div>
                <dt>Watch out for</dt>
                <dd>{t.watch}</dd>
              </div>
            </dl>
            <h3 className="sub">Documented capabilities</h3>
            <ul className="caps">
              {Object.keys(featureLabels).map((f) => (
                <li key={f} className={has(t, f) ? "on" : "off"}>
                  <span className="cap-mark">{has(t, f) ? <Check size={14} /> : <X size={14} />}</span>
                  {featureLabels[f]}
                </li>
              ))}
            </ul>
            <p className="micro">“Off” means not established by the reviewed source, not necessarily unavailable.</p>
            <div className="drawer-actions">
              <button type="button" className={`btn ${selected ? "btn-ghost" : ""}`} onClick={onToggle}>
                {selected ? "Remove from comparison" : "Add to comparison"} <Scale size={18} />
              </button>
              <a className="btn btn-ghost" href={t.source} target="_blank" rel="noopener noreferrer">
                Official source <ArrowUpRight size={18} />
              </a>
            </div>
            {t.extra && (
              <a className="text-link" href={t.extra} target="_blank" rel="noopener noreferrer">
                Additional documentation <ArrowUpRight size={16} />
              </a>
            )}
          </>
        )}
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Compare view                                                        */
/* ------------------------------------------------------------------ */

function CompareView({
  ids,
  onClose,
  onRemove,
  onOpen,
}: {
  ids: string[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onOpen: (t: Tool) => void;
}) {
  const list = ids.map(toolOf).filter(Boolean) as Tool[];
  const [view, setView] = useState<"radar" | "bars" | "matrix" | "facts">("radar");
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.classList.add("no-scroll");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("no-scroll");
    };
  }, [onClose]);
  const copy = () => {
    const text = `PANORAMIX · COMPARISON\n${list
      .map(
        (t) =>
          `\n${t.name} — ${familyOf(t.family).name}\n${t.description}\nAccess: ${t.access}\nBilling: ${t.billing}\nDocumented: ${t.features.map((f) => featureLabels[f]).join(", ")}\nSource: ${t.source}`,
      )
      .join("\n")}\n\nEditorial comparison from documented sources, not a benchmark. Snapshot ${metadata.updated}.`;
    navigator.clipboard?.writeText(text).catch(() => {});
  };
  if (!list.length) return null;
  return (
    <div className="compare-root is-open" role="dialog" aria-modal="true" aria-label="Side-by-side comparison">
      <div className="scrim" onClick={onClose} />
      <section className="compare">
        <header className="compare-head">
          <div>
            <span className="eyebrow">Side by side</span>
            <h2>Your mix, compared.</h2>
          </div>
          <div className="compare-tools">
            <div className="seg" role="tablist" aria-label="Comparison view">
              {(["radar", "bars", "matrix", "facts"] as const).map((v) => (
                <button key={v} role="tab" aria-selected={view === v} className={view === v ? "is-on" : ""} onClick={() => setView(v)}>
                  {v === "radar" ? "Radar" : v === "bars" ? "Bars" : v === "matrix" ? "Matrix" : "Facts"}
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={copy}>
              Copy text
            </button>
            <button type="button" className="icon-btn" aria-label="Close comparison" onClick={onClose}>
              <X size={22} />
            </button>
          </div>
        </header>

        <ul className="compare-legend">
          {list.map((t, i) => (
            <li key={t.id} style={{ ["--c" as string]: RADAR_COLORS[i] }}>
              <span className="swatch" />
              <button type="button" className="legend-name" onClick={() => onOpen(t)}>
                {t.name}
              </button>
              <button type="button" className="legend-x" aria-label={`Remove ${t.name}`} onClick={() => onRemove(t.id)}>
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>

        {view === "radar" && (
          <div className="compare-radar">
            <Radar series={list.map((t) => ({ name: t.name, values: profile(t) }))} size={420} />
            <div className="compare-side">
              {dimensions.map((d, i) => (
                <div className="side-row" key={d.id}>
                  <span className="side-label">{d.label}</span>
                  <span className="side-vals">
                    {list.map((t, ti) => (
                      <i key={t.id} style={{ ["--c" as string]: RADAR_COLORS[ti], opacity: 0.25 + profile(t)[i] * 0.75 }} title={`${t.name}: ${Math.round(profile(t)[i] * 100)}%`} />
                    ))}
                  </span>
                </div>
              ))}
              <p className="micro">Each axis is the share of that dimension's documented features. 100% means every feature we track in that dimension is documented by the official source.</p>
            </div>
          </div>
        )}

        {view === "bars" && (
          <div className="bars">
            {dimensions.map((d, i) => (
              <div className="bar-group" key={d.id}>
                <h4>{d.label}</h4>
                {list.map((t, ti) => (
                  <div className="bar-row" key={t.id}>
                    <span className="bar-name">{t.name}</span>
                    <span className="bar-track">
                      <span className="bar-fill" style={{ ["--w" as string]: `${profile(t)[i] * 100}%`, ["--c" as string]: RADAR_COLORS[ti], ["--d" as string]: `${ti * 80}ms` }} />
                    </span>
                    <span className="bar-val">{Math.round(profile(t)[i] * 100)}%</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {view === "matrix" && (
          <div className="matrix-wrap">
            <table className="matrix">
              <thead>
                <tr>
                  <th scope="col">Capability</th>
                  {list.map((t) => (
                    <th key={t.id} scope="col">
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.keys(featureLabels).map((f) => (
                  <tr key={f}>
                    <th scope="row">{featureLabels[f]}</th>
                    {list.map((t) => (
                      <td key={t.id} className={has(t, f) ? "on" : "off"}>
                        <span className="cell-mark">{has(t, f) ? <Check size={18} /> : <span className="dash" />}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {view === "facts" && (
          <div className="facts-grid" style={{ ["--n" as string]: list.length }}>
            {list.map((t) => (
              <article key={t.id} className="fact-card">
                <span className="eyebrow">{familyOf(t.family).name}</span>
                <h3>{t.name}</h3>
                <dl>
                  <dt>How you use it</dt>
                  <dd>{t.access}</dd>
                  <dt>Billing</dt>
                  <dd>{t.billing}</dd>
                  <dt>Worth testing for</dt>
                  <dd>{t.best}</dd>
                  <dt>Watch out for</dt>
                  <dd>{t.watch}</dd>
                </dl>
                <a className="text-link" href={t.source} target="_blank" rel="noopener noreferrer">
                  Official source <ArrowUpRight size={16} />
                </a>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem("px-theme") === "dark");
  const [query, setQuery] = useState("");
  const [brief, setBrief] = useState("");
  const [family, setFamily] = useState<Family | "all">("all");
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [open, setOpen] = useState<Tool | null>(null);
  const [comparing, setComparing] = useState(false);
  const [limitNote, setLimitNote] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("px-theme", dark ? "dark" : "light");
  }, [dark]);
  useReveal();

  const parsed = useMemo(() => parseBrief(brief), [brief]);
  const matches = useMemo(() => {
    if (!brief) return [];
    return tools
      .map((t) => ({ t, ...matchScore(t, parsed) }))
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [brief, parsed]);

  const browse = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tools.filter(
      (t) =>
        (family === "all" || t.family === family) &&
        (!q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some((x) => x.includes(q)) || t.features.some((f) => featureLabels[f].toLowerCase().includes(q))),
    );
  }, [family, search]);

  const toggle = (id: string) => {
    setPicked((p) => {
      if (p.includes(id)) return p.filter((x) => x !== id);
      if (p.length >= MAX_COMPARE) {
        setLimitNote(true);
        setTimeout(() => setLimitNote(false), 2200);
        return p;
      }
      return [...p, id];
    });
  };

  const runBrief = (text = query) => {
    const v = text.trim();
    setBrief(v);
    if (v) setTimeout(() => scrollTo("results"), 60);
  };

  const useRecipe = (r: Recipe) => {
    setPicked(r.ids.slice(0, MAX_COMPARE));
    setComparing(true);
  };

  const total = useCountUp(tools.length);
  const famCount = useCountUp(families.length);

  return (
    <div className="app">
      <a className="skip" href="#browse">
        Skip to the catalogue
      </a>
      <header className="site-head">
        <div className="wrap head-row">
          <a className="brand" href="#top" aria-label="Panoramix home">
            <Glyph />
            <span>PANORAMIX</span>
          </a>
          <nav className="nav" aria-label="Main">
            <button type="button" onClick={() => scrollTo("ask")}>Ask</button>
            <button type="button" onClick={() => scrollTo("browse")}>Browse</button>
            <button type="button" onClick={() => scrollTo("recipes")}>Recipes</button>
            <button type="button" onClick={() => scrollTo("story")}>The druid</button>
          </nav>
          <div className="head-tools">
            <button type="button" className="theme" aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} aria-pressed={dark} onClick={() => setDark((d) => !d)}>
              <span className="theme-knob">{dark ? <Moon size={14} /> : <Sun size={14} />}</span>
            </button>
            <button type="button" className="btn btn-sm" onClick={() => { scrollTo("ask"); setTimeout(() => inputRef.current?.focus(), 500); }}>
              <span className="hide-m">Ask the druid</span><span className="only-m">Ask</span> <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="hero wrap">
          <div className="hero-copy" data-reveal>
            <span className="eyebrow">AI tools. Compared like ingredients.</span>
            <h1>
              <span>Find your</span>
              <span className="soft">magic mix.</span>
            </h1>
            <p className="lead">
              Agents, model gateways, inference, media APIs, coding tools, automation and creative studios. One open catalogue, documented from official sources, compared the way a druid compares herbs.
            </p>
            <div className="hero-cta">
              <button type="button" className="btn btn-lg" onClick={() => { scrollTo("ask"); setTimeout(() => inputRef.current?.focus(), 500); }}>
                Ask Panoramix <ArrowRight size={20} />
              </button>
              <button type="button" className="text-link lg" onClick={() => scrollTo("browse")}>
                Browse {tools.length} tools <ArrowRight size={18} />
              </button>
            </div>
            <ul className="hero-proof">
              <li><strong>{total}</strong> tools</li>
              <li><strong>{famCount}</strong> families</li>
              <li><strong>0</strong> logins</li>
            </ul>
          </div>
          <figure className="hero-art" data-reveal>
            <img src="./art/druid-hero.webp" alt="An original Gaulish druid with a golden sickle and mistletoe, stirring a cauldron whose steam turns into small software symbols." width={1200} height={900} {...{ fetchpriority: "high" } as Record<string, string>} />
          </figure>
        </section>

        {/* ASK */}
        <section className="ask wrap" id="ask">
          <div className="ask-inner" data-reveal>
            <span className="eyebrow">Describe the job, not the product</span>
            <h2>What are you brewing?</h2>
            <form
              className="ask-form"
              onSubmit={(e) => {
                e.preventDefault();
                runBrief();
              }}
            >
              <label htmlFor="ask-input" className="sr-only">Describe your AI workload</label>
              <div className={`field ${query ? "has-value" : ""}`}>
                <Search size={22} className="field-icon" />
                <input
                  id="ask-input"
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="An alternative to Computer for research… an API for image and video… a cheap, fast text model…"
                  autoComplete="off"
                  maxLength={300}
                  enterKeyHint="search"
                />
                {query && (
                  <button type="button" className="field-clear" aria-label="Clear" onClick={() => { setQuery(""); setBrief(""); inputRef.current?.focus(); }}>
                    <X size={18} />
                  </button>
                )}
                <span className="field-line" />
              </div>
              <button type="submit" className="btn btn-lg" disabled={!query.trim()}>
                Find my mix <ArrowRight size={20} />
              </button>
            </form>
            <div className="suggest">
              <span>Try:</span>
              {[
                "I need a Computer alternative that can browse and run code",
                "one API with many models and fallback",
                "generate images and video from my app",
                "self-hosted, privacy first",
              ].map((s) => (
                <button key={s} type="button" className="chip" onClick={() => { setQuery(s); runBrief(s); }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* RESULTS */}
        {brief && (
          <section className="results wrap" id="results">
            <header className="section-head">
              <div>
                <span className="eyebrow">Panoramix suggests</span>
                <h2>{matches.length ? "Start with these." : "The druid frowns."}</h2>
              </div>
              <p className="section-note">
                {matches.length
                  ? `Matched on ${[...parsed.families.map((f) => familyOf(f).name), ...parsed.features.map((f) => featureLabels[f])].slice(0, 5).join(", ") || "your wording"}. Rule-based, local, no AI call.`
                  : "No documented signal matched. Try naming a job (research, images, routing, self-host) or pick a recipe below."}
              </p>
            </header>
            {matches.length > 0 && (
              <>
                <div className="grid">
                  {matches.map((m, i) => (
                    <ToolCard key={m.t.id} t={m.t} index={i} selected={picked.includes(m.t.id)} onToggle={() => toggle(m.t.id)} onOpen={() => setOpen(m.t)} why={m.why} />
                  ))}
                </div>
                <div className="results-actions">
                  <button type="button" className="btn" onClick={() => { setPicked(matches.slice(0, MAX_COMPARE).map((m) => m.t.id)); setComparing(true); }}>
                    Compare the top {Math.min(MAX_COMPARE, matches.length)} <Scale size={18} />
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {/* BROWSE */}
        <section className="browse" id="browse">
          <div className="wrap">
            <header className="section-head" data-reveal>
              <div>
                <span className="eyebrow">The whole forest</span>
                <h2>Browse by family.</h2>
              </div>
              <p className="section-note">Compare like with like. Each product sits in one primary family; pick up to four for a side-by-side.</p>
            </header>
            <div className="browse-bar" data-reveal>
              <div className="tabs" role="tablist" aria-label="Families">
                <button role="tab" aria-selected={family === "all"} className={`chip ${family === "all" ? "is-on" : ""}`} onClick={() => setFamily("all")}>
                  All <small>{tools.length}</small>
                </button>
                {families.map((f) => (
                  <button key={f.id} role="tab" aria-selected={family === f.id} className={`chip ${family === f.id ? "is-on" : ""}`} onClick={() => setFamily(f.id)}>
                    {f.short} <small>{tools.filter((t) => t.family === f.id).length}</small>
                  </button>
                ))}
              </div>
              <div className="field field-sm">
                <Search size={18} className="field-icon" />
                <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search names, tags, capabilities" aria-label="Search the catalogue" />
                <span className="field-line" />
              </div>
            </div>
            {family !== "all" && <p className="family-desc" data-reveal>{familyOf(family).description}</p>}
            {browse.length ? (
              <div className="grid" key={`${family}-${search}`}>
                {browse.map((t, i) => (
                  <ToolCard key={t.id} t={t} index={i} selected={picked.includes(t.id)} onToggle={() => toggle(t.id)} onOpen={() => setOpen(t)} />
                ))}
              </div>
            ) : (
              <div className="empty" data-reveal>
                <h3>Nothing in this cauldron.</h3>
                <p>No tool matches “{search}”. Try a capability like “video” or a tag like “privacy”.</p>
                <button type="button" className="btn btn-ghost" onClick={() => { setSearch(""); setFamily("all"); }}>Reset</button>
              </div>
            )}
          </div>
        </section>

        {/* LANDSCAPE */}
        <section className="landscape">
          <div className="wrap landscape-grid">
            <figure className="landscape-art" data-reveal>
              <img src="./art/menhirs.webp" alt="Ten standing stones of different heights in a row, like a bar chart." loading="lazy" width={1200} height={800} />
            </figure>
            <div className="landscape-copy" data-reveal>
              <span className="eyebrow">Ten standing stones</span>
              <h2>One forest. Different layers.</h2>
              <p className="lead">A gateway connects models. An agent does the work. A studio helps you create. These are directory counts, not market share.</p>
              <ul className="stones">
                {families.map((f) => {
                  const n = tools.filter((t) => t.family === f.id).length;
                  const max = Math.max(...families.map((g) => tools.filter((t) => t.family === g.id).length));
                  return (
                    <li key={f.id}>
                      <button type="button" onClick={() => { setFamily(f.id); setSearch(""); scrollTo("browse"); }}>
                        <span className="stone-name">{f.name}</span>
                        <span className="stone-track"><span className="stone-fill" style={{ ["--w" as string]: `${(n / max) * 100}%` }} /></span>
                        <span className="stone-n">{n}</span>
                        <ArrowRight size={16} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        {/* RECIPES */}
        <section className="recipes wrap" id="recipes">
          <header className="section-head" data-reveal>
            <div>
              <span className="eyebrow">Ready-made comparisons</span>
              <h2>Recipes from the grimoire.</h2>
            </div>
            <p className="section-note">Each recipe opens a four-tool side-by-side. Adjust the mix to make it yours.</p>
          </header>
          <div className="recipe-grid">
            {recipes.map((r, i) => (
              <article className="recipe" key={r.id} data-reveal style={{ ["--d" as string]: `${(i % 6) * 60}ms` }}>
                <span className="index">{String(i + 1).padStart(2, "0")}</span>
                <h3>{r.title}</h3>
                <p>{r.description}</p>
                <ul className="recipe-ids">
                  {r.ids.map((id) => (
                    <li key={id}>{toolOf(id)?.name}</li>
                  ))}
                </ul>
                <button type="button" className="text-link" onClick={() => useRecipe(r)}>
                  Open comparison <ArrowRight size={16} />
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* STORY */}
        <section className="story" id="story">
          <div className="wrap story-grid">
            <div className="story-copy" data-reveal>
              <span className="eyebrow">Who is Panoramix?</span>
              <h2>A druid for your stack.</h2>
              <p className="lead">
                In French comics lore, Panoramix is the village druid who knows the one recipe everyone wants: which ingredients, in which order, and why. He never sells the potion. He understands it.
              </p>
              <p>
                This Panoramix is our own character and an homage, not a licensed one. He does the same job for AI tooling: reads the official sources, sorts the forest into families, and tells you plainly what each ingredient is documented to do. No rankings, no sponsors, no login. Just the recipe book, open.
              </p>
              <ul className="story-rules">
                <li><strong>Documented, not claimed.</strong> Every capability links to an official page.</li>
                <li><strong>Like with like.</strong> A gateway is not an agent; we compare inside families first.</li>
                <li><strong>Open and forkable.</strong> MIT licence, one JSON file, static hosting.</li>
              </ul>
              <a className="btn btn-ghost" href="https://github.com/paulfxyz/panoramix" target="_blank" rel="noopener noreferrer">
                Read the source on GitHub <ArrowUpRight size={18} />
              </a>
            </div>
            <figure className="story-art" data-reveal>
              <img src="./art/cauldron.webp" alt="A cauldron whose steam forms four different glass vials." loading="lazy" width={1000} height={1000} />
            </figure>
          </div>
          <figure className="village" data-reveal>
            <img src="./art/village.webp" alt="A small Gaulish village of round thatched huts behind a wooden palisade, seen from a hill with oaks and menhirs." loading="lazy" width={1600} height={800} />
          </figure>
        </section>
      </main>

      <footer className="foot wrap">
        <a className="brand" href="#top"><Glyph size={24} /><span>PANORAMIX</span></a>
        <p>Open source under MIT. Catalogue snapshot {metadata.updated}. Editorial comparison from documented sources, not a benchmark. Verify prices and terms before choosing.</p>
        <nav aria-label="Footer">
          <a href="https://github.com/paulfxyz/panoramix" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://github.com/paulfxyz/panoramix/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">Contribute a report</a>
          <a href="./catalog.json">catalog.json</a>
        </nav>
      </footer>

      {/* DOCK */}
      <div className={`dock ${picked.length ? "is-open" : ""}`} aria-live="polite">
        <div className="dock-inner">
          <Scale size={20} />
          <span className="dock-count"><strong>{picked.length}</strong> / {MAX_COMPARE}</span>
          <ul className="dock-list">
            {picked.map((id) => (
              <li key={id}>
                {toolOf(id)?.name}
                <button type="button" aria-label={`Remove ${toolOf(id)?.name}`} onClick={() => toggle(id)}><X size={14} /></button>
              </li>
            ))}
          </ul>
          {limitNote && <span className="dock-note">Four is the limit. Remove one to add another.</span>}
          <button type="button" className="text-link" onClick={() => setPicked([])}>Clear</button>
          <button type="button" className="btn btn-sm" disabled={picked.length < 1} onClick={() => setComparing(true)}>
            Compare <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <Drawer t={open} onClose={() => setOpen(null)} selected={!!open && picked.includes(open.id)} onToggle={() => open && toggle(open.id)} />
      {comparing && picked.length > 0 && (
        <CompareView ids={picked} onClose={() => setComparing(false)} onRemove={(id) => { toggle(id); if (picked.length <= 1) setComparing(false); }} onOpen={(t) => setOpen(t)} />
      )}
    </div>
  );
}
