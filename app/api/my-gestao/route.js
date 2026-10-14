import { NextResponse } from "next/server";
import { checkAccess } from "../../../lib/auth";
import { getGestoesFor } from "../../../lib/store";

export const runtime = "nodejs";

// Devolve a gestão ("Gestor de negócios") do próprio membro: metas e relatórios.
// Só funciona com link pessoal: pelo código geral não dá pra saber quem é.
export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch (e) {}

  const { ok, member } = await checkAccess(body.code);
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });
  if (!member) return NextResponse.json({ ok: true, gestoes: [] });

  return NextResponse.json({ ok: true, gestoes: await getGestoesFor(member) });
}
