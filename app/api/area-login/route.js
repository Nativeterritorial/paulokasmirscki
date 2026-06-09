import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req) {
  let code = "";
  try {
    const body = await req.json();
    code = (body.code || "").trim();
  } catch (e) {}

  // código de acesso (defina AREA_CODE no .env.local / Vercel; padrão p/ teste)
  const expected = process.env.AREA_CODE || "teste123";
  const ok = code.length > 0 && code === expected;

  return NextResponse.json({ ok });
}
