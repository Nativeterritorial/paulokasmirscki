import { NextResponse } from "next/server";
import { logConnect } from "../../../lib/store";
import { COMPANIES } from "../../area/companies";

export const runtime = "nodejs";

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch (e) {}

  const code = (body.code || "").trim();
  const expected = process.env.AREA_CODE || "teste123";
  if (code !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (body.type === "connect" && body.company) {
    const c = COMPANIES.find((x) => x.id === body.company);
    await logConnect(body.company, c?.nome || body.company);
  }

  return NextResponse.json({ ok: true });
}
