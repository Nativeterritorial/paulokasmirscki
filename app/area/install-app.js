"use client";

import { useEffect, useState } from "react";

// Botão "Instalar app": no Android/Chrome/Edge usa o convite nativo do navegador;
// no iPhone (que não tem esse convite) mostra o passo a passo do Safari.
// Some sozinho quando o site já está aberto como app instalado.
export default function InstallApp() {
  const [prompt, setPrompt] = useState(null);
  const [ios, setIos] = useState(false);
  const [tip, setTip] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (standalone) return;

    const ua = window.navigator.userAgent;
    const isIos =
      /iPhone|iPad|iPod/.test(ua) ||
      (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    setIos(isIos);

    const onPrompt = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    const onInstalled = () => {
      setPrompt(null);
      setIos(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!prompt && !ios) return null;

  const install = async () => {
    if (prompt) {
      prompt.prompt();
      try {
        await prompt.userChoice;
      } catch (e) {}
      setPrompt(null);
      return;
    }
    setTip((t) => !t);
  };

  return (
    <>
      <button type="button" className="area-install" onClick={install}>
        Instalar app
      </button>
      {tip && (
        <div className="area-install-tip" role="status">
          No iPhone: toque em <strong>Compartilhar</strong> no Safari e depois
          em <strong>Adicionar à Tela de Início</strong>.
        </div>
      )}
    </>
  );
}
