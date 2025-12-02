"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "@/styles/reset-password.css";
import "@/styles/mobile/reset-password.mobile.css";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");

  // Estado para os requisitos da senha
  const [passwordTips, setPasswordTips] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    setPasswordTips({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    });
  }, [password]);

  async function submit() {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setMsg("Senha alterada com sucesso!");
      setTimeout(() => router.push("/login"), 1500);
    } else {
      setMsg(data.error);
    }
  }

  if (!token) return <p>Token inválido.</p>;

  return (
    <div className="login-container">
      <form
        className="login-form"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <h2>Nova senha</h2>

        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="button"
            className="show-password-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "👁️ Ocultar" : "👁️ Mostrar"}
          </button>
        </div>

        {password && (
          <ul className="password-tips">
            <li className={passwordTips.length ? "valid" : ""}>
              Mínimo 8 caracteres
            </li>
            <li className={passwordTips.upper ? "valid" : ""}>
              Letra maiúscula
            </li>
            <li className={passwordTips.lower ? "valid" : ""}>
              Letra minúscula
            </li>
            <li className={passwordTips.number ? "valid" : ""}>
              Número
            </li>
            <li className={passwordTips.special ? "valid" : ""}>
              Caractere especial
            </li>
          </ul>
        )}

        <button type="submit" className="submit-btn">
          Redefinir
        </button>

        {msg && <p>{msg}</p>}
      </form>
    </div>
  );
}
