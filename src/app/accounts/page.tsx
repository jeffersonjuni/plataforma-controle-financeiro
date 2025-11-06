"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppWrapper from "@/components/AppWrapper";
import Toast from "@/components/Toast";
import "@/styles/accounts.css";
import { formatCurrency } from "@/utils/formatCurrency"; 

type Account = {
  id: number;
  name: string;
  type: "CORRENTE" | "POUPANCA" | "INVESTIMENTO";
  balance: number;
  createdAt: string;
};

export default function AccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [formErrors, setFormErrors] = useState<{ name?: string; balance?: string }>({});
  const [form, setForm] = useState({
    name: "",
    type: "CORRENTE",
    balance: "",
  });

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      const res = await fetch("/api/accounts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao carregar contas");
      setAccounts(data);
    } catch (err: any) {
      setError(err.message);
      setToastMessage("❌ Erro ao carregar contas.");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: { name?: string; balance?: string } = {};

    if (!form.name.trim()) errors.name = "O nome da conta não pode estar vazio.";
    const balanceNum = Number(form.balance);
    if (isNaN(balanceNum) || balanceNum < 0) errors.balance = "Saldo inválido. Deve ser ≥ 0.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          type: form.type.toUpperCase(),
          balance: Number(form.balance) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar conta");

      setForm({ name: "", type: "CORRENTE", balance: "" });
      setFormErrors({});
      setToastMessage("✅ Conta criada com sucesso!");
      fetchAccounts();
    } catch (err: any) {
      setError(err.message);
      setToastMessage("❌ Ocorreu um erro ao criar conta.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta conta?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      const res = await fetch(`/api/accounts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao excluir conta");

      setToastMessage("✅ Conta excluída com sucesso!");
      fetchAccounts();
    } catch (err: any) {
      setError(err.message);
      setToastMessage("❌ Ocorreu um erro ao excluir conta.");
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <AppWrapper>
      <div className="accounts-container">
        <header className="accounts-header">
          <h2>Contas</h2>
        </header>

        <form className="account-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Nome da Conta"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={formErrors.name ? "input-error" : ""}
            />
            {formErrors.name && <small className="error-msg">{formErrors.name}</small>}
          </div>

          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="CORRENTE">Conta Corrente</option>
            <option value="POUPANCA">Poupança</option>
            <option value="INVESTIMENTO">Investimento</option>
          </select>

          <div className="form-group">
            <input
              type="number"
              placeholder="Saldo inicial (R$)"
              value={form.balance}
              onChange={(e) => setForm({ ...form, balance: e.target.value })}
              className={formErrors.balance ? "input-error" : ""}
            />
            {formErrors.balance && <small className="error-msg">{formErrors.balance}</small>}
          </div>

          <button type="submit">Adicionar Conta</button>
        </form>

        {error && <p className="error">{error}</p>}
        {loading && <p className="loading">Carregando...</p>}

        {!loading && accounts.length > 0 && (
          <table className="accounts-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Saldo</th>
                <th>Criada em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td>{a.type}</td>
                  {/* ✅ Aplicando formatCurrency */}
                  <td>{formatCurrency(a.balance)}</td>
                  <td>{new Date(a.createdAt).toLocaleDateString("pt-BR")}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(a.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage("")} />}
      </div>
    </AppWrapper>
  );
}
