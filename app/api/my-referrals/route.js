import { NextResponse } from "next/server";
import { checkAccess } from "../../../lib/auth";
import { getReferralsFor } from "../../../lib/store";

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

  const referrals = await getReferralsFor(member);
  return NextResponse.json({ ok: true, personal: true, referrals });
}
