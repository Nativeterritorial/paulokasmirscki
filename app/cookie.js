"use client";

import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("pk_cookie")) {
        const t = setTimeout(() => setShow(true), 900);
        return () => clearTimeout(t);
      }
    } catch (e) {}
  }, []);

  const close = () => {
    try {
      localStorage.setItem("pk_cookie", "1");
    } catch (e) {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Aviso de cookies">
      <p>
        Usamos cookies para melhorar a sua experiência de navegação. Ao
        continuar, você concorda com o uso de cookies.
      </p>
      <div className="cookie-actions">
        <button className="btn btn-primary" onClick={close}>
          Aceitar
        </button>
        <button className="cookie-dismiss" onClick={close}>
          Agora não
        </button>
      </div>
    </div>
  );
}
