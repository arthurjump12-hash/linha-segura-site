"use client";

import { useState } from "react";
import { List, Map as MapIcon } from "lucide-react";
import { demoCameras, shortName } from "@/lib/intelligence/equipment.ts";
import { formatDuration } from "@/lib/intelligence/analytics.ts";
import type { EquipmentZone, PresenceSession } from "@/lib/intelligence/types.ts";
import type { ZoneState } from "@/lib/intelligence/simulator.ts";
import { useSimulation } from "./SimulationProvider";
import { StatusChip, statusMeta, statusOrder } from "./status";

/** Hash simples para posicionar a pessoa de forma estável dentro da região */
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function personPosition(zone: EquipmentZone, session: PresenceSession, now: number, confirm: number) {
  const { x, y, w, h } = zone.plan;
  const cx = x + w / 2 + ((hash(session.trackId) % 5) - 2) * (w / 14);
  const cy = y + h / 2;
  const dur = session.end - session.start;
  const elapsed = now - session.start;
  // passagem: atravessa a região
  if (dur < confirm) {
    const p = Math.min(1, Math.max(0, elapsed / Math.max(1, dur)));
    return { x: x - 2 + (w + 4) * p, y: y + h + 2.2 };
  }
  // entrando: vem do corredor até o equipamento
  const p = Math.min(1, elapsed / confirm);
  const ease = 1 - (1 - p) ** 3;
  return { x: cx, y: cy + (1 - ease) * (h / 2 + 4) };
}

/** Planta da academia: equipamentos clicáveis, estados ao vivo e câmeras. */
export function GymFloor() {
  const { equipment, zoneStates, now, rules, openEquipment, selectedId } = useSimulation();
  const [view, setView] = useState<"planta" | "lista">("lista");

  return (
    <div>
      {/* Alternância planta/lista (lista é a visualização simplificada para celular e leitores de tela) */}
      <div role="tablist" aria-label="Modo de visualização" className="mb-4 inline-flex rounded-full border border-steel/20 p-1 md:hidden">
        {(
          [
            ["planta", "Planta", MapIcon],
            ["lista", "Lista", List],
          ] as const
        ).map(([v, label, Icon]) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={view === v}
            onClick={() => setView(v)}
            className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors ${
              view === v ? "bg-snow text-void" : "text-steel"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div className={view === "lista" ? "hidden md:block" : ""}>
        <div className="relative overflow-hidden rounded-[1.25rem] border border-steel/15 bg-[#081120] shadow-[0_40px_120px_-60px_rgb(0_212_255/.5)]">
          <svg viewBox="0 0 100 64" className="block h-auto w-full" role="group" aria-label="Planta da academia de demonstração. Selecione um equipamento para ver detalhes.">
            <defs>
              <pattern id="floor-grid" width="4" height="4" patternUnits="userSpaceOnUse">
                <path d="M4 0H0V4" fill="none" stroke="rgb(148 163 184 / .07)" strokeWidth=".15" />
              </pattern>
              <pattern id="hatch" width="1.6" height="1.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="1.6" stroke="#E879A6" strokeWidth=".35" strokeOpacity=".7" />
              </pattern>
              <radialGradient id="fov" cx="0" cy="0" r="1">
                <stop offset="0" stopColor="#00D4FF" stopOpacity=".16" />
                <stop offset="1" stopColor="#00D4FF" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="100" height="64" fill="url(#floor-grid)" />
            {/* paredes, divisória e entrada */}
            <rect x="1" y="1" width="98" height="62" fill="none" stroke="rgb(148 163 184 / .35)" strokeWidth=".4" rx="1" />
            <line x1="40" y1="44" x2="40" y2="63" stroke="rgb(148 163 184 / .35)" strokeWidth=".4" />
            <text x="20" y="55" textAnchor="middle" fontSize="2" fill="rgb(148 163 184 / .55)">
              Recepção e vestiários
            </text>
            <path d="M8 63 v-1.2 h10 v1.2" fill="none" stroke="#00D4FF" strokeWidth=".35" strokeOpacity=".6" />
            <text x="13" y="60.6" textAnchor="middle" fontSize="1.6" fill="rgb(0 212 255 / .7)">
              Entrada
            </text>

            {/* campos de visão das câmeras */}
            {demoCameras.map((c) => (
              <g key={c.id} transform={`translate(${c.plan.x} ${c.plan.y}) rotate(${c.plan.angle})`} aria-hidden="true">
                <path d="M0 0 L55 -22 A60 60 0 0 1 55 22 Z" fill="url(#fov)" />
                <rect x="-1.4" y="-1" width="2.8" height="2" rx=".4" fill="#0B1628" stroke="#00D4FF" strokeWidth=".3" />
              </g>
            ))}

            {/* equipamentos */}
            {equipment.map((e) => (
              <Zone
                key={e.id}
                zone={e}
                state={zoneStates[e.id]}
                now={now}
                selected={selectedId === e.id}
                onOpen={(el) => openEquipment(e.id, el)}
              />
            ))}

            {/* pessoas detectadas */}
            {equipment.map((e) => {
              const st = zoneStates[e.id];
              if (!st.session || st.status === "encerrado") return null;
              const pos = personPosition(e, st.session, now, rules.confirmSeconds);
              return (
                <g key={`p-${e.id}`} aria-hidden="true" style={{ transition: "transform .1s linear" }} transform={`translate(${pos.x} ${pos.y})`}>
                  <circle r="1.9" fill={statusMeta[st.status].color} opacity=".18" />
                  <circle r="1" fill="#E2E8F0" stroke="#070B12" strokeWidth=".3" />
                </g>
              );
            })}
          </svg>
          <p className="pointer-events-none absolute bottom-2 right-3 font-mono text-[0.62rem] text-steel/80">Academia fictícia · simulação</p>
        </div>

        {/* legenda dos estados */}
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2" aria-label="Legenda dos estados">
          {statusOrder.map((s) => {
            const m = statusMeta[s];
            return (
              <li key={s} className="flex items-center gap-1.5 text-xs text-steel">
                <m.Icon className="h-3.5 w-3.5" style={{ color: m.color }} aria-hidden="true" />
                {m.label}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Lista: visualização simplificada do celular. No desktop, a planta é navegável por teclado. */}
      <ul className={`${view === "lista" ? "grid" : "hidden"} gap-2 md:hidden`} aria-label="Equipamentos e estado atual">
        {equipment.map((e) => {
          const st = zoneStates[e.id];
          return (
            <li key={e.id}>
              <button
                type="button"
                onClick={(ev) => openEquipment(e.id, ev.currentTarget)}
                className="flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border border-steel/15 bg-panel/50 px-4 py-3 text-left"
              >
                <span className="font-medium text-snow">{e.name}</span>
                <span className="flex items-center gap-2">
                  {(st.status === "ocupado" || st.status === "inconclusivo") && (
                    <span className="font-mono text-xs tabular-nums text-steel">{formatDuration(st.elapsed)}</span>
                  )}
                  <StatusChip status={st.status} compact />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Zone({
  zone,
  state,
  now,
  selected,
  onOpen,
}: {
  zone: EquipmentZone;
  state: ZoneState;
  now: number;
  selected: boolean;
  onOpen: (el: SVGGElement) => void;
}) {
  const { x, y, w, h } = zone.plan;
  const m = statusMeta[state.status];
  const active = state.status !== "livre";
  const timer = state.status === "ocupado" || state.status === "inconclusivo";
  void now;

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${zone.name}: ${m.label}${timer ? `, ${formatDuration(state.elapsed)}` : ""}. Abrir detalhes.`}
      aria-pressed={selected}
      onClick={(e) => onOpen(e.currentTarget)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(e.currentTarget);
        }
      }}
      className="group cursor-pointer outline-none"
    >
      {/* alvo de clique maior que o desenho */}
      <rect x={x - 1} y={y - 1} width={w + 2} height={h + 5} fill="transparent" />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="1.2"
        fill={state.status === "inconclusivo" ? "url(#hatch)" : m.color}
        fillOpacity={state.status === "inconclusivo" ? 1 : active ? 0.14 : 0.04}
        stroke={m.color}
        strokeOpacity={active ? 0.95 : 0.45}
        strokeWidth={selected ? 0.6 : 0.3}
        strokeDasharray={state.status === "presenca" ? "1 .7" : undefined}
        className="transition-[fill-opacity,stroke-opacity] duration-300 group-hover:stroke-[0.55] group-focus-visible:stroke-[0.8]"
      />
      {/* desenho simples do equipamento */}
      <rect x={x + w * 0.18} y={y + h * 0.42} width={w * 0.64} height={h * 0.24} rx=".6" fill="rgb(148 163 184 / .22)" />
      <text x={x + 1.2} y={y + 2.9} fontSize={Math.min(2.1, (w * 1.75) / shortName(zone.name).length)} fontWeight="600" fill="#F8FAFC">
        {shortName(zone.name)}
      </text>
      <text x={x + 1.2} y={y + h - 1.3} fontSize="1.65" fill={m.color}>
        {m.short}
        {timer ? ` · ${formatDuration(state.elapsed)}` : ""}
      </text>
      {/* foco visível */}
      <rect x={x - 0.8} y={y - 0.8} width={w + 1.6} height={h + 1.6} rx="1.8" fill="none" stroke="#00D4FF" strokeWidth=".5" className="opacity-0 group-focus-visible:opacity-100" />
    </g>
  );
}
