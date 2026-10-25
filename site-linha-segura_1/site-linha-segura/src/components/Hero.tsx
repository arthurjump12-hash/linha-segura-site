"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { whatsappLink } from "@/config/site";
import { AnimatedBackground } from "./AnimatedBackground";
import { HeroVisual } from "./HeroVisual";
import { ButtonLink } from "./ui";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const enter = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 1, delay, ease },
        };

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden pt-[calc(var(--header-h)+env(safe-area-inset-top,0px))]">
      <AnimatedBackground />
      <div className="container-site relative grid items-center gap-14 pb-20 pt-12 md:pt-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10 lg:pb-28">
        <div>
          <motion.p {...enter(0)} className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-steel/15 bg-navy/60 px-3.5 py-1.5 text-xs text-steel">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_10px_#00D4FF]" aria-hidden="true" />
            Segurança eletrônica · Redes · Automação · IA
          </motion.p>

          <motion.h1
            id="hero-title"
            {...enter(0.08)}
            className="text-[clamp(2.6rem,7.2vw,5.6rem)] font-bold uppercase leading-[1.02] tracking-[-0.035em]"
          >
            O futuro da segurança é <span className="text-gradient">inteligente.</span>
          </motion.h1>

          <motion.p {...enter(0.2)} className="mt-7 max-w-[34rem] text-lg text-steel md:text-xl">
            Unimos segurança eletrônica, automação e inteligência artificial para proteger ambientes e transformar tecnologia em
            resultados.
          </motion.p>

          <motion.div {...enter(0.3)} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={whatsappLink("projeto")} external>
              Solicitar um projeto
            </ButtonLink>
            <ButtonLink href="#solucoes" variant="secondary">
              Conhecer nossas soluções
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
            </ButtonLink>
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? undefined : { opacity: 0, scale: 0.96, y: 20 }}
          animate={reduce ? undefined : { opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.25, ease }}
        >
          <HeroVisual />
        </motion.div>
      </div>
      <div className="signal-line" aria-hidden="true" />
    </section>
  );
}
