import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { logQuery } from "../../../lib/store";
import { getAllCompanies } from "../../../lib/companies";

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
      `- ${c.nome} | Segmento: ${c.segmento} | Atende: ${c.atende.join(
        ", "
      )} | ${c.descricao} | Contato: ${c.linkLabel} (${c.link})`
  ).join("\n");

  return `Você é o "Concierge do Ecossistema", o assistente de IA da rede de negócios do Paulo Kasmirscki.

O cliente que conversa com você já faz parte do ecossistema. Sua função é entender o que ele precisa (em linguagem natural) e recomendar a empresa CERTA da rede, oferecendo conectá-lo.

DIRETÓRIO DE EMPRESAS DA REDE (use SOMENTE estas — não invente outras):
${dir}

REGRAS:
- Responda sempre em português do Brasil, com tom caloroso, simpático e objetivo.
- Quando o pedido casar com uma empresa do diretório, recomende-a pelo nome, explique em 1 frase por que ela serve, e ofereça conectar ("Quer que eu te conecte? O Paulo faz a ponte.").
- Se nenhuma empresa do diretório atender, seja honesto e transforme em oportunidade: diga que ainda não há uma empresa para isso na rede, que você vai REGISTRAR o pedido e que o Paulo vai buscar e validar um parceiro de confiança. Se o pedido for vago ou faltar contexto importante (cidade/região, tipo de produto/serviço, prazo), faça UMA pergunta curta pra qualificar melhor a demanda antes de encerrar (ex.: "Em qual cidade/região você precisa?"). Nunca invente nomes de empresas de fora da rede nem prometa fornecedores específicos — quem busca e valida é o Paulo.
- Pode recomendar mais de uma se fizer sentido.
- Seja breve (até ~4 linhas). Não invente preços, telefones ou dados que não estão no diretório.
- O Paulo é sempre a ponte entre o cliente e a empresa.
- IMPORTANTE: escreva em TEXTO SIMPLES. NÃO use markdown — nada de asteriscos (**) nem links em colchetes [texto](url). Cite o nome da empresa normalmente e, se mencionar um site, escreva o endereço direto (ex.: visaradigital.com.br).`;
}

export async function POST(req) {
  let messages = [];
  let code = "";
  try {
    const body = await req.json();
    messages = Array.isArray(body.messages) ? body.messages : [];
    code = (body.code || "").trim();
  } catch (e) {}

  // gate simples de acesso
  const expected = process.env.AREA_CODE || "teste123";
  if (code !== expected) {
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
        const stream = client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system: [
            {
              type: "text",
              text: buildSystem(companies),
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: clean,
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
        const recs = detectRecommended(full, companies);
        if (recs.length) {
          controller.enqueue(encoder.encode(`@@REC:${recs.join(",")}@@`));
        }
        // registra a pergunta + empresas recomendadas (não bloqueia a resposta)
        const lastUser = [...clean].reverse().find((m) => m.role === "user");
        logQuery(lastUser?.content || "", recs).catch(() => {});
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
