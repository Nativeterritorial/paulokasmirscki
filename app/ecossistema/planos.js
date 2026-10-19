"use client";

import { useState } from "react";
import { PLANOS, EXTRAS_PREMIUM } from "../parcerias/mural";

const WHATSAPP = "https://wa.me/5554996505799";
const wa = (msg) => `${WHATSAPP}?text=${encodeURIComponent(msg)}`;

// Planos: Grátis · Básico · Premium. O Premium tem abas com os extras
// (Destaque, Plano de Vendas, Gestão), que somam ao valor e são combinados
// direto com o Paulo.
export default function Planos() {
  const [aba, setAba] = useState("inclui");
  const extra = EXTRAS_PREMIUM.find((e) => e.id === aba);

  return (
    <div className="eco-planos eco-planos-3">
      <article className="eco-plano">
        <div className="kick">Para começar</div>
        <h3>{PLANOS.gratis.nome}</h3>
        <div className="eco-preco">
          {PLANOS.gratis.preco}
        </div>
        <p className="eco-plano-sub">{PLANOS.gratis.sub}</p>
        <ul className="join-checks">
          {PLANOS.gratis.beneficios.map((b) => (
            <li key={b}>✓ {b}</li>
          ))}
        </ul>
        <a className="btn btn-outline" href="#cadastro">
          Criar meu acesso
        </a>
      </article>

      <article className="eco-plano basico">
        <div className="kick">Mais escolhido</div>
        <h3>{PLANOS.basico.nome}</h3>
        <div className="eco-preco">
          {PLANOS.basico.preco}
          <small>/mês</small>
        </div>
        <p className="eco-plano-sub">{PLANOS.basico.sub}</p>
        <ul className="join-checks">
          {PLANOS.basico.beneficios.map((b) => (
            <li key={b}>✓ {b}</li>
          ))}
        </ul>
        <a
          className="btn btn-primary"
          href={wa(`Olá Paulo! Quero assinar o plano ${PLANOS.basico.nome} (${PLANOS.basico.preco}/mês) do Ecossistema PK.`)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Quero o Básico
        </a>
      </article>

      <article className="eco-plano destaque">
        <div className="eco-plano-selo">★ Para empresas</div>
        <div className="kick">Completo</div>
        <h3>{PLANOS.premium.nome}</h3>
        <div className="eco-preco">
          {PLANOS.premium.preco}
          <small>/mês</small>
        </div>
        <p className="eco-plano-sub">{PLANOS.premium.sub}</p>

        <div className="eco-abas" role="tablist" aria-label="O que o Premium oferece">
          {[["inclui", "Inclui"], ...EXTRAS_PREMIUM.map((e) => [e.id, e.nome])].map(([id, lbl]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={aba === id}
              className={`eco-aba${aba === id ? " on" : ""}`}
              onClick={() => setAba(id)}
            >
              {id === "inclui" ? lbl : `+ ${lbl}`}
            </button>
          ))}
        </div>

        {aba === "inclui" ? (
          <ul className="join-checks">
            {PLANOS.premium.beneficios.map((b) => (
              <li key={b}>✓ {b}</li>
            ))}
          </ul>
        ) : (
          <div className="eco-extra">
            <div className="eco-extra-valor">
              {PLANOS.premium.preco}/mês <span>+ {extra.valor}</span>
            </div>
            <ul className="join-checks">
              {extra.itens.map((b) => (
                <li key={b}>✓ {b}</li>
              ))}
            </ul>
          </div>
        )}

        <a
          className="mur-plano-btn eco-plano-btn"
          href={wa(
            aba === "inclui"
              ? `Olá Paulo! Quero assinar o plano ${PLANOS.premium.nome} (${PLANOS.premium.preco}/mês) do Ecossistema PK.`
              : `Olá Paulo! Quero o plano ${PLANOS.premium.nome} com o extra ${extra.nome}. Podemos conversar sobre os valores?`
          )}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="mur-plano-star" aria-hidden="true">
            ★
          </span>
          <span>
            <small>{aba === "inclui" ? "Apareça e venda mais" : "Valores com o Paulo"}</small>
            {aba === "inclui" ? "Quero o Premium" : `Quero o ${extra.nome}`}
          </span>
        </a>
      </article>
    </div>
  );
}
