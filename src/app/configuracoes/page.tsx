"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppWrapper from "@/components/AppWrapper";
import Toast from "@/components/Toast";
import "@/styles/configuracoes.css";
import "@/styles/mobile/configuracoes.mobile.css";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [isDirty, setIsDirty] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [passwordTips, setPasswordTips] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  // Token
  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const fetchConfig = async (toast = false, text = "") => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/configuracoes", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.user) {
        setUserData({
          name: data.user.name,
          email: data.user.email,
          password: "",
        });
      }

      if (toast) setToastMessage(text);
      setError("");
      setIsDirty(false);
    } catch {
      setError("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [token]);

  const markDirty = () => setIsDirty(true);

  const handlePasswordChange = (pwd: string) => {
    setUserData({ ...userData, password: pwd });
    markDirty();
    setPasswordTips({
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[\W_]/.test(pwd),
    });
  };

  const validatePassword = (pwd: string) => {
    if (!pwd) return true;
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return strong.test(pwd);
  };

  const handleSave = async () => {
  // Valida a senha **apenas** se o usuário digitou algo
  if (userData.password.trim() !== "" && !validatePassword(userData.password)) {
    setError("Senha não atende aos requisitos.");
    return;
  }

  if (!confirm("Deseja salvar as alterações?")) return;

  try {
    // não enviar password vazia
    const payload: any = {
      name: userData.name,
      email: userData.email,
    };

    if (userData.password.trim() !== "") {
      payload.password = userData.password;
    }

    const res = await fetch("/api/configuracoes", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      await fetchConfig(true, "Configurações salvas!");
    } else {
      setError(data.error || "Erro ao salvar");
    }
  } catch {
    setError("Erro ao salvar");
  }
};


  const handleDiscard = async () => {
    if (isDirty && !confirm("Descartar alterações?")) return;
    await fetchConfig(true, "Alterações descartadas");
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <AppWrapper>
      <div className="config-container">
        <header className="config-header">
          <h2>Configurações</h2>
          <button
            className="back-btn"
            onClick={async () => {
              if (isDirty && !confirm("Existem alterações não salvas. Deseja voltar?")) return;
              await fetchConfig();
              router.back();
            }}
          >
            ❌ Voltar
          </button>
        </header>

        <section className="config-section">
          <h3>Informações do Usuário</h3>

          <label>Nome</label>
          <input
            type="text"
            value={userData.name}
            onChange={(e) => {
              setUserData({ ...userData, name: e.target.value });
              markDirty();
            }}
          />

          <label>Email</label>
          <input
            type="email"
            value={userData.email}
            onChange={(e) => {
              setUserData({ ...userData, email: e.target.value });
              markDirty();
            }}
          />

          <label>Nova Senha</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Deixe vazio para não alterar"
              value={userData.password}
              onChange={(e) => handlePasswordChange(e.target.value)}
            />
            <button
              type="button"
              className="show-password-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "👁️ Ocultar" : "👁️ Mostrar"}
            </button>
          </div>

          {userData.password && (
            <ul className="password-tips">
              <li className={passwordTips.length ? "valid" : ""}>Mínimo 8 caracteres</li>
              <li className={passwordTips.upper ? "valid" : ""}>Letra maiúscula</li>
              <li className={passwordTips.lower ? "valid" : ""}>Letra minúscula</li>
              <li className={passwordTips.number ? "valid" : ""}>Número</li>
              <li className={passwordTips.special ? "valid" : ""}>Caractere especial</li>
            </ul>
          )}
        </section>

        <div className="config-actions">
          <button onClick={handleDiscard} className="discard-btn">Descartar</button>
          <button onClick={handleSave} className="save-btn">Salvar</button>
        </div>

        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage("")} />}
        {error && <p className="error-message">{error}</p>}
      </div>
    </AppWrapper>
  );
}
