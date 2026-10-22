import React, { useState, useMemo, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  X,
  Plus,
  Check,
  SlidersHorizontal,
  LayoutGrid,
  List,
  FlaskConical,
  BookOpen,
  Sparkles,
  Route,
  Bot,
  Image,
  Zap,
  ShieldCheck,
  Workflow,
  Code2,
  AudioLines,
  Server,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Copy,
  Scale,
  RotateCcw,
  Info,
  ChartNoAxesCombined,
  Leaf,
  Compass,
  CircleHelp,
} from "lucide-react";
import {
  tools,
  families,
  featureLabels,
  recipes,
  metadata,
  parseBrief,
  matchScore,
  type Tool,
  type Family,
} from "./data";

const family = (id: string) => families.find((f) => f.id === id)!;
const dateLabel = () =>
  new Date(`${metadata.updated}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
const icons: Record<string, React.ElementType> = {
  agent: Bot,
  route: Route,
  image: Image,
  zap: Zap,
  shield: ShieldCheck,
  workflow: Workflow,
  code: Code2,
  audio: AudioLines,
  server: Server,
};
const go = (id = "workbench") =>
  document
    .getElementById(id)
    ?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
const sourceLink = (t: Tool, label = "Read official overview") => (
  <>
    <a className="source-link" href={t.source} target="_blank" rel="noreferrer">
      {label}
      <ArrowUpRight size={13} />
    </a>
    {t.evidence && t.evidence.length > 0 && (
      <span className="community-evidence">
        {t.evidence.map((e, i) => (
          <a
            key={i}
            className="source-link"
            href={e.url}
            target="_blank"
            rel="noreferrer"
            title={`${e.field}: ${e.note} · ${e.checkedAt} · ${e.reportId}`}
          >
            {e.field} evidence <ArrowUpRight size={11} />
          </a>
        ))}
      </span>
    )}
  </>
);
function Mark({ t, small = false }: { t: Tool; small?: boolean }) {
  return (
    <span
      className={`tool-mark ${small ? "small" : ""}`}
      style={{ "--mark": family(t.family).color } as React.CSSProperties}
    >
      {t.name === "Perplexity Computer"
        ? "Pc"
        : t.name
            .split(/[\s.]+/)
            .slice(0, 2)
            .map((x) => x[0])
            .join("")}
    </span>
  );
}
function Modal({
  open,
  onClose,
  title,
  description,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className={`modal ${wide ? "wide" : ""}`}>
          <div className="modal-head">
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.Description>{description}</Dialog.Description>
            </div>
            <Dialog.Close aria-label="Close dialog" className="icon-button">
              <X size={20} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export default function App() {
  const [tab, setTab] = useState("matrix"),
    [query, setQuery] = useState(""),
    [brief, setBrief] = useState(""),
    [category, setCategory] = useState("all"),
    [search, setSearch] = useState(""),
    [features, setFeatures] = useState<string[]>([]),
    [sort, setSort] = useState("editorial"),
    [page, setPage] = useState(0),
    [view, setView] = useState(window.innerWidth <= 600 ? "cards" : "table"),
    [selected, setSelected] = useState<string[]>([]),
    [onlySelected, setOnlySelected] = useState(false),
    [filtersOpen, setFiltersOpen] = useState(false),
    [compare, setCompare] = useState(false),
    [detail, setDetail] = useState<Tool | null>(null),
    [method, setMethod] = useState(false),
    [copyText, setCopyText] = useState(""),
    [copied, setCopied] = useState(false),
    [notice, setNotice] = useState("");
  const parsed = useMemo(() => parseBrief(brief), [brief]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) && !document.querySelector('[role="dialog"]')) {
        event.preventDefault();
        setTab("matrix");
        go();
        requestAnimationFrame(() => document.querySelector<HTMLInputElement>(".search-field input")?.focus());
      }
    };
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, []);
  const matched = useMemo(
    () =>
      tools
        .filter(
          (t) =>
            (category === "all" || t.family === category) &&
            (!onlySelected || selected.includes(t.id)) &&
            features.every((f) => t.features.includes(f)) &&
            `${t.name} ${t.description} ${t.tags.join(" ")} ${family(t.family).name}`
              .toLowerCase()
              .includes(search.toLowerCase()),
        )
        .sort((a, b) =>
          sort === "az"
            ? a.name.localeCompare(b.name)
            : sort === "family"
              ? family(a.family).name.localeCompare(family(b.family).name)
              : brief
                ? matchScore(b, parsed).score - matchScore(a, parsed).score
                : tools.indexOf(a) - tools.indexOf(b),
        ),
    [category, features, search, sort, brief, parsed, selected, onlySelected],
  );
  const current = matched.slice(page * 10, page * 10 + 10),
    shortlist = tools.filter((t) => selected.includes(t.id));
  const filtered = (fn: () => void) => {
    fn();
    setPage(0);
  };
  function toggle(id: string) {
    if (selected.includes(id)) setSelected(selected.filter((x) => x !== id));
    else if (selected.length < 4) setSelected([...selected, id]);
    else {
      setNotice(
        "Your comparison tray holds four tools. Remove one to add another.",
      );
      setTimeout(() => setNotice(""), 5000);
    }
  }
  function runBrief(value = query, cat = "all") {
    setQuery(value);
    setBrief(value.trim());
    setCategory(cat);
    setSearch("");
    setFeatures([]);
    setOnlySelected(false);
    setPage(0);
    setSort("editorial");
    setTab("matrix");
    go();
  }
  function useRecipe(r: (typeof recipes)[0], shortlistIt = false) {
    runBrief(r.query, r.family);
    if (shortlistIt) {
      setSelected(r.ids);
      setCompare(true);
    }
  }
  function exportText(csv = false) {
    const list = shortlist.length ? shortlist : matched;
    const text = csv
      ? [
          "Name,Family,Access,Confirmed capabilities,Billing,Official overview",
          ...list.map((t) =>
            [
              t.name,
              family(t.family).name,
              t.access,
              t.features.map((x) => featureLabels[x]).join("; "),
              t.billing,
              t.source,
            ]
              .map((x) => `"${(/^[=+\-@\t\r]/.test(x) ? "'" + x : x).replaceAll('"', '""')}"`)
              .join(","),
          ),
        ].join("\n")
      : `PANORAMIX · COMPARISON BRIEF\n${brief ? `Goal: ${brief}\n` : ""}Catalogue snapshot: ${dateLabel()}\nEditorial shortlist, not a performance ranking.\n\n${list.map((t) => `${t.name} | ${family(t.family).name}\n${t.description}\nAccess: ${t.access}\nConfirmed signals: ${t.features.map((x) => featureLabels[x]).join(", ")}\nBilling: ${t.billing}\nWorth testing for: ${t.best}\nCheck: ${t.watch}\nOfficial overview: ${t.source}${t.extra ? `\nAdditional documentation: ${t.extra}` : ""}${t.evidence?.length ? `\nCommunity evidence:\n${t.evidence.map(e=>`${e.field} | ${e.url} | ${e.checkedAt} | ${e.reportId}`).join("\n")}` : ""}`).join("\n\n")}\n\nValidate current price, exact model/version, output settings, quotas, data terms, and your own workload before choosing. n.a. means not established by the reviewed source, not unavailable.`;
    setCopyText(text);
    setCopied(false);
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
    } catch {
      setNotice(
        "Clipboard access is blocked here. Select the text below and copy it manually.",
      );
    }
  };
  return (
    <div className="app">
      <header className="site-header">
        <div className="shell header-inner">
          <a className="wordmark" href="#home" aria-label="Panoramix home">
            <img className="brand-logo" src="./panoramix-mark.svg" alt="" width="31" height="31" />
            panoramix<span className="brand-dot">.</span>
          </a>
          <nav aria-label="Main navigation">
            <button
              onClick={() => {
                setTab("matrix");
                go();
              }}
            >
              The workbench
            </button>
            <button
              onClick={() => {
                setTab("recipes");
                go();
              }}
            >
              Recipes
            </button>
            <button onClick={() => go("story")}>Why Panoramix?</button>
          </nav>
          <button
            className="button dark small-button"
            onClick={() => {
              go("brief");
              setTimeout(
                () => document.getElementById("brief-input")?.focus(),
                450,
              );
            }}
          >
            Find my mix <ArrowUpRight size={15} />
          </button>
        </div>
      </header>
      <main id="home">
        <section className="hero shell">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" /> A LITTLE WISDOM FOR YOUR AI STACK
            </div>
            <h1>
              Find your
              <br />
              <span>magic mix.</span>
            </h1>
            <p>
              The AI landscape is a wild forest.
              <br className="desktop-br" /> Find the right tools, compare the
              ingredients,
              <br className="desktop-br" /> and brew a stack that actually works
              for you.
            </p>
            <div className="hero-actions">
              <button className="button dark" onClick={() => go()}>
                Explore the workbench <ArrowRight size={17} />
              </button>
              <button
                className="text-button"
                onClick={() => {
                  setTab("recipes");
                  go();
                }}
              >
                Start with a recipe <BookOpen size={16} />
              </button>
            </div>
            <div className="hero-proof">
              <span>
                <Check size={13} /> No account needed
              </span>
              <span>
                <Check size={13} /> Official-source notes
              </span>
              <span>
                <Check size={13} /> No one-size-fits-all winner
              </span>
            </div>
          </div>
          <div className="hero-art">
            <img
              src="./panoramix-apothecary.webp"
              alt="An original forest alchemist combining colorful botanical potions at a copper cauldron"
              fetchPriority="high"
            />
            <span className="art-caption">
              A good stack is all about the ingredients.
            </span>
          </div>
        </section>
        <section className="brief-shell shell" id="brief">
          <div className="brief-card">
            <div className="brief-title">
              <span className="round-icon">
                <FlaskConical size={20} />
              </span>
              <div>
                <h2>What are you brewing?</h2>
                <p>
                  Describe the job, not the product. We’ll help you find a
                  starting point.
                </p>
              </div>
              <span className="local-badge">LOCAL BRIEF MATCHER</span>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                runBrief();
              }}
            >
              <label className="sr-only" htmlFor="brief-input">
                Describe your AI workload
              </label>
              <textarea
                id="brief-input"
                rows={2}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. I need an alternative to Computer for research, or an API for image and video generation…"
                maxLength={1500}
              />
              <button
                className="button dark"
                type="submit"
                disabled={!query.trim()}
              >
                Find my mix <Sparkles size={16} />
              </button>
            </form>
            <div className="suggestion-row">
              <span>Try a recipe</span>
              {[recipes[0], recipes[2], recipes[1], recipes[4]].map((r) => (
                <button key={r.id} onClick={() => useRecipe(r)}>
                  {r.title}
                  <ArrowUpRight size={12} />
                </button>
              ))}
            </div>
            <p className="micro">
              Rule-based matching, not a live AI answer. Your brief stays in
              this tab; no inference calls are made.
            </p>
          </div>
        </section>
        <section className="workbench shell" id="workbench">
          <div className="section-heading">
            <div>
              <div className="eyebrow muted">THE APOTHECARY IS OPEN</div>
              <h2>A clearer view of AI.</h2>
              <p>
                Different tools. Different jobs. Compare like with like, or
                build a complementary stack.
              </p>
            </div>
            <button className="method-link" onClick={() => setMethod(true)}>
              <CircleHelp size={15} /> How to read this
            </button>
          </div>
          <div className="workbench-bar">
            <div className="tabs" role="tablist" aria-label="Workbench view">
              {[
                { id: "matrix", label: "Comparison matrix", icon: List },
                { id: "landscape", label: "The landscape", icon: Compass },
                { id: "recipes", label: "Recipes", icon: BookOpen },
                { id: "cost", label: "Cost lab", icon: ChartNoAxesCombined },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  role="tab"
                  aria-selected={tab === id}
                  className={tab === id ? "active" : ""}
                  key={id}
                  onClick={() => setTab(id)}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
            <span className="snapshot">
              <span /> Snapshot · {dateLabel()}
            </span>
          </div>
          {tab === "matrix" && (
            <>
              {brief && (
                <div className="brief-result">
                  <div>
                    <span className="eyebrow">YOUR BRIEF</span>
                    <p>{brief}</p>
                    <div className="match-tags">
                      {parsed.recognized ? (
                        <>
                          {parsed.families.map((f) => (
                            <span key={f}>{family(f).short}</span>
                          ))}
                          {parsed.features.map((f) => (
                            <span key={f}>{featureLabels[f]}</span>
                          ))}
                        </>
                      ) : (
                        <span>
                          No supported intent recognized. Browse or choose a
                          recipe to narrow it down.
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    aria-label="Clear brief"
                    className="icon-button"
                    onClick={() => {
                      setBrief("");
                      setQuery("");
                      setPage(0);
                    }}
                  >
                    <X size={17} />
                  </button>
                </div>
              )}
              <div className="category-filters">
                <button
                  className={category === "all" ? "active" : ""}
                  onClick={() => filtered(() => setCategory("all"))}
                >
                  All tools <span>{tools.length}</span>
                </button>
                {families.map((f) => (
                  <button
                    key={f.id}
                    className={category === f.id ? "active" : ""}
                    onClick={() => filtered(() => setCategory(f.id))}
                  >
                    <i style={{ background: f.color }} />
                    {f.short}
                    <span>{tools.filter((t) => t.family === f.id).length}</span>
                  </button>
                ))}
              </div>
              <div className="matrix-controls">
                <div className="search-field">
                  <Search size={17} />
                  <input
                    aria-label="Search tools"
                    value={search}
                    onChange={(e) => filtered(() => setSearch(e.target.value))}
                    placeholder="Search tools, tasks, or capabilities…"
                  />
                  {search && (
                    <button
                      className="icon-button"
                      aria-label="Clear search"
                      onClick={() => filtered(() => setSearch(""))}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <button
                  className={`button light filter-button ${filtersOpen ? "pressed" : ""}`}
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  aria-expanded={filtersOpen}
                >
                  <SlidersHorizontal size={15} /> Filters{" "}
                  {features.length > 0 && <span>{features.length}</span>}
                </button>
                <select
                  aria-label="Sort tools"
                  value={sort}
                  onChange={(e) => filtered(() => setSort(e.target.value))}
                >
                  <option value="editorial">
                    {brief ? "Brief relevance" : "Editorial order"}
                  </option>
                  <option value="az">Name A–Z</option>
                  <option value="family">Tool family</option>
                </select>
                <div className="view-toggle">
                  <button
                    className={view === "table" ? "active" : ""}
                    aria-label="Table view"
                    aria-pressed={view === "table"}
                    onClick={() => setView("table")}
                  >
                    <List size={17} />
                  </button>
                  <button
                    className={view === "cards" ? "active" : ""}
                    aria-label="Card view"
                    aria-pressed={view === "cards"}
                    onClick={() => setView("cards")}
                  >
                    <LayoutGrid size={16} />
                  </button>
                </div>
              </div>
              {filtersOpen && (
                <div className="advanced-filters">
                  <p>
                    Require confirmed signals{" "}
                    <span>
                      All selected signals must be documented. Unlisted does not
                      mean unavailable.
                    </span>
                  </p>
                  <div>
                    {Object.entries(featureLabels).map(([id, label]) => (
                      <button
                        className={features.includes(id) ? "active" : ""}
                        aria-pressed={features.includes(id)}
                        key={id}
                        onClick={() =>
                          filtered(() =>
                            setFeatures(
                              features.includes(id)
                                ? features.filter((x) => x !== id)
                                : [...features, id],
                            ),
                          )
                        }
                      >
                        {features.includes(id) ? (
                          <Check size={13} />
                        ) : (
                          <Plus size={13} />
                        )}{" "}
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="results-meta">
                <span aria-live="polite">
                  <strong>{matched.length}</strong> tools
                  {category !== "all"
                    ? ` in ${family(category).name}`
                    : ` across ${families.length} families`}
                  {brief && " · editorial relevance, not a benchmark"}
                </span>
                <div>
                  <label className="shortlist-check">
                    <input
                      type="checkbox"
                      checked={onlySelected}
                      onChange={(e) =>
                        filtered(() => setOnlySelected(e.target.checked))
                      }
                    />{" "}
                    My shortlist
                  </label>
                  <button
                    className="text-button"
                    onClick={() => exportText(true)}
                  >
                    Copy CSV <Copy size={13} />
                  </button>
                  {(search ||
                    category !== "all" ||
                    features.length ||
                    onlySelected) && (
                    <button
                      className="text-button"
                      onClick={() =>
                        filtered(() => {
                          setSearch("");
                          setCategory("all");
                          setFeatures([]);
                          setOnlySelected(false);
                        })
                      }
                    >
                      <RotateCcw size={12} /> Reset filters
                    </button>
                  )}
                </div>
              </div>
              {matched.length === 0 ? (
                <div className="empty-state">
                  <Search size={29} />
                  <h3>No ingredients in this combination.</h3>
                  <p>
                    Try removing a required signal or broadening the family.
                    Unconfirmed capabilities are intentionally excluded by
                    filters.
                  </p>
                  <button
                    className="button dark"
                    onClick={() =>
                      filtered(() => {
                        setSearch("");
                        setCategory("all");
                        setFeatures([]);
                        setOnlySelected(false);
                      })
                    }
                  >
                    Clear filters
                  </button>
                </div>
              ) : view === "table" ? (
                <div className="table-scroll">
                  <table className="matrix-table">
                    <thead>
                      <tr>
                        <th className="tool-col">TOOL / PLATFORM</th>
                        <th>FAMILY</th>
                        <th className="does-col">THE SHORT VERSION</th>
                        <th>ACCESS</th>
                        <th>CONFIRMED SIGNALS</th>
                        <th className="add-col">
                          <span className="sr-only">Shortlist</span>
                          <Scale size={16} />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {current.map((t) => (
                        <tr
                          key={t.id}
                          className={
                            selected.includes(t.id) ? "selected-row" : ""
                          }
                        >
                          <td>
                            <button
                              className="tool-title"
                              onClick={() => setDetail(t)}
                            >
                              <Mark t={t} />
                              <span>
                                {t.name}
                                <small>
                                  {brief && matchScore(t, parsed).score > 0
                                    ? "Relevant to your brief"
                                    : "View the field notes"}
                                  <ArrowUpRight size={11} />
                                </small>
                              </span>
                            </button>
                          </td>
                          <td>
                            <span
                              className="family-label"
                              style={
                                {
                                  "--mark": family(t.family).color,
                                } as React.CSSProperties
                              }
                            >
                              <i />
                              {family(t.family).short}
                            </span>
                          </td>
                          <td>
                            <p className="short-desc">
                              {t.description}{" "}
                              <a
                                href={t.source}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`${t.name} official source`}
                              >
                                <ExternalLink size={11} />
                              </a>
                            </p>
                          </td>
                          <td>
                            <span className="access-label">{t.access}</span>
                          </td>
                          <td>
                            <div className="cap-tags">
                              {t.features.slice(0, 3).map((c) => (
                                <a
                                  href={t.source}
                                  key={c}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {featureLabels[c]}
                                </a>
                              ))}
                              {t.features.length > 3 && (
                                <button
                                  onClick={() => setDetail(t)}
                                  aria-label={`View ${t.features.length - 3} more signals for ${t.name}`}
                                >
                                  +{t.features.length - 3}
                                </button>
                              )}
                            </div>
                          </td>
                          <td>
                            <button
                              className={`add-button ${selected.includes(t.id) ? "added" : ""}`}
                              aria-label={`${selected.includes(t.id) ? "Remove" : "Add"} ${t.name} ${selected.includes(t.id) ? "from" : "to"} comparison`}
                              aria-pressed={selected.includes(t.id)}
                              onClick={() => toggle(t.id)}
                            >
                              {selected.includes(t.id) ? (
                                <Check size={16} />
                              ) : (
                                <Plus size={17} />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="tool-card-grid">
                  {current.map((t) => (
                    <article className="tool-card" key={t.id}>
                      <div className="tool-card-top">
                        <Mark t={t} />
                        <button
                          className={`add-button ${selected.includes(t.id) ? "added" : ""}`}
                          aria-label={`${selected.includes(t.id) ? "Remove" : "Add"} ${t.name} ${selected.includes(t.id) ? "from" : "to"} comparison`}
                          onClick={() => toggle(t.id)}
                        >
                          {selected.includes(t.id) ? (
                            <Check size={16} />
                          ) : (
                            <Plus size={17} />
                          )}
                        </button>
                      </div>
                      <span
                        className="eyebrow"
                        style={{ color: family(t.family).color }}
                      >
                        {family(t.family).name}
                      </span>
                      <h3>
                        <button onClick={() => setDetail(t)}>
                          {t.name}
                          <ArrowUpRight size={14} />
                        </button>
                      </h3>
                      <p>
                        {t.description}{" "}
                        <a
                          href={t.source}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`${t.name} official source`}
                        >
                          <ExternalLink size={11} />
                        </a>
                      </p>
                      <div className="cap-tags">
                        {t.features.slice(0, 3).map((c) => (
                          <a
                            href={t.source}
                            key={c}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {featureLabels[c]}
                          </a>
                        ))}
                      </div>
                      <button
                        className="text-button"
                        onClick={() => setDetail(t)}
                      >
                        Read field notes <ArrowRight size={14} />
                      </button>
                    </article>
                  ))}
                </div>
              )}
              {matched.length > 0 && (
                <div className="pagination">
                  <span>
                    Showing {page * 10 + 1}–
                    {Math.min(page * 10 + 10, matched.length)} of{" "}
                    {matched.length}
                  </span>
                  <div>
                    <button
                      className="icon-button"
                      aria-label="Previous page"
                      disabled={!page}
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronLeft size={17} />
                    </button>
                    <span>
                      {page + 1} / {Math.ceil(matched.length / 10)}
                    </span>
                    <button
                      className="icon-button"
                      aria-label="Next page"
                      disabled={(page + 1) * 10 >= matched.length}
                      onClick={() => setPage(page + 1)}
                    >
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
              )}
              <div className="matrix-footnote">
                <Info size={14} />
                <p>
                  Not every tool belongs in the same contest. A gateway connects
                  models; an agent executes work; a studio helps you create.
                  Open any field note for evidence, trade-offs, and billing
                  context.
                </p>
                <button className="text-button" onClick={() => setMethod(true)}>
                  The fine print <ArrowUpRight size={13} />
                </button>
              </div>
            </>
          )}
          {tab === "recipes" && (
            <div className="recipes-view">
              <div className="panel-intro">
                <div>
                  <h3>A few good starting questions.</h3>
                  <p>
                    Ready-made comparison templates, not pre-selected winners.
                    Adjust the brief to make it yours.
                  </p>
                </div>
                <span className="count-label">{recipes.length} STARTING POINTS</span>
              </div>
              <div className="recipe-grid">
                {recipes.map((r) => {
                  const Icon = icons[r.icon];
                  return (
                    <article className={`recipe-card ${r.tone}`} key={r.id}>
                      <span className="recipe-icon">
                        <Icon size={24} />
                      </span>
                      <h3>{r.title}</h3>
                      <p>{r.description}</p>
                      <div className="mini-marks">
                        {r.ids.slice(0, 3).map((id) => (
                          <Mark
                            small
                            key={id}
                            t={tools.find((t) => t.id === id)!}
                          />
                        ))}
                        {r.ids.length>3&&<span>+{r.ids.length-3} ingredient{r.ids.length>4?"s":""}</span>}
                      </div>
                      <div className="recipe-actions">
                        <button
                          className="text-button"
                          onClick={() => useRecipe(r)}
                        >
                          Use this recipe <ArrowRight size={15} />
                        </button>
                        <button
                          aria-label={`Compare template: ${r.title}`}
                          className="icon-button"
                          onClick={() => useRecipe(r, true)}
                        >
                          <Scale size={17} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
          {tab === "landscape" && (
            <div className="landscape-view">
              <div className="panel-intro">
                <div>
                  <h3>One forest. Different layers.</h3>
                  <p>
                    Click a family to explore it. These are directory counts,
                    not market share or quality scores.
                  </p>
                </div>
                <span className="count-label">{tools.length} TOOLS / {families.length} FAMILIES</span>
              </div>
              <div className="landscape-grid">
                <div className="family-chart">
                  <h4>What’s in the apothecary?</h4>
                  <div className="chart-legend">
                    <i /> Tools in this snapshot
                  </div>
                  {families.map((f) => {
                    const count = tools.filter((t) => t.family === f.id).length;
                    return (
                      <button
                        className="chart-row"
                        key={f.id}
                        onClick={() => {
                          setCategory(f.id);
                          setSearch("");
                          setFeatures([]);
                          setPage(0);
                          setOnlySelected(false);
                          setTab("matrix");
                        }}
                      >
                        <span>{f.name}</span>
                        <div className="chart-track">
                          <i
                            style={{
                              width: `${(count / Math.max(1,...families.map(f=>tools.filter(t=>t.family===f.id).length))) * 100}%`,
                              background: f.color,
                            }}
                          />
                        </div>
                        <b>{count}</b>
                        <ArrowUpRight size={13} />
                      </button>
                    );
                  })}
                  <p className="micro">
                    Each product appears in one primary family. Products can
                    span several layers.
                  </p>
                </div>
                <div className="stack-diagram">
                  <span className="eyebrow">
                    THINK IN LAYERS, NOT LEADERBOARDS
                  </span>
                  <h4>Your stack can be a team.</h4>
                  {[
                    {
                      label: "Do the work",
                      sub: "Agents · Coding · Automation",
                      icon: Bot,
                      tone: "sage",
                    },
                    {
                      label: "Make the experience",
                      sub: "Creative studios · Media APIs",
                      icon: Image,
                      tone: "peach",
                    },
                    {
                      label: "Connect the models",
                      sub: "Gateways · First-party APIs",
                      icon: Route,
                      tone: "blue",
                    },
                    {
                      label: "Run the engines",
                      sub: "Inference · GPU · Cloud platforms",
                      icon: Server,
                      tone: "sand",
                    },
                  ].map((x, i) => (
                    <React.Fragment key={x.label}>
                      {i > 0 && <div className="stack-connector" />}
                      <div className={`stack-layer ${x.tone}`}>
                        <x.icon size={23} />
                        <div>
                          <h5>{x.label}</h5>
                          <p>{x.sub}</p>
                        </div>
                        <span>0{i + 1}</span>
                      </div>
                    </React.Fragment>
                  ))}
                  <p className="micro">
                    Conceptual diagram. One tool may cover multiple layers; you
                    don’t necessarily need all four.
                  </p>
                </div>
              </div>
              <div className="callout">
                <Leaf size={22} />
                <div>
                  <h4>A good mix is often better than a single winner.</h4>
                  <p>
                    For example, compare an agent for research, a gateway for
                    your app, and a media API for generation as complementary
                    ingredients, not direct substitutes.
                  </p>
                </div>
                <button
                  className="button light"
                  onClick={() => setTab("recipes")}
                >
                  Find a recipe <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}
          {tab === "cost" && <CostLab />}
        </section>
        <section className="story shell" id="story">
          <div className="story-art">
            <img
              src="./panoramix-apothecary.webp"
              alt="Botanical potion ingredients in Panoramix's original illustrated apothecary"
              loading="lazy"
            />
            <span>THE WISDOM IS IN THE MIX.</span>
          </div>
          <div className="story-copy">
            <div className="eyebrow">A SMALL NOD TO A WISE DRUID</div>
            <h2>Why Panoramix?</h2>
            <p>
              In Astérix, Panoramix (Getafix in English) is the village druid:
              keeper of its wisdom and the secret recipe for the magic potion.{" "}
              <a
                href="https://asterix.com/personnages/panoramix/"
                target="_blank"
                rel="noreferrer"
              >
                Meet the original <ArrowUpRight size={13} />
              </a>
            </p>
            <p>
              That’s the spirit here. AI tools are ingredients, not magic on
              their own. A little knowledge, the right proportions, and a recipe
              for your actual task make a much better brew.
            </p>
            <span className="story-note">
              An independent project and affectionate nod. Not affiliated with
              Astérix or its rights holders. Our alchemist illustration is an
              original character, not the comic’s Panoramix.
            </span>
          </div>
        </section>
      </main>
      <section className="community shell">
        <div>
          <span className="eyebrow">THE POTION GETS BETTER TOGETHER</span>
          <h2>Bring your findings to the table.</h2>
          <p>
            Found a new tool, a changed feature, or a better source? Submit a
            standard research report. Reviewed contributions are combined into
            the next public catalogue update.
          </p>
        </div>
        <div>
          <a
            className="button dark"
            href="https://github.com/paulfxyz/panoramix/blob/main/CONTRIBUTING.md"
            target="_blank"
            rel="noreferrer"
          >
            Contribute a report <ArrowUpRight size={15} />
          </a>
          <a
            className="text-button"
            href="https://github.com/paulfxyz/panoramix"
            target="_blank"
            rel="noreferrer"
          >
            Explore the source <Code2 size={15} />
          </a>
        </div>
      </section>
      <footer className="site-footer shell">
        <div>
          <a className="wordmark" href="#home">
            <img className="brand-logo" src="./panoramix-mark.svg" alt="" width="27" height="27" />
            panoramix<span className="brand-dot">.</span>
          </a>
          <p>A little wisdom. A better AI stack.</p>
        </div>
        <div>
          <span>Independent, not exhaustive, and never pay-to-rank.</span>
          <button onClick={() => setMethod(true)}>
            Sources & methodology <ArrowUpRight size={13} />
          </button>
          <a
            href="https://github.com/paulfxyz/panoramix"
            target="_blank"
            rel="noreferrer"
          >
            Open source · MIT · GitHub <ArrowUpRight size={12} />
          </a>
          <span>No account or API key required inside the tool.</span>
        </div>
      </footer>
      {selected.length > 0 && (
        <div className="compare-tray">
          <div>
            <Scale size={18} />
            <strong>{selected.length} / 4</strong>
            <span className="tray-label">in your mix</span>
            <div className="tray-tools">
              {shortlist.map((t) => (
                <button
                  key={t.id}
                  title={`Remove ${t.name}`}
                  onClick={() => toggle(t.id)}
                >
                  <Mark small t={t} />
                  <span>{t.name}</span>
                  <X size={12} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <button className="text-button" onClick={() => setSelected([])}>
              Clear
            </button>
            <button className="button dark" onClick={() => setCompare(true)}>
              Compare{selected.length > 1 ? ` ${selected.length}` : ""}{" "}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
      {notice && (
        <div className="notice" role="status">
          {notice}
          <button aria-label="Dismiss notice" onClick={() => setNotice("")}>
            <X size={15} />
          </button>
        </div>
      )}
      <Modal
        open={compare}
        onClose={() => setCompare(false)}
        title="Your ingredients, side by side."
        description="A decision aid, not a leaderboard. Check source details and test your own workload."
        wide
      >
        <div className="comparison-scroll">
          <table className="compare-table">
            <thead>
              <tr>
                <th>THE FIELD NOTES</th>
                {shortlist.map((t) => (
                  <th key={t.id}>
                    <Mark t={t} />
                    <span>{t.name}</span>
                    <button
                      className="icon-button"
                      aria-label={`Remove ${t.name} from comparison`}
                      onClick={() => toggle(t.id)}
                    >
                      <X size={13} />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  label: "Primary family",
                  value: (t: Tool) => family(t.family).name,
                },
                { label: "What it does", value: (t: Tool) => t.description },
                { label: "How you use it", value: (t: Tool) => t.access },
                { label: "Worth testing for", value: (t: Tool) => t.best },
                { label: "Billing context", value: (t: Tool) => t.billing },
                { label: "Watch out for", value: (t: Tool) => t.watch },
              ].map((row) => (
                <tr key={row.label}>
                  <th>{row.label}</th>
                  {shortlist.map((t) => (
                    <td key={t.id}>
                      {row.value(t)} {sourceLink(t, "Docs")}
                    </td>
                  ))}
                </tr>
              ))}
              {Object.entries(featureLabels)
                .filter(([id]) =>
                  shortlist.some((t) => t.features.includes(id)),
                )
                .map(([id, label]) => (
                  <tr key={id}>
                    <th>{label}</th>
                    {shortlist.map((t) => (
                      <td key={t.id}>
                        {t.features.includes(id) ? (
                          <a
                            className="confirmed"
                            href={t.source}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Check size={14} />
                            Documented <ArrowUpRight size={10} />
                          </a>
                        ) : (
                          <span className="unconfirmed">
                            Not established here
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              <tr>
                <th>Official overview</th>
                {shortlist.map((t) => (
                  <td key={t.id}>
                    {sourceLink(t)}
                    {t.extra && (
                      <a
                        className="source-link"
                        href={t.extra}
                        target="_blank"
                        rel="noreferrer"
                      >
                        More documentation <ArrowUpRight size={13} />
                      </a>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        {shortlist.length === 0 && (
          <p className="empty-state">
            Your tray is empty. Close this view and add tools from the matrix.
          </p>
        )}
        <div className="modal-bottom">
          <p>
            Missing signal ≠ missing feature. “Worth testing for” and caution
            notes are editorial guidance.
          </p>
          <button
            className="button dark"
            disabled={!shortlist.length}
            onClick={() => exportText()}
          >
            Copy comparison brief <Copy size={14} />
          </button>
        </div>
      </Modal>
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.name || ""}
        description={detail ? family(detail.family).name : ""}
      >
        {detail && (
          <div className="detail-body">
            <p className="detail-lede">
              {detail.description} {sourceLink(detail, "Official overview")}
            </p>
            <div className="detail-facts">
              <div>
                <span>ACCESS</span>
                <p>
                  {detail.access} {sourceLink(detail, "Docs")}
                </p>
              </div>
              <div>
                <span>BILLING CONTEXT</span>
                <p>
                  {detail.billing} {sourceLink(detail, "Docs")}
                </p>
              </div>
            </div>
            <h3>Confirmed signals</h3>
            <div className="cap-tags">
              {detail.features.map((x) => (
                <a
                  href={detail.source}
                  target="_blank"
                  rel="noreferrer"
                  key={x}
                >
                  {featureLabels[x]} <ArrowUpRight size={10} />
                </a>
              ))}
            </div>
            <p className="micro">
              Selected capabilities confirmed by the reviewed pages, not an
              exhaustive feature audit. Model-specific restrictions apply.
            </p>
            {brief && (
              <>
                <h3>Why it surfaced</h3>
                <p>
                  {matchScore(detail, parsed).reasons.join(" · ") ||
                    "No specific intent match. Shown as part of the broader directory."}
                </p>
              </>
            )}
            <div className="editorial-note">
              <span className="eyebrow">
                EDITORIAL GUIDANCE, NOT A BENCHMARK
              </span>
              <h3>Worth testing for</h3>
              <p>{detail.best}</p>
              <h3>Before you choose</h3>
              <p>{detail.watch}</p>
            </div>
            <div className="detail-source">
              <span>Catalogue snapshot · {dateLabel()} · check individual evidence dates</span>
              {sourceLink(detail)}
              {detail.extra && (
                <a
                  className="source-link"
                  target="_blank"
                  rel="noreferrer"
                  href={detail.extra}
                >
                  Additional documentation <ArrowUpRight size={13} />
                </a>
              )}
            </div>
            <button className="button dark" onClick={() => toggle(detail.id)}>
              {selected.includes(detail.id) ? (
                <Check size={16} />
              ) : (
                <Plus size={16} />
              )}{" "}
              {selected.includes(detail.id)
                ? "Remove from my mix"
                : "Add to my mix"}
            </button>
          </div>
        )}
      </Modal>
      <Modal
        open={method}
        onClose={() => setMethod(false)}
        title="Wisdom, not a magic leaderboard."
        description="What this directory can help with, and what still needs your judgment."
      >
        <div className="method-body">
          <h3>What the matrix means</h3>
          <p>
            {tools.length} products are assigned to {families.length} primary families by their main role.
            Classification and “worth testing for” notes are editorial. Official
            overviews and docs are linked beside product facts. This is a
            curated snapshot, not a live or exhaustive audit.
          </p>
          <h3>Evidence and missing information</h3>
          <p>
            The initial research was checked on 22 October 2026. The catalogue snapshot is {dateLabel()}; this is not a claim that every record was re-audited on that date. Some reviewed pages,
            including product launch articles, are older. “Documented” means
            present in the reviewed material; “not established here” and “n.a.”
            mean unconfirmed, not unsupported. Product pages can be incomplete
            or change. Check the exact model, plan, region, licensing, API
            restrictions, and data terms.
          </p>
          <h3>How the brief matcher works</h3>
          <p>
            Your words are matched locally to curated families, confirmed
            capabilities, product names, and task tags. Relevance rewards a
            matching family, capability, name, and shared task terms, in that
            order. It does not call an LLM, measure quality, determine the
            cheapest provider, understand every constraint, or enforce
            requirements from prose. Use the explicit Filters to require
            documented signals. If the brief is unfamiliar, use a recipe or
            browse.
          </p>
          <h3>No invented benchmarks</h3>
          <p>
            There are no universal speed, intelligence, privacy, or price
            scores. A self-hosted app can still call cloud models. Vision input
            is different from image generation. OpenAI-style compatibility does
            not promise every endpoint or parameter works.
          </p>
          <h3>Costs are workload-specific</h3>
          <p>
            The cost lab calculates figures you enter, not live vendor quotes.
            Token rates, model versions, settings, region, caching, minimum
            spend, idle time, storage, and credits can all change the outcome.
            Taxes and unentered charges are excluded. No Computer credit
            estimate is provided.
          </p>
          <h3>Open by design</h3>
          <p>
            There is no app login, paid ranking, or query API. Shortlists live
            in the current tab only. The preview host may require access; a
            public deployment is a separate step. External official links leave
            this tool.
          </p>
        </div>
      </Modal>
      <Modal
        open={!!copyText}
        onClose={() => setCopyText("")}
        title="Take your notes with you."
        description="Copy a portable comparison brief or CSV. No account or data connection required."
      >
        <textarea
          className="export-text"
          aria-label="Export text"
          readOnly
          value={copyText}
          onFocus={(e) => e.target.select()}
        />
        <div className="modal-bottom">
          <p>Clipboard blocked? Select the text and copy manually.</p>
          <button className="button dark" onClick={copy}>
            {copied ? <Check size={15} /> : <Copy size={15} />}{" "}
            {copied ? "Copied" : "Copy text"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function CostLab() {
  const [mode, setMode] = useState("tokens"),
    [calls, setCalls] = useState("10000"),
    [input, setInput] = useState("1000"),
    [output, setOutput] = useState("500"),
    [units, setUnits] = useState("1000"),
    [rates, setRates] = useState([
      { name: "Quote A", input: "", output: "", markup: "0", fixed: "0" },
      { name: "Quote B", input: "", output: "", markup: "0", fixed: "0" },
    ]);
  const n = (s: string) => Math.max(0, Number(s) || 0);
  const money = (v: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(v);
  const totals = rates.map((r) => {
    const valid =
      mode === "tokens" ? r.input !== "" && r.output !== "" : r.input !== "";
    const base =
      mode === "tokens"
        ? (n(calls) * (n(input) * n(r.input) + n(output) * n(r.output))) / 1e6
        : n(units) * n(r.input);
    return valid ? base * (1 + n(r.markup) / 100) + n(r.fixed) : null;
  });
  const max = Math.max(...totals.map((x) => x || 0), 1);
  const update = (idx: number, key: string, value: string) =>
    setRates(rates.map((r, i) => (i === idx ? { ...r, [key]: value } : r)));
  return (
    <div className="cost-view">
      <div className="panel-intro">
        <div>
          <h3>Compare quotes. Not apples and potions.</h3>
          <p>
            A transparent scenario calculator. Enter current rates for the same
            model and settings; nothing here is a live vendor price.
          </p>
        </div>
        <span className="count-label">YOUR INPUTS, YOUR ESTIMATE</span>
      </div>
      <div className="cost-modes">
        {[
          { id: "tokens", name: "Text tokens" },
          { id: "images", name: "Per image / clip" },
          { id: "gpu", name: "GPU hours" },
          { id: "seats", name: "Subscription seats" },
        ].map((x) => (
          <button
            className={mode === x.id ? "active" : ""}
            key={x.id}
            onClick={() => {
              setMode(x.id);
              setRates(rates.map((r) => ({ ...r, input: "", output: "" })));
            }}
          >
            {x.name}
          </button>
        ))}
      </div>
      <div className="cost-grid">
        <div className="workload-inputs">
          <span className="eyebrow">SET THE WORKLOAD</span>
          <h4>
            {mode === "tokens"
              ? "A month of requests."
              : mode === "gpu"
                ? "Your compute time."
                : mode === "seats"
                  ? "Your team, per month."
                  : "Your monthly outputs."}
          </h4>
          {mode === "tokens" ? (
            <>
              <NumberInput
                label="Requests per month"
                value={calls}
                change={setCalls}
              />
              <NumberInput
                label="Input tokens per request"
                value={input}
                change={setInput}
              />
              <NumberInput
                label="Output tokens per request"
                value={output}
                change={setOutput}
              />
              <p className="formula">
                requests × (input tokens × input rate + output tokens × output
                rate) ÷ 1,000,000
              </p>
            </>
          ) : (
            <>
              <NumberInput
                label={
                  mode === "gpu"
                    ? "GPU hours per month"
                    : mode === "seats"
                      ? "Number of seats"
                      : "Outputs per month"
                }
                value={units}
                change={setUnits}
              />
              <p className="formula">
                {mode === "gpu"
                  ? "hours × hourly rate"
                  : mode === "seats"
                    ? "seats × monthly seat price"
                    : "outputs × price per output"}
              </p>
            </>
          )}
          <div className="cost-warning">
            <Info size={17} />
            <p>
              Compare identical units. A video clip’s duration and resolution
              matter. Credits cannot be converted without the provider’s actual
              conversion rules.
            </p>
          </div>
        </div>
        <div className="quote-area">
          <div className="quote-grid">
            {rates.map((r, i) => (
              <div className="quote-card" key={i}>
                <label className="quote-name">
                  QUOTE {i + 1}
                  <input
                    aria-label={`Name for quote ${i + 1}`}
                    value={r.name}
                    onChange={(e) => update(i, "name", e.target.value)}
                    maxLength={45}
                  />
                </label>
                <NumberInput
                  label={
                    mode === "tokens"
                      ? "Input · USD / 1M tokens"
                      : mode === "gpu"
                        ? "USD / GPU hour"
                        : mode === "seats"
                          ? "USD / seat / month"
                          : "USD / output"
                  }
                  value={r.input}
                  change={(v) => update(i, "input", v)}
                  placeholder="Enter a current quote"
                />
                {mode === "tokens" && (
                  <NumberInput
                    label="Output · USD / 1M tokens"
                    value={r.output}
                    change={(v) => update(i, "output", v)}
                    placeholder="Enter a current quote"
                  />
                )}
                <NumberInput
                  label="Additional fee (%)"
                  value={r.markup}
                  change={(v) => update(i, "markup", v)}
                />
                <NumberInput
                  label="Other fixed monthly costs (USD)"
                  value={r.fixed}
                  change={(v) => update(i, "fixed", v)}
                />
                <span className="estimate-label">
                  ILLUSTRATIVE MONTHLY TOTAL
                </span>
                <strong className="estimate">
                  {totals[i] === null ? "Add your rates" : money(totals[i]!)}
                </strong>
              </div>
            ))}
          </div>
          <div
            className="cost-bars"
            aria-label="Monthly quote comparison chart"
          >
            {rates.map((r, i) => (
              <div key={i}>
                <span>{r.name}</span>
                <div>
                  <i
                    style={{
                      width: `${totals[i] === null ? 0 : (totals[i]! / max) * 100}%`,
                      background: i ? "#ad6849" : "#567253",
                    }}
                  />
                </div>
                <strong>{totals[i] === null ? "—" : money(totals[i]!)}</strong>
              </div>
            ))}
          </div>
          <p className="micro">
            Formula includes your additional percentage fee, then fixed costs.
            Caching discounts, retries, taxes, minimum commitments, idle time,
            storage, and overages are excluded unless included in your inputs.
            This is not a Computer credit calculator.
          </p>
        </div>
      </div>
    </div>
  );
}
function NumberInput({
  label,
  value,
  change,
  placeholder,
}: {
  label: string;
  value: string;
  change: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="number-input">
      <span>{label}</span>
      <input
        type="number"
        min="0"
        step="any"
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(e) => change(e.target.value)}
      />
    </label>
  );
}
