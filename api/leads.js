// Função serverless (Vercel) — lista os leads do chat para o painel do comercial.
// Protegida por LEADS_TOKEN. Lê do Supabase com a service key (somente no servidor).

module.exports = async function handler(req, res) {
  const env = process.env;
  const token = (req.query && req.query.token) || '';

  if (!env.LEADS_TOKEN || token !== env.LEADS_TOKEN) {
    res.status(401).json({ error: 'Não autorizado' });
    return;
  }
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    res.status(200).json({ leads: [] });
    return;
  }

  try {
    const url = env.SUPABASE_URL.replace(/\/+$/, '') +
      '/rest/v1/leads_chat?select=id,page,phone,transcript,criado_em&order=criado_em.desc&limit=100';
    const r = await fetch(url, {
      headers: { apikey: env.SUPABASE_SERVICE_KEY, authorization: 'Bearer ' + env.SUPABASE_SERVICE_KEY }
    });
    if (!r.ok) { res.status(200).json({ leads: [] }); return; }
    const data = await r.json();
    res.status(200).json({ leads: Array.isArray(data) ? data : [] });
  } catch (e) {
    res.status(200).json({ leads: [] });
  }
};
