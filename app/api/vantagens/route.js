import { NextResponse } from "next/server";
import { checkAccess } from "../../../lib/auth";
import { getVantagensAtivas, saveVantagem, usarVantagem } from "../../../lib/store";

export const runtime = "nodejs";

// Clube de Vantagens na Área de Membros.
// action: "propor" (vantagem nova, vai para aprovação do Paulo) | "usar" (id) | nada = listar
export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch (e) {}
  const { ok, member } = await checkAccess(body.code);
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });

  if (body.action === "propor") {
    const r = await saveVantagem(body.vantagem || {}, { member });
    if (r.error) {
      const msg =
        r.error === "campos"
          ? "Preencha o nome da empresa e a vantagem."
          : r.error === "conta"
          ? "Para oferecer uma vantagem, entre com a sua conta (WhatsApp e senha)."
          : "Não consegui enviar agora. Tente de novo em instantes.";
      return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }
  }
  if (body.action === "usar" && body.id) await usarVantagem(String(body.id));

  return NextResponse.json({ ok: true, conta: !!member?.id, vantagens: await getVantagensAtivas() });
}
