"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { siteConfig } from "@/config/site";

/**
 * Área do vídeo demonstrativo.
 * Com `siteConfig.demoVideo.src` preenchido, exibe o vídeo real.
 * Sem vídeo, exibe uma SIMULAÇÃO ILUSTRATIVA em canvas, identificada como tal.
 */
export function VideoShowcase() {
  const { src, poster } = siteConfig.demoVideo;

  return (
    <figure className="m-0 overflow-hidden rounded-[1.25rem] border border-steel/15 bg-navy p-2.5 shadow-[0_40px_120px_-50px_rgb(0_212_255/.45)]">
      <div className="flex items-center justify-between px-2 pb-2.5 pt-1 font-mono text-[0.68rem] text-steel">
        <span className="flex items-center gap-2 text-cyan">
          <span className="h-2 w-2 rounded-full bg-cyan animate-blink" aria-hidden="true" />
          ANÁLISE
        </span>
        <span>Protótipo · visão computacional</span>
      </div>
      <div className="relative aspect-video overflow-hidden rounded-xl bg-[#08111f]">
        {src ? (
          <video
            className="h-full w-full object-cover"
            src={src}
            poster={poster || undefined}
            controls
            playsInline
            preload="none"
            aria-label="Vídeo demonstrativo do protótipo de visão computacional"
          />
        ) : (
          <Simulation />
        )}
      </div>
      <figcaption className="px-2 pb-1 pt-3 text-xs text-steel">
        {src
          ? "Demonstração do protótipo. Imagens utilizadas com autorização."
          : "Simulação ilustrativa do funcionamento. Não representa imagens reais nem resultados medidos."}
      </figcaption>
    </figure>
  );
}

type Region = { x: number; y: number; w: number; h: number; name: string };
const REGIONS: Region[] = [
  { x: 0.06, y: 0.52, w: 0.2, h: 0.3, name: "A1" },
  { x: 0.31, y: 0.56, w: 0.17, h: 0.28, name: "A2" },
  { x: 0.53, y: 0.6, w: 0.16, h: 0.26, name: "A3" },
  { x: 0.73, y: 0.5, w: 0.2, h: 0.24, name: "A4" },
  { x: 0.58, y: 0.2, w: 0.18, h: 0.2, name: "A5" },
];
const LOOP = 20;

function Simulation() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(true);
  const playingRef = useRef(true);
  playingRef.current = playing && !reduce;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0;
    let h = 0;
    let raf = 0;
    let elapsed = 6;
    let last = performance.now();
    let visible = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const person = (x: number, y: number, s: number) => {
      ctx.fillStyle = "rgba(203,213,225,.75)";
      ctx.beginPath();
      ctx.arc(x, y - s * 1.55, s * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(x - s * 0.38, y - s * 1.22, s * 0.76, s * 1.22, s * 0.25);
      ctx.fill();
    };

    const draw = () => {
      if (!w) return;
      const t = elapsed % LOOP;
      ctx.fillStyle = "#08111f";
      ctx.fillRect(0, 0, w, h);
      // piso
      ctx.strokeStyle = "rgba(148,163,184,.13)";
      ctx.lineWidth = 1;
      const hy = h * 0.32;
      ctx.beginPath();
      for (let i = -6; i <= 6; i++) {
        ctx.moveTo(w / 2, hy);
        ctx.lineTo(w / 2 + i * w * 0.22, h);
      }
      for (let j = 1; j < 7; j++) {
        const y = hy + (h - hy) * Math.pow(j / 7, 1.8);
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.moveTo(0, hy);
      ctx.lineTo(w, hy);
      ctx.stroke();

      // equipamentos
      ctx.fillStyle = "rgba(148,163,184,.2)";
      REGIONS.forEach((r) => ctx.fillRect(w * (r.x + r.w * 0.2), h * (r.y + r.h * 0.35), w * r.w * 0.6, h * r.h * 0.4));

      const aIn = t >= 1 && t <= 18;
      const occ = Math.max(0, Math.min(t, 18) - 1);
      const bp = (t - 6) / 5;
      const bIn = bp > 0.35 && bp < 0.65;

      REGIONS.forEach((r, i) => {
        const active = (i === 0 && aIn) || (i === 1 && bIn);
        const col = i === 0 && aIn ? "#00D4FF" : i === 1 && bIn ? "#3B82F6" : "rgba(148,163,184,.45)";
        ctx.strokeStyle = col;
        ctx.lineWidth = active ? 2 : 1;
        ctx.setLineDash(active ? [] : [5, 4]);
        ctx.strokeRect(w * r.x, h * r.y, w * r.w, h * r.h);
        ctx.setLineDash([]);
        ctx.fillStyle = col;
        ctx.font = "500 11px ui-monospace, monospace";
        ctx.fillText(r.name, w * r.x + 4, h * r.y - 6);
      });

      if (aIn) person(w * 0.16, h * 0.8 + (reduce ? 0 : Math.sin(t * 3) * 1.5), h * 0.2);
      if (t >= 6 && t <= 11) person(w * (0.18 + 0.42 * bp), h * 0.94, h * 0.2);

      // painel de eventos
      ctx.fillStyle = "rgba(7,11,18,.78)";
      ctx.fillRect(10, 10, Math.min(w * 0.5, 210), 58);
      ctx.font = "500 11px ui-monospace, monospace";
      ctx.fillStyle = "#00D4FF";
      ctx.fillText(`A1 · uso: ${occ.toFixed(1)} s`, 18, 28);
      ctx.fillStyle = "#3B82F6";
      ctx.fillText(`A2 · passagem: ${t >= 8.5 ? 1 : 0}`, 18, 44);
      ctx.fillStyle = "rgba(203,213,225,.85)";
      ctx.fillText("SIMULAÇÃO", 18, 60);

      // vinheta
      const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.75);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,.5)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    };

    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (playingRef.current && visible) {
        elapsed += dt;
        draw();
      }
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [reduce]);

  return (
    <>
      <canvas
        ref={ref}
        className="h-full w-full"
        role="img"
        aria-label="Simulação: regiões de equipamentos marcadas na imagem; uma pessoa usa um aparelho e outra apenas passa por outro."
      />
      {!reduce && (
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full border border-steel/25 bg-void/70 text-snow backdrop-blur hover:border-cyan/60"
          aria-label={playing ? "Pausar simulação" : "Reproduzir simulação"}
        >
          {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
        </button>
      )}
    </>
  );
}
