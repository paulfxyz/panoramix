import React, { useMemo, useState } from "react";
import { ArrowRight, Check, Plus, X } from "lucide-react";
import {
  dimensions,
  familyOf,
  families,
  featureLabels,
  has,
  profile,
  toolOf,
  tools,
  type Family,
  type Tool,
} from "./data";

/* ------------------------------------------------------------------ */
/* Lens registry                                                       */
/* ------------------------------------------------------------------ */

export type LensKind = "radars" | "matrix" | "map" | "rivers" | "alternatives" | "checklist" | "stack";

export type Lens = { kind: LensKind; family?: Family | "all"; anchor?: string; caps?: string[] };

export const lensMeta: Record<LensKind, { title: string; blurb: string; shape: string }> = {
  radars: { title: "Radar gallery", blurb: "One small radar per tool. Spot the shape of a family at a glance.", shape: "graph" },
  matrix: { title: "Capability matrix", blurb: "Every tool against every documented capability. The honest table.", shape: "table" },
  map: { title: "Constellation", blurb: "Six poles, one per dimension. Each tool is pulled toward what it documents. Specialists hug a pole; generalists float to the middle.", shape: "map" },
  rivers: { title: "Rivers", blurb: "How each family flows into the six dimensions. Width is documented coverage.", shape: "flow" },
  alternatives: { title: "Alternatives to…", blurb: "Pick a reference tool. See its neighbours and exactly what differs.", shape: "sidebar" },
  checklist: { title: "I need…", blurb: "Tick the capabilities you need. Keep only tools that document all of them.", shape: "filter" },
  stack: { title: "Stack builder", blurb: "One tool per layer. See the combined shape of your stack.", shape: "builder" },
};

export const anchors = ["computer", "openrouter", "runware", "cursor", "zapier", "midjourney", "openai", "modal"];

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

export const RADAR_COLORS = ["var(--fg)", "var(--red)", "var(--muted)", "var(--fg-soft)"];

export function Radar({
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
  const ring = (v: number) => Array.from({ length: n }, (_, i) => pt(i, v).join(",")).join(" ");
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

function FamilyChips({ value, onChange, all = true }: { value: Family | "all"; onChange: (f: Family | "all") => void; all?: boolean }) {
  return (
    <div className="tabs" role="tablist" aria-label="Families">
      {all && (
        <button role="tab" aria-selected={value === "all"} className={`chip ${value === "all" ? "is-on" : ""}`} onClick={() => onChange("all")}>
          All <small>{tools.length}</small>
        </button>
      )}
      {families.map((f) => (
        <button key={f.id} role="tab" aria-selected={value === f.id} className={`chip ${value === f.id ? "is-on" : ""}`} onClick={() => onChange(f.id)}>
          {f.short} <small>{tools.filter((t) => t.family === f.id).length}</small>
        </button>
      ))}
    </div>
  );
}

type Acts = { picked: string[]; toggle: (id: string) => void; open: (t: Tool) => void; compare: (ids: string[]) => void };

function PickBtn({ id, acts, size = 40 }: { id: string; acts: Acts; size?: number }) {
  const on = acts.picked.includes(id);
  return (
    <button type="button" className={`pick ${on ? "is-on" : ""}`} style={{ width: size, height: size }} aria-pressed={on} aria-label={on ? "Remove from comparison" : "Add to comparison"} onClick={() => acts.toggle(id)}>
      <span className="pick-icon">
        <Plus size={16} />
        <Check size={16} />
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Radar gallery                                                    */
/* ------------------------------------------------------------------ */

export function RadarGallery({ lens, setLens, acts }: { lens: Lens; setLens: (l: Lens) => void; acts: Acts }) {
  const fam = lens.family ?? "agents";
  const list = tools.filter((t) => fam === "all" || t.family === fam);
  return (
    <div className="lens-body">
      <FamilyChips value={fam} onChange={(f) => setLens({ ...lens, family: f })} />
      <div className="gallery" key={fam}>
        {list.map((t, i) => (
          <article key={t.id} className={`mini ${acts.picked.includes(t.id) ? "is-selected" : ""}`} style={{ ["--d" as string]: `${(i % 12) * 40}ms` }}>
            <button type="button" className="mini-radar" onClick={() => acts.open(t)} aria-label={`Open ${t.name} field notes`}>
              <Radar series={[{ name: t.name, values: profile(t) }]} size={200} labels={false} />
            </button>
            <div className="mini-foot">
              <div>
                <h4>{t.name}</h4>
                <span className="meta">{familyOf(t.family).short}</span>
              </div>
              <PickBtn id={t.id} acts={acts} size={36} />
            </div>
          </article>
        ))}
      </div>
      <p className="micro">Axes clockwise from the top: {dimensions.map((d) => d.short).join(", ")}. Each axis is the share of that dimension's documented features.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Capability matrix                                                */
/* ------------------------------------------------------------------ */

export function MatrixLens({ lens, setLens, acts }: { lens: Lens; setLens: (l: Lens) => void; acts: Acts }) {
  const fam = lens.family ?? "all";
  const list = tools.filter((t) => fam === "all" || t.family === fam);
  const caps = Object.keys(featureLabels);
  return (
    <div className="lens-body">
      <FamilyChips value={fam} onChange={(f) => setLens({ ...lens, family: f })} />
      <div className="bigmatrix-wrap">
        <table className="bigmatrix">
          <thead>
            <tr>
              <th scope="col" className="sticky">Tool</th>
              {caps.map((c) => (
                <th key={c} scope="col">
                  <span>{featureLabels[c]}</span>
                </th>
              ))}
              <th scope="col" className="num">Σ</th>
              <th scope="col" />
            </tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id} className={acts.picked.includes(t.id) ? "is-selected" : ""}>
                <th scope="row" className="sticky">
                  <button type="button" className="row-name" onClick={() => acts.open(t)}>
                    {t.name}
                  </button>
                  <span className="meta">{familyOf(t.family).short}</span>
                </th>
                {caps.map((c) => (
                  <td key={c} className={has(t, c) ? "on" : "off"} title={`${t.name}: ${featureLabels[c]} ${has(t, c) ? "documented" : "not established"}`}>
                    <i />
                  </td>
                ))}
                <td className="num">{t.features.length}</td>
                <td>
                  <PickBtn id={t.id} acts={acts} size={32} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="micro">A filled dot is documented by the official source. An empty dot means not established, not necessarily unavailable. Σ counts documented capabilities.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Constellation map                                                */
/* ------------------------------------------------------------------ */

export function MapLens({ lens, setLens, acts }: { lens: Lens; setLens: (l: Lens) => void; acts: Acts }) {
  const fam = lens.family ?? "all";
  const [hover, setHover] = useState<string | null>(null);
  const W = 900,
    H = 640,
    cx = W / 2,
    cy = H / 2 + 10,
    R = 250;
  const poles = dimensions.map((d, i) => {
    const a = (Math.PI * 2 * i) / dimensions.length - Math.PI / 2;
    return { d, x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, a };
  });
  const pts = useMemo(() => {
    // RadViz: each tool is pulled toward the poles it documents, weighted by coverage.
    const raw = tools.map((t) => {
      const p = profile(t);
      const sum = p.reduce((x, y) => x + y, 0);
      let x = cx,
        y = cy;
      if (sum > 0) {
        x = p.reduce((acc, v, i) => acc + v * poles[i].x, 0) / sum;
        y = p.reduce((acc, v, i) => acc + v * poles[i].y, 0) / sum;
      }
      // pull outward a little so specialists sit nearer their pole
      const dx = x - cx,
        dy = y - cy;
      return { t, x: cx + dx * 1.05, y: cy + dy * 1.05, spec: Math.hypot(dx, dy) / R };
    });
    // collision avoidance
    for (let it = 0; it < 120; it++) {
      for (let i = 0; i < raw.length; i++)
        for (let j = i + 1; j < raw.length; j++) {
          const a = raw[i],
            b = raw[j];
          let dx = b.x - a.x,
            dy = b.y - a.y;
          let d = Math.hypot(dx, dy);
          const min = 34;
          if (d < min) {
            if (d < 0.01) {
              dx = Math.cos(i * 1.7);
              dy = Math.sin(i * 1.7);
              d = 1;
            }
            const push = ((min - d) / d) * 0.5;
            a.x -= dx * push;
            a.y -= dy * push;
            b.x += dx * push;
            b.y += dy * push;
          }
        }
    }
    return raw;
  }, []);
  const vis = pts.filter((p) => fam === "all" || p.t.family === fam);
  const hovered = hover ? toolOf(hover) : null;
  return (
    <div className="lens-body">
      <FamilyChips value={fam} onChange={(f) => setLens({ ...lens, family: f })} />
      <div className="sky-wrap">
        <svg className="sky" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Constellation: tools placed near the dimensions they document">
          <circle className="sky-grid" cx={cx} cy={cy} r={R} />
          <circle className="sky-grid" cx={cx} cy={cy} r={R * 0.5} />
          {poles.map((p) => (
            <g key={p.d.id} className="pole">
              <line className="sky-grid" x1={cx} y1={cy} x2={p.x} y2={p.y} />
              <circle cx={p.x} cy={p.y} r={5} />
              <text x={cx + Math.cos(p.a) * (R + 46)} y={cy + Math.sin(p.a) * (R + 46)} textAnchor={Math.abs(Math.cos(p.a)) < 0.2 ? "middle" : Math.cos(p.a) > 0 ? "start" : "end"} dominantBaseline="middle">
                {p.d.short}
              </text>
            </g>
          ))}
          {pts.map((p, i) => {
            const dim = !(fam === "all" || p.t.family === fam);
            const on = acts.picked.includes(p.t.id);
            return (
              <g key={p.t.id} className={`star ${dim ? "is-dim" : ""} ${hover === p.t.id ? "is-hover" : ""} ${on ? "is-on" : ""} ${fam !== "all" || p.t.features.length >= 6 ? "has-name" : ""}`} style={{ ["--d" as string]: `${(i % 16) * 30}ms` }} transform={`translate(${p.x} ${p.y})`} onMouseEnter={() => setHover(p.t.id)} onMouseLeave={() => setHover(null)} onClick={() => !dim && acts.open(p.t)} tabIndex={dim ? -1 : 0} role="button" aria-label={`${p.t.name}, open field notes`} onKeyDown={(e) => e.key === "Enter" && acts.open(p.t)}>
                <circle className="star-halo" r={18} />
                <circle className="star-dot" r={on ? 9 : 6 + p.t.features.length * 0.35} />
                <text className="star-name" y={-14 - p.t.features.length * 0.35} textAnchor="middle">
                  {p.t.name}
                </text>
              </g>
            );
          })}
        </svg>
        <aside className={`sky-card ${hovered ? "is-on" : ""}`} aria-live="polite">
          {hovered ? (
            <>
              <span className="eyebrow">{familyOf(hovered.family).name}</span>
              <h4>{hovered.name}</h4>
              <p>{hovered.description}</p>
              <Radar series={[{ name: hovered.name, values: profile(hovered) }]} size={220} labels={false} />
              <span className="meta">{hovered.features.length} documented capabilities · {hovered.access}</span>
            </>
          ) : (
            <>
              <span className="eyebrow">Read the sky</span>
              <h4>{vis.length} stars</h4>
              <p>Each tool is pulled toward the six poles it documents. Specialists sit near one pole; generalists drift to the middle. Bigger stars document more. Hover a star; click to open its notes.</p>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Rivers (families → dimensions)                                   */
/* ------------------------------------------------------------------ */

export function RiversLens({ onFamily }: { onFamily: (f: Family) => void }) {
  const [hover, setHover] = useState<string | null>(null);
  const W = 900,
    H = 620,
    L = 230,
    R = W - 230,
    gap = 10;
  const data = useMemo(() => {
    const w = families.map((f) => dimensions.map((d, di) => tools.filter((t) => t.family === f.id).reduce((a, t) => a + profile(t)[di], 0)));
    const famTot = w.map((r) => r.reduce((a, b) => a + b, 0));
    const dimTot = dimensions.map((_, di) => w.reduce((a, r) => a + r[di], 0));
    const total = famTot.reduce((a, b) => a + b, 0);
    const scale = (H - gap * (families.length - 1)) / total;
    const scaleR = (H - gap * (dimensions.length - 1)) / total;
    let y = 0;
    const left = famTot.map((v) => {
      const o = { y0: y, y1: y + v * scale };
      y = o.y1 + gap;
      return o;
    });
    y = 0;
    const right = dimTot.map((v) => {
      const o = { y0: y, y1: y + v * scaleR };
      y = o.y1 + gap;
      return o;
    });
    const lOff = left.map((o) => o.y0),
      rOff = right.map((o) => o.y0);
    const ribbons: { f: number; d: number; ly0: number; ly1: number; ry0: number; ry1: number }[] = [];
    w.forEach((row, fi) =>
      row.forEach((v, di) => {
        if (v <= 0) return;
        const ly0 = lOff[fi],
          ly1 = ly0 + v * scale,
          ry0 = rOff[di],
          ry1 = ry0 + v * scaleR;
        lOff[fi] = ly1;
        rOff[di] = ry1;
        ribbons.push({ f: fi, d: di, ly0, ly1, ry0, ry1 });
      }),
    );
    return { left, right, ribbons };
  }, []);
  const path = (r: (typeof data.ribbons)[number]) => {
    const c = (L + R) / 2;
    return `M${L},${r.ly0} C${c},${r.ly0} ${c},${r.ry0} ${R},${r.ry0} L${R},${r.ry1} C${c},${r.ry1} ${c},${r.ly1} ${L},${r.ly1} Z`;
  };
  return (
    <div className="lens-body">
      <div className="rivers-wrap">
        <svg className="rivers" viewBox={`-10 -10 ${W + 20} ${H + 20}`} role="img" aria-label="Flow of documented coverage from families to dimensions">
          {data.ribbons.map((r, i) => {
            const fid = families[r.f].id,
              did = dimensions[r.d].id;
            const lit = !hover || hover === fid || hover === did;
            return <path key={i} className={`ribbon ${lit ? "" : "is-dim"}`} d={path(r)} style={{ ["--d" as string]: `${i * 12}ms` }} onMouseEnter={() => setHover(fid)} onMouseLeave={() => setHover(null)} />;
          })}
          {families.map((f, i) => {
            const o = data.left[i];
            return (
              <g key={f.id} className={`node ${hover && hover !== f.id ? "is-dim" : ""}`} onMouseEnter={() => setHover(f.id)} onMouseLeave={() => setHover(null)} onClick={() => onFamily(f.id)} role="button" tabIndex={0} aria-label={`Browse ${f.name}`} onKeyDown={(e) => e.key === "Enter" && onFamily(f.id)}>
                <rect x={L - 14} y={o.y0} width={14} height={Math.max(2, o.y1 - o.y0)} rx={3} />
                <text x={L - 24} y={(o.y0 + o.y1) / 2} textAnchor="end" dominantBaseline="middle">
                  {f.name}
                </text>
              </g>
            );
          })}
          {dimensions.map((d, i) => {
            const o = data.right[i];
            return (
              <g key={d.id} className={`node ${hover && hover !== d.id ? "is-dim" : ""}`} onMouseEnter={() => setHover(d.id)} onMouseLeave={() => setHover(null)}>
                <rect x={R} y={o.y0} width={14} height={Math.max(2, o.y1 - o.y0)} rx={3} />
                <text x={R + 24} y={(o.y0 + o.y1) / 2} dominantBaseline="middle">
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="micro">Each ribbon's width is the sum of documented coverage from one family into one dimension. Hover to isolate; click a family to browse it. Directory shape, not market share.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Alternatives sidebar                                             */
/* ------------------------------------------------------------------ */

export function AlternativesLens({ lens, setLens, acts }: { lens: Lens; setLens: (l: Lens) => void; acts: Acts }) {
  const anchor = toolOf(lens.anchor ?? anchors[0])!;
  const neighbours = useMemo(
    () =>
      tools
        .filter((t) => t.id !== anchor.id && t.family === anchor.family)
        .map((t) => ({ t, shared: t.features.filter((f) => has(anchor, f)).length, extra: t.features.filter((f) => !has(anchor, f)), missing: anchor.features.filter((f) => !has(t, f)) }))
        .sort((a, b) => b.shared - b.missing.length - (a.shared - a.missing.length)),
    [anchor],
  );
  return (
    <div className="lens-body">
      <div className="tabs">
        {anchors.map((id) => {
          const t = toolOf(id)!;
          return (
            <button key={id} className={`chip ${anchor.id === id ? "is-on" : ""}`} onClick={() => setLens({ ...lens, anchor: id })}>
              {t.name}
            </button>
          );
        })}
      </div>
      <div className="alt-grid">
        <aside className="alt-anchor" key={anchor.id}>
          <span className="eyebrow">Reference · {familyOf(anchor.family).name}</span>
          <h3>{anchor.name}</h3>
          <p>{anchor.description}</p>
          <Radar series={[{ name: anchor.name, values: profile(anchor) }]} size={260} />
          <ul className="caps-inline">
            {anchor.features.map((f) => (
              <li key={f}>{featureLabels[f]}</li>
            ))}
          </ul>
          <div className="alt-actions">
            <button type="button" className="btn btn-sm" onClick={() => acts.compare([anchor.id, ...neighbours.slice(0, 3).map((n) => n.t.id)])}>
              Compare with top 3 <ArrowRight size={16} />
            </button>
            <button type="button" className="text-link" onClick={() => acts.open(anchor)}>
              Field notes <ArrowRight size={16} />
            </button>
          </div>
        </aside>
        <ol className="alt-list" key={`l-${anchor.id}`}>
          {neighbours.map((n, i) => (
            <li key={n.t.id} className="alt-row" style={{ ["--d" as string]: `${i * 50}ms` }}>
              <div className="alt-head">
                <span className="index">{String(i + 1).padStart(2, "0")}</span>
                <button type="button" className="row-name lg" onClick={() => acts.open(n.t)}>
                  {n.t.name}
                </button>
                <span className="meta">{n.t.access}</span>
                <PickBtn id={n.t.id} acts={acts} size={36} />
              </div>
              <div className="alt-diff">
                <div>
                  <span className="diff-label">Shares</span>
                  <strong>{n.shared}</strong>
                </div>
                <div>
                  <span className="diff-label">Also documents</span>
                  {n.extra.length ? n.extra.map((f) => <em key={f} className="tag plus">{featureLabels[f]}</em>) : <span className="meta">nothing extra</span>}
                </div>
                <div>
                  <span className="diff-label">Not established</span>
                  {n.missing.length ? n.missing.map((f) => <em key={f} className="tag minus">{featureLabels[f]}</em>) : <span className="meta">matches fully</span>}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Checklist                                                        */
/* ------------------------------------------------------------------ */

export function ChecklistLens({ lens, setLens, acts }: { lens: Lens; setLens: (l: Lens) => void; acts: Acts }) {
  const caps = lens.caps ?? [];
  const fam = lens.family ?? "all";
  const flip = (c: string) => setLens({ ...lens, caps: caps.includes(c) ? caps.filter((x) => x !== c) : [...caps, c] });
  const list = tools.filter((t) => (fam === "all" || t.family === fam) && caps.every((c) => has(t, c))).sort((a, b) => b.features.length - a.features.length);
  const byFam = families.map((f) => ({ f, items: list.filter((t) => t.family === f.id) })).filter((g) => g.items.length);
  return (
    <div className="lens-body">
      <FamilyChips value={fam} onChange={(f) => setLens({ ...lens, family: f })} />
      <div className="tabs tabs-caps">
        <span className="tabs-label">Must document:</span>
        {Object.keys(featureLabels).map((c) => (
          <button key={c} className={`chip ${caps.includes(c) ? "is-on" : ""}`} aria-pressed={caps.includes(c)} onClick={() => flip(c)}>
            {caps.includes(c) && <Check size={14} />} {featureLabels[c]}
          </button>
        ))}
        {caps.length > 0 && (
          <button className="chip chip-clear" onClick={() => setLens({ ...lens, caps: [] })}>
            <X size={14} /> Clear
          </button>
        )}
      </div>
      <div className="check-count" aria-live="polite">
        <strong>{list.length}</strong> {list.length === 1 ? "tool documents" : "tools document"} {caps.length ? `all ${caps.length} selected ${caps.length === 1 ? "capability" : "capabilities"}` : "at least one capability. Tick what you need, or read this as a coverage ranking."}{fam !== "all" ? ` within ${familyOf(fam).name}.` : "."}
      </div>
      {list.length === 0 ? (
        <div className="empty">
          <h3>No single ingredient does all that.</h3>
          <p>Loosen one requirement, or build a stack of two tools instead.</p>
          <button type="button" className="btn btn-ghost" onClick={() => setLens({ kind: "stack" })}>
            Open the stack builder
          </button>
        </div>
      ) : (
        <div className="check-groups" key={caps.join()}>
          {byFam.map((g, gi) => (
            <section key={g.f.id} className="check-group" style={{ ["--d" as string]: `${gi * 60}ms` }}>
              <h4>
                {g.f.name} <small>{g.items.length}</small>
              </h4>
              <ul>
                {g.items.map((t) => (
                  <li key={t.id} className={acts.picked.includes(t.id) ? "is-selected" : ""}>
                    <button type="button" className="row-name" onClick={() => acts.open(t)}>
                      {t.name}
                    </button>
                    <span className="meta">{t.features.length} documented</span>
                    <PickBtn id={t.id} acts={acts} size={32} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Stack builder                                                    */
/* ------------------------------------------------------------------ */

const layers: { id: string; title: string; hint: string; fams: Family[] }[] = [
  { id: "do", title: "Do the work", hint: "An agent, coding tool or automation that executes.", fams: ["agents", "coding", "automation"] },
  { id: "make", title: "Make the experience", hint: "Images, video, audio: a studio or a media API.", fams: ["creative", "media"] },
  { id: "connect", title: "Connect the models", hint: "A gateway or a first-party API.", fams: ["gateways", "models"] },
  { id: "run", title: "Run the engines", hint: "Inference, GPUs or a cloud platform.", fams: ["inference", "gpu", "cloud"] },
];

export function StackLens({ acts }: { acts: Acts }) {
  const [stack, setStack] = useState<Record<string, string | null>>({ do: null, make: null, connect: null, run: null });
  const chosen = layers.map((l) => stack[l.id]).filter(Boolean).map((id) => toolOf(id!)!);
  const union = dimensions.map((_, i) => (chosen.length ? Math.max(...chosen.map((t) => profile(t)[i])) : 0));
  const unionFeatures = new Set(chosen.flatMap((t) => t.features));
  return (
    <div className="lens-body stack-grid">
      <div className="stack-layers">
        {layers.map((l, li) => (
          <section key={l.id} className="layer" style={{ ["--d" as string]: `${li * 70}ms` }}>
            <header>
              <span className="index">0{li + 1}</span>
              <div>
                <h4>{l.title}</h4>
                <p className="meta">{l.hint}</p>
              </div>
            </header>
            <div className="tabs">
              {tools
                .filter((t) => l.fams.includes(t.family))
                .map((t) => (
                  <button key={t.id} className={`chip ${stack[l.id] === t.id ? "is-on" : ""}`} aria-pressed={stack[l.id] === t.id} onClick={() => setStack((s) => ({ ...s, [l.id]: s[l.id] === t.id ? null : t.id }))}>
                    {t.name}
                  </button>
                ))}
            </div>
          </section>
        ))}
      </div>
      <aside className="stack-side">
        <span className="eyebrow">Your stack</span>
        <h3>{chosen.length ? `${chosen.length} ${chosen.length === 1 ? "ingredient" : "ingredients"}.` : "Empty cauldron."}</h3>
        <Radar series={[{ name: "stack", values: union }]} size={280} animate={false} />
        <ul className="stack-list">
          {layers.map((l) => {
            const t = stack[l.id] ? toolOf(stack[l.id]!) : null;
            return (
              <li key={l.id} className={t ? "is-on" : ""}>
                <span className="meta">{l.title}</span>
                <strong>{t ? t.name : "—"}</strong>
                {t && (
                  <button type="button" className="legend-x" aria-label={`Remove ${t.name}`} onClick={() => setStack((s) => ({ ...s, [l.id]: null }))}>
                    <X size={14} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        <div className="stack-cov">
          <span className="meta">Documented together</span>
          <strong>
            {unionFeatures.size} / {Object.keys(featureLabels).length}
          </strong>
          <span className="stone-track">
            <span className="stone-fill is-static" style={{ ["--w" as string]: `${(unionFeatures.size / Object.keys(featureLabels).length) * 100}%` }} />
          </span>
        </div>
        <button type="button" className="btn" disabled={chosen.length < 2} onClick={() => acts.compare(chosen.map((t) => t.id))}>
          Compare this stack <ArrowRight size={18} />
        </button>
        <p className="micro">The radar shows the best documented coverage per dimension across your chosen tools. A stack is a team, not a single product.</p>
      </aside>
    </div>
  );
}
