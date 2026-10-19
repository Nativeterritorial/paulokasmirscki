import { NextResponse } from "next/server";
import { checkAccess } from "../../../lib/auth";
import {
  getMuralFor,
  saveMuralPost,
  muralInteresse,
  encerrarMuralPost,
} from "../../../lib/store";

export const runtime = "nodejs";

const ERROS = {
  conta: "Para usar o Mural, entre com a sua conta (cadastro com WhatsApp e senha).",
  plano: "Essa função é do Plano Ecossistema.",
  campos: "Preencha o título e a descrição.",
  tipo: "Escolha o tipo da publicação.",
  limite: "Você já tem 5 publicações no ar. Encerre uma para publicar outra.",
  fechado: "Essa publicação já saiu do ar.",
  proprio: "Essa publicação é sua.",
  contato: "Preencha seu nome e WhatsApp.",
  repetido: "Você já demonstrou interesse nessa publicação.",
  cheio: "Essa publicação já recebeu muitos interessados.",
  indisponivel: "Não consegui agora. Tente de novo em instantes.",
  falha: "Não consegui agora. Tente de novo em instantes.",
};

// Mural de Oportunidades na Área de Membros.
// action: "create" (post) | "interesse" (id, + msg/empresa/link) | "encerrar" (id) | nada = listar
export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch (e) {}

  const { ok, member } = await checkAccess(body.code);
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });

  const erro = (code) =>
    NextResponse.json({ ok: false, error: ERROS[code] || ERROS.falha, code }, { status: 400 });

  if (body.action === "create") {
    const r = await saveMuralPost(member, body.post || {});
    if (r.error) return erro(r.error);
  }
  if (body.action === "interesse" && body.id) {
    const r = await muralInteresse(member, String(body.id), body.dados || {});
    if (r.error) return erro(r.error);
  }
  if (body.action === "encerrar" && body.id) {
    await encerrarMuralPost(member, String(body.id));
  }

  const { posts, meus } = await getMuralFor(member);
  return NextResponse.json({
    ok: true,
    conta: !!member?.id,
    plano: !!member?.plano,
    posts,
    meus,
  });
}
