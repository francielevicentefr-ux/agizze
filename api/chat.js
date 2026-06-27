// Função serverless (Vercel) — assistente de IA da Agizze.
// Aceita a chave de qualquer um destes provedores (a chave fica só no servidor):
//   - GROQ_API_KEY        -> Groq (gratuito, sem cartão)        [recomendado]
//   - OPENROUTER_API_KEY  -> OpenRouter (tem modelos :free)
//   - GEMINI_API_KEY      -> Google Gemini (free tier)
//   - ANTHROPIC_API_KEY   -> Claude (pago)
// Modelo opcional via AI_MODEL.

const SYSTEM = `Você é a assistente virtual de atendimento da AGIZZE, empresa de terceirização logística e recrutamento & seleção de Santa Catarina. Você atende pelo chat do site.

IDENTIDADE E TOM
- Apresente-se como assistente virtual da Agizze. Seja transparente que é um atendimento automático; nunca finja ser humana.
- Tom da marca: destemida (mas não arrogante), humana (mas não piegas), precisa (mas não fria), parceira e ágil. Frases curtas e diretas, em português do Brasil, sem jargão.
- Mensagens curtas (2 a 5 linhas). No máximo 1 emoji por mensagem, e só quando couber.

O QUE A AGIZZE FAZ
- Terceirização logística (carro-chefe): alocação e gestão de equipes em câmara fria, separação/picking, conferência, carga e descarga.
- Mão de obra temporária para picos e sazonalidade; cobertura de faltas.
- Recrutamento & Seleção para quem quer contratar direto (banco de talentos próprio, matching).
- Gestão e acompanhamento (Ponto de Controle: panorama da operação por WhatsApp).
- Prazos: resposta a uma demanda em até 24h, início da operação em até 7 dias, reposição de vaga em até 48h.
- Atuação: Santa Catarina, com expansão pelo Sul e Sudeste. Instagram @agizzerh. WhatsApp (47) 99655-8404.
- Endereço (escritório): Rua Alberto Werner, 370, Itajaí/SC. Informe quando perguntarem onde a Agizze fica.

IDENTIFIQUE O PÚBLICO E AJA
1) EMPRESA (quer contratar/terceirizar): qualifique com poucas perguntas — nome, empresa, cidade, quantas vagas, tipo de contratação (CLT/temporário) e urgência. Diga que a equipe comercial retorna com proposta sob medida em até 24h úteis. Ofereça falar no WhatsApp (47) 99655-8404 ou preencher o formulário de proposta no site.
2) CANDIDATO (procura vaga): seja acolhedora. Direcione para o Portal de Vagas (/vagas.html) e para o cadastro no Banco de Talentos. Pergunte área de interesse, cidade e experiência. Reforce que o cadastro é gratuito.

REGRAS (IMPORTANTE)
- NUNCA informe preços ou valores fechados. O investimento varia por vaga/volume/modelo — diga que a equipe envia proposta sob medida.
- NÃO invente números, cases ou nomes de clientes além do que a empresa divulga publicamente.
- Ao pedir dados pessoais, deixe claro que serão usados apenas para o contato da Agizze (LGPD).
- Encaminhe para um humano (WhatsApp) quando: negociação de valores, reclamação, urgência crítica, ou quando não souber a resposta.
- Seja honesta sobre o que não sabe. Nunca prometa o que não pode cumprir.

OBJETIVO
- Empresa: captar a necessidade e o contato para a proposta.
- Candidato: levar ao cadastro no Banco de Talentos / Portal de Vagas.
- Sempre encerrar com um próximo passo claro.`;

function readMessages(payload) {
  const incoming = Array.isArray(payload.messages) ? payload.messages : [];
  return incoming.slice(-12).map(function (m) {
    return {
      role: m && m.role === 'assistant' ? 'assistant' : 'user',
      content: String((m && m.content) || '').slice(0, 2000)
    };
  }).filter(function (m) { return m.content.length > 0; });
}

// OpenAI-compatible (Groq, OpenRouter)
async function callOpenAICompat(url, key, model, messages, extraHeaders) {
  const msgs = [{ role: 'system', content: SYSTEM }].concat(messages);
  const headers = Object.assign({ 'content-type': 'application/json', authorization: 'Bearer ' + key }, extraHeaders || {});
  const r = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ model: model, max_tokens: 500, temperature: 0.6, messages: msgs })
  });
  if (!r.ok) return null;
  const data = await r.json();
  try { return (data.choices[0].message.content || '').trim() || null; } catch (e) { return null; }
}

async function callGemini(key, model, messages) {
  const contents = messages.map(function (m) {
    return { role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] };
  });
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
    encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(key);
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM }] },
      contents: contents,
      generationConfig: { maxOutputTokens: 500, temperature: 0.6 }
    })
  });
  if (!r.ok) return null;
  const data = await r.json();
  try { return data.candidates[0].content.parts.map(function (p) { return p.text || ''; }).join('').trim() || null; }
  catch (e) { return null; }
}

async function callClaude(key, model, messages) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: model || 'claude-sonnet-4-6', max_tokens: 500, system: SYSTEM, messages: messages })
  });
  if (!r.ok) return null;
  const data = await r.json();
  try { return data.content[0].text.trim() || null; } catch (e) { return null; }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const env = process.env;
  const hasKey = env.GROQ_API_KEY || env.OPENROUTER_API_KEY || env.GEMINI_API_KEY || env.ANTHROPIC_API_KEY;
  if (!hasKey) {
    res.status(200).json({ reply: 'O atendimento por IA está sendo configurado. Enquanto isso, fale com a gente no WhatsApp (47) 99655-8404 ou pelo formulário do site. 🙂' });
    return;
  }

  let payload = req.body;
  if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch (e) { payload = {}; } }
  if (!payload || typeof payload !== 'object') payload = {};

  const messages = readMessages(payload);
  if (!messages.length) {
    res.status(200).json({ reply: 'Oi! Como posso ajudar — você é uma empresa que precisa contratar ou está procurando uma vaga?' });
    return;
  }

  try {
    let reply = null;
    if (env.GROQ_API_KEY) {
      reply = await callOpenAICompat('https://api.groq.com/openai/v1/chat/completions', env.GROQ_API_KEY, env.AI_MODEL || 'llama-3.3-70b-versatile', messages);
    }
    if (!reply && env.OPENROUTER_API_KEY) {
      reply = await callOpenAICompat('https://openrouter.ai/api/v1/chat/completions', env.OPENROUTER_API_KEY, env.AI_MODEL || 'meta-llama/llama-3.3-70b-instruct:free', messages, { 'HTTP-Referer': 'https://agizze.vercel.app', 'X-Title': 'Agizze' });
    }
    if (!reply && env.GEMINI_API_KEY) {
      reply = await callGemini(env.GEMINI_API_KEY, env.AI_MODEL || 'gemini-2.0-flash', messages);
    }
    if (!reply && env.ANTHROPIC_API_KEY) {
      reply = await callClaude(env.ANTHROPIC_API_KEY, env.AI_MODEL, messages);
    }
    if (!reply) reply = 'Tive um problema técnico agora. Pode tentar de novo, ou falar no WhatsApp (47) 99655-8404.';
    res.status(200).json({ reply: reply });
  } catch (e) {
    res.status(200).json({ reply: 'Estou com um problema técnico no momento. Fale com a gente no WhatsApp (47) 99655-8404 que a equipe te atende. 🙂' });
  }
};
