import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://www.paulokasmirscki.com.br"),
  alternates: { canonical: "/" },
  title: "Paulo Kasmirscki — Conectando pessoas e gerando negócios",
  description:
    "Paulo Kasmirscki conecta pessoas e gera negócios. Networking estratégico, parcerias e oportunidades que transformam relações em resultados.",
  openGraph: {
    title: "Paulo Kasmirscki — Conectando pessoas e gerando negócios",
    description:
      "Networking estratégico, parcerias e oportunidades que transformam relações em resultados.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Paulo Kasmirscki — Conectando pessoas e gerando negócios",
    description:
      "Networking estratégico, parcerias e oportunidades que transformam relações em resultados.",
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
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Michroma&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/svg+xml" href="/logo-mark.svg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
