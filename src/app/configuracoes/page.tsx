"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppWrapper from "@/components/AppWrapper";
import Toast from "@/components/Toast";
import "@/styles/configuracoes.css";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [error, setError] = useState("");

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [defaultExport, setDefaultExport] = useState("csv");
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [passwordTips, setPasswordTips] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  const [token, setToken] = useState<string | null>(null);

  // Pega token no client
  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  // Função para buscar dados do usuário
  const fetchConfig = async (showToast = false, toastText = "") => {
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
        setDefaultExport(data.user.defaultExport || "csv");
      }
      if (data.categories)
        setCategories(data.categories.map((c: any) => c.name));
      setError("");
      setIsDirty(false);

      if (showToast && toastText) setToastMessage(toastText);
    } catch (err) {
      console.error(err);
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
    const strongPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return strongPwd.test(pwd);
  };

  const handleSave = async () => {
    if (!validatePassword(userData.password)) {
      setError(
        "Senha inválida! Ela deve conter ao menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial."
      );
      return;
    }

    if (!confirm("Tem certeza que deseja salvar as alterações?")) return;

    try {
      const res = await fetch("/api/configuracoes", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...userData, defaultExport, categories }),
      });

      const data = await res.json();
      if (res.ok) {
        // Recarrega dados e mostra toast
        await fetchConfig(true, "✅ Configurações salvas com sucesso!");
      } else {
        setError(data.error || "Erro ao salvar configurações");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar configurações");
    }
  };

  const handleDiscard = async () => {
    if (
      isDirty &&
      !confirm("Existem alterações não salvas. Deseja realmente descartar?")
    )
      return;

    await fetchConfig(true, "Alterações descartadas");
  };

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory("");
      markDirty();
    }
  };

  const removeCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat));
    markDirty();
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
              if (isDirty) {
                const confirmDiscard = confirm(
                  "Existem alterações não salvas. Deseja realmente descartar e voltar?"
                );
                if (!confirmDiscard) return;
              }
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
          <input
            type="password"
            placeholder="Deixe vazio para não alterar"
            value={userData.password}
            onChange={(e) => handlePasswordChange(e.target.value)}
          />
          {userData.password && (
            <ul className="password-tips">
              <li className={passwordTips.length ? "valid" : ""}>
                Mínimo 8 caracteres
              </li>
              <li className={passwordTips.upper ? "valid" : ""}>
                Ao menos uma letra maiúscula
              </li>
              <li className={passwordTips.lower ? "valid" : ""}>
                Ao menos uma letra minúscula
              </li>
              <li className={passwordTips.number ? "valid" : ""}>
                Ao menos um número
              </li>
              <li className={passwordTips.special ? "valid" : ""}>
                Ao menos um caractere especial
              </li>
            </ul>
          )}
        </section>

        <section className="config-section">
          <h3>Exportação Padrão</h3>
          <select
            value={defaultExport}
            onChange={(e) => {
              setDefaultExport(e.target.value);
              markDirty();
            }}
          >
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
          </select>
        </section>

        <section className="config-section">
          <h3>Categorias</h3>
          <div className="category-list">
            {categories.map((cat) => (
              <div key={cat} className="category-item">
                {cat} <button onClick={() => removeCategory(cat)}>❌</button>
              </div>
            ))}
          </div>
          <div className="add-category">
            <input
              type="text"
              placeholder="Nova categoria"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button onClick={addCategory}>Adicionar</button>
          </div>
        </section>

        <div className="config-actions">
          <button onClick={handleDiscard} className="discard-btn">
            Descartar
          </button>
          <button onClick={handleSave} className="save-btn">
            Salvar
          </button>
        </div>

        {toastMessage && (
          <Toast message={toastMessage} onClose={() => setToastMessage("")} />
        )}
        {error && <p className="error-message">{error}</p>}
      </div>
    </AppWrapper>
  );
}
