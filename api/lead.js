// Função serverless (Vercel) — notifica o setor comercial a cada contato pelo chat.
// Dispara para os canais configurados (qualquer combinação):
//   - LEAD_WEBHOOK_URL  -> POST JSON (n8n / Make / Slack / Discord)   [recomendado]
//   - TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID -> mensagem no Telegram
//   - SUPABASE_URL + SUPABASE_SERVICE_KEY   -> grava em leads_chat (registro durável)
// Se nada estiver configurado, apenas responde ok (não quebra o chat).

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  let p = req.body;
  if (typeof p === 'string') { try { p = JSON.parse(p); } catch (e) { p = {}; } }
  if (!p || typeof p !== 'object') p = {};

  const messages = Array.isArray(p.messages) ? p.messages.slice(-20) : [];
  const page = String(p.page || 'site').slice(0, 120);
  if (!messages.length) { res.status(200).json({ ok: true }); return; }

  const transcript = messages.map(function (m) {
    const who = m && m.role === 'assistant' ? 'Agizze' : 'Visitante';
    return who + ': ' + String((m && m.content) || '').slice(0, 1000);
  }).join('\n');

  const userText = messages.filter(function (m) { return m && m.role !== 'assistant'; })
    .map(function (m) { return String((m && m.content) || ''); }).join(' ');
  const phone = ((userText.match(/(\+?\d[\d\s().-]{8,}\d)/) || [])[0] || '').trim();

  const header = '🟠 Novo contato no chat do site Agizze (' + page + ')';
  const text = header + (phone ? ('\nTelefone detectado: ' + phone) : '') + '\n\n' + transcript;

  const env = process.env;
  const tasks = [];

  if (env.LEAD_WEBHOOK_URL) {
    tasks.push(fetch(env.LEAD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: text, content: text, page: page, phone: phone, transcript: transcript, messages: messages })
    }).catch(function () {}));
  }

  // WhatsApp direto via Evolution API (sem n8n)
  if (env.EVOLUTION_URL && env.EVOLUTION_INSTANCE && env.EVOLUTION_APIKEY && env.COMERCIAL_NUMBER) {
    const base = env.EVOLUTION_URL.replace(/\/+$/, '');
    const url = base + '/message/sendText/' + env.EVOLUTION_INSTANCE;
    const headers = { 'content-type': 'application/json', apikey: env.EVOLUTION_APIKEY };
    tasks.push((async function () {
      try {
        let r = await fetch(url, { method: 'POST', headers: headers, body: JSON.stringify({ number: env.COMERCIAL_NUMBER, text: text }) });
        if (!r || !r.ok) {
          // fallback formato Evolution v1
          await fetch(url, { method: 'POST', headers: headers, body: JSON.stringify({ number: env.COMERCIAL_NUMBER, textMessage: { text: text } }) });
        }
      } catch (e) {}
    })());
  }

  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    tasks.push(fetch('https://api.telegram.org/bot' + env.TELEGRAM_BOT_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: text.slice(0, 4000), disable_web_page_preview: true })
    }).catch(function () {}));
  }

  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
    tasks.push(fetch(env.SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/leads_chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        apikey: env.SUPABASE_SERVICE_KEY,
        authorization: 'Bearer ' + env.SUPABASE_SERVICE_KEY,
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ page: page, phone: phone || null, transcript: transcript })
    }).catch(function () {}));
  }

  try { await Promise.all(tasks); } catch (e) {}
  res.status(200).json({ ok: true });
};
