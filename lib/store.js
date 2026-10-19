import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { Redis } from "@upstash/redis";
import {
  MURAL_TIPO_IDS,
  REGIMES,
  MURAL_DIAS,
  MURAL_MAX_ATIVOS,
  MURAL_MAX_INTERESSES,
  publicarPedePlano,
  responderPedePlano,
  pedeAprovacao,
  RECOMENDO_DIAS,
  PLANO_NIVEIS,
  chavesRestantes,
  inicioDoMes,
} from "../app/parcerias/mural";
import { STATUS_IDS } from "../app/parcerias/referral-status";
import {
  STAGE_STATUS_IDS,
  TRILHA_IDS,
  OBRA_RESPONSAVEIS,
  stagesOf,
} from "../app/parcerias/project-stages";
import {
  GOAL_TERM_IDS,
  GOAL_STATUS_IDS,
  MAX_METAS,
  MAX_RELATORIOS,
} from "../app/parcerias/gestao";
import {
  PEDIDO_TIPOS,
  PEDIDO_STATUS_IDS,
  FASES_PROJETO,
  TEMPO_EMPRESA,
  AREAS_GESTAO,
  TIPOS_IMOVEL,
  SITUACAO_IMOVEL,
  TIPOS_OBRA,
  TERRENO_SITUACAO,
  MAX_PEDIDOS_ABERTOS,
  MAX_MSG,
  MAX_TIME,
  naoLidas,
  pedidoStatus,
} from "../app/parcerias/pedidos";
import {
  IMOVEL_STATUS_IDS,
  VITRINE_STATUS,
  MAX_FOTOS_IMOVEL,
  parsePreco,
} from "../app/imoveis/imovel-defs";

// Aceita tanto as variáveis da integração Vercel KV quanto as do Upstash direto.
const url =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const token =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

let redis = null;
if (url && token) {
  try {
    redis = new Redis({ url, token });
  } catch (e) {
    redis = null;
  }
}

export const storeReady = !!redis;

// Prefixo para isolar os dados deste projeto (banco pode ser compartilhado)
const K = "pk:";

// Registra uma pergunta feita ao concierge
export async function logQuery(text, recommended = []) {
  if (!redis) return;
  const ts = Date.now();
  try {
    const p = redis.pipeline();
    p.incr(K + "stat:queries:total");
    p.lpush(
      K + "list:queries",
      JSON.stringify({
        t: ts,
        q: String(text).slice(0, 300),
        r: (recommended || []).slice(0, 5),
      })
    );
    p.ltrim(K + "list:queries", 0, 199);
    // ranking do que a IA mais recomenda
    for (const id of recommended) {
      p.zincrby(K + "z:recommended", 1, id);
    }
    await p.exec();
  } catch (e) {}
}

// Registra uma DEMANDA: necessidade real sem empresa na rede, já resumida pela
// IA (ex.: "Empresa de segurança e monitoramento em Veranópolis/RS"). Uma por
// conversa, não uma por mensagem.
export async function logDemand(text) {
  if (!redis) return;
  const clean = String(text || "").trim();
  if (!clean) return;
  const ts = Date.now();
  try {
    const p = redis.pipeline();
    p.lpush(K + "list:demands", JSON.stringify({ t: ts, q: clean.slice(0, 300) }));
    p.ltrim(K + "list:demands", 0, 99);
    await p.exec();
  } catch (e) {}
}

// Registra um CADASTRO de empresa que quer entrar na rede (form do /ecossistema)
export async function logSignup(data = {}) {
  if (!redis) return;
  const ts = Date.now();
  try {
    const p = redis.pipeline();
    p.incr(K + "stat:signups:total");
    p.lpush(
      K + "list:signups",
      JSON.stringify({
        t: ts,
        nome: String(data.nome || "").slice(0, 80),
        empresa: String(data.empresa || "").slice(0, 80),
        site: String(data.site || "").slice(0, 120),
        instagram: String(data.instagram || "").slice(0, 80),
        email: String(data.email || "").slice(0, 120),
        whatsapp: String(data.whatsapp || "").slice(0, 40),
      })
    );
    p.ltrim(K + "list:signups", 0, 199);
    await p.exec();
  } catch (e) {}
}

// Cadastro pelo site com acesso imediato: cria o acesso pessoal e devolve o
// link (token). Se já existe acesso com esse WhatsApp, NÃO devolve o token
// (senão qualquer um entraria na conta de outra pessoa digitando o número dela).
export async function selfSignupMember({ nome, whatsapp, senha } = {}) {
  if (!redis) return { error: "indisponivel" };
  const n = String(nome || "").trim();
  if (!n) return { error: "nome" };
  if (phoneKey(whatsapp).length < 10) return { error: "whatsapp" };
  if (!senhaValida(senha)) return { error: "senha" };
  try {
    const ja = (await getMembers()).find((m) => phoneKey(m.whatsapp) === phoneKey(whatsapp));
    if (ja) return { exists: true };
    const id = await saveMember({ nome: n, whatsapp });
    if (!id) return { error: "falha" };
    const m = parseJson(await redis.hget(K + "members", id));
    if (!m?.token) return { error: "falha" };
    await redis.hset(K + "members", { [id]: JSON.stringify({ ...m, senha: hashSenha(senha) }) });
    return { token: m.token };
  } catch (e) {
    return { error: "falha" };
  }
}

// Marca/desmarca um cadastro de empresa como atendido (chave = timestamp)
export async function setSignupDone(t, done) {
  if (!redis) return;
  try {
    if (done) await redis.sadd(K + "set:signups-done", String(t));
    else await redis.srem(K + "set:signups-done", String(t));
  } catch (e) {}
}

// Registra uma INDICAÇÃO de negócio imobiliário (form do /parcerias).
// Diferente dos outros logs, devolve o timestamp gravado (ou null se não
// gravou): a data do registro é o que define a precedência da indicação, então
// quem chama precisa saber se salvou de verdade.
export async function logReferral(data = {}) {
  if (!redis) return null;
  const ts = Date.now();
  try {
    const p = redis.pipeline();
    p.incr(K + "stat:referrals:total");
    p.lpush(
      K + "list:referrals",
      JSON.stringify({
        t: ts,
        nome: String(data.nome || "").slice(0, 80),
        whatsapp: String(data.whatsapp || "").slice(0, 40),
        indicado: String(data.indicado || "").slice(0, 80),
        indicadoContato: String(data.indicadoContato || "").slice(0, 80),
        tipo: String(data.tipo || "").slice(0, 30),
        obs: String(data.obs || "").slice(0, 400),
        memberId: String(data.memberId || "").slice(0, 40),
      })
    );
    p.ltrim(K + "list:referrals", 0, 499);
    await p.exec();
    return ts;
  } catch (e) {
    return null;
  }
}

// Marca/desmarca uma indicação como tratada (chave = timestamp)
export async function setReferralDone(t, done) {
  if (!redis) return;
  try {
    if (done) await redis.sadd(K + "set:referrals-done", String(t));
    else await redis.srem(K + "set:referrals-done", String(t));
  } catch (e) {}
}

// Andamento de uma indicação (chave = timestamp). Guardado à parte da lista,
// que é só de leitura: pk:referral-status  hash  t -> id do status
export async function setReferralStatus(t, status) {
  if (!redis || !t || !STATUS_IDS.includes(status)) return;
  try {
    await redis.hset(K + "referral-status", { [String(t)]: status });
  } catch (e) {}
}

// Exclui uma indicação: ela some do painel e da lista do membro. O registro
// original continua guardado no banco (a data dele é o que comprova quem
// indicou primeiro), só deixa de ser exibido.
export async function deleteReferral(t) {
  if (!redis || !t) return;
  try {
    await redis.sadd(K + "set:referrals-deleted", String(t));
  } catch (e) {}
}

// só os dígitos do telefone, sem o 55 do país (pra comparar números)
const phoneKey = (v) => {
  const d = String(v || "").replace(/[^0-9]/g, "");
  return d.length >= 12 && d.startsWith("55") ? d.slice(2) : d;
};

// Indicações de um membro: as que ele registrou logado e as que entraram pelo
// formulário público com o mesmo WhatsApp do cadastro dele. Devolve só o que o
// próprio membro precisa ver, com o andamento de cada uma.
export async function getReferralsFor(member) {
  if (!redis || !member) return [];
  try {
    const [raw, statuses, deleted] = await Promise.all([
      redis.lrange(K + "list:referrals", 0, 499),
      redis.hgetall(K + "referral-status"),
      redis.smembers(K + "set:referrals-deleted"),
    ]);
    const gone = new Set((deleted || []).map(String));
    const mine = phoneKey(member.whatsapp);
    return (raw || [])
      .map((x) => {
        try {
          return typeof x === "string" ? JSON.parse(x) : x;
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .filter((r) => !gone.has(String(r.t)))
      .filter(
        (r) =>
          (r.memberId && r.memberId === member.id) ||
          (mine.length >= 10 && phoneKey(r.whatsapp) === mine)
      )
      .map((r) => ({
        t: r.t,
        indicado: r.indicado,
        tipo: r.tipo,
        status: String((statuses || {})[String(r.t)] || "registrada"),
      }));
  } catch (e) {
    return [];
  }
}

// Registra um clique em "Conectar" com determinada empresa
export async function logConnect(companyId, companyName) {
  if (!redis) return;
  const ts = Date.now();
  try {
    const p = redis.pipeline();
    p.incr(K + "stat:connects:total");
    p.zincrby(K + "z:connects", 1, companyId);
    p.lpush(
      K + "list:connects",
      JSON.stringify({ t: ts, id: companyId, nome: companyName || companyId })
    );
    p.ltrim(K + "list:connects", 0, 199);
    await p.exec();
  } catch (e) {}
}

// Registra um lead vindo do formulário da home
export async function logLead({ nome, contato, msg }) {
  if (!redis) return;
  const ts = Date.now();
  try {
    const p = redis.pipeline();
    p.incr(K + "stat:leads:total");
    p.lpush(
      K + "list:leads",
      JSON.stringify({
        t: ts,
        nome: String(nome || "").slice(0, 80),
        contato: String(contato || "").slice(0, 80),
        msg: String(msg || "").slice(0, 400),
      })
    );
    p.ltrim(K + "list:leads", 0, 199);
    await p.exec();
  } catch (e) {}
}

// Marca/desmarca um lead como atendido (chave = timestamp do lead)
export async function setLeadDone(t, done) {
  if (!redis) return;
  try {
    if (done) await redis.sadd(K + "set:leads-done", String(t));
    else await redis.srem(K + "set:leads-done", String(t));
  } catch (e) {}
}

// ---------- EMPRESAS GERENCIADAS PELO PAULO (no banco) ----------
// Guardadas num hash: campo = id da empresa, valor = JSON com os dados.

// gera um id "slug" a partir do nome
function slugify(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function getCustomCompanies() {
  if (!redis) return [];
  try {
    const all = await redis.hgetall(K + "companies");
    if (!all) return [];
    return Object.values(all)
      .map((v) => {
        try {
          return typeof v === "string" ? JSON.parse(v) : v;
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch (e) {
    return [];
  }
}

// cria/edita uma empresa; retorna o id salvo (ou null se falhar)
export async function saveCompany(input = {}) {
  if (!redis) return null;
  try {
    const id = (input.id && String(input.id)) || slugify(input.nome);
    if (!id) return null;
    const company = {
      id,
      nome: String(input.nome || "").slice(0, 80),
      segmento: String(input.segmento || "Outros").slice(0, 60),
      descricao: String(input.descricao || "").slice(0, 400),
      atende: Array.isArray(input.atende)
        ? input.atende.map((a) => String(a).slice(0, 60)).slice(0, 8)
        : String(input.atende || "")
            .split(/[,;]/)
            .map((a) => a.trim())
            .filter(Boolean)
            .slice(0, 8),
      link: String(input.link || "").slice(0, 200),
      linkLabel: String(input.linkLabel || "").slice(0, 60),
      custom: true,
    };
    await redis.hset(K + "companies", { [id]: JSON.stringify(company) });
    return id;
  } catch (e) {
    return null;
  }
}

export async function deleteCompany(id) {
  if (!redis || !id) return;
  try {
    await redis.hdel(K + "companies", String(id));
  } catch (e) {}
}

// ---------- MEMBROS (acesso individual à Área de Membros) ----------
// pk:members        hash  id -> JSON { id, nome, whatsapp, token, t }
// pk:member-tokens  hash  token -> id   (pra achar o membro pelo link pessoal)
// pk:member-seen    hash  id -> timestamp do último acesso

const newToken = () => randomBytes(18).toString("base64url");

const parseJson = (v) => {
  try {
    return typeof v === "string" ? JSON.parse(v) : v;
  } catch {
    return null;
  }
};

export async function getMembers() {
  if (!redis) return [];
  try {
    const [all, seen] = await Promise.all([
      redis.hgetall(K + "members"),
      redis.hgetall(K + "member-seen"),
    ]);
    if (!all) return [];
    return Object.values(all)
      .map(parseJson)
      .filter(Boolean)
      .map((m) => ({ ...m, visto: Number((seen || {})[m.id] || 0) }))
      .sort((a, b) => (b.t || 0) - (a.t || 0));
  } catch (e) {
    return [];
  }
}

// cria um membro (gera o link pessoal) ou edita nome/WhatsApp de um existente
export async function saveMember(input = {}) {
  if (!redis) return null;
  try {
    const nome = String(input.nome || "").trim().slice(0, 80);
    if (!nome) return null;
    const whatsapp = String(input.whatsapp || "").trim().slice(0, 40);

    if (input.id) {
      const cur = parseJson(await redis.hget(K + "members", String(input.id)));
      if (!cur) return null;
      const next = { ...cur, nome, whatsapp };
      await redis.hset(K + "members", { [cur.id]: JSON.stringify(next) });
      return cur.id;
    }

    const phone = phoneKey(whatsapp);
    if (phone.length >= 10) {
      const all = await redis.hgetall(K + "members");
      const same = Object.values(all || {})
        .map(parseJson)
        .find((m) => m && phoneKey(m.whatsapp) === phone);
      if (same) return same.id;
    }

    const id = `m${Date.now().toString(36)}${randomBytes(2).toString("hex")}`;
    const member = { id, nome, whatsapp, token: newToken(), t: Date.now() };
    const p = redis.pipeline();
    p.hset(K + "members", { [id]: JSON.stringify(member) });
    p.hset(K + "member-tokens", { [member.token]: id });
    await p.exec();
    return id;
  } catch (e) {
    return null;
  }
}

// troca o link pessoal de um membro: o link antigo para de funcionar na hora
export async function resetMemberToken(id) {
  if (!redis || !id) return;
  try {
    const cur = parseJson(await redis.hget(K + "members", String(id)));
    if (!cur) return;
    const next = { ...cur, token: newToken() };
    const p = redis.pipeline();
    if (cur.token) p.hdel(K + "member-tokens", cur.token);
    p.hset(K + "member-tokens", { [next.token]: cur.id });
    p.hset(K + "members", { [cur.id]: JSON.stringify(next) });
    await p.exec();
  } catch (e) {}
}

export async function deleteMember(id) {
  if (!redis || !id) return;
  try {
    const cur = parseJson(await redis.hget(K + "members", String(id)));
    const p = redis.pipeline();
    if (cur?.token) p.hdel(K + "member-tokens", cur.token);
    p.hdel(K + "members", String(id));
    p.hdel(K + "member-seen", String(id));
    await p.exec();
  } catch (e) {}
}

export async function findMemberByToken(token) {
  if (!redis || !token) return null;
  try {
    const id = await redis.hget(K + "member-tokens", String(token));
    if (!id) return null;
    const m = parseJson(await redis.hget(K + "members", String(id)));
    // confere o token gravado no membro: um link trocado não entra mais
    return m && m.token === String(token) ? m : null;
  } catch (e) {
    return null;
  }
}

// ---------- SENHAS (entrar com WhatsApp + senha, em qualquer aparelho) ----------
// a senha fica no membro como "sal:hash" (scrypt); nunca é guardada em texto.
// pk:login-fail:<telefone>  contador de tentativas erradas (expira em 15 min)
// pk:senha-pedidos          hash telefone -> JSON { whatsapp, nome, memberId, t }
//                           ("Esqueci minha senha": aparece no painel do Paulo)

export const SENHA_MIN = 6;
const MAX_FALHAS = 8;
export const senhaValida = (v) => {
  const s = String(v || "");
  return s.length >= SENHA_MIN && s.length <= 100;
};

function hashSenha(senha) {
  const sal = randomBytes(16).toString("hex");
  return sal + ":" + scryptSync(String(senha), sal, 32).toString("hex");
}

function confereSenha(senha, gravada) {
  const [sal, hash] = String(gravada || "").split(":");
  if (!sal || !hash) return false;
  try {
    const a = Buffer.from(hash, "hex");
    const b = scryptSync(String(senha || ""), sal, 32);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch (e) {
    return false;
  }
}

// senha provisória fácil de ditar (sem 0/O, 1/l/I)
function senhaProvisoria() {
  const abc = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from(randomBytes(8), (b) => abc[b % abc.length]).join("");
}

const temSenhaDe = (m) => !!m?.senha;

async function memberByPhone(whatsapp) {
  const phone = phoneKey(whatsapp);
  if (phone.length < 10) return null;
  return (await getMembers()).find((m) => phoneKey(m.whatsapp) === phone) || null;
}

// devolve { token } ou { error: "dados" | "bloqueado" | "semsenha" | "indisponivel" }
export async function loginWithSenha(whatsapp, senha) {
  if (!redis) return { error: "indisponivel" };
  const phone = phoneKey(whatsapp);
  if (phone.length < 10 || !senha) return { error: "dados" };
  const failKey = K + "login-fail:" + phone;
  try {
    if (Number(await redis.get(failKey)) >= MAX_FALHAS) return { error: "bloqueado" };
    const m = await memberByPhone(phone);
    if (m && !temSenhaDe(m)) return { error: "semsenha" };
    if (m && confereSenha(senha, m.senha)) {
      await redis.del(failKey);
      return { token: m.token };
    }
    const n = await redis.incr(failKey);
    if (n === 1) await redis.expire(failKey, 15 * 60);
    return { error: n >= MAX_FALHAS ? "bloqueado" : "dados" };
  } catch (e) {
    return { error: "indisponivel" };
  }
}

// o próprio membro (já dentro da área) cria ou troca a senha
export async function setMemberSenha(id, senha) {
  if (!redis || !id) return false;
  if (!senhaValida(senha)) return false;
  try {
    const cur = parseJson(await redis.hget(K + "members", String(id)));
    if (!cur) return false;
    const { senhaTemp, ...rest } = cur;
    const p = redis.pipeline();
    p.hset(K + "members", { [cur.id]: JSON.stringify({ ...rest, senha: hashSenha(senha) }) });
    p.hdel(K + "senha-pedidos", phoneKey(cur.whatsapp) || "-");
    await p.exec();
    return true;
  } catch (e) {
    return false;
  }
}

export async function memberSenhaInfo(id) {
  if (!redis || !id) return { temSenha: false, senhaTemp: false };
  try {
    const m = parseJson(await redis.hget(K + "members", String(id)));
    return { temSenha: temSenhaDe(m), senhaTemp: !!m?.senhaTemp };
  } catch (e) {
    return { temSenha: false, senhaTemp: false };
  }
}

// "Esqueci minha senha": só registra o pedido se o WhatsApp é de um membro,
// mas a resposta pro site é sempre a mesma (não revela quem é membro)
export async function pedirNovaSenha(whatsapp) {
  if (!redis) return;
  try {
    const m = await memberByPhone(whatsapp);
    if (!m) return;
    await redis.hset(K + "senha-pedidos", {
      [phoneKey(m.whatsapp)]: JSON.stringify({ whatsapp: m.whatsapp, nome: m.nome, memberId: m.id, t: Date.now() }),
    });
  } catch (e) {}
}

export async function getSenhaPedidos() {
  if (!redis) return [];
  try {
    const all = await redis.hgetall(K + "senha-pedidos");
    return Object.values(all || {})
      .map(parseJson)
      .filter(Boolean)
      .sort((a, b) => (b.t || 0) - (a.t || 0));
  } catch (e) {
    return [];
  }
}

export async function dropSenhaPedido(memberId) {
  if (!redis || !memberId) return;
  try {
    const m = parseJson(await redis.hget(K + "members", String(memberId)));
    const pedidos = await getSenhaPedidos();
    const keys = pedidos.filter((p) => p.memberId === memberId).map((p) => phoneKey(p.whatsapp));
    if (m) keys.push(phoneKey(m.whatsapp));
    for (const k of new Set(keys.filter(Boolean))) await redis.hdel(K + "senha-pedidos", k);
  } catch (e) {}
}

// o Paulo gera uma senha provisória (vai pro membro pelo WhatsApp);
// ao entrar, o membro vê o aviso pra trocar por uma dele
export async function resetMemberSenha(id) {
  if (!redis || !id) return null;
  try {
    const cur = parseJson(await redis.hget(K + "members", String(id)));
    if (!cur) return null;
    const senha = senhaProvisoria();
    await redis.hset(K + "members", {
      [cur.id]: JSON.stringify({ ...cur, senha: hashSenha(senha), senhaTemp: true }),
    });
    await dropSenhaPedido(cur.id);
    const phone = phoneKey(cur.whatsapp);
    if (phone) await redis.del(K + "login-fail:" + phone);
    return senha;
  } catch (e) {
    return null;
  }
}

// registra o último acesso do membro (aparece no painel)
export async function touchMember(id) {
  if (!redis || !id) return;
  try {
    await redis.hset(K + "member-seen", { [String(id)]: String(Date.now()) });
  } catch (e) {}
}

// ---------- PROJETOS (modelo "Da ideia à abertura") ----------
// pk:projects  hash  id -> JSON { id, nome, cliente, memberId, proximo,
//                                 etapas: { <etapa>: { status, responsavel, nota } },
//                                 t (criado), atualizado }

// limpa e limita o que vem do painel; etapas desconhecidas são descartadas
function cleanProject(input, base) {
  // trilha: "abertura" (Da ideia à abertura) ou "obra" (Do Terreno às Chaves)
  const trilha = TRILHA_IDS.includes(input.trilha)
    ? input.trilha
    : TRILHA_IDS.includes(base.trilha)
    ? base.trilha
    : "abertura";
  const novaObra = !base.criado && trilha === "obra" && !input.etapas;
  const etapas = {};
  for (const { id } of stagesOf({ trilha })) {
    const e = input.etapas?.[id] || {};
    if (novaObra && OBRA_RESPONSAVEIS[id]) e.responsavel = OBRA_RESPONSAVEIS[id];
    etapas[id] = {
      status: STAGE_STATUS_IDS.includes(e.status) ? e.status : "pendente",
      responsavel: String(e.responsavel || "").trim().slice(0, 80),
      nota: String(e.nota || "").trim().slice(0, 300),
    };
  }
  const { criado, ...resto } = base;
  return {
    ...resto,
    trilha,
    nome: String(input.nome || "").trim().slice(0, 80),
    cliente: String(input.cliente || "").trim().slice(0, 80),
    memberId: String(input.memberId || "").slice(0, 40),
    proximo: String(input.proximo || "").trim().slice(0, 200),
    etapas,
    atualizado: Date.now(),
  };
}

export async function getProjects() {
  if (!redis) return [];
  try {
    const all = await redis.hgetall(K + "projects");
    if (!all) return [];
    return Object.values(all)
      .map(parseJson)
      .filter(Boolean)
      .sort((a, b) => (b.t || 0) - (a.t || 0));
  } catch (e) {
    return [];
  }
}

// cria (sem id) ou atualiza (com id) um projeto; devolve o id ou null
export async function saveProject(input = {}) {
  if (!redis) return null;
  try {
    if (!String(input.nome || "").trim()) return null;
    let base;
    if (input.id) {
      base = parseJson(await redis.hget(K + "projects", String(input.id)));
      if (!base) return null;
    } else {
      base = {
        id: `p${Date.now().toString(36)}${randomBytes(2).toString("hex")}`,
        t: Date.now(),
      };
    }
    const project = cleanProject(input, {
      id: base.id,
      t: base.t,
      trilha: base.trilha,
      criado: !!input.id,
    });
    await redis.hset(K + "projects", { [project.id]: JSON.stringify(project) });
    return project.id;
  } catch (e) {
    return null;
  }
}

export async function deleteProject(id) {
  if (!redis || !id) return;
  try {
    await redis.hdel(K + "projects", String(id));
  } catch (e) {}
}

// projetos de um membro — só o que o cliente precisa ver
// ids dos acessos que são da mesma pessoa (o próprio + os com o mesmo WhatsApp)
async function sameOwnerIds(member) {
  const ids = new Set([member.id]);
  const mine = phoneKey(member.whatsapp);
  if (mine.length >= 10) {
    for (const m of await getMembers()) {
      if (phoneKey(m.whatsapp) === mine) ids.add(m.id);
    }
  }
  return ids;
}

export async function getProjectsFor(member) {
  if (!member) return [];
  const ids = await sameOwnerIds(member);
  return (await getProjects())
    .filter((p) => p.memberId && ids.has(p.memberId))
    .map((p) => ({
      id: p.id,
      nome: p.nome,
      trilha: p.trilha || "abertura",
      proximo: p.proximo,
      etapas: p.etapas,
      atualizado: p.atualizado,
    }));
}

// Marca/desmarca uma demanda (pedido sem empresa na rede) como já buscada/recrutada
export async function setDemandDone(t, done) {
  if (!redis) return;
  try {
    if (done) await redis.sadd(K + "set:demands-done", String(t));
    else await redis.srem(K + "set:demands-done", String(t));
  } catch (e) {}
}

// Lê todas as estatísticas para o painel
export async function getStats() {
  if (!redis) return { ready: false };
  try {
    const [
      qTotal,
      cTotal,
      lTotal,
      recRaw,
      conRaw,
      queries,
      connects,
      leads,
      leadsDone,
      demandsDone,
      demandsRaw,
      signupsRaw,
      signupsDone,
      referralsRaw,
      referralsDone,
      referralStatus,
      referralsDeleted,
    ] = await Promise.all([
      redis.get(K + "stat:queries:total"),
      redis.get(K + "stat:connects:total"),
      redis.get(K + "stat:leads:total"),
      redis.zrange(K + "z:recommended", 0, 19, { rev: true, withScores: true }),
      redis.zrange(K + "z:connects", 0, 19, { rev: true, withScores: true }),
      redis.lrange(K + "list:queries", 0, 49),
      redis.lrange(K + "list:connects", 0, 49),
      redis.lrange(K + "list:leads", 0, 49),
      redis.smembers(K + "set:leads-done"),
      redis.smembers(K + "set:demands-done"),
      redis.lrange(K + "list:demands", 0, 49),
      redis.lrange(K + "list:signups", 0, 49),
      redis.smembers(K + "set:signups-done"),
      redis.lrange(K + "list:referrals", 0, 99),
      redis.smembers(K + "set:referrals-done"),
      redis.hgetall(K + "referral-status"),
      redis.smembers(K + "set:referrals-deleted"),
    ]);
    const referralsGone = new Set((referralsDeleted || []).map(String));

    const pairsToList = (arr) => {
      const out = [];
      for (let i = 0; i < arr.length; i += 2) {
        out.push({ id: arr[i], count: Number(arr[i + 1]) });
      }
      return out;
    };
    const parse = (arr) =>
      (arr || []).map((x) => {
        try {
          return typeof x === "string" ? JSON.parse(x) : x;
        } catch {
          return null;
        }
      }).filter(Boolean);

    return {
      ready: true,
      totals: {
        queries: Number(qTotal || 0),
        connects: Number(cTotal || 0),
        leads: Number(lTotal || 0),
      },
      recommended: pairsToList(recRaw || []),
      connectsRanking: pairsToList(conRaw || []),
      recentQueries: parse(queries),
      recentConnects: parse(connects),
      leads: parse(leads),
      leadsDone: (leadsDone || []).map(String),
      demandsDone: (demandsDone || []).map(String),
      demands: parse(demandsRaw),
      signups: parse(signupsRaw),
      signupsDone: (signupsDone || []).map(String),
      referrals: parse(referralsRaw).filter((r) => !referralsGone.has(String(r.t))),
      referralsDone: (referralsDone || []).map(String),
      referralStatus: referralStatus || {},
    };
  } catch (e) {
    return { ready: false, error: String(e) };
  }
}

// ---------- GESTÃO (modelo "Gestor de negócios") ----------
// pk:gestoes  hash  id -> JSON { id, empresa, cliente, memberId, foco,
//   metas: [{ id, texto, prazo, status }],
//   relatorios: [{ id, mes: "AAAA-MM", feito, numeros, proximos }],
//   t (criado), atualizado }

const txt = (v, n) => String(v || "").trim().slice(0, n);
const subId = (v, prefix) =>
  /^[a-z0-9]{4,24}$/i.test(String(v || ""))
    ? String(v)
    : `${prefix}${Date.now().toString(36)}${randomBytes(2).toString("hex")}`;

function cleanGestao(input, base) {
  const metas = (Array.isArray(input.metas) ? input.metas : [])
    .map((m) => ({
      id: subId(m?.id, "g"),
      texto: txt(m?.texto, 160),
      prazo: GOAL_TERM_IDS.includes(m?.prazo) ? m.prazo : "curto",
      status: GOAL_STATUS_IDS.includes(m?.status) ? m.status : "pendente",
    }))
    .filter((m) => m.texto)
    .slice(0, MAX_METAS);
  const relatorios = (Array.isArray(input.relatorios) ? input.relatorios : [])
    .map((r) => ({
      id: subId(r?.id, "r"),
      mes: /^\d{4}-(0[1-9]|1[0-2])$/.test(String(r?.mes || "")) ? r.mes : "",
      feito: txt(r?.feito, 1500),
      numeros: txt(r?.numeros, 800),
      proximos: txt(r?.proximos, 800),
    }))
    .filter((r) => r.mes && (r.feito || r.numeros || r.proximos))
    .sort((a, b) => (a.mes < b.mes ? 1 : a.mes > b.mes ? -1 : 0))
    .slice(0, MAX_RELATORIOS);
  return {
    ...base,
    empresa: txt(input.empresa, 80),
    cliente: txt(input.cliente, 80),
    memberId: String(input.memberId || "").slice(0, 40),
    foco: txt(input.foco, 200),
    metas,
    relatorios,
    atualizado: Date.now(),
  };
}

export async function getGestoes() {
  if (!redis) return [];
  try {
    const all = await redis.hgetall(K + "gestoes");
    if (!all) return [];
    return Object.values(all)
      .map(parseJson)
      .filter(Boolean)
      .sort((a, b) => (b.t || 0) - (a.t || 0));
  } catch (e) {
    return [];
  }
}

// cria (sem id) ou atualiza (com id); devolve o id ou null
export async function saveGestao(input = {}) {
  if (!redis) return null;
  try {
    if (!String(input.empresa || "").trim()) return null;
    let base;
    if (input.id) {
      base = parseJson(await redis.hget(K + "gestoes", String(input.id)));
      if (!base) return null;
    } else {
      base = {
        id: `n${Date.now().toString(36)}${randomBytes(2).toString("hex")}`,
        t: Date.now(),
      };
    }
    const g = cleanGestao(input, { id: base.id, t: base.t });
    await redis.hset(K + "gestoes", { [g.id]: JSON.stringify(g) });
    return g.id;
  } catch (e) {
    return null;
  }
}

export async function deleteGestao(id) {
  if (!redis || !id) return;
  try {
    await redis.hdel(K + "gestoes", String(id));
  } catch (e) {}
}

// gestões de um membro — só o que o cliente precisa ver
export async function getGestoesFor(member) {
  if (!member) return [];
  const ids = await sameOwnerIds(member);
  return (await getGestoes())
    .filter((g) => g.memberId && ids.has(g.memberId))
    .map((g) => ({
      id: g.id,
      empresa: g.empresa,
      foco: g.foco,
      metas: g.metas,
      relatorios: g.relatorios,
      atualizado: g.atualizado,
    }));
}

// ---------- PEDIDOS (+ Novo projeto / + Nova gestão, feitos pelo membro) ----------
// pk:pedidos  hash  id -> JSON { id, tipo: "projeto"|"gestao", memberId, nome,
//   whatsapp, titulo, local, fase, descricao, areas: [], status, t }
//   projeto: titulo = ideia do negócio, local = cidade, fase = em que ponto está
//   gestao:  titulo = empresa, local = segmento, fase = tempo de empresa

export async function getPedidos() {
  if (!redis) return [];
  try {
    const all = await redis.hgetall(K + "pedidos");
    if (!all) return [];
    return Object.values(all)
      .map(parseJson)
      .filter(Boolean)
      .sort((a, b) => (b.t || 0) - (a.t || 0));
  } catch (e) {
    return [];
  }
}

// o pedido é dessa pessoa? (mesmo acesso, outro acesso com o mesmo WhatsApp,
// ou pedido feito pelo código geral com o mesmo WhatsApp)
async function pedidoOwner(member) {
  const ids = member.id ? await sameOwnerIds(member) : new Set();
  const phone = phoneKey(member.whatsapp);
  return (p) =>
    (p.memberId && ids.has(p.memberId)) ||
    (phone.length >= 10 && phoneKey(p.whatsapp) === phone);
}

// cria um pedido; devolve { id } ou { error }. `member` pode ser
// { id: "", nome, whatsapp } quando a pessoa entrou pelo código geral.
export async function savePedido(member, input = {}) {
  if (!redis) return { error: "indisponivel" };
  if (!member) return { error: "sem-membro" };
  // sem acesso pessoal (entrou pelo código geral): precisa de nome e WhatsApp
  if (!member.id && (!txt(member.nome, 80) || phoneKey(member.whatsapp).length < 10)) {
    return { error: "contato" };
  }
  const tipo = PEDIDO_TIPOS.includes(input.tipo) ? input.tipo : null;
  if (!tipo) return { error: "tipo" };
  const titulo =
    tipo === "imovel"
      ? TIPOS_IMOVEL.includes(input.titulo) ? input.titulo : ""
      : tipo === "obra"
      ? TIPOS_OBRA.includes(input.titulo) ? input.titulo : ""
      : txt(input.titulo, 100);
  const descricao = txt(input.descricao, 1500);
  if (!titulo || !descricao) return { error: "campos" };
  // imóvel: só quem é o dono (ou tem autorização dele) pode cadastrar
  if (tipo === "imovel" && input.proprietario !== true) return { error: "proprietario" };
  try {
    const mine = await pedidoOwner(member);
    const abertos = (await getPedidos()).filter(
      (p) => mine(p) && (p.status === "novo" || p.status === "conversa")
    );
    if (abertos.length >= MAX_PEDIDOS_ABERTOS) return { error: "limite" };
    const fases =
      tipo === "projeto"
        ? FASES_PROJETO
        : tipo === "imovel"
        ? SITUACAO_IMOVEL
        : tipo === "obra"
        ? TERRENO_SITUACAO
        : TEMPO_EMPRESA;
    const fotos = tipo === "imovel" ? await keepFotos(input.fotos) : [];
    // Chave PK: dentro do plano (Básico tem limite por mês) ou avulsa (o Paulo cobra)
    let chavePlano = "";
    let chaveAvulsa = false;
    if (tipo === "chave") {
      chavePlano = planoDe(member);
      const usadas = (await getPedidos()).filter(
        (p) => p.tipo === "chave" && mine(p) && (p.t || 0) >= inicioDoMes() && !p.avulsa
      ).length;
      const resta = chavesRestantes(chavePlano, usadas);
      chaveAvulsa = !resta;
    }
    const pedido = {
      id: `q${Date.now().toString(36)}${randomBytes(2).toString("hex")}`,
      // chave secreta guardada no aparelho de quem pediu: permite acompanhar o
      // pedido (e conversar) mesmo sem link pessoal
      segredo: randomBytes(12).toString("base64url"),
      tipo,
      memberId: member.id,
      nome: txt(member.nome, 80),
      whatsapp: txt(member.whatsapp, 40),
      titulo,
      local: txt(input.local, 80),
      fase: fases.includes(input.fase) ? input.fase : "",
      descricao,
      areas:
        tipo === "gestao" && Array.isArray(input.areas)
          ? AREAS_GESTAO.filter((a) => input.areas.includes(a))
          : [],
      ...(tipo === "imovel"
        ? {
            bairro: txt(input.bairro, 80),
            valor: txt(input.valor, 40),
            // o dono escolhe: valor visível no anúncio ou "sob consulta"
            valorVisivel: input.valorVisivel !== false,
            // quem cadastrou: o dono ou um corretor/imobiliária parceira
            origem: input.origem === "parceiro" ? "parceiro" : "proprietario",
            creci: input.origem === "parceiro" ? txt(input.creci, 30) : "",
            // endereço completo: só o Paulo vê (o anúncio mostra só o bairro)
            endereco: txt(input.endereco, 160),
            fotos: fotos,
            metragem: txt(input.metragem, 30),
            quartos: txt(input.quartos, 10),
          }
        : {}),
      // Chave PK: qual empresa da rede a pessoa quer conhecer
      ...(tipo === "chave"
        ? { empresaId: txt(input.empresaId, 40), plano: chavePlano, avulsa: chaveAvulsa }
        : {}),
      // Monte meu time: os serviços que a pessoa marcou e, só para o Paulo,
      // as empresas da rede que o concierge achou para cada um (vazio = vaga na rede)
      ...(tipo === "time"
        ? {
            servicos: (Array.isArray(input.servicos) ? input.servicos : [])
              .map((e) => ({
                nome: txt(e?.nome, 50),
                ids: (Array.isArray(e?.ids) ? e.ids : [])
                  .map((id) => txt(id, 40))
                  .filter(Boolean)
                  .slice(0, 8),
              }))
              .filter((e) => e.nome)
              .slice(0, MAX_TIME),
          }
        : {}),
      // obra: tamanho e prazo desejado
      ...(tipo === "obra"
        ? { metragem: txt(input.metragem, 30), prazo: txt(input.prazo, 60) }
        : {}),
      status: "novo",
      t: Date.now(),
    };
    await redis.hset(K + "pedidos", { [pedido.id]: JSON.stringify(pedido) });
    return { id: pedido.id, segredo: pedido.segredo };
  } catch (e) {
    return { error: "falha" };
  }
}

export async function setPedidoStatus(id, status) {
  if (!redis || !id || !PEDIDO_STATUS_IDS.includes(status)) return;
  try {
    const p = parseJson(await redis.hget(K + "pedidos", String(id)));
    if (!p || p.status === status) return;
    // a mudança de situação vira um aviso na conversa do pedido
    const aviso = {
      de: "sistema",
      texto: `Situação atualizada: ${pedidoStatus(status, p.tipo).label}`,
      t: Date.now(),
    };
    const mensagens = [...(p.mensagens || []), aviso].slice(-80);
    await redis.hset(K + "pedidos", { [p.id]: JSON.stringify({ ...p, status, mensagens }) });
  } catch (e) {}
}

// nova mensagem na conversa de um pedido; devolve o pedido ou null
export async function addPedidoMsg(id, de, texto) {
  if (!redis || !id || !["paulo", "cliente"].includes(de)) return null;
  const t = txt(texto, MAX_MSG);
  if (!t) return null;
  try {
    const p = parseJson(await redis.hget(K + "pedidos", String(id)));
    if (!p) return null;
    const msg = { de, texto: t, t: Date.now() };
    const next = {
      ...p,
      mensagens: [...(p.mensagens || []), msg].slice(-80),
      // quem escreve já leu tudo até ali
      ...(de === "paulo" ? { lidoPaulo: msg.t } : { lidoCliente: msg.t }),
    };
    await redis.hset(K + "pedidos", { [p.id]: JSON.stringify(next) });
    return next;
  } catch (e) {
    return null;
  }
}

// marca a conversa como lida por "paulo" ou "cliente"
export async function markPedidoRead(id, quem) {
  if (!redis || !id || !["paulo", "cliente"].includes(quem)) return;
  try {
    const p = parseJson(await redis.hget(K + "pedidos", String(id)));
    if (!p) return;
    const campo = quem === "paulo" ? "lidoPaulo" : "lidoCliente";
    await redis.hset(K + "pedidos", { [p.id]: JSON.stringify({ ...p, [campo]: Date.now() }) });
  } catch (e) {}
}

export async function deletePedido(id) {
  if (!redis || !id) return;
  try {
    const p = parseJson(await redis.hget(K + "pedidos", String(id)));
    await redis.hdel(K + "pedidos", String(id));
    await dropFotos(p?.fotos);
  } catch (e) {}
}

// ---------- FOTOS dos imóveis ----------
// pk:foto:<id>  string  JPEG em base64 (já reduzido no navegador).
// Ao enviar, a foto expira em 7 dias; quando o cadastro é salvo ela passa a
// ser permanente. Fotos de formulários abandonados somem sozinhas.
export const MAX_FOTOS = 10;
const FOTO_MAX_B64 = 450000; // ~330 KB de imagem
const FOTO_ID = /^[A-Za-z0-9_-]{16}$/;

export async function saveFoto(b64) {
  if (!redis) return null;
  const data = String(b64 || "");
  if (!data || data.length > FOTO_MAX_B64 || !/^[A-Za-z0-9+/]+=*$/.test(data)) return null;
  // precisa começar como JPEG (FF D8 FF)
  if (!data.startsWith("/9j/")) return null;
  try {
    const id = randomBytes(12).toString("base64url");
    await redis.set(K + "foto:" + id, data, { ex: 7 * 86400 });
    return id;
  } catch (e) {
    return null;
  }
}

export async function getFoto(id) {
  if (!redis || !FOTO_ID.test(String(id || ""))) return null;
  try {
    const v = await redis.get(K + "foto:" + id);
    return typeof v === "string" ? v : null;
  } catch (e) {
    return null;
  }
}

// mantém só ids válidos que existem e tira o prazo de expiração
async function keepFotos(list, max = MAX_FOTOS) {
  const ids = [...new Set(Array.isArray(list) ? list.map(String) : [])]
    .filter((id) => FOTO_ID.test(id))
    .slice(0, max);
  const ok = [];
  for (const id of ids) {
    const key = K + "foto:" + id;
    if ((await redis.persist(key)) === 1 || (await redis.exists(key)) === 1) ok.push(id);
  }
  return ok;
}

// pedidos do próprio membro (e dos acessos com o mesmo WhatsApp)
// o que a pessoa vê de um pedido (sem contato, descrição interna nem segredo)
const pedidoPublico = (p) => ({
      id: p.id,
      tipo: p.tipo,
      titulo: p.titulo,
      onde:
        p.tipo === "imovel"
          ? [p.bairro, p.local].filter(Boolean).join(", ")
          : p.tipo === "obra"
          ? p.local || ""
          : "",
      status: p.status,
      t: p.t,
      ...(p.tipo === "chave" ? { avulsa: !!p.avulsa } : {}),
  mensagens: p.mensagens || [],
  naoLidas: naoLidas(p, "cliente"),
});

export async function getPedidosFor(member) {
  if (!member) return [];
  const mine = await pedidoOwner(member);
  return (await getPedidos()).filter(mine).map(pedidoPublico);
}

// pedidos que este aparelho guardou (pares { id, s } com a chave secreta)
export async function getPedidosBySegredo(meus) {
  const pares = new Map(
    (Array.isArray(meus) ? meus : [])
      .slice(0, 40)
      .filter((x) => x && typeof x.id === "string" && typeof x.s === "string")
      .map((x) => [x.id, x.s])
  );
  if (!pares.size) return [];
  return (await getPedidos())
    .filter((p) => p.segredo && pares.get(p.id) === p.segredo)
    .map(pedidoPublico);
}

// apaga fotos que não estão mais em nenhum cadastro nem anúncio
async function dropFotos(list) {
  if (!Array.isArray(list) || !list.length) return;
  const emUso = new Set();
  for (const p of await getPedidos()) for (const f of p.fotos || []) emUso.add(f);
  for (const im of await getImoveis()) for (const f of im.fotos || []) emUso.add(f);
  for (const f of list) {
    if (!emUso.has(f)) await redis.del(K + "foto:" + f);
  }
}

// ---------- VITRINE DE IMÓVEIS ----------
// pk:imoveis  hash  id -> JSON {
//   id, status (rascunho|disponivel|reservado|vendido), titulo, tipo, cidade,
//   bairro, preco (número em reais), valorVisivel, metragem, quartos,
//   banheiros, vagas, descricao, fotos: [ids] (a primeira é a capa),
//   parceiroCreci (público, quando o anúncio é de um parceiro),
//   — só o Paulo vê: endereco, proprietario, contato, notas, pedidoId —
//   t (criado), atualizado }

const num = (v, max) => {
  const n = Math.round(Number(String(v ?? "").replace(/[^\d]/g, "")));
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : 0;
};

async function cleanImovel(input, base) {
  return {
    ...base,
    status: IMOVEL_STATUS_IDS.includes(input.status) ? input.status : "rascunho",
    titulo: txt(input.titulo, 90),
    tipo: TIPOS_IMOVEL.includes(input.tipo) ? input.tipo : "Outro",
    cidade: txt(input.cidade, 60),
    bairro: txt(input.bairro, 60),
    preco: num(input.preco, 999999999),
    valorVisivel: input.valorVisivel !== false,
    metragem: num(input.metragem, 9999999),
    quartos: num(input.quartos, 50),
    banheiros: num(input.banheiros, 50),
    vagas: num(input.vagas, 50),
    descricao: txt(input.descricao, 3000),
    fotos: await keepFotos(input.fotos, MAX_FOTOS_IMOVEL),
    parceiroCreci: txt(input.parceiroCreci, 30),
    endereco: txt(input.endereco, 160),
    proprietario: txt(input.proprietario, 80),
    contato: txt(input.contato, 60),
    notas: txt(input.notas, 1500),
    pedidoId: txt(input.pedidoId, 40),
    atualizado: Date.now(),
  };
}

export async function getImoveis() {
  if (!redis) return [];
  try {
    const all = await redis.hgetall(K + "imoveis");
    if (!all) return [];
    return Object.values(all)
      .map(parseJson)
      .filter(Boolean)
      .sort((a, b) => (b.t || 0) - (a.t || 0));
  } catch (e) {
    return [];
  }
}

// cria (sem id) ou atualiza (com id); devolve o id ou null
export async function saveImovel(input = {}) {
  if (!redis) return null;
  try {
    if (!String(input.titulo || "").trim()) return null;
    let base;
    if (input.id) {
      base = parseJson(await redis.hget(K + "imoveis", String(input.id)));
      if (!base) return null;
    } else {
      base = {
        id: `i${Date.now().toString(36)}${randomBytes(2).toString("hex")}`,
        t: Date.now(),
      };
    }
    const im = await cleanImovel(input, { id: base.id, t: base.t });
    await redis.hset(K + "imoveis", { [im.id]: JSON.stringify(im) });
    // fotos que saíram do anúncio e não estão em mais nada são apagadas
    const removidas = (base.fotos || []).filter((f) => !im.fotos.includes(f));
    await dropFotos(removidas);
    return im.id;
  } catch (e) {
    return null;
  }
}

export async function deleteImovel(id) {
  if (!redis || !id) return;
  try {
    const im = parseJson(await redis.hget(K + "imoveis", String(id)));
    await redis.hdel(K + "imoveis", String(id));
    await dropFotos(im?.fotos);
  } catch (e) {}
}

// "Preparar anúncio": cria um rascunho a partir do cadastro do proprietário
export async function imovelFromPedido(pedidoId) {
  if (!redis || !pedidoId) return null;
  try {
    const p = parseJson(await redis.hget(K + "pedidos", String(pedidoId)));
    if (!p || p.tipo !== "imovel") return null;
    const titulo = [p.titulo, p.bairro ? "no " + p.bairro : ""].filter(Boolean).join(" ");
    const id = await saveImovel({
      status: "rascunho",
      titulo,
      tipo: p.titulo,
      cidade: p.local,
      bairro: p.bairro,
      preco: parsePreco(p.valor),
      valorVisivel: p.valorVisivel !== false,
      metragem: p.metragem,
      quartos: p.quartos,
      descricao: p.descricao,
      fotos: p.fotos,
      parceiroCreci: p.origem === "parceiro" ? p.creci : "",
      endereco: p.endereco,
      proprietario: p.nome,
      contato: p.whatsapp,
      notas: [p.fase ? "Situação: " + p.fase : "", p.valor ? "Valor pedido: " + p.valor : ""]
        .filter(Boolean)
        .join(" · "),
      pedidoId: p.id,
    });
    if (id) await setPedidoStatus(p.id, "aceito");
    return id;
  } catch (e) {
    return null;
  }
}

// o que o público vê de um imóvel (sem endereço, dono, contato e notas)
const publicImovel = (im) => ({
  id: im.id,
  status: im.status,
  titulo: im.titulo,
  tipo: im.tipo,
  cidade: im.cidade,
  bairro: im.bairro,
  preco: im.valorVisivel ? im.preco : 0,
  sobConsulta: !im.valorVisivel || !im.preco,
  metragem: im.metragem,
  quartos: im.quartos,
  banheiros: im.banheiros,
  vagas: im.vagas,
  descricao: im.descricao,
  fotos: im.fotos,
  parceiroCreci: im.parceiroCreci,
  atualizado: im.atualizado,
});

export async function getVitrine() {
  return (await getImoveis())
    .filter((im) => VITRINE_STATUS.includes(im.status))
    .sort((a, b) => (a.status === b.status ? (b.t || 0) - (a.t || 0) : a.status === "disponivel" ? -1 : 1))
    .map(publicImovel);
}

export async function getImovelPublic(id) {
  if (!redis || !/^[a-z0-9]{6,30}$/i.test(String(id || ""))) return null;
  try {
    const im = parseJson(await redis.hget(K + "imoveis", String(id)));
    return im && VITRINE_STATUS.includes(im.status) ? publicImovel(im) : null;
  } catch (e) {
    return null;
  }
}

// ---------- PLANO ECOSSISTEMA (liberado pelo Paulo no painel) ----------
// fica no membro: plano: "basico" | "premium" (ou vazio), planoDesde: timestamp
// (quem foi liberado antes, com plano: true, conta como Básico)
export const planoDe = (m) =>
  m?.plano === true ? "basico" : PLANO_NIVEIS.includes(m?.plano) ? m.plano : "";

export async function setMemberPlano(id, nivel) {
  if (!redis || !id) return false;
  try {
    const cur = parseJson(await redis.hget(K + "members", String(id)));
    if (!cur) return false;
    const novo = nivel === true ? "basico" : PLANO_NIVEIS.includes(nivel) ? nivel : "";
    const next = novo
      ? { ...cur, plano: novo, planoDesde: planoDe(cur) ? cur.planoDesde || Date.now() : Date.now() }
      : { ...cur, plano: "" };
    await redis.hset(K + "members", { [cur.id]: JSON.stringify(next) });
    return true;
  } catch (e) {
    return false;
  }
}

// ---------- MURAL DE OPORTUNIDADES ----------
// pk:mural  hash id -> JSON { id, tipo, titulo, descricao, area, cidade, empresa,
//                             regime (vaga), memberId, nome, whatsapp,
//                             status: ativo | oculto | encerrado, t, expira,
//                             interesses: [{ id, memberId, nome, whatsapp, empresa, msg, link, t }] }

const muralAtivo = (m, now = Date.now()) => m.status === "ativo" && (m.expira || 0) > now;

export async function getMural() {
  if (!redis) return [];
  try {
    const all = await redis.hgetall(K + "mural");
    return Object.values(all || {})
      .map(parseJson)
      .filter(Boolean)
      .sort((a, b) => (b.t || 0) - (a.t || 0));
  } catch (e) {
    return [];
  }
}

// o que um membro vê de uma publicação de OUTRA pessoa: sem o WhatsApp do autor
// e sem a lista de interessados (só se ele mesmo já demonstrou interesse)
function muralParaOutro(m, member) {
  const meu = (i) =>
    (member?.id && i.memberId === member.id) ||
    (phoneKey(member?.whatsapp).length >= 10 && phoneKey(i.whatsapp) === phoneKey(member.whatsapp));
  return {
    id: m.id,
    tipo: m.tipo,
    titulo: m.titulo,
    descricao: m.descricao,
    area: m.area,
    cidade: m.cidade,
    empresa: m.empresa,
    regime: m.regime,
    link: m.link,
    nome: m.nome,
    t: m.t,
    expira: m.expira,
    interessados: (m.interesses || []).length,
    jaInteressei: (m.interesses || []).some(meu),
  };
}

// lista para a área de membros: o que está no ar (dos outros) + as minhas
export async function getMuralFor(member) {
  const now = Date.now();
  const all = await getMural();
  const meu = (m) => !!member?.id && m.memberId === member.id;
  return {
    posts: all.filter((m) => muralAtivo(m, now) && !meu(m)).map((m) => muralParaOutro(m, member)),
    meus: all
      .filter(meu)
      .filter((m) => m.status !== "oculto")
      .map((m) => ({ ...m, noAr: muralAtivo(m, now) })),
  };
}

export async function saveMuralPost(member, input = {}) {
  if (!redis) return { error: "indisponivel" };
  if (!member?.id) return { error: "conta" };
  const tipo = MURAL_TIPO_IDS.includes(input.tipo) ? input.tipo : null;
  if (!tipo) return { error: "tipo" };
  if (publicarPedePlano(tipo) && !member.plano) return { error: "plano" };
  const titulo = txt(input.titulo, 100);
  const descricao = txt(input.descricao, 1500);
  if (!titulo || !descricao) return { error: "campos" };
  try {
    const now = Date.now();
    // o limite de 5 no ar vale para Procuro/Ofereço/Vaga (recomendações passam pelo Paulo)
    const ativos = (await getMural()).filter(
      (m) => m.memberId === member.id && muralAtivo(m, now) && !pedeAprovacao(m.tipo)
    );
    if (!pedeAprovacao(tipo) && ativos.length >= MURAL_MAX_ATIVOS) return { error: "limite" };
    const post = {
      id: `o${now.toString(36)}${randomBytes(2).toString("hex")}`,
      tipo,
      titulo,
      descricao,
      area: txt(input.area, 60),
      cidade: txt(input.cidade, 60),
      empresa: txt(input.empresa, 80),
      regime: tipo === "vaga" && REGIMES.includes(input.regime) ? input.regime : "",
      // Recomendo: Instagram ou site de quem foi recomendado
      link: tipo === "recomendo" ? txt(input.link, 200) : "",
      memberId: member.id,
      nome: txt(member.nome, 80),
      whatsapp: txt(member.whatsapp, 40),
      // recomendação espera o Paulo aprovar (o prazo começa a contar na aprovação)
      status: pedeAprovacao(tipo) ? "analise" : "ativo",
      t: now,
      expira: now + MURAL_DIAS * 24 * 60 * 60 * 1000,
      interesses: [],
    };
    await redis.hset(K + "mural", { [post.id]: JSON.stringify(post) });
    return { id: post.id };
  } catch (e) {
    return { error: "falha" };
  }
}

// "Tenho interesse" / "Quero me candidatar".
// member: quem está logado (ou null — só na vaga, pela página pública)
export async function muralInteresse(member, id, input = {}) {
  if (!redis || !id) return { error: "indisponivel" };
  try {
    const m = parseJson(await redis.hget(K + "mural", String(id)));
    if (!m || !muralAtivo(m)) return { error: "fechado" };
    if (m.tipo === "recomendo") return { error: "tipo" };
    if (member?.id && m.memberId === member.id) return { error: "proprio" };
    if (m.tipo !== "vaga" && !member?.id) return { error: "conta" };
    if (responderPedePlano(m.tipo) && !member?.plano) return { error: "plano" };
    const nome = txt(member?.nome || input.nome, 80);
    const whatsapp = txt(member?.whatsapp || input.whatsapp, 40);
    if (!nome || phoneKey(whatsapp).length < 10) return { error: "contato" };
    const lista = m.interesses || [];
    const igual = (i) =>
      (member?.id && i.memberId === member.id) || phoneKey(i.whatsapp) === phoneKey(whatsapp);
    if (lista.some(igual)) return { error: "repetido" };
    if (lista.length >= MURAL_MAX_INTERESSES) return { error: "cheio" };
    const novo = {
      id: randomBytes(6).toString("hex"),
      memberId: member?.id || "",
      nome,
      whatsapp,
      empresa: txt(input.empresa, 80),
      msg: txt(input.msg, 800),
      link: txt(input.link, 200),
      t: Date.now(),
    };
    await redis.hset(K + "mural", {
      [m.id]: JSON.stringify({ ...m, interesses: [...lista, novo] }),
    });
    return { ok: true };
  } catch (e) {
    return { error: "falha" };
  }
}

// quem publicou encerra (vaga preenchida, já achou fornecedor...)
export async function encerrarMuralPost(member, id) {
  if (!redis || !member?.id || !id) return false;
  try {
    const m = parseJson(await redis.hget(K + "mural", String(id)));
    if (!m || m.memberId !== member.id) return false;
    await redis.hset(K + "mural", { [m.id]: JSON.stringify({ ...m, status: "encerrado" }) });
    return true;
  } catch (e) {
    return false;
  }
}

// painel do Paulo: tirar do ar / voltar / excluir
export async function setMuralStatus(id, status) {
  if (!redis || !id || !["ativo", "oculto", "encerrado", "recusado"].includes(status)) return;
  try {
    const m = parseJson(await redis.hget(K + "mural", String(id)));
    if (!m) return;
    const next = { ...m, status };
    // aprovando uma recomendação: fica 90 dias no ar a partir de agora
    if (status === "ativo" && m.status === "analise") {
      next.aprovada = Date.now();
      next.expira = Date.now() + RECOMENDO_DIAS * 24 * 60 * 60 * 1000;
    }
    await redis.hset(K + "mural", { [m.id]: JSON.stringify(next) });
  } catch (e) {}
}

export async function deleteMuralPost(id) {
  if (!redis || !id) return;
  try {
    await redis.hdel(K + "mural", String(id));
  } catch (e) {}
}

// página pública /vagas: só o necessário (sem contato de quem publicou)
export async function getVagasPublicas() {
  const now = Date.now();
  return (await getMural())
    .filter((m) => m.tipo === "vaga" && muralAtivo(m, now))
    .map((m) => ({
      id: m.id,
      titulo: m.titulo,
      descricao: m.descricao,
      area: m.area,
      cidade: m.cidade,
      empresa: m.empresa,
      regime: m.regime,
      t: m.t,
    }));
}
