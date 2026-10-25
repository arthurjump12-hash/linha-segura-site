"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Camera, FileBarChart2, ScanSearch, SquareDashedMousePointer, Timer } from "lucide-react";
import { pipeline } from "@/content/home";

const icons = [Camera, ScanSearch, SquareDashedMousePointer, Timer, FileBarChart2];

/** Diagrama do processamento: da imagem ao relatório. */
export function PipelineDiagram() {
  const [active, setActive] = useState<number | null>(null);
  const reduce = useReducedMotion();

  return (
    <ol className="relative grid gap-3 md:grid-cols-5 md:gap-4" aria-label="Etapas do processamento">
      {/* conector com pulso */}
      <div aria-hidden="true" className="absolute left-[10%] right-[10%] top-[2.75rem] hidden h-px bg-steel/20 md:block">
        {!reduce && (
          <motion.span
            className="absolute top-1/2 h-1.5 w-16 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-cyan to-transparent"
            animate={{ left: ["-5%", "100%"] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>
      <div aria-hidden="true" className="absolute bottom-6 left-[1.6rem] top-6 w-px bg-steel/20 md:hidden" />

      {pipeline.map((step, i) => {
        const Icon = icons[i];
        const on = active === i;
        return (
          <li
            key={step.title}
            className="relative"
            onPointerEnter={() => setActive(i)}
            onPointerLeave={() => setActive(null)}
          >
            <div
              tabIndex={0}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className={`flex h-full gap-4 rounded-2xl border p-4 transition-colors duration-300 md:flex-col md:items-center md:p-5 md:text-center ${
                on ? "border-cyan/50 bg-panel" : "border-steel/12 bg-panel/50"
              }`}
            >
              <span
                className={`relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-xl border bg-void transition-all duration-300 md:h-14 md:w-14 ${
                  on ? "border-cyan text-cyan shadow-[0_0_24px_-4px_rgb(0_212_255/.7)]" : "border-steel/25 text-snow"
                }`}
              >
                <Icon className="h-5 w-5 md:h-6 md:w-6" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <div>
                <p className="font-mono text-[0.7rem] text-cyan">{step.tech}</p>
                <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-steel">{step.text}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
