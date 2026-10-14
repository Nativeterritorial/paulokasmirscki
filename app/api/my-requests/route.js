import { NextResponse } from "next/server";
import { checkAccess } from "../../../lib/auth";
import { savePedido, getPedidosFor, setPedidoStatus } from "../../../lib/store";

export const runtime = "nodejs";

const ERROS = {
  campos: "Preencha os campos obrigatórios.",
  limite: "Você já tem pedidos em aberto. Aguarde o contato do Paulo.",
  indisponivel: "Não consegui enviar agora. Fale com o Paulo pelo WhatsApp.",
};

// Pedidos de "+ Novo projeto" e "+ Nova gestão" do próprio membro.
// action: "create" (com pedido) | "cancel" (com id) | nada = só listar.
// Só funciona com link pessoal: pelo código geral não dá pra saber quem é.
export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch (e) {}

  const { ok, member } = await checkAccess(body.code);
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });
  if (!member) return NextResponse.json({ ok: true, personal: false, pedidos: [] });

  if (body.action === "create") {
    const r = await savePedido(member, body.pedido || {});
    if (r.error) {
      return NextResponse.json(
        { ok: false, error: ERROS[r.error] || "Não consegui enviar. Tente novamente." },
        { status: 400 }
      );
    }
  }

  // cancelar: só um pedido do próprio membro que o Paulo ainda não começou a tratar
  if (body.action === "cancel" && body.id) {
    const alvo = (await getPedidosFor(member)).find((p) => p.id === String(body.id));
    if (alvo && alvo.status === "novo") await setPedidoStatus(alvo.id, "encerrado");
  }

  return NextResponse.json({ ok: true, personal: true, pedidos: await getPedidosFor(member) });
}
