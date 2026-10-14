"use client";

import { useMemo, useState } from "react";
import { formatPreco, imovelCodigo } from "./imovel-defs";

const FAIXAS = [
  [0, "Qualquer valor"],
  [300000, "Até R$ 300 mil"],
  [500000, "Até R$ 500 mil"],
  [800000, "Até R$ 800 mil"],
  [1200000, "Até R$ 1,2 milhão"],
];

const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

// Lista pública com filtros (tipo, cidade, quartos, valor e busca livre)
export default function Vitrine({ imoveis }) {
  const [tipo, setTipo] = useState("");
  const [cidade, setCidade] = useState("");
  const [quartos, setQuartos] = useState(0);
  const [ate, setAte] = useState(0);
  const [busca, setBusca] = useState("");

  const tipos = useMemo(() => [...new Set(imoveis.map((i) => i.tipo))].sort(), [imoveis]);
  const cidades = useMemo(
    () => [...new Set(imoveis.map((i) => i.cidade).filter(Boolean))].sort(),
    [imoveis]
  );

  const lista = imoveis.filter(
    (i) =>
      (!tipo || i.tipo === tipo) &&
      (!cidade || i.cidade === cidade) &&
      (!quartos || (i.quartos || 0) >= quartos) &&
      // "sob consulta" continua aparecendo: não dá pra saber se passa do limite
      (!ate || i.sobConsulta || i.preco <= ate) &&
      (!busca ||
        norm(`${i.titulo} ${i.tipo} ${i.bairro} ${i.cidade} ${i.descricao} ${imovelCodigo(i)}`).includes(norm(busca)))
  );

  const limpar = () => {
    setTipo("");
    setCidade("");
    setQuartos(0);
    setAte(0);
    setBusca("");
  };
  const filtrando = tipo || cidade || quartos || ate || busca;

  if (!imoveis.length) {
    return (
      <div className="vt-empty">
        <h2>Em breve, novos imóveis por aqui</h2>
        <p>
          Os primeiros anúncios estão sendo preparados. Procura algo específico?
          Me conte o que você precisa que eu busco para você.
        </p>
        <a
          className="btn btn-primary"
          href={`https://wa.me/5554996505799?text=${encodeURIComponent("Olá Paulo! Estou procurando um imóvel: ")}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Dizer o que procuro
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="vt-filters">
        <label className="vt-search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10.5 3a7.5 7.5 0 015.9 12.1l4.2 4.2-1.4 1.4-4.2-4.2A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 100 11 5.5 5.5 0 000-11z" />
          </svg>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por bairro, cidade ou código"
            aria-label="Buscar imóvel"
          />
        </label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} aria-label="Tipo de imóvel">
          <option value="">Todos os tipos</option>
          {tipos.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {cidades.length > 1 && (
          <select value={cidade} onChange={(e) => setCidade(e.target.value)} aria-label="Cidade">
            <option value="">Todas as cidades</option>
            {cidades.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
        <select value={quartos} onChange={(e) => setQuartos(Number(e.target.value))} aria-label="Quartos">
          <option value={0}>Quartos</option>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n}+ quartos
            </option>
          ))}
        </select>
        <select value={ate} onChange={(e) => setAte(Number(e.target.value))} aria-label="Valor máximo">
          {FAIXAS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div className="vt-count">
        {lista.length} {lista.length === 1 ? "imóvel" : "imóveis"}
        {filtrando ? (
          <button type="button" onClick={limpar}>
            Limpar filtros
          </button>
        ) : null}
      </div>

      {!lista.length ? (
        <div className="vt-empty">
          <p>Nenhum imóvel com esses filtros.</p>
          <button type="button" className="btn btn-outline" onClick={limpar}>
            Ver todos
          </button>
        </div>
      ) : (
        <div className="vt-grid">
          {lista.map((i) => (
            <a className="vt-card" href={`/imoveis/${i.id}`} key={i.id}>
              <div className="vt-card-img">
                {i.fotos?.[0] ? (
                  <img src={`/api/foto/${i.fotos[0]}`} alt={i.titulo} loading="lazy" />
                ) : (
                  <span className="vt-noimg">Fotos em breve</span>
                )}
                {i.status === "reservado" && <span className="vt-badge">Reservado</span>}
                <span className="vt-tipo">{i.tipo}</span>
              </div>
              <div className="vt-card-body">
                <div className="vt-loc">{[i.bairro, i.cidade].filter(Boolean).join(", ")}</div>
                <h2>{i.titulo}</h2>
                <div className="vt-specs">
                  {i.metragem > 0 && <span>{i.metragem} m²</span>}
                  {i.quartos > 0 && <span>{i.quartos} {i.quartos === 1 ? "quarto" : "quartos"}</span>}
                  {i.banheiros > 0 && <span>{i.banheiros} {i.banheiros === 1 ? "banheiro" : "banheiros"}</span>}
                  {i.vagas > 0 && <span>{i.vagas} {i.vagas === 1 ? "vaga" : "vagas"}</span>}
                </div>
                <div className="vt-preco">{i.sobConsulta ? "Valor sob consulta" : formatPreco(i.preco)}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </>
  );
}
