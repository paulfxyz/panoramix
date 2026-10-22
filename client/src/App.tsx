import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, Check, Moon, Plus, Scale, Sun, X } from "lucide-react";
import { AlternativesLens, ChecklistLens, MapLens, MatrixLens, Radar, RADAR_COLORS, RadarGallery, RiversLens, StackLens, lensMeta, type Lens, type LensKind } from "./lenses";
import { groupLabels, questions, type Question, type QuestionGroup } from "./questions";
import {
  dimensions,
  familyOf,
  families,
  featureLabels,
  has,
  metadata,
  profile,
  record,
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
/* Capability dots                                                     */
/* ------------------------------------------------------------------ */

const ABBR: Record<string, string> = { language: "Lang", media: "Media", action: "Act", research: "Rsch", control: "Ctrl", workflow: "Flow" };
function Dots({ t }: { t: Tool }) {
  const p = profile(t);
  return (
    <ul className="dots" aria-label="Documented capability coverage by dimension">
      {dimensions.map((d, i) => (
        <li key={d.id} title={`${d.label}: ${Math.round(p[i] * 100)}% of tracked features documented`}>
          <span className="dot-bar">
            <span style={{ ["--v" as string]: p[i] }} />
          </span>
          <span className="dot-label">{ABBR[d.id]}</span>
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
  index,
}: {
  t: Tool;
  selected: boolean;
  onToggle: () => void;
  onOpen: () => void;
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
      <p className="card-count"><strong>{t.features.length}</strong> documented capabilities</p>
      <Dots t={t} />
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
  const verdict = useMemo(() => {
    if (list.length < 2) return [] as string[];
    const out: string[] = [];
    const sorted = [...list].sort((a, b) => b.features.length - a.features.length);
    if (sorted[0].features.length > sorted[1].features.length) out.push(`${sorted[0].name} documents the most capabilities (${sorted[0].features.length}).`);
    else out.push(`${sorted[0].name} and ${sorted[1].name} tie on documented capabilities (${sorted[0].features.length}).`);
    const caps = Object.keys(featureLabels);
    const shared = caps.filter((c) => list.every((t) => has(t, c)));
    if (shared.length) out.push(`All ${list.length} document ${shared.map((c) => featureLabels[c]).join(", ")}.`);
    for (const c of caps) {
      const who = list.filter((t) => has(t, c));
      if (who.length === 1) out.push(`Only ${who[0].name} documents ${featureLabels[c]}.`);
    }
    const fams = new Set(list.map((t) => t.family));
    if (fams.size > 1) out.push(`You are comparing across ${fams.size} families (${[...fams].map((f) => familyOf(f).short).join(", ")}): think of this as a stack, not a contest.`);
    return out.slice(0, 5);
  }, [list]);
  const rows = useMemo(() => {
    const caps = Object.keys(featureLabels);
    const differ = caps.filter((c) => { const n = list.filter((t) => has(t, c)).length; return n > 0 && n < list.length; });
    const all = caps.filter((c) => list.every((t) => has(t, c)));
    const none = caps.filter((c) => !list.some((t) => has(t, c)));
    return { differ, all, none };
  }, [list]);
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

        {verdict.length > 0 && (
          <ul className="verdict">
            {verdict.map((v, i) => (
              <li key={v} style={{ ["--d" as string]: `${i * 70}ms` }}>{v}</li>
            ))}
          </ul>
        )}

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
            <p className="how">Differences first. A filled circle is documented by the official source; a dash means not established.</p>
            <table className="matrix">
              <thead>
                <tr>
                  <th scope="col">Capability</th>
                  {list.map((t) => (
                    <th key={t.id} scope="col">{t.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: `Where they differ (${rows.differ.length})`, caps: rows.differ },
                  { label: `Shared by all (${rows.all.length})`, caps: rows.all },
                  { label: `None document (${rows.none.length})`, caps: rows.none },
                ].filter((g) => g.caps.length).map((g) => (
                  <React.Fragment key={g.label}>
                    <tr className="group-row"><th scope="rowgroup" colSpan={list.length + 1}>{g.label}</th></tr>
                    {g.caps.map((f) => (
                      <tr key={f}>
                        <th scope="row">{featureLabels[f]}</th>
                        {list.map((t) => (
                          <td key={t.id} className={has(t, f) ? "on" : "off"}>
                            <span className="cell-mark">{has(t, f) ? <Check size={18} /> : <span className="dash" />}</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
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
/* Lens icons                                                          */
/* ------------------------------------------------------------------ */

function LensIcon({ kind }: { kind: LensKind }) {
  const c = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg className="lens-icon" width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" {...c}>
      {kind === "radars" && (<><polygon points="14,4 23,9 23,19 14,24 5,19 5,9" /><polygon points="14,9 19,12 18,18 14,20 9,17 10,11" fill="currentColor" fillOpacity=".15" /></>)}
      {kind === "matrix" && (<><rect x="4" y="4" width="20" height="20" rx="3" /><path d="M4 11h20M4 17h20M11 4v20M17 4v20" /></>)}
      {kind === "map" && (<><path d="M4 22L24 6" strokeDasharray="2 3" /><circle cx="8" cy="18" r="2.2" fill="currentColor" /><circle cx="14" cy="10" r="2.2" fill="currentColor" /><circle cx="21" cy="14" r="2.2" fill="currentColor" /><circle cx="19" cy="6" r="1.4" fill="currentColor" /></>)}
      {kind === "rivers" && (<><path d="M4 7c8 0 8 7 16 7M4 14c8 0 8-7 16-7M4 21c8 0 8-7 16-7M4 14c8 0 8 7 16 7" /></>)}
      {kind === "alternatives" && (<><rect x="4" y="5" width="7" height="18" rx="2" fill="currentColor" fillOpacity=".15" /><path d="M15 8h9M15 14h9M15 20h9" /></>)}
      {kind === "checklist" && (<><path d="M5 8l2 2 4-4M5 15l2 2 4-4M5 22l2 2 4-4" /><path d="M14 7h10M14 14h10M14 21h10" /></>)}
      {kind === "stack" && (<><path d="M14 4l10 5-10 5L4 9z" fill="currentColor" fillOpacity=".15" /><path d="M4 14l10 5 10-5M4 19l10 5 10-5" /></>)}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem("px-theme") === "dark");
  const [lens, setLens] = useState<Lens | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [group, setGroup] = useState<QuestionGroup | "all">("all");
  const [family, setFamily] = useState<Family | "all">("all");
  const [picked, setPicked] = useState<string[]>([]);
  const [open, setOpen] = useState<Tool | null>(null);
  const [comparing, setComparing] = useState(false);
  const [limitNote, setLimitNote] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("px-theme", dark ? "dark" : "light");
  }, [dark]);
  useReveal();

  const browse = useMemo(() => tools.filter((t) => family === "all" || t.family === family), [family]);

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

  const ask = (q: Question) => {
    setQuestion(q);
    if (q.compare) {
      setPicked(q.compare.slice(0, MAX_COMPARE));
      setComparing(true);
      return;
    }
    if (q.lens) {
      setLens(q.lens);
      setTimeout(() => scrollTo("lens"), 60);
    }
  };
  const openLens = (kind: LensKind) => {
    setQuestion(null);
    setLens((l) => (l?.kind === kind ? l : { kind }));
    setTimeout(() => scrollTo("lens"), 60);
  };
  const useRecipe = (r: Recipe) => {
    setPicked(r.ids.slice(0, MAX_COMPARE));
    setComparing(true);
  };
  const acts = {
    picked,
    toggle,
    open: (t: Tool) => setOpen(t),
    compare: (ids: string[]) => {
      setPicked(ids.slice(0, MAX_COMPARE));
      setComparing(true);
    },
  };
  const visibleQuestions = questions.filter((q) => group === "all" || q.group === group);

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
            <button type="button" onClick={() => scrollTo("ask")}>Checks</button>
            <button type="button" onClick={() => scrollTo("browse")}>Browse</button>
            <button type="button" onClick={() => scrollTo("recipes")}>Recipes</button>
            <button type="button" onClick={() => scrollTo("record")}>The record</button>
            <button type="button" onClick={() => scrollTo("story")}>The druid</button>
          </nav>
          <div className="head-tools">
            <button type="button" className="theme" aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} aria-pressed={dark} onClick={() => setDark((d) => !d)}>
              <span className="theme-knob">{dark ? <Moon size={14} /> : <Sun size={14} />}</span>
            </button>
            <button type="button" className="btn btn-sm" onClick={() => scrollTo("ask")}>
              <span className="hide-m">Open the record</span><span className="only-m">Record</span> <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="hero wrap">
          <div className="hero-copy" data-reveal>
            <span className="eyebrow">The open record of what AI tools document</span>
            <h1>
              <span>Find your</span>
              <span className="soft">magic mix.</span>
            </h1>
            <p className="lead">
              {tools.length} AI tools in {families.length} families, recorded from official sources in one signed catalogue on GitHub. Panoramix only renders the record: {questions.length} common checks, seven lenses, no account, no AI call.
            </p>
            <div className="hero-cta">
              <button type="button" className="btn btn-lg" onClick={() => scrollTo("ask")}>
                Open the record <ArrowRight size={20} />
              </button>
              <button type="button" className="text-link lg" onClick={() => scrollTo("browse")}>
                Browse {tools.length} tools <ArrowRight size={18} />
              </button>
            </div>
            <ul className="hero-proof">
              <li><strong>{total}</strong> tools</li>
              <li><strong>{famCount}</strong> families</li>
              <li><strong>{questions.length}</strong> checks</li>
              <li className={`proof-int ${record.intact === false ? "is-bad" : ""}`}><strong>{record.intact === null ? "—" : record.intact ? "✓" : "!"}</strong> {record.intact === false ? "record altered" : "record intact"}</li>
            </ul>
          </div>
          <figure className="hero-art" data-reveal>
            <img src="./art/druid-hero.webp" alt="An original Gaulish druid with a golden sickle and mistletoe, stirring a cauldron whose steam turns into small software symbols." width={1200} height={900} {...{ fetchpriority: "high" } as Record<string, string>} />
          </figure>
        </section>

        {/* QUESTIONS + LENSES */}
        <section className="ask wrap" id="ask">
          <div className="ask-inner" data-reveal>
            <header className="section-head tight">
              <div>
                <span className="eyebrow">Common checks</span>
                <h2>What people look up.</h2>
              </div>
              <p className="section-note">The {questions.length} checks run most often against the record. Each is a fixed, reproducible view of the catalogue: same record, same answer, for everyone.</p>
            </header>
            <div className="tabs groups" role="tablist" aria-label="Question groups">
              <button role="tab" aria-selected={group === "all"} className={`chip ${group === "all" ? "is-on" : ""}`} onClick={() => setGroup("all")}>All <small>{questions.length}</small></button>
              {(Object.keys(groupLabels) as QuestionGroup[]).map((g) => (
                <button key={g} role="tab" aria-selected={group === g} className={`chip ${group === g ? "is-on" : ""}`} onClick={() => setGroup(g)}>
                  {groupLabels[g]} <small>{questions.filter((q) => q.group === g).length}</small>
                </button>
              ))}
            </div>
            <ul className="cloud" key={group}>
              {visibleQuestions.map((q, i) => (
                <li key={q.id} style={{ ["--d" as string]: `${Math.min(i, 24) * 25}ms` }}>
                  <button type="button" className={`q ${question?.id === q.id ? "is-on" : ""} ${q.compare ? "q-compare" : ""}`} onClick={() => ask(q)}>
                    <span>{q.text}</span>
                    <small>{q.compare ? "Side by side" : lensMeta[q.lens!.kind].title}</small>
                  </button>
                </li>
              ))}
            </ul>
            <div className="lenses">
              <span className="tabs-label">Or start from a lens:</span>
              {(Object.keys(lensMeta) as LensKind[]).map((k) => (
                <button key={k} type="button" className={`lens-btn ${lens?.kind === k ? "is-on" : ""}`} aria-pressed={lens?.kind === k} onClick={() => openLens(k)}>
                  <LensIcon kind={k} />
                  <span>{lensMeta[k].title}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* LENS PANEL */}
        {lens && (
          <section className="lens wrap" id="lens" key={lens.kind}>
            <header className="section-head">
              <div>
                <span className="eyebrow">{question ? "Check" : "Lens"}</span>
                <h2>{question ? question.text : lensMeta[lens.kind].title}</h2>
              </div>
              <div className="lens-head-right">
                <p className="section-note">{question ? question.read : lensMeta[lens.kind].blurb}</p>
                <button type="button" className="icon-btn" aria-label="Close lens" onClick={() => { setLens(null); setQuestion(null); scrollTo("ask"); }}><X size={22} /></button>
              </div>
            </header>
            {lens.kind === "radars" && <RadarGallery lens={lens} setLens={setLens} acts={acts} />}
            {lens.kind === "matrix" && <MatrixLens lens={lens} setLens={setLens} acts={acts} />}
            {lens.kind === "map" && <MapLens lens={lens} setLens={setLens} acts={acts} />}
            {lens.kind === "rivers" && <RiversLens onFamily={(f) => { setFamily(f); scrollTo("browse"); }} />}
            {lens.kind === "alternatives" && <AlternativesLens lens={lens} setLens={setLens} acts={acts} />}
            {lens.kind === "checklist" && <ChecklistLens lens={lens} setLens={setLens} acts={acts} />}
            {lens.kind === "stack" && <StackLens acts={acts} />}
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
              <p className="section-note">Every tool, one family each. The strip on each card shows documented coverage in six dimensions; + adds it to your comparison.</p>
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
            </div>
            {family !== "all" && <p className="family-desc" data-reveal>{familyOf(family).description}</p>}
            <div className="grid" key={family}>
              {browse.map((t, i) => (
                <ToolCard key={t.id} t={t} index={i} selected={picked.includes(t.id)} onToggle={() => toggle(t.id)} onOpen={() => setOpen(t)} />
              ))}
            </div>
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
                      <button type="button" onClick={() => { setFamily(f.id); scrollTo("browse"); }}>
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

        {/* RECORD */}
        <section className="record" id="record">
          <div className="wrap record-grid">
            <div className="record-copy" data-reveal>
              <span className="eyebrow">The record</span>
              <h2>GitHub is the source of truth. This page is a window.</h2>
              <p className="lead">One JSON file holds everything you see. It lives in a public repository, changes only through reviewed, GitHub-signed merges, and this page checks on load that the copy it rendered is byte-for-byte the one it was built from.</p>
              <ol className="record-steps">
                <li><span><strong>Report.</strong> Anyone files a source-backed JSON report: one field, one official URL, one date.</span></li>
                <li><span><strong>Review.</strong> A maintainer dry-runs the merge. Conflicts and stale values stop it; agreeing reports combine their evidence.</span></li>
                <li><span><strong>Sign.</strong> The merge workflow writes the catalogue through GitHub's API, so the commit carries GitHub's verified signature.</span></li>
                <li><span><strong>Render.</strong> A static rebuild ships the new record with its hash and commit stamped into the page.</span></li>
              </ol>
              <div className="record-actions">
                <a className="btn" href={`${record.repo}/blob/main/client/public/catalog.json`} target="_blank" rel="noopener noreferrer">Read the record on GitHub <ArrowUpRight size={18} /></a>
                <a className="btn btn-ghost" href={`${record.repo}/commits/main/client/public/catalog.json`} target="_blank" rel="noopener noreferrer">Change history <ArrowUpRight size={18} /></a>
              </div>
            </div>
            <aside className="seal" data-reveal>
              <div className={`seal-ring ${record.intact === false ? "is-bad" : record.intact ? "is-ok" : ""}`}>
                <svg viewBox="0 0 120 120" aria-hidden="true">
                  <circle className="seal-track" cx="60" cy="60" r="54" />
                  <circle className="seal-arc" cx="60" cy="60" r="54" />
                </svg>
                <div className="seal-face">
                  <Glyph size={34} />
                  <strong>{record.intact === null ? "Unverified" : record.intact ? "Intact" : "Altered"}</strong>
                </div>
              </div>
              <dl className="seal-facts">
                <div><dt>Catalogue snapshot</dt><dd>{metadata.updated}</dd></div>
                <div><dt>Rendering commit</dt><dd><a href={`${record.repo}/commit/${record.commit}`} target="_blank" rel="noopener noreferrer"><code>{record.commit}</code></a></dd></div>
                <div><dt>Built</dt><dd>{record.buildDate}</dd></div>
                <div><dt>Record SHA-256</dt><dd><code className="hash" title={record.expectedSha}>{record.expectedSha.slice(0, 16)}…{record.expectedSha.slice(-8)}</code></dd></div>
                <div><dt>Served copy</dt><dd>{record.intact === null ? "Hash unavailable in this browser" : record.intact ? "Matches the build" : <>Differs: <code className="hash">{record.actualSha.slice(0, 16)}…</code></>}</dd></div>
                <div><dt>Licence</dt><dd>MIT · original data and code</dd></div>
              </dl>
              <a className="text-link" href="./catalog.json" download>Download catalog.json <ArrowRight size={16} /></a>
            </aside>
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
                This Panoramix is our own character and an homage, not a licensed one. He does the same job for AI tooling: keeps the record of what each ingredient is documented to do, sorts the forest into families, and shows it plainly. No rankings, no sponsors, no login, nothing to type. Just the recipe book, open and signed.
              </p>
              <ul className="story-rules">
                <li><strong>Documented, not claimed.</strong> Every capability links to an official page.</li>
                <li><strong>Like with like.</strong> A gateway is not an agent; we compare inside families first.</li>
                <li><strong>Signed and checkable.</strong> GitHub-verified merges, a hash on the page, the file one click away.</li>
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
        <p>Open source under MIT. Record snapshot {metadata.updated}, rendered from commit <code>{record.commit}</code>. Editorial comparison from documented sources, not a benchmark. Verify prices and terms before choosing. "ask" in the domain is just the domain.</p>
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
