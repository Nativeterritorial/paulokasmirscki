import { NextResponse } from "next/server";
import { logConnect } from "../../../lib/store";
import { COMPANIES } from "../../area/companies";
import { checkAccess } from "../../../lib/auth";

export const runtime = "nodejs";

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch (e) {}

  const { ok } = await checkAccess(body.code);
  if (!ok) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (body.type === "connect" && body.company) {
    const c = COMPANIES.find((x) => x.id === body.company);
    await logConnect(body.company, c?.nome || body.company);
  }

  return NextResponse.json({ ok: true });
}
