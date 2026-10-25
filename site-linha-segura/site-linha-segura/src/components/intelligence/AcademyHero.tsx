"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, MessageCircle } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { ButtonLink } from "@/components/ui";
import { demoEquipment } from "@/lib/intelligence/equipment.ts";
import { formatClock } from "@/lib/intelligence/analytics.ts";
import { zoneStateAt } from "@/lib/intelligence/simulator.ts";
import type { DetectionRules, PresenceSession } from "@/lib/intelligence/types.ts";
import { CameraFeed } from "./CameraFeed";
import { statusMeta } from "./status";

const LOOP = 30;
const BASE = 18 * 3600 + 42 * 60;
const heroRules: DetectionRules = { confirmSeconds: 3, minConfidence: 0.6, endedDisplaySeconds: 3.5 };
const zones = demoEquipment.filter((e) => e.cameraId === "cam-03");

/** Roteiro da demonstração do topo (sintético, repete a cada 30 s) */
const script: Omit<PresenceSession, "id">[] = [
  { trackId: "T-7C21", equipmentId: "leg-press", start: 1, end: 24, confidence: 0.91 },
  { trackId: "T-A40E", equipmentId: "hack", start: 6, end: 8.5, confidence: 0.83 },
  { trackId: "T-19B3", equipmentId: "extensora", start: 11, end: 28, confidence: 0.49 },
  { trackId: "T-5D6F", equipmentId: "flexora", start: 15, end: 27, confidence: 0.88 },
];

function scriptEvents() {
  const name = (id: string) => zones.find((z) => z.id === id)!.name;
  const out: { t: number; text: string; status: keyof typeof statusMeta }[] = [];
  for (const s of script) {
    out.push({ t: s.start, text: `${name(s.equipmentId)}: presença detectada`, status: "presenca" });
    const dur = s.end - s.start;
    if (dur < heroRules.confirmSeconds) out.push({ t: s.end, text: `${name(s.equipmentId)}: passagem, não contada como uso`, status: "livre" });
    else if (s.confidence < heroRules.minConfidence) out.push({ t: s.start + heroRules.confirmSeconds, text: `${name(s.equipmentId)}: detecção inconclusiva`, status: "inconclusivo" });
    else {
      out.push({ t: s.start + heroRules.confirmSeconds, text: `${name(s.equipmentId)}: ocupação estimada iniciada`, status: "ocupado" });
      out.push({ t: s.end, text: `${name(s.equipmentId)}: evento encerrado (${Math.round(dur)} s)`, status: "encerrado" });
    }
  }
  return out.sort((a, b) => a.t - b.t);
}
const timeline = scriptEvents();

export function AcademyHero() {
  const reduce = useReducedMotion();
  const [elapsed, setElapsed] = useState(18);

  useEffect(() => {
    if (reduce) return;
    const t0 = performance.now() - 18000;
    const id = window.setInterval(() => {
      if (!document.hidden) setElapsed((performance.now() - t0) / 1000);
    }, 50);
    return () => window.clearInterval(id);
  }, [reduce]);

  const loopStart = Math.floor(elapsed / LOOP) * LOOP;
  const local = elapsed - loopStart;
  const now = BASE + elapsed;

  const feed = useMemo(() => {
    const sessions: PresenceSession[] = script.map((s, i) => ({ ...s, id: `h${i}`, start: BASE + loopStart + s.start, end: BASE + loopStart + s.end }));
    return zones.map((zone) => ({ zone, state: zoneStateAt(sessions, zone.id, now, heroRules) }));
  }, [loopStart, now]);

  const log = timeline.filter((e) => e.t <= local).slice(-4).reverse();
  const ocupados = feed.filter((f) => f.state.status === "ocupado").length;

  const enter = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] as const } };

  return (
    <section aria-labelledby="ia-academias-titulo" className="relative isolate overflow-hidden pt-[calc(var(--header-h)+env(safe-area-inset-top,0px))]">
      <AnimatedBackground />
      <div className="container-site relative grid items-center gap-12 pb-16 pt-10 md:pt-16 lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)] lg:gap-12 lg:pb-24">
        <div>
          <motion.p {...enter(0)} className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-cyan/25 bg-cyan/[.06] px-3.5 py-1.5 text-xs text-cyan">
            Linha Segura Intelligence · Academias
          </motion.p>
          <motion.h1
            id="ia-academias-titulo"
            {...enter(0.06)}
            className="text-[clamp(2.5rem,6.4vw,5rem)] font-bold uppercase leading-[1.02] tracking-[-0.035em]"
          >
            Suas câmeras podem revelar <span className="text-gradient">muito mais.</span>
          </motion.h1>
          <motion.p {...enter(0.16)} className="mt-6 max-w-[34rem] text-lg text-steel md:text-xl">
            Transformamos imagens de videomonitoramento em inteligência operacional para academias, empresas e ambientes inteligentes.
          </motion.p>
          <motion.div {...enter(0.26)} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="#academia-digital">
              Explorar a inteligência artificial
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="#avaliacao" variant="secondary">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Solicitar uma demonstração
            </ButtonLink>
          </motion.div>
          <motion.dl {...enter(0.34)} className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-steel/15 pt-6">
            <div>
              <dt className="text-xs text-steel">Na câmera agora</dt>
              <dd className="mt-1 font-display text-2xl font-semibold tabular-nums">{feed.filter((f) => f.state.session && f.state.status !== "encerrado").length} pessoas</dd>
            </div>
            <div>
              <dt className="text-xs text-steel">Ocupação estimada</dt>
              <dd className="mt-1 font-display text-2xl font-semibold tabular-nums">{ocupados} de 4</dd>
            </div>
            <div>
              <dt className="text-xs text-steel">Relógio</dt>
              <dd className="mt-1 font-mono text-xl tabular-nums">{formatClock(now).slice(0, 5)}</dd>
            </div>
          </motion.dl>
        </div>

        <motion.div {...enter(0.2)} className="min-w-0">
          <figure className="m-0 overflow-hidden rounded-[1.25rem] border border-steel/15 bg-navy p-2 shadow-[0_40px_140px_-50px_rgb(0_212_255/.55)]">
            <div className="overflow-hidden rounded-xl">
              <CameraFeed
                cameraLabel="CAM 03 · Membros inferiores"
                zones={feed}
                now={now}
                confirmSeconds={heroRules.confirmSeconds}
                ariaLabel="Simulação de câmera em uma academia: quatro regiões de equipamentos, pessoas detectadas com caixas de detecção, contadores de ocupação e estados como presença, ocupação estimada, passagem e detecção inconclusiva."
              />
            </div>
            <figcaption className="grid gap-1.5 px-2 pb-1 pt-3" aria-live="off">
              <p className="text-xs font-medium text-steel">Eventos detectados</p>
              <ol className="grid gap-1">
                {log.map((e) => {
                  const m = statusMeta[e.status];
                  return (
                    <li key={`${loopStart}-${e.t}-${e.text}`} className="flex items-center gap-2 text-xs">
                      <span className="font-mono tabular-nums text-steel-dim">{formatClock(BASE + loopStart + e.t)}</span>
                      <m.Icon className="h-3.5 w-3.5 shrink-0" style={{ color: m.color }} aria-hidden="true" />
                      <span className="truncate text-snow">{e.text}</span>
                    </li>
                  );
                })}
                {log.length === 0 && <li className="text-xs text-steel">Aguardando detecções…</li>}
              </ol>
            </figcaption>
          </figure>
        </motion.div>
      </div>
      <div className="signal-line" aria-hidden="true" />
    </section>
  );
}

