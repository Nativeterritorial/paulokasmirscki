import { NextResponse } from "next/server";
import {
  getStats,
  setLeadDone,
  setDemandDone,
  setSignupDone,
  getCustomCompanies,
  saveCompany,
  deleteCompany,
} from "../../../lib/store";
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

  // ação: marcar/desmarcar demanda (pedido sem empresa) como já buscada
  if (body.action === "demandDone" && body.t) {
    await setDemandDone(body.t, body.done !== false);
  }

  // ação: marcar/desmarcar cadastro de empresa como atendido
  if (body.action === "signupDone" && body.t) {
    await setSignupDone(body.t, body.done !== false);
  }

  // ação: criar/editar empresa cadastrada pelo Paulo
  if (body.action === "companySave" && body.company) {
    await saveCompany(body.company);
  }

  // ação: excluir empresa cadastrada pelo Paulo
  if (body.action === "companyDelete" && body.id) {
    await deleteCompany(body.id);
  }

  const stats = await getStats();
  const customCompanies = await getCustomCompanies();

  // link-convite pronto pra copiar (o servidor conhece o código de acesso)
  const inviteLink = `https://www.paulokasmirscki.com.br/area?convite=${encodeURIComponent(
    process.env.AREA_CODE || "teste123"
  )}`;

  // adiciona o nome das empresas aos rankings (que guardam só o id)
  const allForName = [...COMPANIES, ...customCompanies];
  const nameOf = (id) =>
    allForName.find((c) => c.id === id)?.nome || id;
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

  // empresas fixas (curadas no código) — só leitura no painel, com flag
  const fixedCompanies = COMPANIES.map((c) => ({
    id: c.id,
    nome: c.nome,
    segmento: c.segmento,
    descricao: c.descricao,
    atende: c.atende,
    link: c.link,
    linkLabel: c.linkLabel,
    fixed: true,
  }));

  return NextResponse.json({
    ok: true,
    stats,
    inviteLink,
    customCompanies,
    fixedCompanies,
  });
}
