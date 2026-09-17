# Redação IA

MVP local para correção pedagógica de redações no padrão ENEM usando a API Gemini. A chave fica exclusivamente no backend.

## Executar

1. Use Node.js 20 ou superior.
2. Copie `.env.example` para `.env` e informe sua chave: `GEMINI_API_KEY=sua_chave`.
3. Instale dependências: `npm install`.
4. Inicie: `npm run dev`.
5. Acesse `http://localhost:3000`.

Para obter uma chave, use o Google AI Studio. O modelo padrão é `gemini-2.5-flash`; altere `GEMINI_MODEL` no `.env` se necessário.

## Estrutura

- `frontend/`: interface estática, validação básica, histórico local e visualização.
- `backend/server.js`: Express, endpoint e integração Gemini.
- `backend/prompt.js`: instruções de avaliação e contrato JSON.
- `backend/validation.js`: limpeza, validação e cálculo da nota total.

## Endpoints

- `GET /api/health` → `{ "status": "ok" }`
- `POST /api/corrigir` → corpo `{ "tema": "opcional", "redacao": "..." }`

O servidor limita a redação a 12.000 caracteres e exige 120 caracteres mínimos. O retorno da IA é validado: todas as cinco competências devem existir, cada nota deve pertencer à escala 0/40/80/120/160/200 e o total é recalculado no backend.

## Testes

Execute `npm test`. Os testes cobrem extração de JSON, escala de notas e cálculo do total. A chave nunca é enviada ao navegador e `.env` está ignorado pelo Git.

## Limitações

A plataforma oferece uma estimativa para estudo; não substitui a correção oficial do INEP. A qualidade e disponibilidade dependem da API Gemini e da chave configurada.
