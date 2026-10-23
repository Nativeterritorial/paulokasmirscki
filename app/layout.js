import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://www.paulokasmirscki.com.br"),
  alternates: { canonical: "/" },
  title: "Paulo Kasmirscki — Conectando pessoas e gerando negócios",
  description:
    "Paulo Kasmirscki conecta pessoas e gera negócios. Networking estratégico, parcerias e oportunidades que transformam relações em resultados.",
  // o que aparece ao compartilhar o link (WhatsApp, Instagram, LinkedIn...)
  openGraph: {
    title: "Ecossistema PK · Seus contatos viram negócios",
    description:
      "Empresas de confiança, IA e o Paulo conduzindo cada conexão. Cadastro grátis em 1 minuto.",
    siteName: "Paulo Kasmirscki",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ecossistema PK · Seus contatos viram negócios",
    description:
      "Empresas de confiança, IA e o Paulo conduzindo cada conexão. Cadastro grátis em 1 minuto.",
  },
};

export const viewport = {
  themeColor: "#0a0c1e",
};

// dados estruturados pro Google (quem é o Paulo + o site)
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://www.paulokasmirscki.com.br/#paulo",
      name: "Paulo Kasmirscki",
      jobTitle: "Conector de negócios",
      description:
        "Conector de um ecossistema de negócios — une pessoas e marcas de diferentes segmentos, gerando indicações, parcerias e oportunidades.",
      url: "https://www.paulokasmirscki.com.br",
      sameAs: ["https://instagram.com/paulokasmirscki"],
      image: "https://www.paulokasmirscki.com.br/paulo-premium.jpg",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Veranópolis",
        addressRegion: "RS",
        addressCountry: "BR",
      },
    },
    {
      "@type": "WebSite",
      name: "Paulo Kasmirscki — Conectando pessoas e gerando negócios",
      url: "https://www.paulokasmirscki.com.br",
      inLanguage: "pt-BR",
      about: { "@id": "https://www.paulokasmirscki.com.br/#paulo" },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Michroma&family=Sora:wght@700;800&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&display=swap"
          rel="stylesheet"
        />
        {/* ícone do site (aba do navegador e busca do Google: tamanhos múltiplos de 48) */}
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
