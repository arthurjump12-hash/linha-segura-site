"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { siteConfig, whatsappLink } from "@/config/site";

/**
 * Atalho de contato sempre à mão:
 * barra inferior no celular e botão flutuante no desktop.
 * Aparece depois da abertura e some quando o formulário ou o rodapé estão na tela.
 */
export function StickyCTA() {
  const [scrolled, setScrolled] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const targets = [document.getElementById("contato"), document.querySelector("footer")].filter(Boolean) as Element[];
    const visible = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      setBlocked(visible.size > 0);
    });
    targets.forEach((t) => io.observe(t));
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  const show = scrolled && !blocked;

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Celular */}
          <motion.div
            key="bar"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="glass fixed inset-x-0 bottom-0 z-40 border-t border-steel/15 px-[max(1rem,env(safe-area-inset-left,0px))] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-3 md:hidden"
          >
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-snow">Fale com o Arthur</p>
                <p className="truncate text-xs text-steel">{siteConfig.contact.whatsappDisplay}</p>
              </div>
              <a href={whatsappLink("orcamento")} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-snow px-5 text-sm font-semibold text-void">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Pedir orçamento
              </a>
            </div>
          </motion.div>

          {/* Desktop */}
          <motion.a
            key="fab"
            href={whatsappLink("geral")}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Conversar no WhatsApp"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="group fixed bottom-[max(1.5rem,env(safe-area-inset-bottom,0px))] right-[max(1.5rem,env(safe-area-inset-right,0px))] z-40 hidden h-14 items-center gap-0 overflow-hidden rounded-full bg-snow pl-4 pr-4 text-void shadow-[0_10px_40px_-10px_rgb(0_212_255/.6)] transition-[gap,padding] duration-300 hover:gap-2 hover:pr-5 focus-visible:gap-2 focus-visible:pr-5 md:inline-flex"
          >
            <MessageCircle className="h-6 w-6 shrink-0" aria-hidden="true" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-[max-width] duration-300 group-hover:max-w-40 group-focus-visible:max-w-40">
              Conversar no WhatsApp
            </span>
          </motion.a>
        </>
      )}
    </AnimatePresence>
  );
}
