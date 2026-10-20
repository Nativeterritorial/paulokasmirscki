import { NextResponse } from "next/server";
import { checkAccess } from "../../../lib/auth";
import { getConvidadosDe } from "../../../lib/store";

export const runtime = "nodejs";

// O link de convite do membro e quem já entrou na rede por ele.
// Só com acesso pessoal: pelo código geral não dá para saber quem convida.
export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch (e) {}
  const { ok, member } = await checkAccess(body.code);
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });
  if (!member) return NextResponse.json({ ok: true, personal: false });
  const convidados = await getConvidadosDe(member.id);
  return NextResponse.json({
    ok: true,
    personal: true,
    link: `https://www.paulokasmirscki.com.br/convite/${member.id}`,
    convidados: convidados.map((c) => c.nome.split(" ")[0]),
  });
}
