import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { logQuery, logDemand } from "../../../lib/store";
import { getAllCompanies } from "../../../lib/companies";
import { checkAccess } from "../../../lib/auth";

export const runtime = "nodejs";

// Detecta quais empresas do diretório foram citadas na resposta da IA
function detectRecommended(reply, companies) {
  const low = String(reply || "").toLowerCase();
  return companies
    .filter((c) => low.includes(c.nome.toLowerCase()))
    .map((c) => c.id);
}

function buildSystem(companies) {
  const dir = companies.map(
    (c) =>
      `- [${c.id}] ${c.nome} | Segmento: ${c.segmento} | Atende: ${c.atende.join(
        ", "
      )} | ${c.descricao} | Contato: ${c.linkLabel} (${c.link})`
  ).join("\n");

  return `Você é o "Concierge do Ecossistema", o assistente de IA da rede de negócios do Paulo Kasmirscki.

O cliente que conversa com você já faz parte do ecossistema. Sua função é entender o que ele precisa (em linguagem natural) e recomendar a empresa CERTA da rede, oferecendo conectá-lo.

DIRETÓRIO DE EMPRESAS DA REDE (use SOMENTE estas — não invente outras):
${dir}

REGRAS:
- Responda sempre em português do Brasil, com tom caloroso, simpático e objetivo.
- Quando a pessoa pedir DIRETAMENTE um fornecedor, profissional ou empresa (ex.: "preciso de um contador", "quem faz placas?", "indica um fotógrafo"), recomende a empresa do diretório pelo nome, explique em 1 frase por que ela serve, e ofereça conectar ("Quer que eu te conecte? O Paulo faz a ponte.").
- PROJETOS E INFORMAÇÃO SEM NOMES: quando a pessoa trouxer um PROJETO (abrir um negócio — ex.: eletroposto, loja, restaurante —, construir ou reformar, vender imóvel, organizar a empresa ou as finanças) ou fizer uma pergunta de INFORMAÇÃO (como fazer, o que precisa, documentos, custos), NÃO cite nomes de empresas da rede nem de fora. Explique o caminho e ofereça o serviço do Paulo (marcador de serviço) e, se fizer sentido, o roteiro de serviços (marcador de time) — quem escolhe e apresenta os parceiros é o Paulo.
- Se nenhuma empresa do diretório atender, seja honesto e transforme em oportunidade: diga que ainda não há uma empresa para isso na rede, que você vai REGISTRAR o pedido e que o Paulo vai buscar e validar um parceiro de confiança. Sugira também publicar no Mural de Oportunidades, onde as empresas da rede veem e respondem, e acrescente o marcador de serviço @@SERV:mural@@ (o sistema mostra o botão "Publicar no Mural"). Use esse marcador também quando a pessoa quiser divulgar uma vaga de emprego, buscar colaboradores ou oferecer algo para a rede. Se o pedido for vago ou faltar contexto importante (cidade/região, tipo de produto/serviço, prazo), faça UMA pergunta curta pra qualificar melhor a demanda antes de encerrar (ex.: "Em qual cidade/região você precisa?"). Nunca invente nomes de empresas de fora da rede nem prometa fornecedores específicos — quem busca e valida é o Paulo.
- Pode recomendar mais de uma se fizer sentido.
- Seja breve (até ~4 linhas). Não invente preços, telefones ou dados que não estão no diretório.
- O Paulo é sempre a ponte entre o cliente e a empresa.
- SERVIÇOS DO PAULO: além das empresas, o Paulo conduz serviços completos. Quando o pedido for um desses caminhos, explique o serviço em 1 frase e, NO FINAL da resposta, em linha separada, acrescente UM marcador (o sistema mostra um cartão com botão; nunca comente o marcador):
  · construir casa, pavilhão, prédio, comercial, reforma grande, "tenho um terreno e quero construir" → serviço "Do Terreno às Chaves" (11 fases, do terreno à entrega das chaves) → @@SERV:obra@@
  · abrir um negócio/empresa/loja → serviço "Da ideia à abertura" → @@SERV:projeto@@
  · quero vender meu imóvel → cadastro de imóvel na vitrine → @@SERV:imovel@@
  · organizar a empresa, gestão, finanças do negócio, crescer com planejamento → "Gestor de negócios" → @@SERV:gestao@@
- CHAVE PK: o acesso livre a uma empresa é pelo site ou Instagram dela (botão no cartão). O contato com o dono/responsável NÃO é passado direto: ele é feito pela "Chave PK", uma apresentação pessoal do Paulo, que passa por análise (Pedido → Análise do Paulo → Apresentação → Conexão). Se o cliente pedir telefone, WhatsApp ou contato pessoal do dono, nunca informe: explique com simpatia que esse acesso é pela Chave PK e que ele pode solicitar pelo botão com o cadeado no cartão da empresa. Ao recomendar uma empresa, você pode mencionar que, além do site/Instagram, existe a Chave PK para uma apresentação feita pelo Paulo.
- MONTE MEU TIME: quando o pedido for um projeto ou momento que envolve VÁRIOS tipos de serviço (ex.: casamento, festa, aniversário, evento da empresa, construir ou reformar, mobiliar a casa nova, abrir uma empresa, mudar de cidade, cuidar da saúde e do corpo), monte um ROTEIRO DE SERVIÇOS: de 4 a 8 serviços que esse projeto costuma precisar, na ordem em que acontecem. NESSA resposta NÃO cite nomes de empresas: escreva 1 ou 2 frases curtas dizendo que montou o roteiro, que a pessoa marca os serviços que precisa e que o Paulo seleciona as melhores opções de parceiros para cada um. NO FINAL, em linha separada, acrescente UM marcador exatamente neste formato: @@TIME:Título curto|Serviço=id,id;Serviço=id;Serviço=@@ — depois de cada serviço, liste os ids (entre colchetes no diretório) das empresas da rede que fazem aquele serviço, separados por vírgula, ou deixe vazio se nenhuma faz. Ex.: @@TIME:Seu casamento|Vestido e trajes=davinanoivas;Fotografia e filmagem=adilsonchaves,tonmuller;Buffet=@@. Os nomes dos serviços são curtos (até 4 palavras). Os ids são só para o Paulo (o cliente não vê). Pode usar junto o marcador de serviço (@@SERV:...@@) quando o caminho for obra ou abertura de empresa. Não use o marcador de time para pedidos de uma única empresa.
- BUSCA NA INTERNET: você tem a ferramenta de busca na web. Use-a SOMENTE para perguntas de INFORMAÇÃO que dependem de dados atuais ou que você não sabe com segurança — por exemplo: documentos e etapas para abrir uma empresa ou MEI, alvarás e licenças em Veranópolis/RS, financiamento imobiliário, impostos, normas, prazos, preços médios de mercado, eventos e notícias da região. Responda de forma curta e prática, em até ~6 linhas, e diga de onde veio a informação citando só o nome do site (ex.: segundo o site da Receita Federal). NUNCA use a busca para indicar empresas, profissionais ou fornecedores — nem de fora nem da rede (veja "Projetos e informação sem nomes"). Não busque para saudações, para perguntas sobre a rede ou sobre os serviços do Paulo. Quando a informação levar a um serviço do Paulo (ex.: abrir empresa, construir), ofereça também o serviço com o marcador correspondente.
- IMPORTANTE: escreva em TEXTO SIMPLES. NÃO use markdown — nada de asteriscos (**) nem links em colchetes [texto](url). Cite o nome da empresa normalmente e, se mencionar um site, escreva o endereço direto (ex.: visaradigital.com.br).

REGISTRO DE DEMANDA (uso interno):
- Quando — e SOMENTE quando — o cliente expressar uma necessidade REAL de produto/serviço que NENHUMA empresa do diretório atende, acrescente NO FINAL da sua resposta, em uma linha separada, um marcador exatamente neste formato: @@GAP:descrição curta da necessidade@@
- A descrição deve ser objetiva e em terceira pessoa, juntando o que você entendeu da conversa, incluindo cidade/região se o cliente disse. Ex.: @@GAP:Empresa de segurança e monitoramento em Veranópolis/RS@@
- Use apenas UM marcador por resposta, resumindo a necessidade principal (não repita um por mensagem).
- NÃO emita o marcador para saudações, agradecimentos, conversa fiada, perguntas genéricas, nem quando você recomendou alguma empresa do diretório. Nesses casos, responda normalmente SEM o marcador.
- O marcador é invisível para o cliente (o sistema o remove). Nunca o comente nem o explique.`;
}

export async function POST(req) {
  let messages = [];
  let code = "";
  try {
    const body = await req.json();
    messages = Array.isArray(body.messages) ? body.messages : [];
    code = (body.code || "").trim();
  } catch (e) {}

  // gate de acesso: link pessoal do membro ou código geral
  const { ok } = await checkAccess(code);
  if (!ok) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      "⚙️ A IA ainda não foi ativada. Para ligar o concierge, adicione a sua chave ANTHROPIC_API_KEY (no .env.local em teste, ou nas variáveis de ambiente da Vercel em produção). Enquanto isso, o diretório ao lado já funciona — é só clicar em \"Conectar\".",
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  // só as últimas 12 mensagens, e garante começar com 'user'
  const clean = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content)
    .slice(-12)
    .map((m) => ({ role: m.role, content: String(m.content) }));
  while (clean.length && clean[0].role !== "user") clean.shift();
  if (!clean.length) {
    return new Response("Olá! Me conte o que você precisa.", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // lista combinada: empresas fixas + as cadastradas pelo Paulo no painel
  const companies = await getAllCompanies();

  const client = new Anthropic();
  const encoder = new TextEncoder();

  // resposta em streaming: texto puro + marcador final @@REC:id1,id2@@
  // com as empresas recomendadas (o front transforma em cards "Conectar")
  const body = new ReadableStream({
    async start(controller) {
      let full = "";
      try {
        // conversa enviada à IA nesta resposta (cresce se a busca pausar a resposta)
        const conversa = [...clean];
        let final = null;
        // a busca na web roda no servidor da Anthropic; se a resposta pausar no
        // meio (pause_turn), continua de onde parou (no máximo 3 rodadas)
        for (let rodada = 0; rodada < 3; rodada++) {
          const stream = client.beta.messages.stream({
            model: "claude-opus-5-5",
            max_tokens: 16000,
            // chat: respostas rápidas e diretas
            output_config: { effort: "low" },
            // se o modelo recusar por segurança, outro modelo assume na mesma chamada
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
            tools: [
              {
                type: "web_search_20260209",
                name: "web_search",
                max_uses: 3,
                user_location: {
                  type: "approximate",
                  city: "Veranópolis",
                  region: "Rio Grande do Sul",
                  country: "BR",
                  timezone: "America/Sao_Paulo",
                },
              },
            ],
            system: [
              {
                type: "text",
                text: buildSystem(companies),
                cache_control: { type: "ephemeral" },
              },
            ],
            messages: conversa,
          });
          for await (const ev of stream) {
            if (
              ev.type === "content_block_delta" &&
              ev.delta?.type === "text_delta"
            ) {
              full += ev.delta.text;
              controller.enqueue(encoder.encode(ev.delta.text));
            }
          }
          final = await stream.finalMessage();
          if (final.stop_reason !== "pause_turn") break;
          conversa.push({ role: "assistant", content: final.content });
        }
        if (final?.stop_reason === "refusal" && !full.trim()) {
          const aviso = "Não consigo ajudar com isso por aqui. Me conte de outro jeito o que você precisa que eu procuro na rede.";
          full = aviso;
          controller.enqueue(encoder.encode(aviso));
        }
        // separa o marcador de demanda @@GAP:...@@ do texto
        const gapMatch = full.match(/@@GAP:([^@]*)@@/);
        const gapText = gapMatch ? gapMatch[1].trim() : "";
        const visibleFull = full
          .replace(/@@GAP:[^@]*@@/g, "")
          .replace(/@@TIME:[^@]*@@/g, "")
          .trim();

        // empresas do time (se houver) não viram cartões soltos: aparecem no cartão do time
        const timeMatch = full.match(/@@TIME:([^@]*)@@/);
        const timeIds = timeMatch
          ? timeMatch[1]
              .split("|")
              .slice(1)
              .join("|")
              .split(";")
              .flatMap((x) => (x.split("=")[1] || "").split(","))
              .map((id) => id.trim())
              .filter(Boolean)
          : [];
        const servPaulo = /@@SERV:(obra|projeto|gestao|imovel)@@/.test(full);
        const recs = timeMatch || servPaulo
          ? []
          : detectRecommended(visibleFull, companies);
        if (recs.length) {
          controller.enqueue(encoder.encode(`@@REC:${recs.join(",")}@@`));
        }
        // registra a pergunta + empresas recomendadas (não bloqueia a resposta)
        const lastUser = [...clean].reverse().find((m) => m.role === "user");
        logQuery(lastUser?.content || "", [...new Set([...recs, ...timeIds])]).catch(() => {});
        // registra a DEMANDA resumida pela IA, se houver (radar do Paulo)
        if (gapText && recs.length === 0) {
          logDemand(gapText).catch(() => {});
        }
      } catch (err) {
        const msg =
          err instanceof Anthropic.APIError
            ? `Erro da IA (${err.status}). Verifique a chave/variável de ambiente.`
            : "Não consegui responder agora. Tente novamente.";
        controller.enqueue(
          encoder.encode(full ? `\n\n⚠️ ${msg}` : `⚠️ ${msg}`)
        );
      }
      controller.close();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
