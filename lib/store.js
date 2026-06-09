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

// Registra uma pergunta feita ao concierge
export async function logQuery(text, recommended = []) {
  if (!redis) return;
  const ts = Date.now();
  try {
    const p = redis.pipeline();
    p.incr("stat:queries:total");
    p.lpush("list:queries", JSON.stringify({ t: ts, q: String(text).slice(0, 300) }));
    p.ltrim("list:queries", 0, 199);
    // ranking do que a IA mais recomenda
    for (const id of recommended) {
      p.zincrby("z:recommended", 1, id);
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
    p.incr("stat:connects:total");
    p.zincrby("z:connects", 1, companyId);
    p.lpush(
      "list:connects",
      JSON.stringify({ t: ts, id: companyId, nome: companyName || companyId })
    );
    p.ltrim("list:connects", 0, 199);
    await p.exec();
  } catch (e) {}
}

// Lê todas as estatísticas para o painel
export async function getStats() {
  if (!redis) return { ready: false };
  try {
    const [qTotal, cTotal, recRaw, conRaw, queries, connects] =
      await Promise.all([
        redis.get("stat:queries:total"),
        redis.get("stat:connects:total"),
        redis.zrange("z:recommended", 0, 19, { rev: true, withScores: true }),
        redis.zrange("z:connects", 0, 19, { rev: true, withScores: true }),
        redis.lrange("list:queries", 0, 49),
        redis.lrange("list:connects", 0, 49),
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
