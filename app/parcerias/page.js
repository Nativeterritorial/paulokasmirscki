import { permanentRedirect } from "next/navigation";

// Parcerias agora faz parte da página do Ecossistema (serviços, planos e
// cadastro num só lugar). Links antigos continuam funcionando.
export default function Parcerias() {
  permanentRedirect("/ecossistema#servicos");
}
