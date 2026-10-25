"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, MessageCircle, X } from "lucide-react";
import { mainNav, siteConfig, whatsappLink } from "@/config/site";
import { Logo } from "./Logo";

export function MobileNavigation({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  // Fecha ao trocar de página
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("nav a")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab" && panelRef.current) {
        const items = panelRef.current.querySelectorAll<HTMLElement>("a, button");
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function close() {
    setOpen(false);
    requestAnimationFrame(() => buttonRef.current?.focus());
  }

  const panel = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          id="menu-mobile"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-void/97 pb-[max(2rem,env(safe-area-inset-bottom,0px))] pt-[env(safe-area-inset-top,0px)] backdrop-blur-xl xl:hidden"
        >
          <div className="container-site flex h-[var(--header-h)] shrink-0 items-center justify-between">
            <Logo />
            <button
              type="button"
              onClick={close}
              aria-label="Fechar menu"
              className="grid h-11 w-11 place-items-center rounded-full border border-steel/25 text-snow hover:border-cyan/60"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Menu móvel" className="container-site mt-6">
            <ul className="flex flex-col">
              {[{ href: "/", label: "Início" }, ...mainNav].map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="border-b border-steel/10"
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className="flex min-h-14 items-center font-display text-2xl font-medium text-snow aria-[current=page]:text-cyan"
                  >
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>

          <div className="container-site mt-auto flex flex-col gap-3 pt-10">
            <a
              href={whatsappLink("orcamento")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-snow py-3.5 font-semibold text-void"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Solicitar orçamento no WhatsApp
            </a>
            <p className="text-center text-sm text-steel">{siteConfig.contact.whatsappDisplay}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="xl:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="menu-mobile"
        aria-label="Abrir menu"
        className="grid h-11 w-11 place-items-center rounded-full border border-steel/25 text-snow transition-colors hover:border-cyan/60"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>
      {mounted && createPortal(panel, document.body)}
    </div>
  );
}
