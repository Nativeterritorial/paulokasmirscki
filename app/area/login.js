"use client";

import { useState } from "react";

const post = async (url, body) => {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
};

// Tela de entrada da Área de Membros: WhatsApp + senha (qualquer aparelho),
// "Esqueci minha senha" (o pedido vai pro painel do Paulo) e, por baixo,
// o código de acesso antigo.
export function LoginForm({ onLogin }) {
  const [modo, setModo] = useState("senha"); // senha | esqueci | codigo
  const [whatsapp, setWhatsapp] = useState("");
  const [senha, setSenha] = useState("");
  const [codigo, setCodigo] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  const trocar = (m) => {
    setModo(m);
    setErr("");
    setOk("");
  };

  const entrar = async (e) => {
    e.preventDefault();
    setErr("");
    if (modo === "senha" && (whatsapp.replace(/\D/g, "").length < 10 || !senha)) {
      setErr("Informe o seu WhatsApp com DDD e a sua senha.");
      return;
    }
    setLoading(true);
    try {
      const d = await post(
        "/api/area-login",
        modo === "senha" ? { whatsapp, senha } : { code: codigo.trim() }
      );
      if (d.ok) onLogin(modo === "senha" ? d.token : codigo.trim(), d.member || null);
      else setErr(d.error || "Código incorreto.");
    } catch (e2) {
      setErr("Erro ao entrar. Tente novamente.");
    }
    setLoading(false);
  };

  const esqueci = async (e) => {
    e.preventDefault();
    setErr("");
    if (whatsapp.replace(/\D/g, "").length < 10) {
      setErr("Informe o seu WhatsApp com DDD.");
      return;
    }
    setLoading(true);
    try {
      const d = await post("/api/senha", { action: "esqueci", whatsapp });
      if (d.ok)
        setOk(
          "Pedido enviado! Se esse WhatsApp tiver cadastro, o Paulo te manda uma senha provisória por lá."
        );
      else setErr(d.error || "Não consegui enviar. Tente novamente.");
    } catch (e2) {
      setErr("Não consegui enviar. Tente novamente.");
    }
    setLoading(false);
  };

  if (modo === "esqueci") {
    return (
      <>
        <form onSubmit={esqueci} className="login-form login-form-col">
          <label className="login-lbl">
            Seu WhatsApp
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="(54) 99999-9999"
              inputMode="tel"
              autoComplete="tel"
              autoFocus
            />
          </label>
          {!ok && (
            <button className="btn btn-primary" disabled={loading}>
              {loading ? "Enviando..." : "Pedir nova senha"}
            </button>
          )}
        </form>
        {ok && <div className="login-ok">{ok}</div>}
        {err && <div className="login-err">{err}</div>}
        <button type="button" className="login-link" onClick={() => trocar("senha")}>
          ← Voltar para a entrada
        </button>
      </>
    );
  }

  return (
    <>
      <form onSubmit={entrar} className="login-form login-form-col">
        {modo === "senha" ? (
          <>
            <label className="login-lbl">
              WhatsApp
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(54) 99999-9999"
                inputMode="tel"
                autoComplete="username"
                autoFocus
              />
            </label>
            <label className="login-lbl">
              Senha
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Sua senha"
                autoComplete="current-password"
              />
            </label>
          </>
        ) : (
          <label className="login-lbl">
            Código de acesso
            <input
              type="password"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Código de acesso"
              autoFocus
            />
          </label>
        )}
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      {err && <div className="login-err">{err}</div>}
      <div className="login-links">
        {modo === "senha" ? (
          <>
            <button type="button" className="login-link" onClick={() => trocar("esqueci")}>
              Esqueci minha senha
            </button>
            <button type="button" className="login-link login-link-mute" onClick={() => trocar("codigo")}>
              Tenho um código de acesso
            </button>
          </>
        ) : (
          <button type="button" className="login-link" onClick={() => trocar("senha")}>
            ← Entrar com WhatsApp e senha
          </button>
        )}
      </div>
    </>
  );
}

// Aviso dentro da área para quem ainda não tem senha (entrou pelo link) ou
// está com a senha provisória que o Paulo gerou.
export function SenhaAviso({ code, member, onSalva }) {
  const [aberto, setAberto] = useState(false);
  const [fechado, setFechado] = useState(false);
  const [senha, setSenha] = useState("");
  const [conf, setConf] = useState("");
  const [err, setErr] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [feito, setFeito] = useState(false);

  if (!member || fechado) return null;
  if (!feito && member.temSenha && !member.senhaTemp) return null;

  const salvar = async (e) => {
    e.preventDefault();
    setErr("");
    if (senha.length < 6) return setErr("A senha precisa ter pelo menos 6 caracteres.");
    if (senha !== conf) return setErr("As duas senhas não são iguais.");
    setSalvando(true);
    try {
      const d = await post("/api/senha", { action: "definir", code, senha });
      if (d.ok) {
        setFeito(true);
        onSalva?.();
      } else setErr(d.error || "Não foi possível salvar agora.");
    } catch (e2) {
      setErr("Não foi possível salvar agora.");
    }
    setSalvando(false);
  };

  if (feito) {
    return (
      <div className="senha-aviso senha-ok">
        <span>
          ✓ Senha salva! Agora você entra de qualquer aparelho com o seu WhatsApp e
          esta senha.
        </span>
        <button type="button" className="login-link" onClick={() => setFechado(true)}>
          Fechar
        </button>
      </div>
    );
  }

  const temp = member.senhaTemp;
  return (
    <div className="senha-aviso">
      <div className="senha-aviso-txt">
        <strong>{temp ? "Troque a sua senha provisória" : "Crie a sua senha"}</strong>
        <span>
          {temp
            ? "Você entrou com a senha que o Paulo enviou. Escolha uma só sua."
            : "Assim você entra de qualquer aparelho com o seu WhatsApp e uma senha, sem precisar do link."}
        </span>
      </div>
      {!aberto ? (
        <div className="senha-aviso-acts">
          <button type="button" className="btn btn-primary" onClick={() => setAberto(true)}>
            {temp ? "Trocar senha" : "Criar senha"}
          </button>
          <button type="button" className="login-link login-link-mute" onClick={() => setFechado(true)}>
            Depois
          </button>
        </div>
      ) : (
        <form className="senha-aviso-form" onSubmit={salvar}>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Nova senha (mín. 6)"
            autoComplete="new-password"
            autoFocus
          />
          <input
            type="password"
            value={conf}
            onChange={(e) => setConf(e.target.value)}
            placeholder="Repita a senha"
            autoComplete="new-password"
          />
          <button className="btn btn-primary" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar senha"}
          </button>
          {err && <div className="login-err">{err}</div>}
        </form>
      )}
    </div>
  );
}
