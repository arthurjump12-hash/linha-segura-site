"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Bell, DoorOpen, ScanEye, Wifi } from "lucide-react";

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Painel de videomonitoramento com detecção por IA (ilustrativo). */
export function HeroVisual() {
  const reduce = useReducedMotion();
  const now = useClock();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-9, 3]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [5, -3]);
  const chipX = useTransform(sx, [-0.5, 0.5], [-10, 10]);
  const chipY = useTransform(sy, [-0.5, 0.5], [-8, 8]);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }

  const time = now ? `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}` : "--:--:--";

  return (
    <div
      className="relative mx-auto w-full max-w-[38rem] [perspective:1400px]"
      onPointerMove={onMove}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <motion.figure
        style={reduce ? undefined : { rotateY, rotateX }}
        className="relative m-0 rounded-[1.25rem] border border-steel/15 bg-navy/80 p-2.5 shadow-[0_40px_120px_-40px_rgb(37_99_235/.55)] [transform-style:preserve-3d]"
      >
        {/* barra do monitor */}
        <div className="flex items-center justify-between px-2 pb-2.5 pt-1 font-mono text-[0.68rem] text-steel">
          <span className="flex items-center gap-2 text-danger">
            <span className="h-2 w-2 rounded-full bg-danger animate-blink" aria-hidden="true" />
            REC
          </span>
          <span className="hidden sm:inline">CAM 03 · ÁREA DE TREINO</span>
          <span className="tabular-nums">{time}</span>
        </div>

        {/* viewport da câmera */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#08111f]">
          <svg viewBox="0 0 640 400" className="absolute inset-0 h-full w-full" role="img" aria-label="Ilustração de câmera com pessoas detectadas por inteligência artificial e uma área monitorada">
            <defs>
              <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#0B1628" />
                <stop offset="1" stopColor="#0f2140" />
              </linearGradient>
              <radialGradient id="vign" cx=".5" cy=".5" r=".75">
                <stop offset=".55" stopColor="#000" stopOpacity="0" />
                <stop offset="1" stopColor="#000" stopOpacity=".65" />
              </radialGradient>
            </defs>
            <rect width="640" height="400" fill="url(#floor)" />
            {/* parede e piso em perspectiva */}
            <g stroke="rgb(148 163 184 / .14)" strokeWidth="1">
              <line x1="0" y1="150" x2="640" y2="150" />
              {Array.from({ length: 13 }).map((_, i) => (
                <line key={`v${i}`} x1="320" y1="150" x2={-460 + i * 130} y2="400" />
              ))}
              {[175, 205, 245, 300, 370].map((y) => (
                <line key={`h${y}`} x1="0" y1={y} x2="640" y2={y} />
              ))}
            </g>
            {/* janelas */}
            <g fill="rgb(148 163 184 / .07)">
              <rect x="60" y="40" width="120" height="80" rx="3" />
              <rect x="260" y="40" width="120" height="80" rx="3" />
              <rect x="460" y="40" width="120" height="80" rx="3" />
            </g>
            {/* equipamentos */}
            <g fill="rgb(148 163 184 / .2)">
              <rect x="70" y="250" width="120" height="34" rx="4" />
              <rect x="420" y="235" width="140" height="30" rx="4" />
              <rect x="270" y="190" width="90" height="22" rx="3" />
            </g>
            {/* região monitorada */}
            <polygon
              points="390,222 590,222 620,300 370,300"
              fill="rgb(0 212 255 / .08)"
              stroke="#00D4FF"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <text x="392" y="215" fill="#00D4FF" fontSize="11" fontFamily="ui-monospace,monospace">
              ÁREA 02 · OCUPADA
            </text>
            {/* pessoas */}
            <g fill="rgb(203 213 225 / .75)">
              <circle cx="140" cy="205" r="13" />
              <rect x="122" y="220" width="36" height="62" rx="12" />
              <circle cx="488" cy="190" r="12" />
              <rect x="471" y="204" width="34" height="58" rx="11" />
              <circle cx="300" cy="166" r="8" />
              <rect x="289" y="175" width="22" height="38" rx="8" />
            </g>
            {/* caixas de detecção */}
            <g fill="none" stroke="#00D4FF" strokeWidth="1.5">
              <rect x="112" y="186" width="56" height="104" rx="2" />
              <rect x="462" y="172" width="52" height="98" rx="2" />
              <rect x="282" y="152" width="36" height="66" rx="2" stroke="#3B82F6" />
            </g>
            <g fontSize="10" fontFamily="ui-monospace,monospace">
              <rect x="112" y="172" width="70" height="14" fill="#00D4FF" />
              <text x="116" y="182" fill="#070B12">pessoa</text>
              <rect x="462" y="158" width="70" height="14" fill="#00D4FF" />
              <text x="466" y="168" fill="#070B12">pessoa</text>
              <rect x="282" y="138" width="56" height="14" fill="#3B82F6" />
              <text x="286" y="148" fill="#F8FAFC">pessoa</text>
            </g>
            <rect width="640" height="400" fill="url(#vign)" />
          </svg>
          {/* feixe de varredura */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 animate-scan bg-gradient-to-b from-transparent via-cyan/10 to-cyan/25 [mask-image:linear-gradient(to_bottom,transparent,#000)]" aria-hidden="true">
            <div className="absolute inset-x-0 bottom-0 h-px bg-cyan/70 shadow-[0_0_14px_rgb(0_212_255/.9)]" />
          </div>
          {/* cantos do HUD */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-3">
            <span className="absolute left-0 top-0 h-4 w-4 border-l border-t border-snow/50" />
            <span className="absolute right-0 top-0 h-4 w-4 border-r border-t border-snow/50" />
            <span className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-snow/50" />
            <span className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-snow/50" />
          </div>
        </div>

        <figcaption className="flex flex-wrap items-center gap-x-5 gap-y-1 px-2 pb-1 pt-3 font-mono text-[0.68rem] text-steel">
          <span className="flex items-center gap-1.5">
            <ScanEye className="h-3.5 w-3.5 text-cyan" aria-hidden="true" />3 pessoas detectadas
          </span>
          <span>1 área ocupada</span>
          <span className="text-steel-dim">Ilustração</span>
        </figcaption>
      </motion.figure>

      {/* eventos flutuantes */}
      <motion.ul
        style={reduce ? undefined : { x: chipX, y: chipY }}
        aria-hidden="true"
        className="pointer-events-none absolute -left-4 top-[18%] hidden flex-col gap-2 md:flex lg:-left-16"
      >
        <EventChip icon={<DoorOpen className="h-3.5 w-3.5" />} label="Acesso liberado · Recepção" delay={0.9} />
        <EventChip icon={<Bell className="h-3.5 w-3.5" />} label="Alarme armado · Depósito" delay={1.15} />
      </motion.ul>
      <motion.ul
        style={reduce ? undefined : { x: chipX, y: chipY }}
        aria-hidden="true"
        className="pointer-events-none absolute -right-3 bottom-[14%] hidden md:flex lg:-right-10"
      >
        <EventChip icon={<Wifi className="h-3.5 w-3.5" />} label="Rede segmentada · Câmeras" delay={1.4} />
      </motion.ul>
    </div>
  );
}

function EventChip({ icon, label, delay }: { icon: React.ReactNode; label: string; delay: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="glass flex items-center gap-2 rounded-full border border-steel/15 px-3.5 py-2 text-xs text-snow shadow-lg"
    >
      <span className="text-cyan">{icon}</span>
      {label}
    </motion.li>
  );
}
