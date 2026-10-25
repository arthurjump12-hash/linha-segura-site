"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { formatClock } from "@/lib/intelligence/analytics.ts";
import { speeds, useSimulation } from "./SimulationProvider";
import { SimBadge } from "./status";

/** Dock de controles da simulação (iniciar, pausar, reiniciar, velocidade, tempo mínimo). */
export function SimControls({ compact = false }: { compact?: boolean }) {
  const { now, playing, setPlaying, speed, setSpeed, reset, finished, rules, setConfirmSeconds } = useSimulation();

  return (
    <div
      role="group"
      aria-label="Controles da simulação"
      className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-steel/15 bg-navy/80 p-3 backdrop-blur"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => (finished ? reset() : setPlaying(!playing))}
          aria-label={finished ? "Reiniciar simulação" : playing ? "Pausar simulação" : "Iniciar simulação"}
          className="grid h-11 w-11 place-items-center rounded-full bg-snow text-void transition-shadow hover:shadow-[0_0_0_4px_rgb(0_212_255/.2)]"
        >
          {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4 translate-x-px" aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={reset}
          aria-label="Reiniciar simulação"
          title="Reiniciar"
          className="grid h-11 w-11 place-items-center rounded-full border border-steel/25 text-snow transition-colors hover:border-cyan/60"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="ml-1 leading-tight">
          <p className="font-mono text-lg tabular-nums text-snow" aria-live="off">
            {formatClock(now)}
          </p>
          <p className="text-[0.7rem] text-steel">{finished ? "Fim do expediente simulado" : playing ? "Em execução" : "Pausada"}</p>
        </div>
      </div>

      <fieldset className="flex items-center gap-2">
        <legend className="sr-only">Velocidade</legend>
        <span className="text-xs text-steel" aria-hidden="true">
          Velocidade
        </span>
        <div className="flex rounded-full border border-steel/20 p-0.5">
          {speeds.map((s) => (
            <label key={s.value} title={s.hint} className="relative">
              <input type="radio" name="sim-speed" className="peer sr-only" checked={speed === s.value} onChange={() => setSpeed(s.value)} />
              <span className="flex min-h-9 min-w-10 cursor-pointer items-center justify-center rounded-full px-2.5 font-mono text-xs text-steel transition-colors peer-checked:bg-cyan peer-checked:text-void peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-cyan hover:text-snow peer-checked:hover:text-void">
                {s.label}
                <span className="sr-only">, {s.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {!compact && (
        <label className="flex items-center gap-2 text-xs text-steel">
          Tempo mínimo para ocupação
          <select
            value={rules.confirmSeconds}
            onChange={(e) => setConfirmSeconds(Number(e.target.value))}
            className="min-h-9 rounded-full border border-steel/25 bg-void px-3 text-xs text-snow"
          >
            {[10, 20, 40, 60].map((v) => (
              <option key={v} value={v}>
                {v} s
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="ml-auto">
        <SimBadge />
      </div>
    </div>
  );
}
