import { NextResponse } from "next/server";
import {
  getStats,
  setLeadDone,
  setDemandDone,
  setSignupDone,
  setReferralDone,
  setReferralStatus,
  deleteReferral,
  getCustomCompanies,
  saveCompany,
  deleteCompany,
  getMembers,
  saveMember,
  resetMemberToken,
  deleteMember,
  resetMemberSenha,
  setMemberPlano,
  getMural,
  setMuralStatus,
  deleteMuralPost,
  getSenhaPedidos,
  dropSenhaPedido,
  getProjects,
  saveProject,
  deleteProject,
  getGestoes,
  saveGestao,
  deleteGestao,
  getPedidos,
  setPedidoStatus,
  deletePedido,
  addPedidoMsg,
  markPedidoRead,
  saveFoto,
  getImoveis,
  saveImovel,
  deleteImovel,
  imovelFromPedido,
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

  // foto da vitrine (uma por vez, já reduzida no navegador): responde só o id
  if (body.action === "foto") {
    const id = await saveFoto(body.data);
    return NextResponse.json(id ? { ok: true, id } : { ok: false }, { status: id ? 200 : 400 });
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

  // ação: marcar/desmarcar indicação de negócio como tratada
  if (body.action === "referralDone" && body.t) {
    await setReferralDone(body.t, body.done !== false);
  }

  // ação: mudar o andamento de uma indicação (o membro vê na área dele)
  if (body.action === "referralStatus" && body.t && body.status) {
    await setReferralStatus(body.t, String(body.status));
  }

  // ação: excluir uma indicação (some do painel e da lista de quem indicou)
  if (body.action === "referralDelete" && body.t) {
    await deleteReferral(body.t);
  }

  // ação: criar/editar empresa cadastrada pelo Paulo
  if (body.action === "companySave" && body.company) {
    await saveCompany(body.company);
  }

  // ação: excluir empresa cadastrada pelo Paulo
  if (body.action === "companyDelete" && body.id) {
    await deleteCompany(body.id);
  }

  // ações: membros com link pessoal de acesso
  if (body.action === "memberSave" && body.member) {
    await saveMember(body.member);
  }
  if (body.action === "memberReset" && body.id) {
    await resetMemberToken(body.id);
  }
  if (body.action === "memberDelete" && body.id) {
    await dropSenhaPedido(String(body.id));
    await deleteMember(body.id);
  }
  // senha provisória (pedido "Esqueci minha senha"): volta só nesta resposta
  let novaSenha = null;
  if (body.action === "senhaReset" && body.id) {
    const senha = await resetMemberSenha(String(body.id));
    if (senha) novaSenha = { id: String(body.id), senha };
  }
  // Plano Ecossistema: o Paulo libera depois de receber o pagamento
  if (body.action === "memberPlano" && body.id) {
    await setMemberPlano(String(body.id), body.nivel ?? (body.ativo === true ? "basico" : ""));
  }
  // Mural de Oportunidades: tirar do ar, voltar, excluir
  if (body.action === "muralStatus" && body.id && body.status) {
    await setMuralStatus(String(body.id), String(body.status));
  }
  if (body.action === "muralDelete" && body.id) {
    await deleteMuralPost(String(body.id));
  }
  if (body.action === "senhaPedidoDrop" && body.id) {
    await dropSenhaPedido(String(body.id));
  }

  // ações: projetos "Da ideia à abertura"
  if (body.action === "projectSave" && body.project) {
    await saveProject(body.project);
  }
  if (body.action === "projectDelete" && body.id) {
    await deleteProject(body.id);
  }

  // ações: gestão "Gestor de negócios"
  if (body.action === "gestaoSave" && body.gestao) {
    await saveGestao(body.gestao);
  }
  if (body.action === "gestaoDelete" && body.id) {
    await deleteGestao(body.id);
  }

  // ações: pedidos de projeto/gestão feitos pelos membros
  if (body.action === "pedidoStatus" && body.id) {
    await setPedidoStatus(body.id, body.status);
  }
  if (body.action === "pedidoDelete" && body.id) {
    await deletePedido(body.id);
  }
  // conversa com o cliente dentro do pedido
  if (body.action === "pedidoMsg" && body.id) {
    await addPedidoMsg(body.id, "paulo", body.texto);
  }
  if (body.action === "pedidoRead" && body.id) {
    await markPedidoRead(body.id, "paulo");
  }

  // ações: vitrine de imóveis
  let novoImovel = null;
  if (body.action === "imovelFromPedido" && body.id) {
    novoImovel = await imovelFromPedido(body.id);
  }
  if (body.action === "imovelSave" && body.imovel) {
    novoImovel = await saveImovel(body.imovel);
  }
  if (body.action === "imovelDelete" && body.id) {
    await deleteImovel(body.id);
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

  // membros, já com o link pessoal pronto pra copiar/enviar
  const todos = await getMembers();
  const nomeDe = { paulo: "você (/convite/paulo)", ...Object.fromEntries(todos.map((m) => [m.id, m.nome])) };
  const members = todos.map((m) => ({
    id: m.id,
    convidadoPor: m.convidadoPor ? nomeDe[m.convidadoPor] || "membro removido" : "",
    convidou: todos.filter((x) => x.convidadoPor === m.id).length,
    nome: m.nome,
    whatsapp: m.whatsapp,
    t: m.t,
    visto: m.visto,
    temSenha: !!m.senha,
    plano: m.plano === true ? "basico" : m.plano || "",
    planoDesde: m.planoDesde || 0,
    link: `https://www.paulokasmirscki.com.br/area?convite=${encodeURIComponent(
      m.token
    )}`,
  }));

  const projects = await getProjects();
  const gestoes = await getGestoes();
  const pedidos = await getPedidos();
  const imoveis = await getImoveis();
  const senhaPedidos = await getSenhaPedidos();
  const mural = await getMural();

  return NextResponse.json({
    ok: true,
    senhaPedidos,
    novaSenha,
    mural,
    imoveis,
    novoImovel,
    pedidos,
    projects,
    gestoes,
    members,
    stats,
    inviteLink,
    customCompanies,
    fixedCompanies,
  });
}
