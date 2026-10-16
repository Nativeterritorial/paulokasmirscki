// Seção "Sua rede gera negócios ou só contatos?": a rede da pessoa (esquerda),
// as três pontes do Ecossistema PK (meio) e as novas oportunidades (direita).
// SVG puro com animação em CSS; no celular o desenho fica na vertical.

const ICONS = {
  empresa: "M4 21V3h11v18M15 9h5v12M8 7h3M8 11h3M8 15h3M2 21h20",
  clientes: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  equipe: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  fornecedores: "M1 3h15v13H1zM16 8h4l3 3v5h-7zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  ind: "M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3",
  intro: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  parc: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  socios: "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",
  contatos: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
  cresc: "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
  investidores: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  visibilidade: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  nclientes: "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 8v6M23 11h-6",
  ncanais: "M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM16.24 7.76a6 6 0 0 1 0 8.49M7.76 16.24a6 6 0 0 1 0-8.49M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14",
  nparceiros: "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17 11l2 2 4-4",
  nmercados: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
};

// tipo: base (rede da pessoa), centro (sua empresa), ponte, alvo (negócios), novo
const NODES = {
  empresa: { label: "Sua empresa", tipo: "centro" },
  clientes: { label: "Clientes", tipo: "base" },
  equipe: { label: "Equipe", tipo: "base" },
  fornecedores: { label: "Fornecedores", tipo: "base" },
  socios: { label: "Sócios", tipo: "base" },
  contatos: { label: "Seus contatos", tipo: "base" },
  ind: { label: "Indicações", tipo: "ponte", cor: "#6fffbf" },
  intro: { label: "Chave PK", tipo: "ponte", cor: "#f5c04e" },
  parc: { label: "Parcerias", tipo: "ponte", cor: "#d2b6ff" },
  cresc: { label: "Negócios fechados", tipo: "alvo" },
  nclientes: { label: "Novos clientes", tipo: "novo" },
  ncanais: { label: "Novos canais", tipo: "novo" },
  nparceiros: { label: "Novos parceiros", tipo: "novo" },
  nmercados: { label: "Novos mercados", tipo: "novo" },
  investidores: { label: "Investidores", tipo: "novo" },
  visibilidade: { label: "Visibilidade", tipo: "novo" },
};

// anel: a ordem das oportunidades ao redor de "Negócios fechados"
const LAYOUTS = {
  h: {
    vb: "0 0 1000 520",
    zonas: [
      { cx: 190, cy: 260, r: 172, cls: "rp-zona", titulo: "SUA REDE", tx: 190, ty: 62 },
      { cx: 820, cy: 260, r: 168, cls: "rp-zona rp-zona-nova", titulo: "NOVAS OPORTUNIDADES", tx: 820, ty: 66 },
    ],
    meio: { titulo: "ECOSSISTEMA PK", tx: 500, ty: 50 },
    pos: {
      empresa: [190, 262], clientes: [169, 144], contatos: [294, 202], fornecedores: [282, 339], socios: [130, 366], equipe: [72, 241],
      ind: [500, 130], intro: [500, 262], parc: [500, 394],
      cresc: [820, 262], nclientes: [718, 203], ncanais: [820, 144], nmercados: [922, 203],
      visibilidade: [922, 321], investidores: [820, 380], nparceiros: [718, 321],
    },
    anel: ["nclientes", "ncanais", "nmercados", "visibilidade", "investidores", "nparceiros"],
  },
  v: {
    vb: "0 0 400 935",
    zonas: [
      { cx: 200, cy: 178, r: 150, cls: "rp-zona", titulo: "SUA REDE", tx: 200, ty: 16 },
      { cx: 200, cy: 738, r: 168, cls: "rp-zona rp-zona-nova", titulo: "NOVAS OPORTUNIDADES", tx: 200, ty: 556 },
    ],
    meio: { titulo: "ECOSSISTEMA PK", tx: 200, ty: 392 },
    pos: {
      empresa: [200, 186], equipe: [200, 86], clientes: [108, 150], contatos: [292, 150], socios: [128, 272], fornecedores: [272, 272],
      ind: [76, 450], intro: [200, 450], parc: [324, 450],
      cresc: [200, 735], nclientes: [94, 670], ncanais: [200, 610], nparceiros: [306, 670],
      visibilidade: [306, 800], investidores: [200, 860], nmercados: [94, 800],
    },
    anel: ["nclientes", "ncanais", "nparceiros", "visibilidade", "investidores", "nmercados"],
  },
};

// ligações dentro da rede da pessoa e dentro das oportunidades
const linhas = (L) => [
  ...["clientes", "equipe", "fornecedores", "socios", "contatos"].map((k) => ["empresa", k]),
  // sem as ligações retas pra cima e pra baixo: deixam o nome "Negócios fechados" livre
  ...L.anel.filter((k) => k !== "ncanais" && k !== "investidores").map((k) => ["cresc", k]),
  ...L.anel.map((k, i) => [k, L.anel[(i + 1) % L.anel.length]]),
];
// os três fluxos: da rede, pela ponte, até a oportunidade
const FLUXOS = [
  ["clientes", "ind", "nclientes"],
  ["empresa", "intro", "cresc"],
  ["fornecedores", "parc", "nparceiros"],
];

const R = { base: 25, centro: 34, ponte: 30, alvo: 32, novo: 25 };

function Diagrama({ id, layout }) {
  const L = LAYOUTS[layout];
  const p = (k) => L.pos[k];
  const seg = (a, b) => `M ${p(a)[0]} ${p(a)[1]} L ${p(b)[0]} ${p(b)[1]}`;
  return (
    <svg
      className={`rp-svg rp-svg-${layout}`}
      viewBox={L.vb}
      role="img"
      aria-labelledby={`${id}-t`}
    >
      <title id={`${id}-t`}>
        Sua rede (clientes, equipe, fornecedores, sócios e seus contatos) passa
        pelas três pontes do Ecossistema PK (indicações, Chave PK e parcerias) e
        chega a negócios fechados: novos clientes, canais, parceiros, mercados,
        investidores e visibilidade.
      </title>
      {L.zonas.map((z) => (
        <g key={z.titulo}>
          <circle className={z.cls} cx={z.cx} cy={z.cy} r={z.r} />
          <text className="rp-zona-t" x={z.tx} y={z.ty} textAnchor="middle">
            {z.titulo}
          </text>
        </g>
      ))}
      <text className="rp-zona-t rp-meio-t" x={L.meio.tx} y={L.meio.ty} textAnchor="middle">
        {L.meio.titulo}
      </text>

      {linhas(L).map(([a, b]) => (
        <path key={a + b} className="rp-linha" d={seg(a, b)} />
      ))}
      {FLUXOS.map(([a, ponte, b], i) => (
        <g key={ponte} style={{ "--c": NODES[ponte].cor, "--d": `${i * 0.6}s` }}>
          <path className="rp-fluxo-base" d={`${seg(a, ponte)} ${seg(ponte, b).replace("M", "L")}`} />
          <path className="rp-fluxo" d={`${seg(a, ponte)} ${seg(ponte, b).replace("M", "L")}`} />
        </g>
      ))}

      {Object.entries(NODES).map(([k, n]) => {
        const [x, y] = p(k);
        const r = R[n.tipo];
        const s = n.tipo === "centro" ? 1.15 : n.tipo === "base" || n.tipo === "novo" ? 0.85 : 1;
        return (
          <g
            key={k}
            className={`rp-no rp-${n.tipo}`}
            style={n.cor ? { "--c": n.cor } : undefined}
          >
            <circle cx={x} cy={y} r={r} />
            <path
              className="rp-ic"
              d={ICONS[k]}
              transform={`translate(${x - 12 * s} ${y - 12 * s}) scale(${s})`}
            />
            {n.label && (
              <text
                className="rp-lbl"
                x={x}
                y={y + r + 20}
                textAnchor="middle"
              >
                {n.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

const PONTES = [
  {
    cor: "#6fffbf",
    t: "Indicações",
    d: "Seus clientes e contatos viram indicações, e quem indica é bonificado quando o negócio fecha.",
  },
  {
    cor: "#f5c04e",
    t: "Chave PK",
    d: "Com a Chave PK, você é apresentado direto a quem decide na empresa certa da rede.",
  },
  {
    cor: "#d2b6ff",
    t: "Parcerias",
    d: "Obra, abertura de negócio, gestão e imóveis com parceiros de confiança, em um só lugar.",
  },
];

export default function RedePontes() {
  return (
    <section id="pontes" className="rp-sec">
      <div className="container">
        <div className="rp-head">
          <div className="eyebrow">Do contato ao negócio</div>
          <h2 className="rp-title">
            Sua rede gera <em>negócios</em>
            <br />
            ou só contatos?
          </h2>
          <p className="rp-lead">
            Contato parado não gera nada. No Ecossistema PK, a sua rede ganha
            três pontes que transformam conhecidos em oportunidades reais.
          </p>
        </div>

        <div className="rp-diagram fade-up">
          <Diagrama id="rp-h" layout="h" />
          <Diagrama id="rp-v" layout="v" />
        </div>

        <div className="rp-pontes">
          {PONTES.map((b) => (
            <div className="rp-card" key={b.t} style={{ "--c": b.cor }}>
              <h3>{b.t}</h3>
              <p>{b.d}</p>
            </div>
          ))}
        </div>

        <div className="rp-cta">
          <a className="btn btn-primary" href="#faca-parte">
            Quero minha rede gerando negócios
          </a>
        </div>
      </div>
    </section>
  );
}
