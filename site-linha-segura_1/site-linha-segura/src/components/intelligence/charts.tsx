"use client";

import { useId, useState } from "react";
import { Table2 } from "lucide-react";
import { formatPercent } from "@/lib/intelligence/analytics.ts";

/* Paleta validada (skill dataviz, superfície #0E1B30): categórica, sequencial e série única */
export const SERIES = "#00D4FF";
export const SERIES_COMPARE = "#94A3B8";
export const CATEGORICAL = ["#3987E5", "#D95926", "#199E70", "#C98500"];
const SEQ = ["#13233D", "#104281", "#184F95", "#1C5CAB", "#256ABF", "#2A78D6", "#3987E5", "#5598E7", "#86B6EF", "#CDE2FB"];

export function seqColor(v: number | null) {
  if (v === null) return "transparent";
  const i = Math.min(SEQ.length - 1, Math.max(0, Math.round(v * (SEQ.length - 1) * 1.6)));
  return SEQ[i];
}

/** Botão "Ver tabela": alternativa acessível a todo gráfico. */
export function TableToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={shown}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-steel/20 px-3 text-xs text-steel transition-colors hover:border-steel/50 hover:text-snow aria-pressed:border-cyan/50 aria-pressed:text-cyan"
    >
      <Table2 className="h-3.5 w-3.5" aria-hidden="true" />
      {shown ? "Ver gráfico" : "Ver tabela"}
    </button>
  );
}

/* ---------- Ocupação por horário: linha, área ou barras ---------- */

type HourDatum = { hour: number; rate: number | null };

export function HourChart({
  data,
  compare,
  mode,
  label,
  compareLabel = "Período anterior",
  height = 220,
}: {
  data: HourDatum[];
  compare?: HourDatum[];
  mode: "linha" | "area" | "barras";
  label: string;
  compareLabel?: string;
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const gid = useId().replace(/:/g, "");
  const W = 640;
  const H = height;
  const pad = { l: 40, r: 12, t: 12, b: 26 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const max = Math.max(0.25, ...data.map((d) => d.rate ?? 0), ...(compare ?? []).map((d) => d.rate ?? 0));
  const yMax = Math.ceil(max * 10) / 10;
  const n = data.length;
  const x = (i: number) => pad.l + (iw * (i + 0.5)) / n;
  const y = (v: number) => pad.t + ih - (v / yMax) * ih;
  const ticks = [0, yMax / 2, yMax];

  const path = (rows: HourDatum[]) => {
    let d = "";
    let pen = false;
    rows.forEach((r, i) => {
      if (r.rate === null) {
        pen = false;
        return;
      }
      d += `${pen ? "L" : "M"}${x(i).toFixed(1)} ${y(r.rate).toFixed(1)} `;
      pen = true;
    });
    return d;
  };
  const valid = data.map((d, i) => ({ ...d, i })).filter((d) => d.rate !== null);
  const area =
    valid.length > 1
      ? `${path(data)} L${x(valid[valid.length - 1].i)} ${y(0)} L${x(valid[0].i)} ${y(0)} Z`
      : "";

  const h = hover !== null ? data[hover] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full touch-pan-y"
        role="img"
        aria-label={label}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * W;
          const i = Math.floor(((px - pad.l) / iw) * n);
          setHover(i >= 0 && i < n ? i : null);
        }}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`a${gid}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={SERIES} stopOpacity=".28" />
            <stop offset="1" stopColor={SERIES} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="rgb(148 163 184 / .12)" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#94A3B8">
              {formatPercent(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) =>
          i % 2 === 0 ? (
            <text key={d.hour} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#94A3B8">
              {d.hour}h
            </text>
          ) : null,
        )}
        {hover !== null && <rect x={x(hover) - iw / n / 2} y={pad.t} width={iw / n} height={ih} fill="rgb(148 163 184 / .07)" />}

        {mode === "barras" &&
          data.map((d, i) =>
            d.rate === null ? null : (
              <rect key={d.hour} x={x(i) - iw / n / 2 + 2} y={y(d.rate)} width={iw / n - 4} height={Math.max(0, y(0) - y(d.rate))} rx="3" fill={SERIES} fillOpacity={hover === null || hover === i ? 0.9 : 0.45} />
            ),
          )}
        {mode === "area" && area && <path d={area} fill={`url(#a${gid})`} />}
        {mode !== "barras" && <path d={path(data)} fill="none" stroke={SERIES} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
        {compare && <path d={path(compare)} fill="none" stroke={SERIES_COMPARE} strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" />}
        {h && h.rate !== null && mode !== "barras" && <circle cx={x(hover!)} cy={y(h.rate)} r="5" fill={SERIES} stroke="#0E1B30" strokeWidth="2" />}
      </svg>

      {h && (
        <div
          className="pointer-events-none absolute top-1 z-10 min-w-36 -translate-x-1/2 rounded-lg border border-steel/20 bg-void/95 px-3 py-2 text-xs shadow-xl"
          style={{ left: `${(x(hover!) / W) * 100}%` }}
          role="status"
        >
          <p className="font-medium text-snow">
            {h.hour}h às {h.hour + 1}h
          </p>
          <p className="mt-1 flex justify-between gap-4 text-steel">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 rounded-full" style={{ background: SERIES }} aria-hidden="true" />
              Ocupação
            </span>
            <span className="tabular-nums text-snow">{h.rate === null ? "sem dados" : formatPercent(h.rate, 1)}</span>
          </p>
          {compare && (
            <p className="mt-0.5 flex justify-between gap-4 text-steel">
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-3 rounded-full border-t-2 border-dashed" style={{ borderColor: SERIES_COMPARE }} aria-hidden="true" />
                {compareLabel}
              </span>
              <span className="tabular-nums text-snow">{compare[hover!]?.rate == null ? "sem dados" : formatPercent(compare[hover!].rate!, 1)}</span>
            </p>
          )}
        </div>
      )}

      {compare && (
        <p className="mt-2 flex flex-wrap gap-4 text-xs text-steel">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ background: SERIES }} aria-hidden="true" />
            Período selecionado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 border-t-2 border-dashed" style={{ borderColor: SERIES_COMPARE }} aria-hidden="true" />
            {compareLabel}
          </span>
        </p>
      )}
    </div>
  );
}

/* ---------- Barras horizontais (ranking e comparação entre equipamentos) ---------- */

export function HBars({
  rows,
  max,
  onSelect,
  selectedId,
}: {
  rows: { id: string; label: string; value: number; display: string; sub?: string }[];
  max?: number;
  onSelect?: (id: string, el: HTMLElement) => void;
  selectedId?: string | null;
}) {
  const m = max ?? Math.max(1e-9, ...rows.map((r) => r.value));
  return (
    <ol className="grid gap-2.5">
      {rows.map((r, i) => {
        const inner = (
          <>
            <span className="flex items-baseline justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-baseline gap-2">
                <span className="w-5 shrink-0 font-mono text-xs text-steel-dim">{i + 1}</span>
                <span className="truncate font-medium text-snow">{r.label}</span>
              </span>
              <span className="shrink-0 tabular-nums text-snow">
                {r.display}
                {r.sub && <span className="ml-2 text-xs text-steel">{r.sub}</span>}
              </span>
            </span>
            <span className="ml-7 mt-1.5 block h-2 rounded-full bg-steel/10">
              <span
                className="block h-2 rounded-full transition-[width] duration-700 ease-[cubic-bezier(.16,1,.3,1)]"
                style={{ width: `${Math.max(1.5, (r.value / m) * 100)}%`, background: selectedId === r.id ? "#F8FAFC" : SERIES }}
              />
            </span>
          </>
        );
        return (
          <li key={r.id}>
            {onSelect ? (
              <button
                type="button"
                onClick={(e) => onSelect(r.id, e.currentTarget)}
                className="block w-full rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-steel/[.06]"
              >
                {inner}
              </button>
            ) : (
              <div className="px-2 py-1.5">{inner}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- Donut por categoria ---------- */

export function Donut({ slices, centerLabel, centerValue }: { slices: { label: string; value: number; share: number; display: string }[]; centerLabel: string; centerValue: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const R = 70;
  const r = 48;
  const C = 90;
  let acc = 0;
  const total = slices.reduce((a, s) => a + s.share, 0);
  const arcs = slices.map((s, i) => {
    const a0 = acc * Math.PI * 2 - Math.PI / 2;
    acc += total ? s.share / total : 0;
    const a1 = acc * Math.PI * 2 - Math.PI / 2;
    const gap = s.share > 0.02 ? 0.025 : 0;
    const p = (rad: number, a: number) => `${C + rad * Math.cos(a)} ${C + rad * Math.sin(a)}`;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const A0 = a0 + gap;
    const A1 = Math.max(A0, a1 - gap);
    return {
      i,
      d: `M${p(R, A0)} A${R} ${R} 0 ${large} 1 ${p(R, A1)} L${p(r, A1)} A${r} ${r} 0 ${large} 0 ${p(r, A0)} Z`,
    };
  });
  const active = hover !== null ? slices[hover] : null;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <svg viewBox="0 0 180 180" className="h-40 w-40 shrink-0" role="img" aria-label={`Distribuição do tempo de ocupação por categoria: ${slices.map((s) => `${s.label} ${formatPercent(s.share)}`).join(", ")}`}>
        {total === 0 ? (
          <circle cx={C} cy={C} r={(R + r) / 2} fill="none" stroke="rgb(148 163 184 / .15)" strokeWidth={R - r} />
        ) : (
          arcs.map((a) => (
            <path
              key={a.i}
              d={a.d}
              fill={CATEGORICAL[a.i]}
              opacity={hover === null || hover === a.i ? 1 : 0.35}
              onPointerEnter={() => setHover(a.i)}
              onPointerLeave={() => setHover(null)}
              className="transition-opacity"
            />
          ))
        )}
        <text x={C} y={C - 4} textAnchor="middle" fontSize="20" fontWeight="600" fill="#F8FAFC">
          {active ? formatPercent(active.share) : centerValue}
        </text>
        <text x={C} y={C + 15} textAnchor="middle" fontSize="10" fill="#94A3B8">
          {active ? active.label : centerLabel}
        </text>
      </svg>
      <ul className="grid w-full gap-2 text-sm">
        {slices.map((s, i) => (
          <li
            key={s.label}
            className="flex items-center justify-between gap-3"
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
          >
            <span className="flex items-center gap-2 text-steel">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: CATEGORICAL[i] }} aria-hidden="true" />
              {s.label}
            </span>
            <span className="tabular-nums text-snow">
              {formatPercent(s.share)} <span className="text-xs text-steel">· {s.display}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Mapa de calor equipamento × hora ---------- */

export function HeatGrid({
  rows,
  hours,
  onSelect,
}: {
  rows: { id: string; label: string; cells: (number | null)[] }[];
  hours: number[];
  onSelect?: (id: string, el: HTMLElement) => void;
}) {
  const [tip, setTip] = useState<{ row: number; col: number } | null>(null);
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full min-w-[34rem] border-separate border-spacing-[2px] text-xs">
        <caption className="sr-only">Taxa de ocupação estimada por equipamento e hora (simulação)</caption>
        <thead>
          <tr>
            <th scope="col" className="sr-only">
              Equipamento
            </th>
            {hours.map((h, i) => (
              <th key={h} scope="col" className="pb-1 text-center font-normal text-steel">
                {i % 2 === 0 ? `${h}h` : <span className="sr-only">{h}h</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={r.id}>
              <th scope="row" className="whitespace-nowrap pr-3 text-left font-normal text-steel">
                {onSelect ? (
                  <button type="button" className="min-h-8 hover:text-snow" onClick={(e) => onSelect(r.id, e.currentTarget)}>
                    {r.label}
                  </button>
                ) : (
                  r.label
                )}
              </th>
              {r.cells.map((v, ci) => (
                <td
                  key={ci}
                  tabIndex={0}
                  aria-label={`${r.label}, ${hours[ci]}h: ${v === null ? "sem dados" : formatPercent(v, 1)}`}
                  onPointerEnter={() => setTip({ row: ri, col: ci })}
                  onPointerLeave={() => setTip(null)}
                  onFocus={() => setTip({ row: ri, col: ci })}
                  onBlur={() => setTip(null)}
                  className="h-7 min-w-6 rounded-[3px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan"
                  style={{ background: v === null ? "rgb(148 163 184 / .05)" : seqColor(v) }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {tip && (
        <div role="status" className="pointer-events-none absolute right-2 top-0 rounded-lg border border-steel/20 bg-void/95 px-3 py-2 text-xs shadow-xl">
          <p className="font-medium text-snow">{rows[tip.row].label}</p>
          <p className="text-steel">
            {hours[tip.col]}h às {hours[tip.col] + 1}h ·{" "}
            <span className="tabular-nums text-snow">{rows[tip.row].cells[tip.col] === null ? "sem dados" : formatPercent(rows[tip.row].cells[tip.col]!, 1)}</span>
          </p>
        </div>
      )}
      <HeatLegend />
    </div>
  );
}

export function HeatLegend() {
  return (
    <div className="mt-3 flex items-center gap-3 text-xs text-steel" aria-hidden="true">
      <span>Menor ocupação</span>
      <span className="flex h-2 w-40 overflow-hidden rounded-full">
        {SEQ.map((c) => (
          <span key={c} className="flex-1" style={{ background: c }} />
        ))}
      </span>
      <span>Maior</span>
    </div>
  );
}

/** Mini barras por hora (painel do equipamento). */
export function Sparkbars({ data, label }: { data: HourDatum[]; label: string }) {
  const max = Math.max(0.2, ...data.map((d) => d.rate ?? 0));
  return (
    <div>
      <div className="flex h-20 items-end gap-[3px]" role="img" aria-label={label}>
        {data.map((d) => (
          <span
            key={d.hour}
            title={`${d.hour}h: ${d.rate === null ? "sem dados" : formatPercent(d.rate)}`}
            className="flex-1 rounded-t-[3px]"
            style={{ height: `${d.rate === null ? 2 : Math.max(3, (d.rate / max) * 100)}%`, background: d.rate === null ? "rgb(148 163 184 / .12)" : SERIES }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[0.68rem] text-steel">
        <span>{data[0]?.hour}h</span>
        <span>{data[Math.floor(data.length / 2)]?.hour}h</span>
        <span>{(data[data.length - 1]?.hour ?? 0) + 1}h</span>
      </div>
    </div>
  );
}

/** Tabela genérica usada como alternativa aos gráficos */
export function DataTable({ caption, head, rows }: { caption: string; head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[26rem] text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-steel/15 text-xs text-steel">
            {head.map((h) => (
              <th key={h} scope="col" className="py-2 pr-4 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-steel/10">
              {r.map((c, j) => (
                <td key={j} className={`py-2 pr-4 ${j ? "tabular-nums text-steel" : "text-snow"}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
