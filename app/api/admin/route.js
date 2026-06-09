import { NextResponse } from "next/server";
import { getStats } from "../../../lib/store";
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

  const stats = await getStats();

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

  return NextResponse.json({ ok: true, stats });
}
