import { categoryOrder } from "./equipment.ts";
import { DAY } from "./simulator.ts";
import type {
  BandKey,
  EquipmentCategory,
  EquipmentStats,
  EquipmentZone,
  OccupancyEvent,
  PeriodKey,
  RankMetric,
  TimeRange,
} from "./types.ts";

/* ---------------- Períodos ---------------- */

export const bandHours: Record<BandKey, [number, number] | null> = {
  todo: null,
  manha: [6, 12],
  tarde: [12, 18],
  noite: [18, 22],
};

/**
 * Converte período + faixa horária em intervalos de tempo, sempre limitados ao horário
 * de funcionamento e ao instante atual (`now`). Nunca inclui o futuro.
 */
export function buildRanges(period: PeriodKey, band: BandKey, now: number, openHour: number, closeHour: number): TimeRange[] {
  const today = Math.floor(now / DAY);
  const days = period === "hoje" ? [today] : period === "ontem" ? [today - 1] : Array.from({ length: 7 }, (_, i) => today - 6 + i);
  const [bFrom, bTo] = bandHours[band] ?? [openHour, closeHour];
  const from = Math.max(bFrom, openHour);
  const to = Math.min(bTo, closeHour);
  const ranges: TimeRange[] = [];
  for (const d of days) {
    if (d < 0) continue;
    const r = { from: d * DAY + from * 3600, to: Math.min(d * DAY + to * 3600, now) };
    if (r.to > r.from) ranges.push(r);
  }
  return ranges;
}

/** Mesmos intervalos deslocados para trás (período anterior comparável). */
export function previousRanges(ranges: TimeRange[], period: PeriodKey): TimeRange[] {
  const shift = period === "7dias" ? 7 * DAY : DAY;
  return ranges.map((r) => ({ from: r.from - shift, to: r.to - shift })).filter((r) => r.from >= 0);
}

export function totalSeconds(ranges: TimeRange[]) {
  return ranges.reduce((acc, r) => acc + (r.to - r.from), 0);
}

/** Evento pertence ao período pelo início; a duração é cortada no fim do intervalo. */
export function eventsInRanges(events: OccupancyEvent[], ranges: TimeRange[]): OccupancyEvent[] {
  const out: OccupancyEvent[] = [];
  for (const e of events) {
    const r = ranges.find((x) => e.start >= x.from && e.start < x.to);
    if (!r) continue;
    const end = Math.min(e.end, r.to);
    out.push(end === e.end ? e : { ...e, end, duration: end - e.start });
  }
  return out;
}

/* ---------------- Agregações ---------------- */

/** Indicadores por equipamento. Eventos, tempo e taxa são métricas diferentes e não equivalentes. */
export function aggregateByEquipment(events: OccupancyEvent[], equipment: EquipmentZone[], ranges: TimeRange[]): EquipmentStats[] {
  const period = totalSeconds(ranges);
  const map = new Map<string, EquipmentStats>(
    equipment.map((e) => [e.id, { equipmentId: e.id, eventos: 0, passagens: 0, inconclusivos: 0, tempoTotal: 0, duracaoMedia: 0, taxa: 0 }]),
  );
  for (const ev of eventsInRanges(events, ranges)) {
    const s = map.get(ev.equipmentId);
    if (!s) continue;
    if (ev.kind === "ocupacao") {
      s.eventos++;
      s.tempoTotal += ev.duration;
    } else if (ev.kind === "passagem") s.passagens++;
    else s.inconclusivos++;
  }
  for (const s of map.values()) {
    s.duracaoMedia = s.eventos ? s.tempoTotal / s.eventos : 0;
    s.taxa = period ? Math.min(1, s.tempoTotal / period) : 0;
  }
  return [...map.values()];
}

export function rankEquipment(stats: EquipmentStats[], metric: RankMetric, names: Record<string, string> = {}) {
  return [...stats].sort((a, b) => b[metric] - a[metric] || (names[a.equipmentId] ?? a.equipmentId).localeCompare(names[b.equipmentId] ?? b.equipmentId));
}

export interface Summary {
  monitorados: number;
  eventos: number;
  passagens: number;
  inconclusivos: number;
  tempoTotal: number;
  tempoMedio: number;
  maisUtilizado: EquipmentStats | null;
  menosUtilizado: EquipmentStats | null;
}

export function summarize(stats: EquipmentStats[]): Summary {
  const eventos = stats.reduce((a, s) => a + s.eventos, 0);
  const tempoTotal = stats.reduce((a, s) => a + s.tempoTotal, 0);
  const byTime = rankEquipment(stats, "tempoTotal");
  return {
    monitorados: stats.length,
    eventos,
    passagens: stats.reduce((a, s) => a + s.passagens, 0),
    inconclusivos: stats.reduce((a, s) => a + s.inconclusivos, 0),
    tempoTotal,
    tempoMedio: eventos ? tempoTotal / eventos : 0,
    maisUtilizado: eventos ? byTime[0] : null,
    menosUtilizado: eventos ? byTime[byTime.length - 1] : null,
  };
}

/** Ocupação por hora: fração do tempo em que os equipamentos selecionados estiveram ocupados. */
export function occupancyByHour(events: OccupancyEvent[], ranges: TimeRange[], equipmentIds: string[], openHour: number, closeHour: number) {
  const hours = Array.from({ length: closeHour - openHour }, (_, i) => openHour + i);
  const occupied = new Map<number, number>(hours.map((h) => [h, 0]));
  const covered = new Map<number, number>(hours.map((h) => [h, 0]));
  const ids = new Set(equipmentIds);

  for (const r of ranges) {
    for (const h of hours) {
      const day = Math.floor(r.from / DAY);
      const hs = day * DAY + h * 3600;
      const ov = Math.max(0, Math.min(r.to, hs + 3600) - Math.max(r.from, hs));
      covered.set(h, covered.get(h)! + ov);
    }
  }
  for (const ev of eventsInRanges(events, ranges)) {
    if (ev.kind !== "ocupacao" || !ids.has(ev.equipmentId)) continue;
    // distribui a duração pelas horas que o evento atravessa
    let t = ev.start;
    while (t < ev.end) {
      const h = Math.floor((t % DAY) / 3600);
      const hourEnd = Math.floor(t / 3600) * 3600 + 3600;
      const seg = Math.min(ev.end, hourEnd) - t;
      if (occupied.has(h)) occupied.set(h, occupied.get(h)! + seg);
      t += seg;
    }
  }
  return hours.map((h) => {
    const cov = covered.get(h)! * ids.size;
    return { hour: h, occupied: occupied.get(h)!, rate: cov ? Math.min(1, occupied.get(h)! / cov) : null };
  });
}

/** Matriz equipamento × hora para o mapa de calor. */
export function heatmap(events: OccupancyEvent[], ranges: TimeRange[], equipment: EquipmentZone[], openHour: number, closeHour: number) {
  return equipment.map((e) => ({ equipmentId: e.id, hours: occupancyByHour(events, ranges, [e.id], openHour, closeHour) }));
}

export function byCategory(stats: EquipmentStats[], equipment: EquipmentZone[]) {
  const totals = new Map<EquipmentCategory, number>(categoryOrder.map((c) => [c, 0]));
  for (const s of stats) {
    const cat = equipment.find((e) => e.id === s.equipmentId)?.category;
    if (cat) totals.set(cat, totals.get(cat)! + s.tempoTotal);
  }
  const sum = [...totals.values()].reduce((a, b) => a + b, 0);
  return categoryOrder.map((c) => ({ category: c, seconds: totals.get(c)!, share: sum ? totals.get(c)! / sum : 0 }));
}

/* ---------------- Formatação ---------------- */

export function formatDuration(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ${String(s % 60).padStart(2, "0")} s`;
  const h = Math.floor(m / 60);
  return `${h} h ${String(m % 60).padStart(2, "0")} min`;
}

export function formatClock(t: number) {
  const s = ((t % DAY) + DAY) % DAY;
  const p = (n: number) => String(Math.floor(n)).padStart(2, "0");
  return `${p(s / 3600)}:${p((s % 3600) / 60)}:${p(s % 60)}`;
}

export function formatPercent(v: number, digits = 0) {
  return `${(v * 100).toFixed(digits).replace(".", ",")}%`;
}

export function dayLabel(t: number, now: number) {
  const diff = Math.floor(now / DAY) - Math.floor(t / DAY);
  return diff === 0 ? "Hoje" : diff === 1 ? "Ontem" : `Há ${diff} dias`;
}

/* ---------------- Exportação ---------------- */

const kindLabel = { ocupacao: "Ocupação estimada", passagem: "Passagem", inconclusivo: "Inconclusivo" } as const;

/**
 * CSV dos eventos exibidos (separador ";" e BOM para abrir corretamente no Excel em pt-BR).
 * Recebe exatamente a lista filtrada que está na tela.
 */
export function eventsToCSV(events: OccupancyEvent[], equipment: EquipmentZone[], now: number) {
  const names = Object.fromEntries(equipment.map((e) => [e.id, e.name]));
  const esc = (v: string | number) => {
    const s = String(v);
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = ["fonte", "dia_simulado", "equipamento", "inicio", "fim", "duracao_s", "classificacao", "confianca", "em_andamento"];
  const rows = events.map((e) => [
    "Simulação demonstrativa",
    dayLabel(e.start, now),
    names[e.equipmentId] ?? e.equipmentId,
    formatClock(e.start),
    formatClock(e.end),
    Math.round(e.duration),
    kindLabel[e.kind],
    e.confidence.toFixed(2).replace(".", ","),
    e.inProgress ? "sim" : "não",
  ]);
  return "﻿" + [header, ...rows].map((r) => r.map(esc).join(";")).join("\r\n");
}
