import { useState, useMemo } from "react";

const PLANS = {
  starter: { name: "Starter", price: 590, setup: 1990, setupFree: true, agendas: 1, atend: 400, reativ: 50 },
  plus: { name: "Plus", price: 990, setup: 1990, setupFree: true, agendas: 5, atend: 1000, reativ: 200 },
  pro: { name: "Pro", price: 1990, setup: 2990, setupFree: true, agendas: 8, atend: 2500, reativ: 500 },
};

const fmt = v => "R$ " + Math.round(v).toLocaleString("pt-BR");
const fmtPct = v => v + "%";

function suggestPlan(agendas, slotsEstimados) {
  // Por agendas primeiro
  if (agendas >= 6) return PLANS.pro;
  if (agendas >= 2) return PLANS.plus;
  // Por volume (mesmo com 1 agenda, pode precisar de plano maior pelo volume)
  if (slotsEstimados > 1000) return PLANS.pro;
  if (slotsEstimados > 400) return PLANS.plus;
  return PLANS.starter;
}

function Slider({ label, value, min, max, step, onChange, format, hint, accent, extra }) {
  const ac = accent || "#0070C0";
  const uid = `sl-${label.replace(/[^a-zA-Z]/g, "").slice(0, 12)}`;
  const sliderStyle = `
    .${uid} { -webkit-appearance: none; appearance: none; width: 100%; height: 40px; background: transparent; cursor: pointer; outline: none; }
    .${uid}::-webkit-slider-runnable-track { height: 6px; background: #C9D6E3; border-radius: 3px; }
    .${uid}::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 24px; height: 24px; border-radius: 50%; background: ${ac}; border: 3px solid #fff; box-shadow: 0 2px 8px ${ac}55; margin-top: -9px; }
    .${uid}::-moz-range-track { height: 6px; background: #C9D6E3; border-radius: 3px; }
    .${uid}::-moz-range-thumb { width: 24px; height: 24px; border-radius: 50%; background: ${ac}; border: 3px solid #fff; box-shadow: 0 2px 8px ${ac}55; }
  `;
  return (
    <div style={{ marginBottom: 28 }}>
      <style>{sliderStyle}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 6 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#1A3A5C" }}>{label}</div>
          {hint && <div style={{ fontSize: 13, color: "#3D5A80", marginTop: 4, maxWidth: 320, lineHeight: 1.5 }}>{hint}</div>}
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: ac, fontFamily: "'Manrope', monospace", marginLeft: 12, whiteSpace: "nowrap" }}>{format(value)}</div>
      </div>
      {extra && <div style={{ marginBottom: 6 }}>{extra}</div>}
      <input type="range" className={uid} min={min} max={max} step={step || 1} value={value} onChange={e => onChange(+e.target.value)} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: -2 }}>
        <span style={{ fontSize: 11, color: "#8FA4B8" }}>{format(min)}</span>
        <span style={{ fontSize: 11, color: "#8FA4B8" }}>{format(max)}</span>
      </div>
    </div>
  );
}

function Card({ label, value, sub, color }) {
  return (
    <div style={{ background: "#fff", border: "0.5px solid #C9D6E3", borderRadius: 12, padding: "14px 18px", flex: 1, boxShadow: "none" }}>
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#3D5A80", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: color || "#1A3A5C", fontFamily: "'Manrope', monospace", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 13, color: "#8FA4B8", marginTop: 5, lineHeight: 1.4 }}>{sub}</div>}
    </div>
  );
}

function SetupBadge({ plan }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ textDecoration: "line-through", color: "#8FA4B8", fontSize: 14, fontWeight: 600 }}>{fmt(plan.setup)}</span>
      <span style={{ background: "#2E7D32", color: "#fff", fontSize: 12, fontWeight: 800, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.04em" }}>GRÁTIS</span>
    </span>
  );
}

export default function App() {
  const [tipo, setTipo] = useState("dentista");
  const [numDentistas, setNumDentistas] = useState(1);
  const [dias, setDias] = useState(22);
  const [cpd, setCpd] = useState(8);
  const [ns, setNs] = useState(18);
  const [ticket, setTicket] = useState(300);
  const [cf, setCf] = useState(22000);
  const [imp, setImp] = useState(10);

  function switchTipo(t) {
    setTipo(t);
    if (t === "dentista") {
      setNumDentistas(1);
      setCpd(8);
      setCf(22000);
    } else {
      setNumDentistas(3);
      setCpd(24);
      setCf(44000);
    }
  }

  const agendas = tipo === "dentista" ? 1 : numDentistas;
  const slotsEstimados = dias * cpd;
  const plan = suggestPlan(agendas, slotsEstimados);
  const cpdPerDentist = agendas > 0 ? (cpd / agendas) : cpd;

  const r = useMemo(() => {
    const slots = dias * cpd;
    const nsSlots = Math.round(slots * ns / 100);
    const feitas = slots - nsSlots;
    const recAtual = feitas * ticket;
    const horasDia = 8;
    const chora = cf / (dias * horasDia || 1);
    const lucCess = nsSlots * ticket;
    const cfNs = nsSlots * chora;
    const custoNs = lucCess + cfNs;

    // Improvement slider: +imp% of consultas realizadas (feitas)
    const consultasRecuperadas = Math.round(feitas * imp / 100);
    const recRecuperada = consultasRecuperadas * ticket;
    const custoEvitado = consultasRecuperadas * chora;

    // Reactivation: 5% of consultas realizadas
    const reativados = Math.round(feitas * 0.05);
    const recReativacao = reativados * ticket;

    const ganhoTotal = recRecuperada + recReativacao;
    const roi = ganhoTotal - plan.price;
    const roiAnual = roi * 12;
    const mult = plan.price > 0 ? ganhoTotal / plan.price : 0;
    const minConsultas = Math.ceil(plan.price / ticket);
    const payback = ganhoTotal > 0 ? Math.ceil(plan.price / (ganhoTotal / 30)) : null;
    const rc = roi > 5000 ? "#2E7D32" : roi > 2000 ? "#0070C0" : roi > 0 ? "#2E7D32" : roi > -300 ? "#D4A017" : "#CC0000";

    return { slots, nsSlots, feitas, recAtual, chora, lucCess, cfNs, custoNs, consultasRecuperadas, recRecuperada, custoEvitado, reativados, recReativacao, ganhoTotal, roi, roiAnual, mult, minConsultas, payback, rc };
  }, [dias, cpd, ns, ticket, cf, imp, plan.price]);

  const lowTicket = ticket < 100;

  const v = lowTicket
    ? { t: "Perfil com ROI desfavorável", s: "Com ticket abaixo de R$ 100, o retorno tende a não cobrir o investimento. Dentzi funciona melhor com atendimento particular ou misto.", c: "#CC0000" }
    : r.roi > 5000
    ? { t: "ROI excepcional para sua clínica", s: "Sua estrutura tem alto potencial de recuperação. A automação gera retorno significativo já no primeiro mês.", c: "#2E7D32" }
    : r.roi > 2000
    ? { t: "Retorno consistente e previsível", s: "Sua clínica recupera o investimento em poucos dias de operação. Perfil ideal para automação de agenda.", c: "#0070C0" }
    : r.roi > 0
    ? { t: "Retorno positivo — vale o investimento", s: "A automação se paga e ainda gera sobra. Quanto maior seu ticket e agenda, mais esse número cresce.", c: "#2E7D32" }
    : r.roi > -300
    ? { t: "No limite — revise suas premissas", s: "Verifique se o ticket e a agenda refletem sua realidade. Pequenos ajustes podem mudar o cenário.", c: "#D4A017" }
    : { t: "Perfil com ROI desfavorável", s: "Com esses números, o retorno não cobre o investimento hoje. Avalie se sua agenda ou ticket podem crescer.", c: "#CC0000" };

  return (
    <div style={{ fontFamily: "'Manrope','Segoe UI',sans-serif", background: "#F0F4F8", minHeight: "100vh", color: "#1A3A5C" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{margin:0}input[type=range]{-webkit-appearance:none}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none}`}</style>

      {/* Header */}
      <div style={{ borderBottom: "0.5px solid #C9D6E3", padding: "16px 28px", display: "flex", alignItems: "center", gap: 18, background: "#fff" }}>
        <span style={{ fontSize: 28, fontWeight: 800, background: "linear-gradient(90deg,#1A3A5C,#00D4E8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>dentzi</span>
        <div style={{ width: 1, height: 20, background: "#C9D6E3" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "#8FA4B8", letterSpacing: "0.1em", textTransform: "uppercase" }}>Simulador de Retorno</span>
        <div style={{ marginLeft: "auto", fontSize: 13, color: "#8FA4B8" }}>Quanto você recupera com a agenda cheia?</div>
      </div>

      <div style={{ maxWidth: 1020, margin: "0 auto", padding: "28px 22px" }}>

        {/* TIPO SELECTOR — inline, single page */}
        <div style={{ background: "#fff", border: "0.5px solid #C9D6E3", borderRadius: 14, padding: "20px 24px", marginBottom: 20, boxShadow: "none" }}>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#3D5A80", marginBottom: 14 }}>Qual é o seu perfil?</div>
          <div style={{ display: "flex", gap: 12, marginBottom: tipo === "clinica" ? 20 : 0 }}>
            <button onClick={() => switchTipo("dentista")} style={{ flex: 1, padding: "18px 20px", borderRadius: 12, border: tipo === "dentista" ? "2px solid #0070C0" : "2px solid #C9D6E3", background: tipo === "dentista" ? "#E8EEF4" : "#fff", cursor: "pointer", textAlign: "center", transition: "all 0.15s" }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>🦷</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: tipo === "dentista" ? "#0070C0" : "#3D5A80" }}>Sou Dentista</div>
              <div style={{ fontSize: 13, color: "#3D5A80", marginTop: 3 }}>Atendo sozinho, 1 agenda</div>
            </button>
            <button onClick={() => switchTipo("clinica")} style={{ flex: 1, padding: "18px 20px", borderRadius: 12, border: tipo === "clinica" ? "2px solid #0070C0" : "2px solid #C9D6E3", background: tipo === "clinica" ? "#E8EEF4" : "#fff", cursor: "pointer", textAlign: "center", transition: "all 0.15s" }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>🏥</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: tipo === "clinica" ? "#0070C0" : "#3D5A80" }}>Sou Proprietário de Clínica</div>
              <div style={{ fontSize: 13, color: "#3D5A80", marginTop: 3 }}>2 ou mais dentistas na equipe</div>
            </button>
          </div>

          {tipo === "clinica" && (
            <div>
              <Slider
                label="Quantos dentistas atendem na clínica?"
                value={numDentistas} min={2} max={15} step={1}
                onChange={setNumDentistas}
                format={v => v + " dentistas"}
                hint="Cada dentista com agenda própria = 1 agenda integrada"
                accent="#0070C0"
              />
            </div>
          )}

          {/* Plan recommendation — always visible */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", background: "#E8EEF4", borderRadius: 10, border: "1px solid #0070C044" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#0070C0", marginBottom: 4 }}>Plano recomendado para seu perfil</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#1A3A5C" }}>{plan.name} — {fmt(plan.price)}<span style={{ fontSize: 14, fontWeight: 600, color: "#3D5A80" }}>/mês</span></div>
              <div style={{ fontSize: 14, color: "#3D5A80", marginTop: 6, lineHeight: 1.6 }}>
                {agendas === 1 ? "1 agenda integrada" : `Até ${plan.agendas} agendas integradas`} · {plan.atend.toLocaleString("pt-BR")} atendimentos inclusos/mês · Setup: <SetupBadge plan={plan} />
              </div>
              {slotsEstimados > plan.atend && (
                <div style={{ fontSize: 13, color: "#E65100", marginTop: 6, fontWeight: 600 }}>
                  ⚠ Sua agenda tem ~{slotsEstimados.toLocaleString("pt-BR")} consultas/mês — acima do incluso ({plan.atend.toLocaleString("pt-BR")}). O excedente é cobrado a parte.
                </div>
              )}
              {tipo === "dentista" && slotsEstimados > 400 && plan.name !== "Starter" && (
                <div style={{ fontSize: 13, color: "#3D5A80", marginTop: 4 }}>
                  Plano sugerido pelo volume de consultas ({slotsEstimados}/mês), mesmo com 1 agenda.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 22, alignItems: "start" }}>

          {/* LEFT: INPUTS */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Step 1: Agenda */}
            <div style={{ background: "#fff", border: "0.5px solid #C9D6E3", borderRadius: 14, padding: 24, boxShadow: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#1A3A5C,#0070C0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>1</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#1A3A5C" }}>Como é a sua agenda hoje?</div>
                  <div style={{ fontSize: 13, color: "#3D5A80" }}>Preencha o que você já sabe de cabeça</div>
                </div>
              </div>
              <Slider label="Dias de atendimento por mês" value={dias} min={4} max={26} step={1} onChange={setDias} format={v => v + " dias"} hint="Apenas os dias em que há atendimento" />
              <Slider
                label={tipo === "clinica" ? "Consultas totais por dia (toda a clínica)" : "Consultas disponíveis por dia"}
                value={cpd} min={2} max={60} step={1}
                onChange={setCpd}
                format={v => v + " consultas"}
                hint={tipo === "clinica" ? "Soma de todos os dentistas. Ajuste o total da clínica." : "Quantos horários você abre — mesmo os não preenchidos"}
                extra={tipo === "clinica" && numDentistas > 1 ? (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#E8EEF4", border: "0.5px solid #C9D6E3", borderRadius: 8, padding: "5px 12px", fontSize: 13, color: "#0070C0", fontWeight: 600 }}>
                    ≈ {cpdPerDentist.toFixed(1)} consultas/dia por dentista
                  </div>
                ) : null}
              />
              <Slider label="Pacientes que faltam sem avisar" value={ns} min={3} max={45} step={1} onChange={setNs} format={fmtPct} hint="Média nacional em odontologia: 15% a 20%" />
              <div style={{ background: "#E8EEF4", border: "0.5px solid #C9D6E3", borderRadius: 10, padding: "12px 16px", marginTop: -8 }}>
                <div style={{ fontSize: 13, color: "#3D5A80", marginBottom: 2 }}>Consultas realizadas por mês:</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 26, fontWeight: 800, color: "#0070C0", fontFamily: "'Manrope', monospace" }}>{r.feitas}</span>
                  <span style={{ fontSize: 14, color: "#3D5A80" }}>de {r.slots} disponíveis ({100 - ns}% de ocupação)</span>
                </div>
              </div>
            </div>

            {/* Step 2: Financeiro */}
            <div style={{ background: "#fff", border: "0.5px solid #C9D6E3", borderRadius: 14, padding: 24, boxShadow: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#1A3A5C,#0070C0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>2</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#1A3A5C" }}>Seus números financeiros</div>
                  <div style={{ fontSize: 13, color: "#3D5A80" }}>Confira a receita estimada ao lado e ajuste se precisar</div>
                </div>
              </div>
              <div style={{ background: "#F0F4F8", border: "0.5px solid #C9D6E3", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: "#3D5A80", marginBottom: 3 }}>Receita mensal estimada:</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#0070C0", fontFamily: "'Manrope', monospace" }}>{fmt(r.recAtual)}</div>
                <div style={{ fontSize: 13, color: "#8FA4B8", marginTop: 3 }}>{r.feitas} consultas realizadas × {fmt(ticket)}</div>
              </div>
              <Slider label="Valor médio por consulta" value={ticket} min={50} max={1500} step={10} onChange={setTicket} format={fmt} hint="Valor líquido recebido — já descontado repasse de convênio" accent="#0070C0" />
              <Slider label="Custos fixos mensais" value={cf} min={1000} max={250000} step={500} onChange={setCf} format={fmt} hint="Aluguel + pessoal + pró-labore. Sem materiais e impostos." />
            </div>

            {/* Step 3: Expectativa Dentzi */}
            <div style={{ background: "#fff", border: "1px solid #0070C044", borderRadius: 14, padding: 24, boxShadow: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#0070C0,#2E7D32)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>3</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#1A3A5C" }}>O que você espera da Dentzi</div>
                  <div style={{ fontSize: 13, color: "#3D5A80" }}>Nossa referência de mercado: +10% sobre as consultas realizadas</div>
                </div>
              </div>
              <Slider
                label="Aumento esperado de consultas realizadas"
                value={imp} min={3} max={35} step={1}
                onChange={setImp}
                format={fmtPct}
                hint="Via confirmações automáticas, lembretes e reagendamento imediato de faltas"
                accent="#2E7D32"
              />
              <div style={{ fontSize: 13, color: "#3D5A80", background: "#E8F5E9", border: "1px solid #2E7D3233", borderRadius: 8, padding: "10px 14px", lineHeight: 1.6, marginTop: -8 }}>
                Com +{imp}% sobre as {r.feitas} consultas realizadas, são <strong style={{ color: "#2E7D32" }}>{r.consultasRecuperadas} consultas a mais por mês</strong> na sua agenda — além da receita de reativação de pacientes inativos.
              </div>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Current diagnosis */}
            <div style={{ background: "#fff", border: "0.5px solid #C9D6E3", borderRadius: 14, padding: 22, boxShadow: "none" }}>
              <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#3D5A80", marginBottom: 14 }}>Diagnóstico atual — sem Dentzi</div>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <Card label="Consultas/mês" value={r.slots} sub="capacidade total" />
                <Card label="Faltas/mês" value={r.nsSlots} sub={ns + "% da agenda"} color="#E65100" />
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <Card label="Receita realizada" value={fmt(r.recAtual)} sub={r.feitas + " consultas"} />
                <Card label="Receita perdida" value={fmt(r.lucCess)} sub="lucro cessante direto" color="#CC0000" />
              </div>

              <div style={{ background: "#FFF3E0", border: "1px solid #E6510033", borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#E65100", marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>Custo real de cada falta</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {[
                    { label: "Receita perdida", value: fmt(ticket), sub: "lucro cessante", c: "#CC0000", bg: "#fff" },
                    null,
                    { label: "Custo fixo da hora", value: fmt(r.chora), sub: "já pago, desperdiçado", c: "#E65100", bg: "#fff" },
                    null,
                    { label: "Custo real/falta", value: fmt(ticket + r.chora), sub: "por consulta perdida", c: "#CC0000", bg: "#FFEBEE" },
                  ].map((x, i) => x === null ? (
                    <span key={i} style={{ color: "#C0C8D0", fontWeight: 800, fontSize: 16 }}>+</span>
                  ) : (
                    <div key={i} style={{ flex: 1, textAlign: "center", padding: "10px 6px", background: x.bg, borderRadius: 10, border: "1px solid #E6510022" }}>
                      <div style={{ fontSize: 12, color: "#8FA4B8", marginBottom: 3 }}>{x.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: x.c, fontFamily: "'Manrope', monospace" }}>{x.value}</div>
                      <div style={{ fontSize: 12, color: "#8FA4B8" }}>{x.sub}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, textAlign: "center", padding: "10px", background: "#FFEBEE", borderRadius: 10 }}>
                  <span style={{ fontSize: 14, color: "#8FA4B8" }}>Total perdido em faltas por mês: </span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: "#CC0000", fontFamily: "'Manrope', monospace" }}>{fmt(r.custoNs)}</span>
                </div>
              </div>
            </div>

            {/* With Dentzi */}
            <div style={{ background: "#fff", border: "1px solid #0070C044", borderRadius: 14, padding: 22, boxShadow: "none" }}>
              <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#3D5A80", marginBottom: 14 }}>Com Dentzi — +{imp}% sobre consultas realizadas</div>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <Card label="Consultas recuperadas" value={"+" + r.consultasRecuperadas} sub="por mês, via confirmação e lembrete" color="#0070C0" />
                <Card label="Receita recuperada" value={fmt(r.recRecuperada)} sub={r.consultasRecuperadas + " × " + fmt(ticket)} color="#0070C0" />
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <Card label="Custo fixo evitado" value={fmt(r.custoEvitado)} sub="hora clínica que volta a produzir" color="#2E7D32" />
                <Card label="Reativação de inativos" value={fmt(r.recReativacao)} sub={"~" + r.reativados + " pacientes reativados/mês (5% da base)"} color="#2E7D32" />
              </div>

              {/* Big ROI */}
              <div style={{ background: r.rc + "0D", border: "2px solid " + r.rc + "44", borderRadius: 14, padding: 22, textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#3D5A80", marginBottom: 6 }}>Retorno líquido por mês</div>
                <div style={{ fontSize: 50, fontWeight: 800, color: r.rc, fontFamily: "'Manrope', monospace", lineHeight: 1 }}>{r.roi >= 0 ? "+" : ""}{fmt(r.roi)}</div>
                <div style={{ fontSize: 15, color: "#3D5A80", marginTop: 10, lineHeight: 1.8 }}>
                  {fmt(r.ganhoTotal)} de ganho total − {fmt(plan.price)} plano {plan.name}/mês<br />
                  <strong style={{ color: "#1A3A5C" }}>{fmt(r.roiAnual)}/ano</strong> · <strong style={{ color: "#1A3A5C" }}>{r.mult.toFixed(1)}× o investimento</strong>
                </div>
              </div>
            </div>

            {/* Verdict */}
            <div style={{ background: v.c + "0A", border: "2px solid " + v.c + "44", borderRadius: 14, padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: v.c, boxShadow: "0 0 10px " + v.c + "88", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: v.c }}>{v.t}</div>
                  <div style={{ fontSize: 15, color: "#3D5A80" }}>{v.s}</div>
                </div>
              </div>
              <div style={{ background: "#fff", borderRadius: 10, padding: "16px 18px", fontSize: 15, color: "#1A3A5C", lineHeight: 2 }}>
                {!lowTicket && <>
                  <div>→ {r.minConsultas === 1 ? "Basta" : "Bastam"} <strong style={{ color: "#0070C0" }}>{r.minConsultas} consulta{r.minConsultas !== 1 ? "s" : ""} a mais por mês</strong> para a Dentzi se pagar</div>
                  <div>→ Isso representa <strong style={{ color: "#0070C0" }}>{((r.minConsultas / r.slots) * 100).toFixed(1)}%</strong> da sua agenda de {r.slots} horários</div>
                  {r.payback && <div>→ A Dentzi se paga {r.payback === 1 ? "no primeiro" : "nos primeiros"} <strong style={{ color: "#0070C0" }}>{r.payback} {r.payback === 1 ? "dia" : "dias"} do mês</strong></div>}
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #C9D6E3", color: "#3D5A80" }}>
                    Você perde <strong style={{ color: "#E65100" }}>{fmt(r.custoNs)}/mês</strong> em faltas. A Dentzi custa apenas <strong style={{ color: "#E65100" }}>{((plan.price / r.custoNs) * 100).toFixed(1)}%</strong> desse valor.
                  </div>
                </>}
                {lowTicket && (
                  <div>Com ticket médio abaixo de R$ 100, recomendamos avaliar a transição para um modelo com maior participação de pacientes particulares. A Dentzi gera mais valor quando o ticket médio supera R$ 150.</div>
                )}
              </div>
            </div>

            {/* Affirmation box */}
            {!lowTicket && r.roi > 0 && (
              <div style={{ background: "#E8F5E9", border: "2px solid #2E7D3266", borderRadius: 14, padding: 24, textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#2E7D32", marginBottom: 10 }}>✓ Faz sentido para o seu perfil</div>
                <div style={{ fontSize: 17, color: "#1A3A5C", lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
                  Com <strong>{r.slots} horários/mês</strong> e ticket de <strong>{fmt(ticket)}</strong>, sua clínica recupera <strong style={{ color: "#2E7D32" }}>{fmt(r.ganhoTotal)}</strong> por mês com automação — investindo apenas <strong>{fmt(plan.price)}</strong> no plano <strong>{plan.name}</strong>.
                </div>
                <div style={{ marginTop: 14, fontSize: 15, color: "#3D5A80", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  Setup: <SetupBadge plan={plan} /> — incluso na implantação assistida
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clínicas Fundadoras */}
        <div style={{ background: "linear-gradient(135deg, #1A3A5C, #0B5A8C)", borderRadius: 18, padding: "36px 32px", marginTop: 28, textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#00D4E8", marginBottom: 10 }}>Dentzi Founders</div>
          <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.3, marginBottom: 12 }}>Programa Dentzi Founders<br />Estamos em busca das primeiras Clínicas e Dentistas Fundadores</div>
          <div style={{ fontSize: 15, color: "#C9D6E3", lineHeight: 1.7, maxWidth: 600, margin: "0 auto 20px" }}>
            As primeiras 10 clínicas terão <strong style={{ color: "#00F5D4" }}>30% de desconto vitalício</strong> na mensalidade e acesso direto aos fundadores para moldar o produto juntos. Venha fazer parte desta revolução.
          </div>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 6 }}>
            {[
              { label: "Starter Fundador", orig: 590, price: 413 },
              { label: "Plus Fundador", orig: 990, price: 693 },
              { label: "Pro Fundador", orig: 1990, price: 1393 },
            ].map(p => (
              <div key={p.label} style={{ background: "#ffffff15", borderRadius: 10, padding: "14px 22px" }}>
                <div style={{ fontSize: 12, color: "#00D4E8" }}>{p.label}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, justifyContent: "center", marginTop: 4 }}>
                  <span style={{ fontSize: 14, textDecoration: "line-through", color: "#8FA4B8" }}>R$ {p.orig.toLocaleString("pt-BR")}</span>
                  <span style={{ fontSize: 24, fontWeight: 800 }}>R$ {p.price.toLocaleString("pt-BR")}<span style={{ fontSize: 13, fontWeight: 400 }}>/mês</span></span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "#8FA4B8" }}>Vagas limitadas · Setup não será cobrado para Clínicas Fundadoras</div>
        </div>

        {/* CTA */}
        <div style={{ background: "#fff", border: "0.5px solid #C9D6E3", borderRadius: 18, padding: "32px 28px", marginTop: 20, textAlign: "center", boxShadow: "0 1px 2px rgba(26,58,92,0.08)" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#1A3A5C", marginBottom: 6 }}>Quer saber como funciona na prática?</div>
          <div style={{ fontSize: 15, color: "#3D5A80", marginBottom: 24 }}>Fale comigo diretamente. Sem compromisso — você fala com o fundador.</div>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://wa.me/5511944823322?text=Ol%C3%A1%20%C3%89rico%2C%20vi%20o%20simulador%20da%20Dentzi%20e%20gostaria%20de%20saber%20mais%20sobre%20a%20solu%C3%A7%C3%A3o." target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 28px", borderRadius: 12, background: "#25D366", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 14px rgba(37,211,102,0.3)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Conversar no WhatsApp
            </a>
            <a href="https://calendly.com/ericoa-melo/30min" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 28px", borderRadius: 12, background: "#0070C0", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 14px rgba(11,142,196,0.3)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Agendar uma conversa
            </a>
            <a href="mailto:ericoa.melo@gmail.com?subject=Dentzi%20-%20Interesse%20no%20simulador" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 28px", borderRadius: 12, background: "#fff", color: "#1A3A5C", fontSize: 15, fontWeight: 600, textDecoration: "none", border: "2px solid #C9D6E3" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Enviar email
            </a>
          </div>
          <div style={{ fontSize: 14, color: "#8FA4B8", marginTop: 18 }}>Érico Melo · Fundador, Dentzi · (11) 94482-3322</div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: 13, color: "#8FA4B8", textAlign: "center", paddingTop: 18, paddingBottom: 10, lineHeight: 1.8 }}>
          Custo real da falta = lucro cessante + custo fixo da hora parada · Premissa de melhoria sobre consultas realizadas · Reativação: 5% das consultas realizadas · Setup não incluído no cálculo mensal
        </div>
      </div>
    </div>
  );
}