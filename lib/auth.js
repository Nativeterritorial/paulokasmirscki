import { findMemberByToken } from "./store";

// Confere o acesso à Área de Membros: só o token pessoal do membro (o mesmo
// do link pessoal e o que a entrada com WhatsApp + senha devolve).
// O código geral antigo foi desligado.
export async function checkAccess(rawCode) {
  const code = String(rawCode || "").trim();
  if (!code) return { ok: false, member: null };

  const member = await findMemberByToken(code);
  if (member)
    return {
      ok: true,
      member: { id: member.id, nome: member.nome, whatsapp: member.whatsapp || "" },
    };

  return { ok: false, member: null };
}
