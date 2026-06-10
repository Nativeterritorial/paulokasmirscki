import { NextResponse } from "next/server";
import { getStats, setLeadDone } from "../../../lib/store";
import { COMPANIES } from "../../area/companies";

export const runtime = "nodejs";

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch (e) {}

  const code = (body.code || "").trim();
  const expected = process.env.ADMIN_CODE || "paulo-admin";
  if (!code || code !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // ação: marcar/desmarcar lead como atendido
  if (body.action === "leadDone" && body.t) {
    await setLeadDone(body.t, body.done !== false);
  }

  const stats = await getStats();

  // link-convite pronto pra copiar (o servidor conhece o código de acesso)
  const inviteLink = `https://www.paulokasmirscki.com.br/area?convite=${encodeURIComponent(
    process.env.AREA_CODE || "teste123"
  )}`;

  // adiciona o nome das empresas aos rankings (que guardam só o id)
  const nameOf = (id) => COMPANIES.find((c) => c.id === id)?.nome || id;
  if (stats.ready) {
    stats.recommended = (stats.recommended || []).map((r) => ({
      ...r,
      nome: nameOf(r.id),
    }));
    stats.connectsRanking = (stats.connectsRanking || []).map((r) => ({
      ...r,
      nome: nameOf(r.id),
    }));
  }

  return NextResponse.json({ ok: true, stats, inviteLink });
}
