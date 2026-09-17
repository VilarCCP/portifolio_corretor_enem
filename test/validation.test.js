import test from "node:test";
import assert from "node:assert/strict";
import { extractJson, validateResult } from "../backend/validation.js";
const valid = () => ({ competencias: Object.fromEntries([1,2,3,4,5].map(n => [`competencia_${n}`, { nota: 160, justificativa: "Justificativa", pontos_positivos: [], pontos_melhoria: [] }])), pontos_positivos: [] });
test("recalcula a nota total a partir das competências", () => assert.equal(validateResult(valid()).nota_total, 800));
test("rejeita notas fora da matriz ENEM", () => { const result = valid(); result.competencias.competencia_1.nota = 173; assert.throws(() => validateResult(result)); });
test("extrai JSON mesmo quando vem em bloco markdown", () => assert.equal(extractJson("```json\n{\"ok\":true}\n``` ").ok, true));
