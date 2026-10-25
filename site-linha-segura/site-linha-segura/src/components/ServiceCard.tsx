"use client";

import Link from "next/link";
import { ArrowUpRight, BrainCircuit, Cctv, Cpu, Fingerprint, Network, PencilRuler, Siren } from "lucide-react";
import type { Solution, SolutionIcon } from "@/content/solutions";

export const solutionIcons: Record<SolutionIcon, typeof Cctv> = {
  cctv: Cctv,
  siren: Siren,
  fingerprint: Fingerprint,
  network: Network,
  cpu: Cpu,
  brain: BrainCircuit,
  pencil: PencilRuler,
};

/** Card com luz que acompanha o cursor e linha que se acende no hover. */
export function ServiceCard({ solution, featured = false }: { solution: Solution; featured?: boolean }) {
  const Icon = solutionIcons[solution.icon];

  function onMove(e: React.PointerEvent<HTMLAnchorElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <Link
      href={solution.href}
      onPointerMove={onMove}
      className={`group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-steel/12 bg-panel/60 p-7 transition-[border-color,transform,background-color] duration-500 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-1 hover:border-cyan/35 hover:bg-panel ${
        featured ? "md:p-9" : ""
      }`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(420px circle at var(--mx,50%) var(--my,0%), rgb(0 212 255 / .09), transparent 60%)" }}
      />
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-electric to-cyan transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100"
      />

      <span className="relative grid h-12 w-12 place-items-center rounded-xl border border-steel/15 bg-void/60 text-cyan transition-colors duration-500 group-hover:border-cyan/40">
        <Icon className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
      </span>
      <h3 className={`relative mt-6 font-semibold ${featured ? "text-2xl md:text-3xl" : "text-xl"}`}>{solution.title}</h3>
      <p className="relative mt-3 text-[0.98rem] text-steel">{solution.short}</p>
      <span className="relative mt-auto flex items-center gap-1.5 pt-7 text-sm font-medium text-snow/80 transition-colors group-hover:text-cyan">
        Ver detalhes
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  );
}
