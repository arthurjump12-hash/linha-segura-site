import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function SectionHeading({
  kicker,
  title,
  lead,
  align = "split",
  id,
}: {
  kicker?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "split" | "stack";
  id?: string;
}) {
  return (
    <Reveal
      className={
        align === "split"
          ? "grid gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-end md:gap-16"
          : "max-w-3xl"
      }
    >
      <div>
        {kicker && (
          <p className="mb-4 flex items-center gap-3 font-mono text-xs text-cyan">
            <span className="h-px w-8 bg-cyan" aria-hidden="true" />
            {kicker}
          </p>
        )}
        <h2 id={id} className="text-[clamp(2rem,4.6vw,3.5rem)] font-semibold">
          {title}
        </h2>
      </div>
      {lead && <p className={`max-w-xl text-lg text-steel ${align === "stack" ? "mt-5" : ""}`}>{lead}</p>}
    </Reveal>
  );
}
