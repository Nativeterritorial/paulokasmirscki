import { NextResponse } from "next/server";
import { checkAccess } from "../../../lib/auth";
import {
  savePedido,
  getPedidosFor,
  getPedidosBySegredo,
  setPedidoStatus,
  saveFoto,
  addPedidoMsg,
  markPedidoRead,
} from "../../../lib/store";

export const runtime = "nodejs";

const ERROS = {
  campos: "Preencha os campos obrigatórios.",
  contato: "Preencha seu nome e WhatsApp.",
  proprietario: "Confirme que você é o proprietário ou tem autorização dele.",
  limite: "Você já tem pedidos em aberto. Aguarde o contato do Paulo.",
  indisponivel: "Não consegui enviar agora. Fale com o Paulo pelo WhatsApp.",
};

// Pedidos de "+ Novo projeto" e "+ Nova gestão".
// action: "create" (com pedido) | "cancel" (com id) | nada = só listar.
// Com link pessoal vale tudo do membro; pelo código geral vale o que este
// aparelho pediu (body.meus = [{ id, s }]).
export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch (e) {}

  const { ok, member } = await checkAccess(body.code);
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });

  // foto do imóvel (uma por vez, já reduzida no navegador)
  if (body.action === "foto") {
    const id = await saveFoto(body.data);
    if (!id) {
      return NextResponse.json({ ok: false, error: "Não consegui enviar essa foto." }, { status: 400 });
    }
    return NextResponse.json({ ok: true, id });
  }

  // de quem são os pedidos: do membro (link pessoal) ou deste aparelho
  // (pelo código geral, o aparelho guarda a chave secreta de cada pedido)
  const listar = () => (member ? getPedidosFor(member) : getPedidosBySegredo(body.meus));

  let criado = null;
  if (body.action === "create") {
    const p = body.pedido || {};
    const r = await savePedido(member || { id: "", nome: p.nome, whatsapp: p.whatsapp }, p);
    if (r.error) {
      return NextResponse.json(
        { ok: false, error: ERROS[r.error] || "Não consegui enviar. Tente novamente." },
        { status: 400 }
      );
    }
    criado = { id: r.id, s: r.segredo };
  }

  // conversa: só nos pedidos da própria pessoa
  if ((body.action === "msg" || body.action === "read") && body.id) {
    const alvo = (await listar()).find((p) => p.id === String(body.id));
    if (!alvo) {
      return NextResponse.json({ ok: false, error: "Pedido não encontrado." }, { status: 404 });
    }
    if (body.action === "msg") {
      const ok2 = await addPedidoMsg(alvo.id, "cliente", body.texto);
      if (!ok2) {
        return NextResponse.json({ ok: false, error: "Escreva a sua mensagem." }, { status: 400 });
      }
    } else {
      await markPedidoRead(alvo.id, "cliente");
    }
  }

  // cancelar: só um pedido do próprio membro que o Paulo ainda não começou a tratar
  if (body.action === "cancel" && body.id) {
    const alvo = (await listar()).find((p) => p.id === String(body.id));
    if (alvo && alvo.status === "novo") await setPedidoStatus(alvo.id, "encerrado");
  }

  return NextResponse.json({ ok: true, personal: !!member, pedidos: await listar(), criado });
}
