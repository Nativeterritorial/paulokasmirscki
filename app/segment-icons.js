// Ícones (traço, viewBox 24x24) por segmento — usados no hub e na grade de segmentos
export const SEG_ICONS = {
  "Imóveis & Construção": ["M3 11l9-7 9 7", "M5 10v10h14V10", "M10 20v-6h4v6"],
  "Arquitetura": ["M4 20V4l16 16H4z", "M8 16v-3l3 3H8z"],
  "Finanças & Investimentos": ["M3 17l6-6 4 4 8-8", "M15 7h6v6"],
  "Contabilidade": [
    "M6 3h12v18H6z",
    "M9 7h6",
    "M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01",
  ],
  "Jurídico": [
    "M12 3v18",
    "M7 21h10",
    "M5 7h14",
    "M5 7l-3 7a3 3 0 0 0 6 0L5 7z",
    "M19 7l-3 7a3 3 0 0 0 6 0l-3-7z",
  ],
  "Tecnologia & IA": [
    "M7 7h10v10H7z",
    "M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4",
  ],
  "Marketing & Digital": [
    "M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z",
    "M15 9a4 4 0 0 1 0 6",
    "M18 6a8 8 0 0 1 0 12",
  ],
  "Saúde & Bem-estar": [
    "M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z",
  ],
  "Estética & Beleza": [
    "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z",
    "M19 16v4M17 18h4",
  ],
  "Gastronomia": ["M6 3v7a3 3 0 0 0 6 0V3", "M9 3v18", "M17 3c-2 2-2 7 0 9v9"],
  "Turismo & Hotelaria": [
    "M3 7v11",
    "M3 14h18",
    "M21 18v-5a3 3 0 0 0-3-3h-7v4",
  ],
  "Esporte & Lazer": ["M6 8v8", "M3 10v4", "M18 8v8", "M21 10v4", "M6 12h12"],
  "Comércio & Varejo": ["M5 8h14l-1 13H6L5 8z", "M9 8V6a3 3 0 0 1 6 0v2"],
  "Serviços": [
    "M14.5 6.5a4 4 0 0 0-5 5L3 18l3 3 6.5-6.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5 2.5-2.5z",
  ],
  "Agro & Indústria": [
    "M12 21v-9",
    "M12 12c0-4-3-6-7-6 0 4 3 6 7 6z",
    "M12 15c0-3 2.5-5 6-5 0 3-2.5 5-6 5z",
  ],
  "Sustentabilidade & Meio Ambiente": [
    "M5 19c0-8 5-13 15-14 0 9-5 14-13 14",
    "M5 19c3-5 6-8 10-10",
  ],
  "Negócios & Empresas": ["M3 8h18v12H3z", "M9 8V5h6v3", "M3 13h18"],
};

export function SegIcon({ label, size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {(SEG_ICONS[label] || []).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
