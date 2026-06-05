export default function sitemap() {
  const base = "https://www.paulokasmirscki.com.br";
  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
