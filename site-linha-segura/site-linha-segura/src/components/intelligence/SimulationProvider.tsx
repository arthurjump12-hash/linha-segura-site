"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { demoEquipment } from "@/lib/intelligence/equipment.ts";
import { aggregateByEquipment, buildRanges, eventsInRanges, previousRanges } from "@/lib/intelligence/analytics.ts";
import { DAY, defaultRules, generateSessions, indexByEquipment, sessionsToEvents, zoneStateAt, type ZoneState } from "@/lib/intelligence/simulator.ts";
import type { BandKey, DetectionRules, EquipmentStats, EquipmentZone, OccupancyEvent, PeriodKey, PresenceSession, TimeRange } from "@/lib/intelligence/types.ts";

export const SIM = {
  seed: 20261026,
  days: 15,
  openHour: 6,
  closeHour: 22,
  /** A simulação começa hoje às 17:45, com o histórico anterior já processado */
  startAt: 14 * DAY + 17.75 * 3600,
};

export const speeds = [
  { value: 1, label: "1×", hint: "tempo real" },
  { value: 10, label: "10×", hint: "1 min a cada 6 s" },
  { value: 60, label: "60×", hint: "1 min por segundo" },
  { value: 300, label: "300×", hint: "5 min por segundo" },
] as const;

interface SimContextValue {
  equipment: EquipmentZone[];
  sessions: PresenceSession[];
  rules: DetectionRules;
  setConfirmSeconds: (s: number) => void;
  now: number;
  playing: boolean;
  setPlaying: (v: boolean) => void;
  speed: number;
  setSpeed: (v: number) => void;
  reset: () => void;
  finished: boolean;
  /** Eventos até o instante atual */
  events: OccupancyEvent[];
  zoneStates: Record<string, ZoneState>;
  // filtros compartilhados por dashboard, ranking e mapa de calor
  period: PeriodKey;
  setPeriod: (p: PeriodKey) => void;
  band: BandKey;
  setBand: (b: BandKey) => void;
  filterIds: string[];
  setFilterIds: (ids: string[]) => void;
  ranges: TimeRange[];
  prevRanges: TimeRange[];
  stats: EquipmentStats[];
  prevStats: EquipmentStats[];
  filteredEvents: OccupancyEvent[];
  // painel de equipamento
  selectedId: string | null;
  openEquipment: (id: string, opener?: HTMLElement | SVGElement | null) => void;
  closeEquipment: () => void;
}

const SimContext = createContext<SimContextValue | null>(null);

export function useSimulation() {
  const ctx = useContext(SimContext);
  if (!ctx) throw new Error("useSimulation precisa estar dentro de <SimulationProvider>");
  return ctx;
}

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const equipment = demoEquipment;
  const sessions = useMemo(
    () => generateSessions({ equipment, days: SIM.days, openHour: SIM.openHour, closeHour: SIM.closeHour, seed: SIM.seed }),
    [equipment],
  );
  const byEquipment = useMemo(() => indexByEquipment(sessions), [sessions]);

  const [confirmSeconds, setConfirmSeconds] = useState(defaultRules.confirmSeconds);
  const rules = useMemo(() => ({ ...defaultRules, confirmSeconds }), [confirmSeconds]);
  const [now, setNow] = useState(SIM.startAt);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(10);
  const [period, setPeriod] = useState<PeriodKey>("hoje");
  const [band, setBand] = useState<BandKey>("todo");
  const [filterIds, setFilterIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const openerRef = useRef<HTMLElement | SVGElement | null>(null);
  const started = useRef(false);

  const closeAt = Math.floor(SIM.startAt / DAY) * DAY + SIM.closeHour * 3600;
  const finished = now >= closeAt;

  // Inicia sozinha quando a seção entra na tela (exceto com movimento reduzido)
  useEffect(() => {
    if (reduce || started.current) return;
    const el = document.getElementById("academia-digital");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        setPlaying(true);
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  // Relógio da simulação: 10 atualizações por segundo, pausa quando a aba não está visível
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const t = performance.now();
      const dt = Math.min(0.5, (t - last) / 1000);
      last = t;
      if (document.hidden) return;
      setNow((n) => Math.min(closeAt, n + dt * speed));
    }, 100);
    return () => window.clearInterval(id);
  }, [playing, speed, closeAt]);

  useEffect(() => {
    if (finished) setPlaying(false);
  }, [finished]);

  const reset = useCallback(() => {
    setNow(SIM.startAt);
    setPlaying(!reduce);
  }, [reduce]);

  const events = useMemo(() => sessionsToEvents(sessions, rules, now), [sessions, rules, now]);

  const zoneStates = useMemo(() => {
    const out: Record<string, ZoneState> = {};
    for (const e of equipment) out[e.id] = zoneStateAt(byEquipment.get(e.id) ?? [], e.id, now, rules);
    return out;
  }, [equipment, byEquipment, now, rules]);

  const ranges = useMemo(() => buildRanges(period, band, now, SIM.openHour, SIM.closeHour), [period, band, now]);
  const prevRanges = useMemo(() => previousRanges(ranges, period), [ranges, period]);
  const visibleEquipment = useMemo(
    () => (filterIds.length ? equipment.filter((e) => filterIds.includes(e.id)) : equipment),
    [equipment, filterIds],
  );
  const stats = useMemo(() => aggregateByEquipment(events, visibleEquipment, ranges), [events, visibleEquipment, ranges]);
  const prevStats = useMemo(() => aggregateByEquipment(events, visibleEquipment, prevRanges), [events, visibleEquipment, prevRanges]);
  const filteredEvents = useMemo(() => {
    const ids = new Set(visibleEquipment.map((e) => e.id));
    return eventsInRanges(events, ranges).filter((e) => ids.has(e.equipmentId));
  }, [events, ranges, visibleEquipment]);

  const openEquipment = useCallback((id: string, opener?: HTMLElement | SVGElement | null) => {
    openerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    setSelectedId(id);
  }, []);
  const closeEquipment = useCallback(() => {
    setSelectedId(null);
    requestAnimationFrame(() => openerRef.current?.focus());
  }, []);

  const value: SimContextValue = {
    equipment,
    sessions,
    rules,
    setConfirmSeconds,
    now,
    playing,
    setPlaying,
    speed,
    setSpeed,
    reset,
    finished,
    events,
    zoneStates,
    period,
    setPeriod,
    band,
    setBand,
    filterIds,
    setFilterIds,
    ranges,
    prevRanges,
    stats,
    prevStats,
    filteredEvents,
    selectedId,
    openEquipment,
    closeEquipment,
  };

  return <SimContext.Provider value={value}>{children}</SimContext.Provider>;
}
