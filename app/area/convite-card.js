"use client";

import { useEffect, useState } from "react";

// "Convide para a rede": o link de convite do membro. No WhatsApp, a prévia
// aparece como "<Nome> te convidou para o Ecossistema PK"; quem se cadastra
// por ele fica registrado como convidado deste membro.
export default function ConviteCard({ code, member }) {
  const [d, setD] = useState(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!code || !member?.id) return;
    fetch("/api/convites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((r) => r.json())
      .then((j) => j.ok && j.personal && setD(j))
      .catch(() => {});
  }, [code, member?.id]);

  if (!d) return null;

  const msg = `Oi! Quero te convidar para o Ecossistema PK, a rede de empresas de confiança do Paulo Kasmirscki. O cadastro é grátis: ${d.link}`;
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(d.link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch (e) {}
  };
  const n = d.convidados.length;

  return (
    <section className="convite-card">
      <div className="convite-txt">
        <div className="convite-kick">🔗 Seu convite</div>
        <h3>Convide para o Ecossistema PK</h3>
        <p>
          Mande o seu link: no WhatsApp ele aparece como{" "}
          <strong>“{member.nome.split(" ")[0]} te convidou para o Ecossistema PK”</strong>, e quem entrar
          por ele fica registrado como convite seu.
        </p>
        <p className="convite-conta">
          {n
            ? `🙌 Você já trouxe ${n} ${n === 1 ? "pessoa" : "pessoas"} para a rede: ${d.convidados.join(", ")}.`
            : "Ninguém entrou pelo seu convite ainda. Que tal começar hoje?"}
        </p>
      </div>
      <div className="convite-acoes">
        <code className="convite-link">{d.link.replace("https://www.", "")}</code>
        <div className="convite-btns">
          <a
            className="convite-wa"
            href={`https://wa.me/?text=${encodeURIComponent(msg)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Enviar no WhatsApp
          </a>
          <button type="button" className="convite-copiar" onClick={copiar}>
            {copiado ? "Copiado ✓" : "Copiar link"}
          </button>
        </div>
      </div>
    </section>
  );
}
