const SCORES = new Set([0, 40, 80, 120, 160, 200]);
const KEYS = ["competencia_1", "competencia_2", "competencia_3", "competencia_4", "competencia_5"];
export function extractJson(text) { const clean = String(text || "").replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim(); const start = clean.indexOf("{"); const end = clean.lastIndexOf("}"); if (start < 0 || end < start) throw new Error("A IA não retornou JSON."); return JSON.parse(clean.slice(start, end + 1)); }
export function validateResult(data) {
  if (!data || typeof data !== "object" || !data.competencias) throw new Error("Estrutura de correção inválida.");
  for (const key of KEYS) { const item = data.competencias[key]; if (!item || !SCORES.has(item.nota) || typeof item.justificativa !== "string") throw new Error("Notas ou justificativas inválidas."); for (const list of ["pontos_positivos", "pontos_melhoria"]) if (!Array.isArray(item[list])) item[list] = []; if (!Array.isArray(item.problemas)) item.problemas = []; }
  const total = KEYS.reduce((sum, key) => sum + data.competencias[key].nota, 0);
  return { ...data, nota_total: total, pontos_positivos: Array.isArray(data.pontos_positivos) ? data.pontos_positivos : [], principais_pontos_melhoria: Array.isArray(data.principais_pontos_melhoria) ? data.principais_pontos_melhoria : [], analise_estrutura: data.analise_estrutura || {}, comentario_final: typeof data.comentario_final === "string" ? data.comentario_final : "", aviso: "Esta é uma estimativa pedagógica gerada por inteligência artificial e não representa uma nota oficial do ENEM." };
}
