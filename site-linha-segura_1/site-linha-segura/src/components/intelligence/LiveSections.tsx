"use client";

import { useMemo, useState } from "react";
import { EyeOff, Fingerprint, Info, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { aggregateByEquipment, formatDuration, formatPercent, heatmap, rankEquipment } from "@/lib/intelligence/analytics.ts";
import { demoCameras, shortName } from "@/lib/intelligence/equipment.ts";
import type { RankMetric } from "@/lib/intelligence/types.ts";
import { CameraFeed } from "./CameraFeed";
import { DataTable, HBars, HeatLegend, TableToggle, seqColor } from "./charts";
import { Dashboard } from "./Dashboard";
import { EquipmentFilter, PeriodFilters, periodText } from "./Filters";
import { GymFloor } from "./GymFloor";
import { SimControls } from "./SimControls";
import { SIM, useSimulation } from "./SimulationProvider";
import { SimBadge, StatusChip, statusMeta, statusOrder } from "./status";

/* ---------- Explore uma academia inteligente ---------- */
export function GymSection() {
  return (
    <section id="academia-digital" aria-labelledby="academia-titulo" className="section">
      <div className="container-site">
        <SectionHeading
          id="academia-titulo"
          kicker="Academia digital"
          title="Explore uma academia inteligente."
          lead="Uma academia fictícia com 10 equipamentos e 3 câmeras. A simulação gera presenças nas regiões de cada aparelho e aplica as mesmas regras de um sistema real. Clique em um equipamento para ver os detalhes."
        />
        <div className="mt-10 grid gap-6">
          <SimControls />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <GymFloor />
            <aside aria-labelledby="estados-titulo" className="rounded-2xl border border-steel/12 bg-panel/40 p-5">
              <h3 id="estados-titulo" className="text-base font-semibold">
                Como a região é classificada
              </h3>
              <ol className="mt-4 grid gap-4">
                {statusOrder.map((s) => {
                  const m = statusMeta[s];
                  return (
                    <li key={s} className="flex gap-3">
                      <m.Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: m.color }} aria-hidden="true" />
                      <div>
                        <p className="text-sm font-medium text-snow">{m.label}</p>
                        <p className="mt-0.5 text-xs text-steel">{m.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-5 flex gap-2 rounded-xl border border-warn/25 bg-warn/[.05] p-3 text-xs text-steel">
                <Info className="h-4 w-4 shrink-0 text-warn" aria-hidden="true" />
                Presença perto do aparelho não é uso comprovado. A análise estima a ocupação de regiões, e a classificação precisa ser validada em cada academia.
              </p>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Quem está em cada equipamento? ---------- */
export function DetectionsSection() {
  const { equipment, zoneStates, now, rules } = useSimulation();
  const [cam, setCam] = useState(demoCameras[2].id);
  const camera = demoCameras.find((c) => c.id === cam)!;
  const feed = equipment.filter((e) => e.cameraId === cam).map((zone) => ({ zone, state: zoneStates[zone.id] }));
  const active = equipment
    .map((e) => ({ e, st: zoneStates[e.id] }))
    .filter(({ st }) => st.session && st.status !== "encerrado" && st.status !== "livre");

  return (
    <section id="deteccoes" aria-labelledby="deteccoes-titulo" className="section pt-0">
      <div className="container-site">
        <SectionHeading
          id="deteccoes-titulo"
          kicker="Detecção sem identificação"
          title="Quem está em cada equipamento?"
          lead="O sistema sabe que há uma pessoa na região do aparelho e por quanto tempo. Ele não sabe quem é, e não precisa saber."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <div role="tablist" aria-label="Câmera" className="mb-3 flex flex-wrap gap-2">
              {demoCameras.map((c) => (
                <button
                  key={c.id}
                  role="tab"
                  type="button"
                  aria-selected={cam === c.id}
                  onClick={() => setCam(c.id)}
                  className={`min-h-10 rounded-full border px-4 text-sm transition-colors ${cam === c.id ? "border-cyan/60 bg-cyan/10 text-snow" : "border-steel/20 text-steel hover:text-snow"}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div className="overflow-hidden rounded-[1.25rem] border border-steel/15 bg-navy p-2">
              <div className="overflow-hidden rounded-xl">
                <CameraFeed
                  cameraLabel={camera.name}
                  zones={feed}
                  now={now}
                  confirmSeconds={rules.confirmSeconds}
                  ariaLabel={`Visão simulada da ${camera.name} com as regiões dos equipamentos e as pessoas detectadas`}
                />
              </div>
            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-steel/12 bg-panel/50 p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold">Detecções agora</h3>
              <SimBadge>Simulação</SimBadge>
            </div>
            {active.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-steel/25 p-4 text-sm text-steel">Nenhuma pessoa nas regiões neste instante. Inicie a simulação para ver novas detecções.</p>
            ) : (
              <ul className="mt-4 grid gap-2" aria-label="Pessoas detectadas nas regiões dos equipamentos">
                {active.map(({ e, st }) => (
                  <li key={e.id} className="rounded-xl border border-steel/12 bg-void/40 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-snow">Pessoa detectada · {e.name}</p>
                      <StatusChip status={st.status} compact />
                    </div>
                    <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs tabular-nums text-steel">
                      <span>ID temporário {st.session!.trackId}</span>
                      <span>permanência {formatDuration(st.elapsed)}</span>
                      <span>confiança {st.session!.confidence.toFixed(2).replace(".", ",")}</span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <ul className="mt-5 grid gap-3 border-t border-steel/12 pt-5 text-sm text-steel">
              <li className="flex gap-2.5">
                <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
                Sem reconhecimento facial e sem nomes, perfis ou histórico de alunos.
              </li>
              <li className="flex gap-2.5">
                <Fingerprint className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
                O ID temporário só liga as detecções de um mesmo evento e é descartado quando ele termina.
              </li>
              <li className="flex gap-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
                O objetivo é medir a utilização dos equipamentos, não rastrear frequentadores.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Dashboard ---------- */
export function DashboardSection() {
  return (
    <section id="dashboard" aria-labelledby="dashboard-titulo" className="section pt-0">
      <div className="container-site">
        <SectionHeading
          id="dashboard-titulo"
          kicker="Dashboard de gestão"
          title="Da detecção ao indicador, em um só painel."
          lead="Filtre por período, faixa horária e equipamento, compare com o período anterior e exporte os eventos exibidos. O painel acompanha a simulação em tempo real."
        />
        <div className="mt-10">
          <Dashboard />
        </div>
      </div>
    </section>
  );
}

/* ---------- Ranking ---------- */
const metricInfo: Record<RankMetric, { label: string; def: string }> = {
  eventos: { label: "Quantidade de eventos", def: "Quantas vezes o aparelho foi ocupado. Muitos usos curtos contam tanto quanto poucos usos longos." },
  tempoTotal: { label: "Tempo acumulado", def: "Soma do tempo em que o aparelho ficou ocupado. Mostra onde a demanda de fato se concentra." },
  taxa: { label: "Taxa de ocupação", def: "Parte do período em que o aparelho esteve ocupado. Permite comparar períodos de durações diferentes." },
};

export function RankingSection() {
  const { equipment, stats, period, openEquipment } = useSimulation();
  const [metric, setMetric] = useState<RankMetric>("eventos");
  const [table, setTable] = useState(false);
  const names = Object.fromEntries(equipment.map((e) => [e.id, e.name]));
  const ranked = rankEquipment(stats, metric, names);
  const display = (v: number, m: RankMetric) => (m === "eventos" ? `${v} eventos` : m === "tempoTotal" ? formatDuration(v) : formatPercent(v, 1));

  return (
    <section id="ranking" aria-labelledby="ranking-titulo" className="section pt-0">
      <div className="container-site">
        <SectionHeading
          id="ranking-titulo"
          kicker="Ranking de utilização"
          title="Quais equipamentos recebem mais utilização?"
          lead="A resposta depende da pergunta. Troque a métrica e veja o ranking mudar: eventos, tempo e taxa medem coisas diferentes."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div className="grid content-start gap-3">
            <div role="radiogroup" aria-label="Métrica do ranking" className="grid gap-2">
              {(Object.keys(metricInfo) as RankMetric[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={metric === m}
                  onClick={() => setMetric(m)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${metric === m ? "border-cyan/60 bg-cyan/[.06]" : "border-steel/15 bg-panel/40 hover:border-steel/40"}`}
                >
                  <span className="block font-medium text-snow">{metricInfo[m].label}</span>
                  <span className="mt-1 block text-sm text-steel">{metricInfo[m].def}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <PeriodFilters idPrefix="rank" />
              <EquipmentFilter />
            </div>
          </div>
          <div className="min-w-0 rounded-2xl border border-steel/12 bg-panel/50 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">{metricInfo[metric].label}</h3>
                <p className="text-xs text-steel">{periodText(period)}</p>
              </div>
              <div className="flex items-center gap-2">
                <SimBadge>Simulação</SimBadge>
                <TableToggle shown={table} onToggle={() => setTable((v) => !v)} />
              </div>
            </div>
            {table ? (
              <DataTable
                caption="Ranking com as três métricas"
                head={["Equipamento", "Eventos", "Tempo acumulado", "Duração média", "Taxa"]}
                rows={ranked.map((s) => [names[s.equipmentId], s.eventos, formatDuration(s.tempoTotal), formatDuration(s.duracaoMedia), formatPercent(s.taxa, 1)])}
              />
            ) : (
              <HBars
                rows={ranked.map((s) => ({
                  id: s.equipmentId,
                  label: names[s.equipmentId],
                  value: s[metric],
                  display: display(s[metric], metric),
                  sub: metric === "eventos" ? `média ${formatDuration(s.duracaoMedia)}` : metric === "tempoTotal" ? `${s.eventos} eventos` : formatDuration(s.tempoTotal),
                }))}
                onSelect={(id, el) => openEquipment(id, el)}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Mapa de calor da academia ---------- */
export function HeatmapSection() {
  const { equipment, events, ranges, period } = useSimulation();
  const [focus, setFocus] = useState<string | null>(null);
  const stats = useMemo(() => aggregateByEquipment(events, equipment, ranges), [events, equipment, ranges]);
  const heat = useMemo(() => heatmap(events, ranges, equipment, SIM.openHour, SIM.closeHour), [events, ranges, equipment]);
  const maxRate = Math.max(0.01, ...stats.map((s) => s.taxa));
  const sel = focus ? equipment.find((e) => e.id === focus) : null;
  const selStats = focus ? stats.find((s) => s.equipmentId === focus) : null;
  const selPeak = focus
    ? heat.find((h) => h.equipmentId === focus)!.hours.reduce<{ hour: number; rate: number } | null>((b, h) => (h.rate !== null && (!b || h.rate > b.rate) ? { hour: h.hour, rate: h.rate } : b), null)
    : null;

  return (
    <section id="mapa-de-calor" aria-labelledby="calor-titulo" className="section pt-0">
      <div className="container-site">
        <SectionHeading
          id="calor-titulo"
          kicker="Mapa de calor"
          title="Onde a ocupação se concentra."
          lead="Cada região ganha a cor da sua taxa de ocupação no período escolhido. Passe o mouse, toque ou navegue com o teclado para ver os números."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <PeriodFilters idPrefix="calor" />
              <label className="sr-only" htmlFor="calor-equip">
                Destacar equipamento
              </label>
              <select
                id="calor-equip"
                value={focus ?? ""}
                onChange={(e) => setFocus(e.target.value || null)}
                className="min-h-10 rounded-full border border-steel/20 bg-void px-4 text-sm text-snow"
              >
                <option value="">Destacar equipamento</option>
                {equipment.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="overflow-hidden rounded-[1.25rem] border border-steel/15 bg-[#081120]">
              <svg viewBox="0 0 100 64" className="block h-auto w-full" role="group" aria-label={`Mapa de calor da academia, ${periodText(period)}`}>
                <rect x="1" y="1" width="98" height="62" fill="none" stroke="rgb(148 163 184 / .3)" strokeWidth=".4" rx="1" />
                <line x1="40" y1="44" x2="40" y2="63" stroke="rgb(148 163 184 / .3)" strokeWidth=".4" />
                {equipment.map((e) => {
                  const s = stats.find((x) => x.equipmentId === e.id)!;
                  const v = s.taxa / maxRate;
                  const dim = focus && focus !== e.id;
                  const { x, y, w, h } = e.plan;
                  return (
                    <g
                      key={e.id}
                      tabIndex={0}
                      role="button"
                      aria-label={`${e.name}: taxa ${formatPercent(s.taxa, 1)}, ${s.eventos} eventos, ${formatDuration(s.tempoTotal)} de ocupação`}
                      onPointerEnter={() => setFocus(e.id)}
                      onFocus={() => setFocus(e.id)}
                      onClick={() => setFocus(e.id)}
                      className="cursor-pointer outline-none"
                      style={{ opacity: dim ? 0.35 : 1, transition: "opacity .3s" }}
                    >
                      <rect x={x} y={y} width={w} height={h} rx="1.4" fill={seqColor(v * 0.62)} style={{ transition: "fill .6s" }} stroke={focus === e.id ? "#F8FAFC" : "rgb(148 163 184 / .25)"} strokeWidth={focus === e.id ? 0.5 : 0.25} />
                      <text x={x + 1.2} y={y + 2.9} fontSize={Math.min(2, (w * 1.75) / shortName(e.name).length)} fontWeight="600" fill={v > 0.75 ? "#070B12" : "#F8FAFC"}>
                        {shortName(e.name)}
                      </text>
                      <text x={x + 1.2} y={y + h - 1.4} fontSize="2.6" fontWeight="700" fill={v > 0.75 ? "#070B12" : "#F8FAFC"}>
                        {formatPercent(s.taxa)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <HeatLegend />
            {/* Celular: lista legível com a mesma informação do mapa */}
            <ul className="mt-5 grid gap-2 md:hidden" aria-label="Taxa de ocupação por equipamento">
              {[...stats]
                .sort((a, b) => b.taxa - a.taxa)
                .map((s) => (
                  <li key={s.equipmentId}>
                    <button
                      type="button"
                      onClick={() => setFocus(s.equipmentId)}
                      aria-pressed={focus === s.equipmentId}
                      className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-steel/12 px-3 text-left text-sm aria-pressed:border-cyan/50"
                    >
                      <span className="h-4 w-4 shrink-0 rounded" style={{ background: seqColor((s.taxa / maxRate) * 0.62) }} aria-hidden="true" />
                      <span className="flex-1 text-snow">{equipment.find((e) => e.id === s.equipmentId)!.name}</span>
                      <span className="tabular-nums text-steel">{formatPercent(s.taxa)}</span>
                    </button>
                  </li>
                ))}
            </ul>
          </div>

          <aside className="rounded-2xl border border-steel/12 bg-panel/50 p-5" aria-live="polite">
            <SimBadge>Simulação</SimBadge>
            {sel && selStats ? (
              <>
                <h3 className="mt-4 text-xl font-semibold">{sel.name}</h3>
                <dl className="mt-4 grid gap-3 text-sm">
                  <Row label="Taxa de ocupação" value={formatPercent(selStats.taxa, 1)} />
                  <Row label="Eventos de ocupação" value={String(selStats.eventos)} />
                  <Row label="Tempo acumulado" value={formatDuration(selStats.tempoTotal)} />
                  <Row label="Duração média" value={formatDuration(selStats.duracaoMedia)} />
                  <Row label="Horário de pico" value={selPeak ? `${selPeak.hour}h (${formatPercent(selPeak.rate)})` : "—"} />
                </dl>
              </>
            ) : (
              <p className="mt-4 text-sm text-steel">Selecione uma região do mapa para ver os indicadores.</p>
            )}
            <p className="mt-6 border-t border-steel/12 pt-4 text-xs text-steel">
              Em uma academia real, a precisão do mapa depende da posição das câmeras, da iluminação e da validação de cada região durante o piloto.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-steel/10 pb-2">
      <dt className="text-steel">{label}</dt>
      <dd className="tabular-nums text-snow">{value}</dd>
    </div>
  );
}

