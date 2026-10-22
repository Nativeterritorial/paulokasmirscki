import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { checkAccess } from "../../../lib/auth";
import { getAllCompanies } from "../../../lib/companies";
import { getRaiox, saveRaiox } from "../../../lib/store";

export const runtime = "nodejs";

// Raio-X do negócio: o membro conta o que faz, o que oferece, o que procura e
// quem é o seu cliente; a IA cruza com as empresas da rede e devolve o Mapa de
// Oportunidades (quem pode ser cliente e quem pode ser parceiro/fornecedor).

const MAX = 5;

const norm = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

// plano B (sem IA): palavras em comum entre as respostas e cada empresa
function mapaSimples(respostas, companies) {
  const palavras = (t) => new Set(norm(t).split(/[^a-z0-9]+/).filter((w) => w.length > 3));
  const doCliente = palavras(`${respostas.cliente} ${respostas.oferece}`);
  const doProcura = palavras(respostas.procura);
  const nota = (c, set) => {
    const txt = palavras(`${c.nome} ${c.segmento} ${c.descricao} ${(c.atende || []).join(" ")}`);
    let n = 0;
    for (const w of set) if (txt.has(w)) n++;
    return n;
  };
  const top = (set) =>
    companies
      .map((c) => ({ c, n: nota(c, set) }))
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n)
      .slice(0, MAX)
      .map(({ c }) => ({ id: c.id, motivo: `Atua com ${c.segmento.toLowerCase()}.` }));
  return {
    resumo: "Separei empresas da rede que combinam com o que você contou.",
    clientes: top(doCliente),
    parceiros: top(doProcura),
  };
}

async function mapaComIA(respostas, companies) {
  const dir = companies
    .map((c) => `[${c.id}] ${c.nome} | ${c.segmento} | ${String(c.descricao || "").slice(0, 160)}`)
    .join("\n");
  const client = new Anthropic();
  const r = await client.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 2000,
    system: `Você monta o "Mapa de Oportunidades" de um membro do Ecossistema PK, a rede de negócios do Paulo Kasmirscki.
Com base no que o membro contou, escolha no diretório abaixo:
- "clientes": até ${MAX} empresas que podem COMPRAR o que o membro oferece (quem tem a necessidade que ele resolve);
- "parceiros": até ${MAX} empresas que podem FORNECER o que ele procura, ou ser parceiras naturais do negócio dele.
Não repita a mesma empresa nas duas listas e nunca escolha a própria empresa do membro. Para cada uma, escreva um "motivo" curto (até 14 palavras), concreto, em português do Brasil, dizendo por que a conexão faz sentido.
Escreva também um "resumo" de 1 frase calorosa sobre o potencial do membro na rede (sem citar nomes de empresas).
Use SOMENTE ids do diretório. Responda APENAS com JSON válido, sem texto antes ou depois, no formato:
{"resumo":"...","clientes":[{"id":"...","motivo":"..."}],"parceiros":[{"id":"...","motivo":"..."}]}

DIRETÓRIO:
${dir}`,
    messages: [
      {
        role: "user",
        content: `O que eu faço: ${respostas.faz}
O que tenho para oferecer à rede: ${respostas.oferece}
O que procuro agora: ${respostas.procura}
Meu cliente ideal: ${respostas.cliente}`,
      },
    ],
  });
  const txt = (r.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
  const json = JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1));
  return json;
}

// guarda só ids que existem, sem repetir, e junta nome/segmento/link para a tela
function limpar(mapa, companies) {
  const porId = Object.fromEntries(companies.map((c) => [c.id, c]));
  const usados = new Set();
  const lista = (arr) =>
    (Array.isArray(arr) ? arr : [])
      .filter((x) => x && porId[x.id] && !usados.has(x.id) && usados.add(x.id))
      .slice(0, MAX)
      .map((x) => ({ id: x.id, motivo: String(x.motivo || "").slice(0, 160) }));
  return {
    resumo: String(mapa?.resumo || "").slice(0, 300),
    clientes: lista(mapa?.clientes),
    parceiros: lista(mapa?.parceiros),
  };
}

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch (e) {}

  const { ok, member } = await checkAccess(body.code);
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });
  // o Raio-X fica guardado na conta da pessoa: precisa do acesso pessoal
  if (!member) return NextResponse.json({ ok: true, personal: false });

  if (body.action === "gerar") {
    const respostas = {
      faz: String(body.respostas?.faz || "").trim(),
      oferece: String(body.respostas?.oferece || "").trim(),
      procura: String(body.respostas?.procura || "").trim(),
      cliente: String(body.respostas?.cliente || "").trim(),
    };
    if (respostas.faz.length < 3 || respostas.oferece.length < 3) {
      return NextResponse.json(
        { ok: false, error: "Conte pelo menos o que você faz e o que tem para oferecer." },
        { status: 400 }
      );
    }
    const companies = await getAllCompanies();
    let mapa;
    try {
      mapa = limpar(await mapaComIA(respostas, companies), companies);
      if (!mapa.clientes.length && !mapa.parceiros.length) throw new Error("vazio");
    } catch (e) {
      mapa = limpar(mapaSimples(respostas, companies), companies);
    }
    const raiox = await saveRaiox(member.id, respostas, mapa);
    return NextResponse.json({ ok: true, personal: true, raiox: raiox || { respostas, mapa, chaveUsada: false } });
  }

  return NextResponse.json({ ok: true, personal: true, raiox: await getRaiox(member.id) });
}
