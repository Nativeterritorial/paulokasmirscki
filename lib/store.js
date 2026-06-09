import { Redis } from "@upstash/redis";

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
    p.lpush(K + "list:queries", JSON.stringify({ t: ts, q: String(text).slice(0, 300) }));
    p.ltrim(K + "list:queries", 0, 199);
    // ranking do que a IA mais recomenda
    for (const id of recommended) {
      p.zincrby(K + "z:recommended", 1, id);
    }
    await p.exec();
  } catch (e) {}
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

// Lê todas as estatísticas para o painel
export async function getStats() {
  if (!redis) return { ready: false };
  try {
    const [qTotal, cTotal, recRaw, conRaw, queries, connects] =
      await Promise.all([
        redis.get(K + "stat:queries:total"),
        redis.get(K + "stat:connects:total"),
        redis.zrange(K + "z:recommended", 0, 19, { rev: true, withScores: true }),
        redis.zrange(K + "z:connects", 0, 19, { rev: true, withScores: true }),
        redis.lrange(K + "list:queries", 0, 49),
        redis.lrange(K + "list:connects", 0, 49),
      ]);

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
      },
      recommended: pairsToList(recRaw || []),
      connectsRanking: pairsToList(conRaw || []),
      recentQueries: parse(queries),
      recentConnects: parse(connects),
    };
  } catch (e) {
    return { ready: false, error: String(e) };
  }
}
