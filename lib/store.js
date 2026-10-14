import { randomBytes } from "node:crypto";
import { Redis } from "@upstash/redis";
import { STATUS_IDS } from "../app/parcerias/referral-status";

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

// registra o último acesso do membro (aparece no painel)
export async function touchMember(id) {
  if (!redis || !id) return;
  try {
    await redis.hset(K + "member-seen", { [String(id)]: String(Date.now()) });
  } catch (e) {}
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
