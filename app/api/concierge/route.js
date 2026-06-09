import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { COMPANIES } from "../../area/companies";

export const runtime = "nodejs";

function buildSystem() {
  const dir = COMPANIES.map(
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
- Se nenhuma empresa do diretório atender, seja honesto: diga que ainda não há uma empresa para isso na rede e que o Paulo vai buscar um parceiro.
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
    return NextResponse.json({
      reply:
        "⚙️ A IA ainda não foi ativada. Para ligar o concierge, adicione a sua chave ANTHROPIC_API_KEY (no .env.local em teste, ou nas variáveis de ambiente da Vercel em produção). Enquanto isso, o diretório ao lado já funciona — é só clicar em \"Conectar\".",
    });
  }

  // só as últimas 12 mensagens, e garante começar com 'user'
  const clean = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content)
    .slice(-12)
    .map((m) => ({ role: m.role, content: String(m.content) }));
  while (clean.length && clean[0].role !== "user") clean.shift();
  if (!clean.length) {
    return NextResponse.json({ reply: "Olá! Me conte o que você precisa." });
  }

  try {
    const client = new Anthropic();
    const resp = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: buildSystem(),
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: clean,
    });
    const reply = resp.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    return NextResponse.json({ reply: reply || "..." });
  } catch (err) {
    const msg =
      err instanceof Anthropic.APIError
        ? `Erro da IA (${err.status}). Verifique a chave/ável de ambiente.`
        : "Não consegui responder agora. Tente novamente.";
    return NextResponse.json({ reply: `⚠️ ${msg}` }, { status: 200 });
  }
}
