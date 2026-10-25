"use client";

import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  Camera,
  Check,
  ChevronDown,
  Clock3,
  Eye,
  FileBarChart2,
  Lightbulb,
  Lock,
  Minus,
  Plus,
  ScanSearch,
  ShieldCheck,
  SquareDashedMousePointer,
  Target,
  Timer,
  Trash2,
  X,
} from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { ButtonLink } from "@/components/ui";
import { aggregateByEquipment, formatDuration, formatPercent, occupancyByHour, rankEquipment, summarize } from "@/lib/intelligence/analytics.ts";
import { categoryLabel, categoryOrder } from "@/lib/intelligence/equipment.ts";
import { prototypeRun } from "@/lib/intelligence/prototype.ts";
import { DAY, defaultRules, generateSessions, sessionsToEvents } from "@/lib/intelligence/simulator.ts";
import type { EquipmentCategory, EquipmentZone } from "@/lib/intelligence/types.ts";
import { HBars, HourChart } from "./charts";
import { SIM, useSimulation } from "./SimulationProvider";
import { RealBadge, SimBadge } from "./status";

/* ---------- Canal 8: protótipo real × visão futura ---------- */
export function PrototypeSection() {
  const [mode, setMode] = useState<"real" | "futuro">("real");
  const id = useId();
  return (
    <section id="prototipo" aria-labelledby="prototipo-titulo" className="section relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-void via-navy to-void" />
      <div className="container-site">
        <SectionHeading
          id="prototipo-titulo"
          kicker="Prova de conceito"
          title="Da câmera ao dado: nosso primeiro protótipo."
          lead="Um teste técnico real, com um trecho curto de um canal. Separe o que já foi medido do que é visão de futuro."
        />
        <div role="tablist" aria-label="Modo de visualização" className="mt-10 inline-flex flex-wrap gap-1 rounded-full border border-steel/20 p-1">
          {(
            [
              ["real", "Modo A · Protótipo real"],
              ["futuro", "Modo B · Visão futura"],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              id={`${id}-${m}`}
              role="tab"
              type="button"
              aria-selected={mode === m}
              aria-controls={`${id}-painel`}
              onClick={() => setMode(m)}
              className={`min-h-11 rounded-full px-5 text-sm font-medium transition-colors ${mode === m ? (m === "real" ? "bg-ok text-void" : "bg-warn text-void") : "text-steel hover:text-snow"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div id={`${id}-painel`} role="tabpanel" aria-labelledby={`${id}-${mode}`} className="mt-6">
          {mode === "real" ? <RealMode /> : <FutureMode />}
        </div>
      </div>
    </section>
  );
}

function RealMode() {
  const occ = prototypeRun.events[0];
  const pas = prototypeRun.events[1];
  return (
    <div className="rounded-[1.5rem] border-2 border-ok/30 bg-panel/60 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <RealBadge />
        <span className="font-mono text-xs text-steel">relatorio_canal_0{prototypeRun.channel}.txt</span>
      </div>
      <dl className="mt-6 grid gap-px overflow-hidden rounded-2xl bg-steel/12 sm:grid-cols-3">
        {[
          ["Canal analisado", `Canal ${prototypeRun.channel}`],
          ["Duração do vídeo", `≈ ${prototypeRun.videoSeconds} s`],
          ["Regiões de interesse", String(prototypeRun.regions).padStart(2, "0")],
          ["Detecção", prototypeRun.detection],
          ["Ocupação registrada", `≈ ${occ.approxSeconds} s`],
          ["Passagem identificada", "01"],
        ].map(([k, v]) => (
          <div key={k} className="bg-navy p-5">
            <dt className="text-xs text-steel">{k}</dt>
            <dd className="mt-1.5 font-display text-2xl font-semibold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8">
        <p className="text-sm font-medium text-snow">Duração dos eventos em relação ao vídeo</p>
        <div className="mt-3 grid gap-3">
          <div>
            <div className="flex justify-between text-xs text-steel">
              <span>{occ.region}: ocupação</span>
              <span className="tabular-nums">≈ {occ.approxSeconds} s de {prototypeRun.videoSeconds} s</span>
            </div>
            <div className="mt-1.5 h-3 rounded-full bg-steel/12">
              <div className="h-3 rounded-full bg-ok" style={{ width: `${((occ.approxSeconds ?? 0) / prototypeRun.videoSeconds) * 100}%` }} />
            </div>
          </div>
          <p className="text-xs text-steel">
            {pas.region}: 1 passagem identificada, que não foi contada como uso. O gráfico mostra duração, não a posição exata no vídeo.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-snow">Tecnologia</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {prototypeRun.stack.map((t) => (
              <li key={t} className="rounded-full border border-steel/20 px-3 py-1 font-mono text-xs">
                {t}
              </li>
            ))}
            <li className="rounded-full border border-steel/20 px-3 py-1 text-xs">{prototypeRun.report}</li>
          </ul>
        </div>
        <ul className="grid gap-1.5 text-sm text-steel">
          {prototypeRun.caveats.map((c) => (
            <li key={c} className="flex gap-2">
              <Minus className="mt-1 h-3.5 w-3.5 shrink-0 text-steel-dim" aria-hidden="true" />
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FutureMode() {
  const { equipment, events, now } = useSimulation();
  const ranges = useMemo(() => [{ from: Math.floor(now / DAY) * DAY + SIM.openHour * 3600, to: now }], [now]);
  const stats = useMemo(() => aggregateByEquipment(events, equipment, ranges), [events, equipment, ranges]);
  const sum = summarize(stats);
  const hours = useMemo(() => occupancyByHour(events, ranges, equipment.map((e) => e.id), SIM.openHour, SIM.closeHour), [events, ranges, equipment]);
  const names = Object.fromEntries(equipment.map((e) => [e.id, e.name]));
  return (
    <div className="rounded-[1.5rem] border-2 border-warn/30 bg-panel/60 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SimBadge>Visão futura · dados simulados</SimBadge>
        <span className="text-xs text-steel">Como um dia de operação poderia aparecer para a gestão</span>
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Equipamentos", String(equipment.length)],
          ["Eventos hoje", String(sum.eventos)],
          ["Tempo médio", formatDuration(sum.tempoMedio)],
          ["Mais utilizado", sum.maisUtilizado ? names[sum.maisUtilizado.equipmentId] : "—"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-steel/12 bg-navy/70 p-4">
            <dt className="text-xs text-steel">{k}</dt>
            <dd className="mt-1.5 truncate font-display text-xl font-semibold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 rounded-2xl border border-steel/12 bg-navy/60 p-4">
        <HourChart data={hours} mode="area" label="Ocupação simulada por hora hoje" />
      </div>
      <p className="mt-4 text-xs text-steel">Nenhum número deste modo foi medido em uma academia real.</p>
    </div>
  );
}

/* ---------- Como a inteligência artificial funciona ---------- */
const flow = [
  { icon: Camera, title: "Câmera", text: "As câmeras capturam imagens.", detail: "Usamos câmeras já instaladas sempre que ângulo, resolução e iluminação permitem. O acesso às imagens é autorizado e passa por um serviço seguro, nunca direto do navegador." },
  { icon: ScanSearch, title: "Detecção", text: "A IA detecta pessoas.", detail: "Um modelo de visão computacional (como o YOLO) localiza pessoas em cada quadro e devolve caixas de detecção com um grau de confiança. Não há reconhecimento facial." },
  { icon: SquareDashedMousePointer, title: "Análise de regiões", text: "Regiões são associadas aos equipamentos.", detail: "Cada aparelho recebe uma região desenhada sobre a imagem (OpenCV). O sistema verifica se a pessoa detectada está dentro dessa região." },
  { icon: Timer, title: "Eventos", text: "Eventos são registrados.", detail: "Permanência acima do tempo mínimo vira ocupação estimada; permanência curta vira passagem; confiança baixa vira detecção inconclusiva. Cada evento tem início, fim e duração." },
  { icon: BarChart3, title: "Indicadores", text: "Os dados são consolidados.", detail: "Eventos são somados por equipamento, horário e categoria: quantidade de usos, tempo acumulado, duração média e taxa de ocupação." },
  { icon: Lightbulb, title: "Decisões", text: "Relatórios apoiam a gestão.", detail: "Os indicadores podem apoiar decisões como reorganizar o layout, planejar compras ou ajustar horários. Hoje isso está em fase de protótipo e não processa todas as câmeras em tempo real." },
];

export function HowItWorksSection() {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();
  return (
    <section id="como-funciona" aria-labelledby="funciona-titulo" className="section">
      <div className="container-site">
        <SectionHeading id="funciona-titulo" kicker="Como funciona" title="Câmera → detecção → regiões → eventos → indicadores → decisões." lead="Seis etapas entre a imagem e a decisão. Abra cada uma para ver os detalhes." />
        <ol className="relative mt-12 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {flow.map((f, i) => {
            const on = open === i;
            return (
              <li key={f.title} className="relative">
                <button
                  type="button"
                  aria-expanded={on}
                  aria-controls={`etapa-${i}`}
                  onClick={() => setOpen(on ? null : i)}
                  className={`group flex h-full w-full flex-col items-start gap-3 rounded-2xl border p-5 text-left transition-colors ${on ? "border-cyan/60 bg-panel" : "border-steel/12 bg-panel/40 hover:border-steel/40"}`}
                >
                  <span className="flex w-full items-center justify-between">
                    <span className={`relative grid h-11 w-11 place-items-center rounded-xl border bg-void ${on ? "border-cyan text-cyan" : "border-steel/25 text-snow"}`}>
                      <f.icon className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
                      {on && !reduce && <span className="absolute inset-0 animate-ping rounded-xl border border-cyan/40" aria-hidden="true" />}
                    </span>
                    <span className="font-mono text-xs text-steel-dim">{i + 1}/6</span>
                  </span>
                  <span className="text-lg font-semibold text-snow">{f.title}</span>
                  <span className="text-sm text-steel">{f.text}</span>
                  <ChevronDown className={`mt-auto h-4 w-4 text-steel transition-transform ${on ? "rotate-180 text-cyan" : ""}`} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ol>
        <AnimatePresence mode="wait">
          {open !== null && (
            <motion.div
              key={open}
              id={`etapa-${open}`}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="mt-4 rounded-2xl border border-cyan/25 bg-cyan/[.04] p-6"
            >
              <p className="text-sm text-cyan">
                Etapa {open + 1}: {flow[open].title}
              </p>
              <p className="mt-2 max-w-3xl text-lg text-snow">{flow[open].detail}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ---------- Simulador de cenários ---------- */
const templates: Record<EquipmentCategory, { names: string[]; stay: [number, number] }> = {
  cardio: { names: ["Esteira", "Bicicleta", "Elíptico", "Escada"], stay: [480, 1800] },
  inferiores: { names: ["Leg press", "Hack squat", "Cadeira extensora", "Cadeira flexora", "Abdutora", "Panturrilha"], stay: [150, 720] },
  peito: { names: ["Supino reto", "Supino inclinado", "Crossover", "Peck deck"], stay: [180, 720] },
  costas: { names: ["Puxada alta", "Remada baixa", "Remada articulada", "Pulldown"], stay: [180, 540] },
};

export function buildScenarioEquipment(count: number, cats: EquipmentCategory[], seed: number): EquipmentZone[] {
  const list: EquipmentZone[] = [];
  const used: Record<string, number> = {};
  for (let i = 0; i < count; i++) {
    const cat = cats[i % cats.length];
    const t = templates[cat];
    const base = t.names[Math.floor(i / cats.length) % t.names.length];
    used[base] = (used[base] ?? 0) + 1;
    const name = used[base] > 1 ? `${base} ${used[base]}` : base;
    const pop = 0.55 + (((seed * (i + 7)) % 97) / 97) * 0.8;
    list.push({ id: `cen-${i}`, name, category: cat, cameraId: "cen", plan: { x: 0, y: 0, w: 1, h: 1 }, view: { x: 0, y: 0, w: 1, h: 1 }, popularity: pop, stay: t.stay });
  }
  return list;
}

export function ScenarioSection() {
  const [equip, setEquip] = useState(16);
  const [cams, setCams] = useState(4);
  const [open, setOpen] = useState(6);
  const [close, setClose] = useState(22);
  const [cats, setCats] = useState<EquipmentCategory[]>(["cardio", "inferiores", "peito", "costas"]);
  const [days, setDays] = useState<1 | 7>(7);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [result, setResult] = useState<ReturnType<typeof runScenario> | null>(null);

  function runScenario() {
    const equipment = buildScenarioEquipment(equip, cats, 31);
    const sessions = generateSessions({ equipment, days, openHour: open, closeHour: close, seed: 777 + equip * 13 + open * 7 + close });
    const events = sessionsToEvents(sessions, defaultRules);
    const ranges = Array.from({ length: days }, (_, d) => ({ from: d * DAY + open * 3600, to: d * DAY + close * 3600 }));
    const stats = aggregateByEquipment(events, equipment, ranges);
    const names = Object.fromEntries(equipment.map((e) => [e.id, e.name]));
    const hours = occupancyByHour(events, ranges, equipment.map((e) => e.id), open, close);
    const ranked = rankEquipment(stats, "tempoTotal", names);
    const sum = summarize(stats);
    const peak = hours.reduce<{ hour: number; rate: number } | null>((b, h) => (h.rate !== null && (!b || h.rate > b.rate) ? { hour: h.hour, rate: h.rate } : b), null);
    const avgRate = stats.reduce((a, s) => a + s.taxa, 0) / Math.max(1, stats.length);
    return { names, hours, ranked, sum, peak, avgRate, cams, days, equip };
  }

  function generate(e: React.FormEvent) {
    e.preventDefault();
    if (!cats.length || close <= open) return;
    setStatus("loading");
    // pequena espera para o estado de carregamento ser perceptível
    window.setTimeout(() => {
      setResult(runScenario());
      setStatus("done");
    }, 450);
  }

  const invalid = !cats.length ? "Escolha pelo menos uma categoria." : close <= open ? "O fechamento precisa ser depois da abertura." : "";

  return (
    <section id="simulador" aria-labelledby="simulador-titulo" className="section">
      <div className="container-site">
        <SectionHeading id="simulador-titulo" kicker="Simulador de cenários" title="Simule a inteligência da sua academia." lead="Informe o perfil da sua academia e veja como um dashboard poderia ficar. Os números são gerados pelo mesmo motor de simulação." />
        <div className="mt-10 grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
          <form onSubmit={generate} className="grid content-start gap-5 rounded-2xl border border-steel/12 bg-panel/50 p-5" noValidate>
            <Range id="cen-equip" label="Equipamentos" value={equip} min={4} max={40} onChange={setEquip} />
            <Range id="cen-cams" label="Câmeras" value={cams} min={1} max={16} onChange={setCams} />
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1.5 text-sm">
                <span className="text-snow">Abre às</span>
                <select className="field" value={open} onChange={(e) => setOpen(Number(e.target.value))}>
                  {[5, 6, 7, 8, 9].map((h) => (
                    <option key={h} value={h}>
                      {h}h
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="text-snow">Fecha às</span>
                <select className="field" value={close} onChange={(e) => setClose(Number(e.target.value))}>
                  {[20, 21, 22, 23].map((h) => (
                    <option key={h} value={h}>
                      {h}h
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <fieldset>
              <legend className="text-sm text-snow">Categorias de equipamentos</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {categoryOrder.map((c) => (
                  <label key={c} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-steel/15 px-3 text-sm text-snow has-[:checked]:border-cyan/50">
                    <input type="checkbox" className="h-4 w-4 accent-cyan" checked={cats.includes(c)} onChange={() => setCats((v) => (v.includes(c) ? v.filter((x) => x !== c) : [...v, c]))} />
                    {categoryLabel[c]}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-sm text-snow">Período de análise</legend>
              <div className="mt-2 flex gap-2">
                {([1, 7] as const).map((d) => (
                  <label key={d} className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border border-steel/15 text-sm text-snow has-[:checked]:border-cyan/50 has-[:checked]:bg-cyan/[.06]">
                    <input type="radio" name="cen-dias" className="sr-only" checked={days === d} onChange={() => setDays(d)} />
                    {d === 1 ? "1 dia" : "7 dias"}
                  </label>
                ))}
              </div>
            </fieldset>
            {invalid && (
              <p role="alert" className="text-sm text-danger">
                {invalid}
              </p>
            )}
            <button type="submit" disabled={!!invalid || status === "loading"} className="inline-flex min-h-12 items-center justify-center rounded-full bg-snow px-6 font-semibold text-void transition-shadow hover:shadow-[0_0_0_4px_rgb(0_212_255/.18)] disabled:opacity-50">
              {status === "loading" ? "Gerando simulação…" : "Gerar simulação"}
            </button>
          </form>

          <div className="min-w-0 rounded-2xl border border-steel/12 bg-navy/60 p-5" aria-live="polite" aria-busy={status === "loading"}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold">Dashboard simulado</h3>
              <SimBadge>Simulação conceitual</SimBadge>
            </div>
            {status === "idle" && (
              <div className="mt-6 grid place-items-center rounded-2xl border border-dashed border-steel/25 p-10 text-center">
                <BarChart3 className="h-8 w-8 text-steel" aria-hidden="true" />
                <p className="mt-3 font-medium text-snow">Configure ao lado e gere a simulação.</p>
                <p className="mt-1 text-sm text-steel">O resultado aparece aqui em poucos segundos.</p>
              </div>
            )}
            {status === "loading" && (
              <div className="mt-6 grid gap-3" aria-hidden="true">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-2xl bg-steel/10" />
                  ))}
                </div>
                <div className="h-52 animate-pulse rounded-2xl bg-steel/10" />
              </div>
            )}
            {status === "done" && result && (
              <div className="mt-6 grid gap-5">
                <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    ["Eventos de ocupação", String(result.sum.eventos)],
                    ["Tempo médio", formatDuration(result.sum.tempoMedio)],
                    ["Taxa média", formatPercent(result.avgRate)],
                    ["Horário de pico", result.peak ? `${result.peak.hour}h` : "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-2xl border border-steel/12 bg-void/40 p-4">
                      <dt className="text-xs text-steel">{k}</dt>
                      <dd className="mt-1.5 font-display text-xl font-semibold tabular-nums">{v}</dd>
                    </div>
                  ))}
                </dl>
                <HourChart data={result.hours} mode="area" label="Ocupação simulada por hora" height={200} />
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <p className="mb-2 text-sm font-medium text-snow">Maior tempo de ocupação</p>
                    <HBars rows={result.ranked.slice(0, 5).map((s) => ({ id: s.equipmentId, label: result.names[s.equipmentId], value: s.tempoTotal, display: formatDuration(s.tempoTotal) }))} />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-snow">Menor tempo de ocupação</p>
                    <HBars rows={result.ranked.slice(-3).reverse().map((s) => ({ id: s.equipmentId, label: result.names[s.equipmentId], value: s.tempoTotal, display: formatDuration(s.tempoTotal) }))} max={result.ranked[0]?.tempoTotal} />
                  </div>
                </div>
                <p className="text-xs text-steel">
                  Cenário: {result.equip} equipamentos, {result.cams} câmeras informadas, {result.days === 1 ? "1 dia" : "7 dias"}. A quantidade de câmeras não garante cobertura de todos os equipamentos.
                </p>
              </div>
            )}
            <p className="mt-6 rounded-xl border border-warn/25 bg-warn/[.05] p-3 text-sm text-snow">
              Simulação conceitual. A viabilidade depende de levantamento técnico, posicionamento das câmeras e validação do modelo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Range({ id, label, value, min, max, onChange }: { id: string; label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between text-sm">
        <label htmlFor={id} className="text-snow">
          {label}
        </label>
        <span className="flex items-center gap-1">
          <button type="button" aria-label={`Diminuir ${label.toLowerCase()}`} onClick={() => onChange(Math.max(min, value - 1))} className="grid h-8 w-8 place-items-center rounded-full border border-steel/20 text-steel hover:text-snow">
            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <output htmlFor={id} className="w-8 text-center font-mono tabular-nums text-snow">
            {value}
          </output>
          <button type="button" aria-label={`Aumentar ${label.toLowerCase()}`} onClick={() => onChange(Math.min(max, value + 1))} className="grid h-8 w-8 place-items-center rounded-full border border-steel/20 text-steel hover:text-snow">
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </span>
      </div>
      <input id={id} type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-cyan" />
    </div>
  );
}

/* ---------- Comparação ---------- */
export function ComparisonSection() {
  const without = ["Imagens disponíveis para consulta", "Necessidade de observação manual", "Ausência de indicadores automáticos de ocupação"];
  const withA = ["Detecção automatizada de eventos", "Indicadores consolidados", "Histórico de ocupação", "Análise comparativa entre períodos e equipamentos", "Apoio à tomada de decisão"];
  return (
    <section aria-labelledby="comparacao-titulo" className="section pt-0">
      <div className="container-site">
        <SectionHeading id="comparacao-titulo" kicker="Comparação" title="De câmeras tradicionais à inteligência operacional." lead="Capacidades propostas, sujeitas à validação em projeto-piloto." />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Reveal className="rounded-[1.5rem] border border-steel/12 bg-panel/30 p-7">
            <h3 className="text-xl font-semibold text-steel">Sem camada de analytics</h3>
            <ul className="mt-5 grid gap-3">
              {without.map((t) => (
                <li key={t} className="flex gap-3 text-steel">
                  <X className="mt-0.5 h-5 w-5 shrink-0 text-steel-dim" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.08} className="relative overflow-hidden rounded-[1.5rem] border border-cyan/35 bg-gradient-to-br from-panel to-[#0a2348] p-7">
            <h3 className="text-xl font-semibold">Com camada de analytics</h3>
            <ul className="mt-5 grid gap-3">
              {withA.map((t) => (
                <li key={t} className="flex gap-3 text-snow">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-cyan" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- Projeto-piloto ---------- */
const weeks = [
  { title: "Diagnóstico e preparação", items: ["Levantamento das câmeras", "Avaliação da infraestrutura", "Definição das áreas", "Requisitos de segurança e privacidade"] },
  { title: "Configuração e integração", items: ["Acesso seguro às imagens", "Configuração do processamento", "Definição dos equipamentos", "Testes iniciais"] },
  { title: "Validação", items: ["Coleta de amostras autorizadas", "Análise de erros", "Ajustes do modelo", "Comparação com observação humana"] },
  { title: "Resultados", items: ["Consolidação dos indicadores", "Avaliação da viabilidade", "Relatório executivo", "Definição de próximos passos"] },
];

export function PilotSection() {
  const [active, setActive] = useState(0);
  return (
    <section id="piloto" aria-labelledby="piloto-titulo" className="section">
      <div className="container-site">
        <SectionHeading id="piloto-titulo" kicker="Projeto-piloto de 30 dias" title="Validar antes de escalar." lead="Uma proposta de quatro semanas com critérios combinados com a gestão. O piloto é uma proposta, não um contrato já aprovado." />
        <div className="relative mt-12">
          <div aria-hidden="true" className="absolute left-0 right-0 top-[1.1rem] hidden h-px bg-steel/15 md:block" />
          <div aria-hidden="true" className="absolute left-0 top-[1.1rem] hidden h-px bg-gradient-to-r from-electric to-cyan transition-[width] duration-700 md:block" style={{ width: `${((active + 1) / weeks.length) * 100}%` }} />
          <ol className="grid gap-4 md:grid-cols-4">
            {weeks.map((w, i) => (
              <li key={w.title}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={active === i}
                  className="group flex w-full flex-col items-start gap-4 text-left"
                >
                  <span className={`relative z-10 grid h-9 w-9 place-items-center rounded-full border font-mono text-xs transition-all ${i <= active ? "border-cyan bg-cyan text-void" : "border-steel/30 bg-void text-steel"}`}>{i + 1}</span>
                  <span className={`w-full rounded-2xl border p-5 transition-colors ${active === i ? "border-cyan/50 bg-panel" : "border-steel/12 bg-panel/40 group-hover:border-steel/40"}`}>
                    <span className="block font-mono text-xs text-cyan">Semana {i + 1}</span>
                    <span className="mt-1 block text-lg font-semibold text-snow">{w.title}</span>
                    <span className="mt-3 grid gap-1.5">
                      {w.items.map((it) => (
                        <span key={it} className="flex gap-2 text-sm text-steel">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan/70" aria-hidden="true" />
                          {it}
                        </span>
                      ))}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="#avaliacao">Conhecer o projeto-piloto</ButtonLink>
          <ButtonLink href="#avaliacao" variant="secondary">
            Solicitar avaliação técnica
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

/* ---------- Privacidade ---------- */
const privacy = [
  { icon: Target, title: "Finalidade", text: "As imagens são processadas somente para medir a utilização dos equipamentos." },
  { icon: Eye, title: "Minimização", text: "O resultado são eventos e indicadores agregados. Não há reconhecimento facial nem identificação de alunos." },
  { icon: Lock, title: "Controle de acesso", text: "Acesso às imagens e aos painéis restrito a pessoas autorizadas pela academia." },
  { icon: Clock3, title: "Retenção", text: "Prazos de guarda definidos com a academia. Imagens usadas na validação não ficam guardadas além do necessário." },
  { icon: ShieldCheck, title: "Segurança", text: "Processamento por serviço protegido, sem expor endereços de câmeras, senhas ou tokens." },
  { icon: FileBarChart2, title: "Transparência", text: "Orientamos a academia a informar os frequentadores sobre o uso das câmeras e sua finalidade." },
];

export function PrivacySection() {
  return (
    <section id="privacidade-ia" aria-labelledby="privacidade-titulo" className="section pt-0">
      <div className="container-site">
        <SectionHeading id="privacidade-titulo" kicker="LGPD e privacidade" title="Dados agregados, não pessoas." lead="A experiência pública e o produto priorizam indicadores agregados. Cada implantação é avaliada com a academia e seu assessor jurídico; não declaramos conformidade automática." />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {privacy.map((p, i) => (
            <Reveal as="li" key={p.title} delay={(i % 3) * 0.05} className="rounded-2xl border border-steel/12 bg-panel/40 p-6">
              <p.icon className="h-5 w-5 text-cyan" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold">{p.title}</h3>
              <p className="mt-1.5 text-sm text-steel">{p.text}</p>
            </Reveal>
          ))}
        </ul>
        <p className="mt-6 flex items-center gap-2 text-sm text-steel">
          <Trash2 className="h-4 w-4 text-steel-dim" aria-hidden="true" />
          Identificadores temporários de rastreamento são descartados ao fim de cada evento.
        </p>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
const faqAcademias = [
  { q: "Preciso trocar minhas câmeras?", a: "Não necessariamente. No diagnóstico avaliamos se ângulo, resolução e iluminação das câmeras atuais permitem a análise. Algumas áreas podem precisar de ajuste ou de uma câmera adicional." },
  { q: "O sistema identifica os alunos?", a: "Não. Não usamos reconhecimento facial e não associamos detecções a nomes ou cadastros. O foco é a ocupação dos equipamentos." },
  { q: "Os números do site são reais?", a: "Somente os do Modo A (protótipo real do Canal 8). Academia digital, dashboard, ranking, mapa de calor e simulador usam dados sintéticos para demonstração." },
  { q: "O sistema já funciona em tempo real em todas as câmeras?", a: "Ainda não. O protótipo analisou um trecho de um canal. Operação contínua e análise de vários canais são objetivos do projeto-piloto." },
  { q: "Como diferenciar uso de alguém que só passou?", a: "Pelo tempo de permanência na região. Abaixo do tempo mínimo, a presença é registrada como passagem e não conta como uso. O tempo mínimo é calibrado no piloto." },
  { q: "Quanto custa?", a: "Depende do número de câmeras, equipamentos e da infraestrutura existente. O investimento do piloto é definido depois do diagnóstico técnico." },
];

export function AcademyFAQ() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqAcademias.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <section aria-labelledby="faq-academias-titulo" className="section pt-0">
      <JsonLd data={schema} />
      <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <SectionHeading align="stack" id="faq-academias-titulo" kicker="Perguntas frequentes" title="O que gestores costumam perguntar." />
        <div className="divide-y divide-steel/15 border-y border-steel/15">
          {faqAcademias.map((f, i) => (
            <details key={f.q} className="group" open={i === 0}>
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-lg font-medium text-snow hover:text-cyan [&::-webkit-details-marker]:hidden">
                {f.q}
                <Plus className="h-5 w-5 shrink-0 text-steel transition-transform duration-300 group-open:rotate-45 group-open:text-cyan" aria-hidden="true" />
              </summary>
              <p className="max-w-2xl pb-6 text-steel">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
