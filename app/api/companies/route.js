import { NextResponse } from "next/server";
import { getAllCompanies } from "../../../lib/companies";

export const runtime = "nodejs";

// Lista combinada (fixas + cadastradas pelo Paulo) para o diretório da área.
// Informação pública de vitrine — sem dados sensíveis.
export async function GET() {
  try {
    const companies = await getAllCompanies();
    return NextResponse.json(
      { companies },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    return NextResponse.json({ companies: [] });
  }
}
