"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "@/styles/register.css";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [passwordTips, setPasswordTips] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = (pwd: string) => {
    setPassword(pwd);

    setPasswordTips({
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[\W_]/.test(pwd),
    });
  };

  const validatePassword = (pwd: string) => {
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return strong.test(pwd);
  };

  async function handleRegister() {
    setLoading(true);
    setError(null);
    setSuccess(null);

    // ❗ valida antes de enviar
    if (!validatePassword(password)) {
      setError("Senha não atende aos requisitos.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar usuário.");
        return;
      }

      setSuccess("Conta criada com sucesso! Redirecionando...");
      setTimeout(() => router.push("/"), 1500);

    } catch (err) {
      setError("Erro no servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-container">
      <form
        className="register-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleRegister();
        }}
      >
        <h2>Criar Conta</h2>

        <input
          type="text"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label></label>
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Senha forte"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
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
            <li className={passwordTips.length ? "valid" : ""}>Mínimo 8 caracteres</li>
            <li className={passwordTips.upper ? "valid" : ""}>Letra maiúscula</li>
            <li className={passwordTips.lower ? "valid" : ""}>Letra minúscula</li>
            <li className={passwordTips.number ? "valid" : ""}>Número</li>
            <li className={passwordTips.special ? "valid" : ""}>Caractere especial</li>
          </ul>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Criando conta..." : "Cadastrar"}
        </button>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <p className="link" onClick={() => router.push("/")}>
          Já tem conta? Faça login
        </p>
      </form>
    </div>
  );
}
