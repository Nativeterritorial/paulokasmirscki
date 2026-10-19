import { findMemberByToken } from "./store";

// Confere o código de acesso da Área de Membros. Aceita dois tipos:
// - o link pessoal de um membro (token único, criado pelo Paulo no painel);
// - o código geral antigo (AREA_CODE), que continua valendo para quem já tinha.
// Devolve { ok, member } — member é null quando entrou pelo código geral.
export async function checkAccess(rawCode) {
  const code = String(rawCode || "").trim();
  if (!code) return { ok: false, member: null };

  const shared = process.env.AREA_CODE || "teste123";
  if (code === shared) return { ok: true, member: null };

  const member = await findMemberByToken(code);
  if (member)
    return {
      ok: true,
      member: {
        id: member.id,
        nome: member.nome,
        whatsapp: member.whatsapp || "",
        plano: !!member.plano,
      },
    };

  return { ok: false, member: null };
}
