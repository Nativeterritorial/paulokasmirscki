"use client";

import { useEffect, useState } from "react";

// Raio-X do negócio: 4 perguntas -> Mapa de Oportunidades (quem pode ser cliente
// e quem pode ser parceiro na rede) + 1 Chave PK de boas-vindas.

const PERGUNTAS = [
  ["faz", "O que você faz?", "Ex.: sou contador, tenho uma loja de móveis, sou fotógrafo…", true],
  ["oferece", "O que você tem para oferecer à rede?", "Seus produtos, serviços, diferenciais ou uma condição especial para quem é da rede", true],
  ["procura", "O que você procura agora?", "Ex.: novos clientes, um fornecedor de embalagens, um sócio, divulgar a marca…", false],
  ["cliente", "Quem é o seu cliente ideal?", "Ex.: construtoras da região, famílias com filhos, pequenas empresas…", false],
];

export function useRaiox(code, member) {
  const [raiox, setRaiox] = useState(undefined); // undefined = carregando
  useEffect(() => {
    if (!code || !member?.id) {
      setRaiox(null);
      return;
    }
    fetch("/api/raiox", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((r) => r.json())
      .then((d) => setRaiox(d.raiox || null))
      .catch(() => setRaiox(null));
  }, [code, member?.id]);
  return [raiox, setRaiox];
}

function Empresa({ e, c, gratis, onChave }) {
  if (!c) return null;
  return (
    <div className="rx-emp">
      <div className="rx-emp-txt">
        <div className="rx-emp-seg">{c.segmento}</div>
        <div className="rx-emp-nm">{c.nome}</div>
        <p>{e.motivo}</p>
      </div>
      <div className="rx-emp-btns">
        <button type="button" className="rx-chave" onClick={() => onChave(c, gratis)}>
          🔑 {gratis ? "Chave PK grátis" : "Chave PK"}
        </button>
        {c.link && (
          <a href={c.link} target="_blank" rel="noopener noreferrer">
            {/instagram\.com/i.test(c.link) ? "Instagram" : "Site"} ↗
          </a>
        )}
      </div>
    </div>
  );
}

const WHATSAPP = "https://wa.me/5554996505799";

// resumo das respostas, para o concierge e para o WhatsApp do Paulo
const resumoRespostas = (r = {}) =>
  [
    r.faz && `faço: ${r.faz}`,
    r.oferece && `ofereço: ${r.oferece}`,
    r.procura && `procuro: ${r.procura}`,
    r.cliente && `meu cliente ideal: ${r.cliente}`,
  ]
    .filter(Boolean)
    .join("; ");

export default function RaioX({ code, member, companies, raiox, setRaiox, onClose, onChave, onConcierge }) {
  const [refazer, setRefazer] = useState(!raiox);
  const [f, setF] = useState(() => ({ faz: "", oferece: "", procura: "", cliente: "", ...(raiox?.respostas || {}) }));
  const [gerando, setGerando] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const porId = Object.fromEntries((companies || []).map((c) => [c.id, c]));
  const gratis = raiox && !raiox.chaveUsada;

  const gerar = async (e) => {
    e.preventDefault();
    setErr("");
    if (f.faz.trim().length < 3 || f.oferece.trim().length < 3) {
      setErr("Conte pelo menos o que você faz e o que tem para oferecer.");
      return;
    }
    setGerando(true);
    try {
      const r = await fetch("/api/raiox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, action: "gerar", respostas: f }),
      });
      const d = await r.json();
      if (d.ok && d.raiox) {
        setRaiox(d.raiox);
        setRefazer(false);
      } else setErr(d.error || "Não consegui montar o seu Raio-X agora. Tente de novo.");
    } catch (e2) {
      setErr("Não consegui montar o seu Raio-X agora. Tente de novo.");
    }
    setGerando(false);
  };

  const nome = (member?.nome || "").split(" ")[0];

  return (
    <div className="modal-bg rx-bg" role="dialog" aria-modal="true" aria-label="Raio-X do seu negócio" onClick={onClose}>
      <div className="rx-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="rx-fechar" onClick={onClose} aria-label="Fechar">
          ✕
        </button>

        {!member?.id ? (
          <div className="rx-head">
            <div className="rx-kick">🔍 Raio-X do seu negócio</div>
            <h3>Entre com a sua conta para fazer o seu Raio-X</h3>
            <p>O Raio-X fica guardado no seu perfil. Entre com o seu WhatsApp e a sua senha para descobrir as suas oportunidades na rede.</p>
          </div>
        ) : gerando ? (
          <div className="rx-gerando">
            <div className="rx-radar" aria-hidden="true">
              <span />
            </div>
            <h3>Analisando a rede para você…</h3>
            <p>Cruzando o que você contou com as empresas do Ecossistema PK.</p>
          </div>
        ) : refazer || !raiox ? (
          <form onSubmit={gerar}>
            <div className="rx-head">
              <div className="rx-kick">🔍 Raio-X do seu negócio</div>
              <h3>{nome ? `${nome}, conte sobre você` : "Conte sobre você"} e veja as suas oportunidades na rede</h3>
              <p>
                4 perguntas rápidas. Em segundos você recebe o seu <strong>Mapa de Oportunidades</strong>:
                quem na rede pode ser seu cliente e quem pode ser seu parceiro. E a sua{" "}
                <strong>1ª Chave PK é por nossa conta</strong> 🎁
              </p>
            </div>
            <div className="rx-perguntas">
              {PERGUNTAS.map(([k, t, ph, obrig], i) => (
                <label key={k}>
                  <span>
                    <b>{i + 1}</b> {t}
                    {!obrig && <em> (opcional)</em>}
                  </span>
                  <textarea
                    rows={2}
                    value={f[k]}
                    placeholder={ph}
                    maxLength={600}
                    onChange={(e) => setF((s) => ({ ...s, [k]: e.target.value }))}
                  />
                </label>
              ))}
            </div>
            {err && <p className="rx-err">{err}</p>}
            <button className="rx-gerar" type="submit">
              ✦ Gerar meu Mapa de Oportunidades
            </button>
          </form>
        ) : (
          <div>
            <div className="rx-head">
              <div className="rx-kick">🔍 Seu Raio-X</div>
              <h3>Seu Mapa de Oportunidades</h3>
              {raiox.mapa?.resumo && <p>{raiox.mapa.resumo}</p>}
            </div>
            {gratis && (
              <div className="rx-presente">
                🎁 <strong>A sua 1ª Chave PK é por nossa conta.</strong> Escolha uma empresa abaixo e o Paulo faz a
                apresentação pessoalmente.
              </div>
            )}
            <div className="rx-cols">
              <section>
                <h4>🤝 Podem ser seus clientes</h4>
                {raiox.mapa?.clientes?.length ? (
                  raiox.mapa.clientes.map((e) => (
                    <Empresa key={e.id} e={e} c={porId[e.id]} gratis={gratis} onChave={onChave} />
                  ))
                ) : (
                  <p className="rx-vazio">Ainda não achei clientes certos na rede. O Paulo vai procurar para você.</p>
                )}
              </section>
              <section>
                <h4>🧰 Parceiros e fornecedores para você</h4>
                {raiox.mapa?.parceiros?.length ? (
                  raiox.mapa.parceiros.map((e) => (
                    <Empresa key={e.id} e={e} c={porId[e.id]} gratis={gratis} onChave={onChave} />
                  ))
                ) : (
                  <p className="rx-vazio">Ainda não achei parceiros certos na rede. O Paulo vai procurar para você.</p>
                )}
              </section>
            </div>
            <div className="rx-proximo">
              <div>
                <strong>E agora?</strong> Converse sobre o seu mapa e descubra por onde começar.
              </div>
              <div className="rx-proximo-btns">
                <button
                  type="button"
                  className="rx-concierge"
                  onClick={() =>
                    onConcierge(
                      `Fiz o meu Raio-X do negócio (${resumoRespostas(raiox.respostas)}). Por onde eu começo para aproveitar as conexões da rede?`
                    )
                  }
                >
                  💬 Conversar com o concierge
                </button>
                <a
                  className="rx-paulo"
                  href={`${WHATSAPP}?text=${encodeURIComponent(
                    `Olá Paulo! ${nome ? `Aqui é ${member?.nome}. ` : ""}Fiz o meu Raio-X no Ecossistema PK (${resumoRespostas(raiox.respostas)}). Quero conversar sobre as oportunidades na rede.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📲 Falar com o Paulo
                </a>
              </div>
            </div>
            <div className="rx-rodape">
              <button type="button" className="rx-refazer" onClick={() => setRefazer(true)}>
                Refazer meu Raio-X
              </button>
              <span>As suas respostas ajudam o Paulo a te apresentar para as pessoas certas.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
