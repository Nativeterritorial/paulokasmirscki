import { NextResponse } from "next/server";
import { checkAccess } from "../../../lib/auth";
import { touchMember } from "../../../lib/store";

export const runtime = "nodejs";

// Confere o acesso à Área de Membros: link pessoal do membro ou código geral.
export async function POST(req) {
  let code = "";
  try {
    const body = await req.json();
    code = (body.code || "").trim();
  } catch (e) {}

  const { ok, member } = await checkAccess(code);
  if (ok && member) await touchMember(member.id);

  return NextResponse.json({ ok, member });
}
