import { CircleDashed, CircleHelp, CircleCheck, ScanEye, Timer } from "lucide-react";
import type { ZoneStatus } from "@/lib/intelligence/types.ts";

/** Estados da região: cada um com cor, ícone e texto (nunca só cor). */
export const statusMeta: Record<ZoneStatus, { label: string; short: string; color: string; Icon: typeof Timer; description: string }> = {
  livre: {
    label: "Área livre",
    short: "Livre",
    color: "#8492A8",
    Icon: CircleDashed,
    description: "Nenhuma pessoa detectada na região do equipamento.",
  },
  presenca: {
    label: "Presença detectada",
    short: "Presença",
    color: "#FBBF24",
    Icon: ScanEye,
    description: "Pessoa na região, ainda abaixo do tempo mínimo. Pode ser só uma passagem.",
  },
  ocupado: {
    label: "Ocupação estimada",
    short: "Ocupado",
    color: "#00D4FF",
    Icon: Timer,
    description: "Permanência acima do tempo mínimo e com confiança suficiente. O contador mede a duração.",
  },
  encerrado: {
    label: "Evento encerrado",
    short: "Encerrado",
    color: "#34D399",
    Icon: CircleCheck,
    description: "A pessoa saiu da região. O evento foi registrado com início, fim e duração.",
  },
  inconclusivo: {
    label: "Detecção inconclusiva",
    short: "Inconclusivo",
    color: "#E879A6",
    Icon: CircleHelp,
    description: "Há presença, mas a confiança está baixa (oclusão, ângulo ou iluminação). Não entra como ocupação.",
  },
};

export const statusOrder: ZoneStatus[] = ["livre", "presenca", "ocupado", "encerrado", "inconclusivo"];

export function StatusChip({ status, compact = false }: { status: ZoneStatus; compact?: boolean }) {
  const m = statusMeta[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
      style={{ color: m.color, borderColor: `${m.color}55`, background: `${m.color}14` }}
    >
      <m.Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {compact ? m.short : m.label}
    </span>
  );
}

export function SimBadge({ children = "Simulação demonstrativa" }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-warn/40 bg-warn/[.08] px-2.5 py-0.5 text-xs font-medium text-warn">
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}

export function RealBadge({ children = "Dados reais do protótipo" }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-ok/40 bg-ok/[.08] px-2.5 py-0.5 text-xs font-medium text-ok">
      <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" />
      {children}
    </span>
  );
}
