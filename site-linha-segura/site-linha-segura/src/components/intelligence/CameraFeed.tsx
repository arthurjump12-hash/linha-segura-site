"use client";

import { useEffect, useRef } from "react";
import { formatClock } from "@/lib/intelligence/analytics.ts";
import { shortName } from "@/lib/intelligence/equipment.ts";
import type { ZoneState } from "@/lib/intelligence/simulator.ts";
import type { EquipmentZone } from "@/lib/intelligence/types.ts";
import { statusMeta } from "./status";

export type FeedZone = { zone: EquipmentZone; state: ZoneState };

const mmss = (s: number) => {
  const v = Math.max(0, Math.floor(s));
  return `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;
};

/**
 * Visão de câmera SINTÉTICA desenhada em canvas: regiões dos equipamentos,
 * pessoas representadas por silhuetas, caixas de detecção e contadores.
 * Não usa imagens reais.
 */
export function CameraFeed({
  cameraLabel,
  zones,
  now,
  confirmSeconds,
  ariaLabel,
}: {
  cameraLabel: string;
  zones: FeedZone[];
  now: number;
  confirmSeconds: number;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const size = useRef({ w: 0, h: 0 });
  const props = useRef({ zones, now, confirmSeconds, cameraLabel });
  props.current = { zones, now, confirmSeconds, cameraLabel };

  const draw = () => {
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx || !size.current.w) return;
    const { w, h } = size.current;
    const { zones: zs, now: t, confirmSeconds: conf, cameraLabel: label } = props.current;

    // cena
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#0A1426");
    bg.addColorStop(1, "#0F2140");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    const hy = h * 0.28;
    ctx.fillStyle = "rgba(148,163,184,.05)";
    ctx.fillRect(0, 0, w, hy);
    ctx.strokeStyle = "rgba(148,163,184,.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = -8; i <= 8; i++) {
      ctx.moveTo(w / 2 + i * w * 0.04, hy);
      ctx.lineTo(w / 2 + i * w * 0.2, h);
    }
    for (let j = 1; j < 8; j++) {
      const y = hy + (h - hy) * Math.pow(j / 8, 1.7);
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.moveTo(0, hy);
    ctx.lineTo(w, hy);
    ctx.stroke();
    // janelas
    ctx.fillStyle = "rgba(148,163,184,.06)";
    for (let i = 0; i < 4; i++) ctx.fillRect(w * (0.06 + i * 0.24), h * 0.05, w * 0.16, h * 0.14);

    const font = Math.max(10, Math.min(13, w / 55));

    for (const { zone, state } of zs) {
      const m = statusMeta[state.status];
      const x = zone.view.x * w;
      const y = zone.view.y * h;
      const zw = zone.view.w * w;
      const zh = zone.view.h * h;
      const inset = zw * 0.1;
      // região em perspectiva
      ctx.beginPath();
      ctx.moveTo(x + inset, y);
      ctx.lineTo(x + zw - inset, y);
      ctx.lineTo(x + zw, y + zh);
      ctx.lineTo(x, y + zh);
      ctx.closePath();
      ctx.fillStyle = hexA(m.color, state.status === "livre" ? 0.05 : 0.14);
      ctx.fill();
      ctx.setLineDash(state.status === "presenca" || state.status === "livre" ? [6, 5] : []);
      ctx.strokeStyle = hexA(m.color, state.status === "livre" ? 0.5 : 0.95);
      ctx.lineWidth = state.status === "livre" ? 1 : 2;
      ctx.stroke();
      ctx.setLineDash([]);
      // aparelho
      ctx.fillStyle = "rgba(148,163,184,.22)";
      ctx.fillRect(x + zw * 0.25, y + zh * 0.45, zw * 0.5, zh * 0.25);
      // rótulo da região: nome acima, estado e contador dentro
      ctx.font = `600 ${font}px ui-sans-serif, system-ui, sans-serif`;
      const nm = shortName(zone.name);
      const tw = ctx.measureText(nm).width + 14;
      ctx.fillStyle = "rgba(7,11,18,.82)";
      ctx.fillRect(x, y - font - 10, tw, font + 8);
      ctx.fillStyle = m.color;
      ctx.fillRect(x, y - font - 10, 3, font + 8);
      ctx.fillStyle = "#F8FAFC";
      ctx.fillText(nm, x + 8, y - 7);
      const timer = state.status === "ocupado" || state.status === "inconclusivo" ? ` ${mmss(state.elapsed)}` : "";
      const st = `${m.short}${timer}`;
      ctx.font = `500 ${font - 1}px ui-monospace, monospace`;
      const sw = ctx.measureText(st).width + 10;
      ctx.fillStyle = "rgba(7,11,18,.75)";
      ctx.fillRect(x + 4, y + zh - font - 8, sw, font + 4);
      ctx.fillStyle = m.color;
      ctx.fillText(st, x + 9, y + zh - 8);

      // pessoa + caixa de detecção
      const s = state.session;
      if (s && state.status !== "encerrado") {
        const dur = s.end - s.start;
        const el = t - s.start;
        let px = x + zw / 2;
        let py = y + zh * 0.62;
        if (dur < conf) {
          const p = Math.min(1, Math.max(0, el / Math.max(1, dur)));
          px = x - zw * 0.15 + zw * 1.3 * p;
          py = y + zh * 0.95;
        } else {
          const p = Math.min(1, el / conf);
          py += (1 - (1 - (1 - p) ** 3)) * zh * 0.45;
        }
        const ph = zh * 0.75;
        const pw = ph * 0.42;
        ctx.fillStyle = "rgba(226,232,240,.8)";
        ctx.beginPath();
        ctx.arc(px, py - ph * 0.82, pw * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(px - pw * 0.42, py - ph * 0.64, pw * 0.84, ph * 0.64, pw * 0.3);
        ctx.fill();
        // bounding box
        const bx = px - pw * 0.6;
        const by = py - ph * 1.02;
        ctx.strokeStyle = m.color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx, by, pw * 1.2, ph * 1.06);
        const tag = `${s.trackId} ${s.confidence.toFixed(2).replace(".", ",")}`;
        ctx.font = `500 ${font - 1}px ui-monospace, monospace`;
        const tgw = ctx.measureText(tag).width + 8;
        ctx.fillStyle = m.color;
        ctx.fillRect(bx, by - font - 2, tgw, font + 2);
        ctx.fillStyle = "#070B12";
        ctx.fillText(tag, bx + 4, by - 5);
      }
    }

    // HUD
    ctx.font = `500 ${font}px ui-monospace, monospace`;
    ctx.fillStyle = "rgba(7,11,18,.7)";
    ctx.fillRect(10, 10, ctx.measureText(label).width + 40, font + 12);
    ctx.fillStyle = "#F87171";
    ctx.beginPath();
    ctx.arc(22, 16 + font / 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#F8FAFC";
    ctx.fillText(label, 32, 14 + font);
    const clock = formatClock(t);
    const cw = ctx.measureText(clock).width;
    ctx.fillStyle = "rgba(7,11,18,.7)";
    ctx.fillRect(w - cw - 26, 10, cw + 16, font + 12);
    ctx.fillStyle = "#CBD5E1";
    ctx.fillText(clock, w - cw - 18, 14 + font);
    ctx.fillStyle = "rgba(251,191,36,.9)";
    ctx.font = `500 ${font - 1}px ui-sans-serif, system-ui, sans-serif`;
    ctx.fillText("Simulação ilustrativa · sem imagens reais", 12, h - 12);

    const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, w * 0.75);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,.45)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  };

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ro = new ResizeObserver(() => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size.current = { w: r.width, h: r.height };
      c.width = r.width * dpr;
      c.height = r.height * dpr;
      c.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    });
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    draw();
  });

  return <canvas ref={ref} className="block aspect-video h-auto w-full" role="img" aria-label={ariaLabel} />;
}

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
