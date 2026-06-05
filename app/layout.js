import "./globals.css";

export const metadata = {
  title: "Paulo Kasmirscki — Conectando pessoas e gerando negócios",
  description:
    "Paulo Kasmirscki conecta pessoas e gera negócios. Networking estratégico, parcerias e oportunidades que transformam relações em resultados.",
  openGraph: {
    title: "Paulo Kasmirscki — Conectando pessoas e gerando negócios",
    description:
      "Networking estratégico, parcerias e oportunidades que transformam relações em resultados.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/svg+xml" href="/logo-mark.svg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
