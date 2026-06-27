// Função serverless (Vercel) — assistente de IA da Agizze.
// A chave da Anthropic fica só no servidor (env ANTHROPIC_API_KEY), nunca no navegador.

const SYSTEM = `Você é a assistente virtual de atendimento da AGIZZE, empresa de terceirização logística e recrutamento & seleção de Santa Catarina. Você atende pelo chat do site agizze.

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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(200).json({
      reply: 'O atendimento por IA está sendo configurado. Enquanto isso, fale com a gente no WhatsApp (47) 99655-8404 ou pelo formulário do site. 🙂'
    });
    return;
  }

  // Lê o corpo (Vercel costuma entregar req.body já parseado; mas garantimos)
  let payload = req.body;
  if (typeof payload === 'string') {
    try { payload = JSON.parse(payload); } catch (e) { payload = {}; }
  }
  if (!payload || typeof payload !== 'object') payload = {};

  const incoming = Array.isArray(payload.messages) ? payload.messages : [];
  const messages = incoming
    .slice(-12)
    .map(function (m) {
      return {
        role: m && m.role === 'assistant' ? 'assistant' : 'user',
        content: String((m && m.content) || '').slice(0, 2000)
      };
    })
    .filter(function (m) { return m.content.length > 0; });

  if (!messages.length) {
    res.status(200).json({ reply: 'Oi! Como posso ajudar — você é uma empresa que precisa contratar ou está procurando uma vaga?' });
    return;
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        system: SYSTEM,
        messages: messages
      })
    });

    if (!r.ok) {
      res.status(200).json({
        reply: 'Tive um problema técnico agora. Pode tentar de novo, ou falar no WhatsApp (47) 99655-8404.'
      });
      return;
    }

    const data = await r.json();
    const reply =
      data && Array.isArray(data.content) && data.content[0] && data.content[0].text
        ? data.content[0].text
        : 'Desculpe, não consegui responder agora. Fale com a gente no WhatsApp (47) 99655-8404.';

    res.status(200).json({ reply: reply });
  } catch (e) {
    res.status(200).json({
      reply: 'Estou com um problema técnico no momento. Fale com a gente no WhatsApp (47) 99655-8404 que a equipe te atende. 🙂'
    });
  }
};
