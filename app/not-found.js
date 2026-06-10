const WHATSAPP = "https://wa.me/5554996505799";

export const metadata = {
  title: "Página não encontrada — Paulo Kasmirscki",
};

export default function NotFound() {
  return (
    <div className="nf">
      <a className="brand" href="/" aria-label="Paulo Kasmirscki">
        <img src="/logo-mark.svg" alt="" style={{ height: 40 }} />
        <span className="brand-name">Paulo Kasmirscki</span>
      </a>
      <div className="nf-code" aria-hidden="true">
        404
      </div>
      <h1>
        Essa página não existe — mas a <em>rede</em> sim.
      </h1>
      <p>
        O endereço que você acessou não foi encontrado. Pode ter sido movido,
        ou o link veio com algum erro. O importante: você já está no lugar
        certo pra se conectar.
      </p>
      <div className="nf-actions">
        <a className="btn btn-primary" href="/">
          Voltar pro início
        </a>
        <a
          className="btn btn-outline"
          href={WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
        >
          Falar com o Paulo
        </a>
      </div>
    </div>
  );
}
