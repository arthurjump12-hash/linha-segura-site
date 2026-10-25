/**
 * Fundo tecnológico leve: grade, luzes e trilhas de circuito animadas apenas com CSS/SVG.
 * Sem JavaScript, sem impacto relevante em desempenho.
 */
export function AnimatedBackground({ variant = "hero" }: { variant?: "hero" | "section" }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="grid-backdrop absolute inset-0" />
      <div
        className={`absolute rounded-full blur-[120px] ${
          variant === "hero"
            ? "-right-[10%] -top-[20%] h-[42rem] w-[42rem] bg-electric/25"
            : "-left-[15%] top-[10%] h-[30rem] w-[30rem] bg-electric/15"
        }`}
      />
      <div
        className={`absolute rounded-full blur-[120px] ${
          variant === "hero"
            ? "-bottom-[30%] left-[5%] h-[34rem] w-[34rem] bg-cyan/10"
            : "-right-[10%] bottom-0 h-[24rem] w-[24rem] bg-cyan/[.07]"
        }`}
      />
      {variant === "hero" && (
        <svg className="absolute inset-0 h-full w-full opacity-60" preserveAspectRatio="none" viewBox="0 0 1440 900">
          <defs>
            <linearGradient id="trace" x1="0" x2="1">
              <stop offset="0" stopColor="#00D4FF" stopOpacity="0" />
              <stop offset=".5" stopColor="#00D4FF" stopOpacity=".9" />
              <stop offset="1" stopColor="#2563EB" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g fill="none" stroke="rgb(148 163 184 / .12)" strokeWidth="1">
            <path d="M0 640 H260 L320 580 H620" />
            <path d="M1440 220 H1180 L1120 280 H900" />
            <path d="M0 780 H140 L200 720 H420 L470 670" />
            <path d="M1440 760 H1260 L1200 700 H1010" />
          </g>
          <g fill="none" stroke="url(#trace)" strokeWidth="1.5" strokeLinecap="round">
            <path className="trace" d="M0 640 H260 L320 580 H620" />
            <path className="trace trace-2" d="M1440 220 H1180 L1120 280 H900" />
            <path className="trace trace-3" d="M0 780 H140 L200 720 H420 L470 670" />
            <path className="trace trace-4" d="M1440 760 H1260 L1200 700 H1010" />
          </g>
          <g fill="#00D4FF">
            <circle cx="620" cy="580" r="2.5" />
            <circle cx="900" cy="280" r="2.5" />
            <circle cx="470" cy="670" r="2.5" />
            <circle cx="1010" cy="700" r="2.5" />
          </g>
        </svg>
      )}
      <style>{`
        .trace{stroke-dasharray:120 900;stroke-dashoffset:1020;animation:trace 7s cubic-bezier(.5,0,.2,1) infinite}
        .trace-2{animation-delay:1.8s}.trace-3{animation-delay:3.4s}.trace-4{animation-delay:5s}
        @keyframes trace{to{stroke-dashoffset:0}}
        @media (prefers-reduced-motion: reduce){.trace{animation:none;stroke-dasharray:none;opacity:.25}}
      `}</style>
    </div>
  );
}
