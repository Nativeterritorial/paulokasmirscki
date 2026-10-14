import { NextResponse } from "next/server";
import { checkAccess } from "../../../lib/auth";
import { getReferralsFor, deleteReferral } from "../../../lib/store";

export const runtime = "nodejs";

// Devolve as indicações do próprio membro, com o andamento de cada uma.
// Só funciona com link pessoal: pelo código geral não dá pra saber quem é.
export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch (e) {}

  const { ok, member } = await checkAccess(body.code);
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });
  if (!member) return NextResponse.json({ ok: true, personal: false, referrals: [] });

  let referrals = await getReferralsFor(member);

  // excluir: só uma indicação do próprio membro e só enquanto está "registrada".
  // Depois que o Paulo confirma, o registro vale como comprovante e só ele exclui.
  if (body.action === "delete" && body.t) {
    const alvo = referrals.find((r) => String(r.t) === String(body.t));
    if (!alvo) {
      return NextResponse.json({ ok: false, error: "Indicação não encontrada." }, { status: 404 });
    }
    if (alvo.status !== "registrada") {
      return NextResponse.json(
        {
          ok: false,
          error: "Essa indicação já foi confirmada. Fale com o Paulo para excluir.",
        },
        { status: 409 }
      );
    }
    await deleteReferral(alvo.t);
    referrals = referrals.filter((r) => r !== alvo);
  }

  return NextResponse.json({ ok: true, personal: true, referrals });
}
