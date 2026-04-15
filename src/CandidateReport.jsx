import { useMemo, useState } from "react";
import { FieldGroup, FInput, FTextarea } from "./FormComponents";

export const defaultCandidateReportData = {
  empresa: "RGA Recursos Humanos",
  candidato: "Nome do(a) Candidato(a)",
  cargo: "Cargo pretendido",
  dadosPessoaisEntrevista: "Idade: 30 anos\nCidade: Manaus/AM\nDisponibilidade: Imediata\nData da entrevista: 15/04/2026\nEntrevistador(a): Recrutador(a) responsável\n\nResumo da entrevista:\nProfissional com comunicação clara, boa capacidade de análise e aderência ao contexto da vaga.",
  formacaoAcademica: "• Bacharel em Administração — Universidade Exemplo (2018)\n• Curso de Excel Avançado — Instituição Exemplo (2022)\n• Curso de Liderança e Gestão de Pessoas — Plataforma Exemplo (2024)",
  historicoProfissional: [
    {
      empresa: "Empresa Atual/Última",
      cargo: "Analista Administrativo",
      periodo: "Jan/2021 – Atual",
      atividades: "Responsável por rotinas administrativas, elaboração de relatórios gerenciais, acompanhamento de indicadores e suporte à coordenação.",
      resultados: "Redução de 18% no tempo de fechamento de relatórios mensais e melhoria de organização de processos internos.",
    },
    {
      empresa: "Empresa Anterior",
      cargo: "Assistente Administrativo",
      periodo: "Mar/2018 – Dez/2020",
      atividades: "Atendimento interno, controle documental, apoio ao financeiro e interface com fornecedores.",
      resultados: "Padronização de controles e melhoria da confiabilidade das informações de apoio à gestão.",
    },
  ],
  instrumentosAvaliacao: "Instrumentos aplicados:\n• Entrevista por competências\n• Mapeamento comportamental\n• Checagem de referências profissionais\n\nSíntese:\nCandidato(a) demonstra aderência técnica e comportamental ao perfil da posição.",
  perfilDiscTexto: "Predominância comportamental: Perfil com tendência a Estabilidade (S) e Conformidade (C), com boa organização, consistência e foco em qualidade.",
  perfilDiscForcas: "• Organização e disciplina\n• Atenção a detalhes\n• Cooperação com equipe\n• Cumprimento de prazos\n• Comunicação respeitosa e objetiva",
  referenciasAntecedentes: "Referências profissionais: sem ressalvas relevantes, com relatos positivos sobre comprometimento e responsabilidade.\nAntecedentes: sem apontamentos impeditivos para contratação.",
  conclusaoRecomendacao: "Conclusão:\nCom base na análise técnica, comportamental e histórico profissional, o(a) candidato(a) apresenta boa aderência ao cargo avaliado.\n\nRecomendação de etapa:\nRecomendado(a) para avançar à próxima fase do processo seletivo (entrevista com gestor(a) e/ou etapa final de validação).",
};

function CandidateReportPage({ title, children, badge }) {
  return (
    <div
      style={{
        background: "white",
        width: "100%",
        maxWidth: 794,
        minHeight: 1123,
        boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      <div style={{ height: 10, background: "#1976D2" }} />
      <div
        style={{
          padding: "22px 52px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#1976D2", letterSpacing: "0.08em" }}>RELATÓRIO DE CANDIDATO</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>{title}</div>
        </div>
        {!!badge && (
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px 10px", borderRadius: 999 }}>
            {badge}
          </div>
        )}
      </div>
      <div style={{ padding: "24px 52px 28px", display: "flex", flexDirection: "column", gap: 18 }}>{children}</div>
      <div style={{ marginTop: "auto", height: 8, background: "#1976D2" }} />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h3 style={{ margin: 0, fontSize: 13, color: "#1976D2", letterSpacing: "0.04em", textTransform: "uppercase" }}>{title}</h3>
      <div style={{ height: 2, width: 38, background: "#E53935", margin: "8px 0 10px" }} />
      <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{children}</div>
    </section>
  );
}

function asList(text) {
  return (text || "")
    .split("\n")
    .map((line) => line.replace(/^•\s?/, "").trim())
    .filter(Boolean);
}

export default function CandidateReport() {
  const [data, setData] = useState(defaultCandidateReportData);
  const [previewPage, setPreviewPage] = useState(0);

  const setField = (field, value) => setData((prev) => ({ ...prev, [field]: value }));
  const setExperience = (index, field, value) =>
    setData((prev) => ({
      ...prev,
      historicoProfissional: prev.historicoProfissional.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));

  const pages = useMemo(
    () => [
      {
        label: "Página 1",
        node: (
          <CandidateReportPage title="Resumo e elegibilidade" badge={data.cargo}>
            <Section title="Empresa, candidato e cargo">
              {`Empresa: ${data.empresa}\nCandidato(a): ${data.candidato}\nCargo: ${data.cargo}`}
            </Section>
            <Section title="Dados pessoais e entrevista">{data.dadosPessoaisEntrevista}</Section>
            <Section title="Formação acadêmica">
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {asList(data.formacaoAcademica).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </Section>
          </CandidateReportPage>
        ),
      },
      {
        label: "Página 2",
        node: (
          <CandidateReportPage title="Histórico e instrumentos" badge={data.candidato}>
            <Section title="Histórico profissional">
              <div style={{ display: "grid", gap: 10 }}>
                {data.historicoProfissional.map((exp, i) => (
                  <div key={i} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 12 }}>
                    <div style={{ fontWeight: 800, color: "#0f172a" }}>{exp.cargo} — {exp.empresa}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, marginBottom: 8 }}>{exp.periodo}</div>
                    <div><strong>Atividades:</strong> {exp.atividades}</div>
                    <div style={{ marginTop: 6 }}><strong>Resultados:</strong> {exp.resultados}</div>
                  </div>
                ))}
              </div>
            </Section>
            <Section title="Instrumentos de avaliação">{data.instrumentosAvaliacao}</Section>
          </CandidateReportPage>
        ),
      },
      {
        label: "Página 3",
        node: (
          <CandidateReportPage title="Análises complementares" badge="Recomendação final">
            <Section title="Perfil DISC">{data.perfilDiscTexto}</Section>
            <Section title="Forças observadas">
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {asList(data.perfilDiscForcas).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </Section>
            <Section title="Referência profissional / antecedentes">{data.referenciasAntecedentes}</Section>
            <Section title="Conclusão e recomendação de etapa">{data.conclusaoRecomendacao}</Section>
          </CandidateReportPage>
        ),
      },
    ],
    [data]
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(340px, 460px) 1fr", minHeight: "100vh", background: "#f1f5f9" }}>
      <aside style={{ background: "white", borderRight: "1px solid #e2e8f0", padding: 20, overflowY: "auto" }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: "#0f172a", marginBottom: 4 }}>Relatório de Candidato</div>
        <div style={{ color: "#64748b", fontSize: 13, marginBottom: 18 }}>Modelo pronto para ajuste rápido por candidato.</div>

        <FieldGroup label="Empresa"><FInput value={data.empresa} onChange={(e) => setField("empresa", e.target.value)} /></FieldGroup>
        <FieldGroup label="Candidato(a)"><FInput value={data.candidato} onChange={(e) => setField("candidato", e.target.value)} /></FieldGroup>
        <FieldGroup label="Cargo"><FInput value={data.cargo} onChange={(e) => setField("cargo", e.target.value)} /></FieldGroup>
        <FieldGroup label="Dados pessoais e entrevista"><FTextarea rows={8} value={data.dadosPessoaisEntrevista} onChange={(e) => setField("dadosPessoaisEntrevista", e.target.value)} /></FieldGroup>
        <FieldGroup label="Formação acadêmica"><FTextarea rows={6} value={data.formacaoAcademica} onChange={(e) => setField("formacaoAcademica", e.target.value)} /></FieldGroup>

        <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", margin: "12px 0 8px" }}>Histórico profissional</div>
        {data.historicoProfissional.map((exp, i) => (
          <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, marginBottom: 12, background: "#f8fafc" }}>
            <FieldGroup label={`Empresa #${i + 1}`}><FInput value={exp.empresa} onChange={(e) => setExperience(i, "empresa", e.target.value)} /></FieldGroup>
            <FieldGroup label="Cargo"><FInput value={exp.cargo} onChange={(e) => setExperience(i, "cargo", e.target.value)} /></FieldGroup>
            <FieldGroup label="Período"><FInput value={exp.periodo} onChange={(e) => setExperience(i, "periodo", e.target.value)} /></FieldGroup>
            <FieldGroup label="Atividades"><FTextarea rows={3} value={exp.atividades} onChange={(e) => setExperience(i, "atividades", e.target.value)} /></FieldGroup>
            <FieldGroup label="Resultados"><FTextarea rows={3} value={exp.resultados} onChange={(e) => setExperience(i, "resultados", e.target.value)} /></FieldGroup>
          </div>
        ))}

        <FieldGroup label="Instrumentos de avaliação"><FTextarea rows={6} value={data.instrumentosAvaliacao} onChange={(e) => setField("instrumentosAvaliacao", e.target.value)} /></FieldGroup>
        <FieldGroup label="Perfil DISC (texto)"><FTextarea rows={4} value={data.perfilDiscTexto} onChange={(e) => setField("perfilDiscTexto", e.target.value)} /></FieldGroup>
        <FieldGroup label="Perfil DISC (forças)"><FTextarea rows={5} value={data.perfilDiscForcas} onChange={(e) => setField("perfilDiscForcas", e.target.value)} /></FieldGroup>
        <FieldGroup label="Referência profissional / antecedentes"><FTextarea rows={5} value={data.referenciasAntecedentes} onChange={(e) => setField("referenciasAntecedentes", e.target.value)} /></FieldGroup>
        <FieldGroup label="Conclusão e recomendação"><FTextarea rows={6} value={data.conclusaoRecomendacao} onChange={(e) => setField("conclusaoRecomendacao", e.target.value)} /></FieldGroup>
      </aside>

      <main style={{ padding: "20px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {pages.map((page, idx) => (
            <button
              key={page.label}
              onClick={() => setPreviewPage(idx)}
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: 999,
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                background: previewPage === idx ? "#1976D2" : "white",
                color: previewPage === idx ? "white" : "#334155",
              }}
            >
              {page.label}
            </button>
          ))}
        </div>
        {pages[previewPage].node}
      </main>
    </div>
  );
}
