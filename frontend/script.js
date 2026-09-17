const $ = (selector) => document.querySelector(selector);
const essay = $("#essay"),
  theme = $("#theme"),
  form = $("#essay-form"),
  error = $("#form-error"),
  loading = $("#loading"),
  result = $("#result"),
  submit = $("#submit-button"),
  historySection = $("#history-section"),
  historyList = $("#history-list");
const labels = [
  "Domínio da escrita formal",
  "Compreensão do tema",
  "Argumentação",
  "Coesão textual",
  "Proposta de intervenção",
];
const keys = [
  "competencia_1",
  "competencia_2",
  "competencia_3",
  "competencia_4",
  "competencia_5",
];
const esc = (text = "") =>
  String(text).replace(
    /[&<>'\"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        c
      ],
  );
const list = (items) =>
  items?.length
    ? `<ul>${items.map((x) => `<li>${esc(typeof x === "string" ? x : x.texto || x.nome || JSON.stringify(x))}</li>`).join("")}</ul>`
    : "<p>Não há apontamentos específicos nesta parte.</p>";
function updateCounter() {
  const text = essay.value.trim();
  const words = text ? text.split(/\s+/).length : 0;
  const paragraphs = text ? text.split(/\n\s*\n/).filter(Boolean).length : 0;
  $("#counter").textContent =
    `${essay.value.length.toLocaleString("pt-BR")} / 12.000 caracteres · ${words} palavras · ${paragraphs} parágrafos`;
}
essay.addEventListener("input", updateCounter);
document.querySelectorAll(".new-correction").forEach((button) =>
  button.addEventListener("click", () => {
    result.classList.add("hidden");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    essay.focus();
  }),
);
function renderCompetency(data, index) {
  const c = data.competencias[keys[index]],
    issues = c.problemas || [];
  return `<details class="competency" ${index === 0 ? "open" : ""}><summary><span>C${index + 1} <small>${labels[index]}</small></span><strong>${c.nota}/200</strong></summary><div class="competency-body"><p>${esc(c.justificativa)}</p><div class="feedback-grid"><div class="feedback"><h4>O que funcionou</h4>${list(c.pontos_positivos)}</div><div class="feedback"><h4>Como melhorar</h4>${list(c.pontos_melhoria)}</div></div>${issues.length ? `<h4>Ocorrências identificadas</h4>${issues.map((i) => `<div class="issue"><b>${esc(i.categoria || "Observação")}${i.trecho ? ` · “${esc(i.trecho)}”` : ""}</b>${esc(i.explicacao || "")} ${i.sugestao ? `<br><em>Sugestão: ${esc(i.sugestao)}</em>` : ""}</div>`).join("")}` : ""}</div></details>`;
}
function render(data) {
  const c5 = data.competencias.competencia_5,
    analysis = data.analise_estrutura || {};
  const positive = data.pontos_positivos.length
    ? list(data.pontos_positivos)
    : "<p>Veja os pontos destacados nas competências.</p>";
  result.innerHTML = `<div class="score-panel"><div><div class="score-caption">NOTA ESTIMADA</div><div class="total-score">${data.nota_total}<span>/1000</span></div><p>Estimativa pedagógica baseada nos critérios do ENEM.</p></div><div class="competency-bars">${keys
    .map((key, i) => {
      const note = data.competencias[key].nota;
      return `<div class="bar-card"><b>C${i + 1}</b><strong>${note}</strong><div class="meter"><i style="width:${note / 2}%"></i></div></div>`;
    })
    .join(
      "",
    )}</div></div><div class="result-intro"><div><p class="eyebrow">LEITURA GERAL</p><h2>${esc(data.comentario_final || "Sua correção está pronta.")}</h2><p>${esc(data.aviso)}</p></div><div class="insight"><b>O que você fez bem</b>${positive}</div></div><div class="competencies">${keys.map((_, i) => renderCompetency(data, i)).join("")}</div><div class="intervention"><p class="eyebrow">COMPETÊNCIA V</p><h3>Análise da proposta de intervenção</h3><div class="checks">${["agente", "acao", "meio", "finalidade", "detalhamento"].map((k) => `<span class="check ${c5[k]?.presente ? "" : "no"}">${c5[k]?.presente ? "✓" : "×"} ${k === "acao" ? "ação" : k} ${c5[k]?.texto ? `— ${esc(c5[k].texto)}` : ""}</span>`).join("")}<span class="check ${c5.respeita_direitos_humanos ? "" : "no"}">${c5.respeita_direitos_humanos ? "✓ Respeita" : "× Atenção aos"} direitos humanos</span></div></div><div class="structure"><h3>Como a redação foi organizada</h3><div class="structure-grid">${[
    ["Introdução", analysis.introducao],
    ["Desenvolvimento 1", analysis.desenvolvimento_1],
    ["Desenvolvimento 2", analysis.desenvolvimento_2],
    ["Conclusão", analysis.conclusao],
  ]
    .map(
      ([title, text]) =>
        `<div><b>${title}</b><p>${esc(text || "Não identificado de forma separada.")}</p></div>`,
    )
    .join(
      "",
    )}</div></div><div class="result-actions"><button class="button ghost" id="copy-feedback">Copiar feedback</button><button class="button new-correction">Corrigir outra redação</button></div>`;
  result.classList.remove("hidden");
  result.scrollIntoView({ behavior: "smooth", block: "start" });
  $("#copy-feedback").addEventListener("click", async (e) => {
    await navigator.clipboard.writeText(result.innerText);
    e.target.textContent = "Feedback copiado";
  });
  result.querySelector(".new-correction").addEventListener("click", () => {
    result.classList.add("hidden");
    form.scrollIntoView({ behavior: "smooth" });
  });
}
function saved() {
  try {
    return JSON.parse(localStorage.getItem("redacao-ia-history") || "[]");
  } catch {
    return [];
  }
}
function renderHistory() {
  const items = saved();
  if (!items.length) return;
  historySection.classList.remove("hidden");
  historyList.innerHTML = items
    .map(
      (item, i) =>
        `<button data-index="${i}"><small>${esc(item.date)}</small><strong>${item.resultado.nota_total}/1000</strong><span>${esc(item.tema || "Tema não informado")}</span></button>`,
    )
    .join("");
  historyList
    .querySelectorAll("button")
    .forEach(
      (button) =>
        (button.onclick = () => render(items[button.dataset.index].resultado)),
    );
}
function save(resultado) {
  const items = saved();
  items.unshift({
    date: new Date().toLocaleDateString("pt-BR"),
    tema: theme.value.trim(),
    redacao: essay.value,
    resultado,
  });
  localStorage.setItem("redacao-ia-history", JSON.stringify(items.slice(0, 8)));
  renderHistory();
}
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  error.textContent = "";
  if (essay.value.trim().length < 120) {
    error.textContent =
      "Escreva pelo menos 120 caracteres para receber uma correção útil.";
    essay.focus();
    return;
  }
  submit.disabled = true;
  submit.textContent = "Enviando…";
  loading.classList.remove("hidden");
  result.classList.add("hidden");
  try {
    const response = await fetch("/api/corrigir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tema: theme.value, redacao: essay.value }),
    });
    const body = await response.json();
    if (!response.ok || !body.success)
      throw new Error(body.error || "Não foi possível realizar a correção.");
    save(body.resultado);
    render(body.resultado);
  } catch (err) {
    error.textContent = err.message || "Ocorreu um problema. Tente novamente.";
  } finally {
    loading.classList.add("hidden");
    submit.disabled = false;
    submit.innerHTML = "Corrigir redação <span>→</span>";
  }
});
renderHistory();
updateCounter();
