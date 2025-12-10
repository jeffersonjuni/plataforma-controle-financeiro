"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import AppWrapper from "@/components/AppWrapper";
import Toast from "@/components/Toast";
import "@/styles/accounts.css";
import "@/styles/mobile/account.mobile.css";
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
  const abortController = useRef<AbortController | null>(null);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  const [formErrors, setFormErrors] = useState<{ name?: string }>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    type: "CORRENTE",
  });

  /* =============================
        BUSCAR CONTAS
  ============================== */
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      if (abortController.current) abortController.current.abort();
      abortController.current = new AbortController();

      const res = await fetch("/api/accounts", {
        headers: { Authorization: `Bearer ${token}` },
        signal: abortController.current.signal,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao carregar contas");

      setAccounts(data);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setError(err.message);
      setToastMessage("❌ Erro ao carregar contas.");
    } finally {
      setLoading(false);
    }
  };

  /* =============================
           VALIDAÇÃO
  ============================== */
  const validateForm = () => {
    const errors: { name?: string } = {};

    if (!form.name.trim()) errors.name = "O nome da conta não pode estar vazio.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* =============================
          CRIAR CONTA
  ============================== */
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
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar conta");

      setForm({ name: "", type: "CORRENTE" });
      setFormErrors({});
      setToastMessage("✅ Conta criada com sucesso!");
      fetchAccounts();
    } catch (err: any) {
      setError(err.message);
      setToastMessage("❌ Ocorreu um erro ao criar conta.");
    }
  };

  /* =============================
           INICIAR EDIÇÃO
  ============================== */
  const startEditing = (acc: Account) => {
    setEditingId(acc.id);
    setForm({
      name: acc.name,
      type: acc.type.toUpperCase(), // CORREÇÃO APLICADA
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* =============================
            SALVAR EDIÇÃO
  ============================== */
  const handleUpdate = async () => {
    if (!validateForm() || editingId === null) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      const res = await fetch(`/api/accounts/${editingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          type: form.type.toUpperCase(), // CORREÇÃO APLICADA
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar conta");

      setToastMessage("✅ Conta atualizada com sucesso!");
      setEditingId(null);
      setForm({ name: "", type: "CORRENTE" });
      fetchAccounts();
    } catch (err: any) {
      setToastMessage("❌ Não foi possível atualizar a conta.");
      setError(err.message);
    }
  };

  /* =============================
           EXCLUIR
  ============================== */
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
      setToastMessage("❌ Não foi possível excluir a conta.");
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchAccounts();
    return () => abortController.current?.abort();
  }, []);

  return (
    <AppWrapper>
      <div className="accounts-container">
        <header className="accounts-header">
          <h2>{editingId ? "Editar Conta" : "Contas"}</h2>
        </header>

        {/* FORMULÁRIO */}
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

          {editingId ? (
            <button type="button" onClick={handleUpdate}>
              Salvar Alterações
            </button>
          ) : (
            <button type="submit">Adicionar Conta</button>
          )}
        </form>

        {error && <p className="error">{error}</p>}
        {loading && <p className="loading">Carregando...</p>}

        {/* TABELA */}
        {!loading && accounts.length > 0 && (
          <table className="accounts-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Saldo</th>
                <th>Criada em</th>
                <th className="actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td>{a.type}</td>
                  <td>{formatCurrency(a.balance)}</td>
                  <td>{new Date(a.createdAt).toLocaleDateString("pt-BR")}</td>
                  <td className="actions">
                    <button className="edit-btn" onClick={() => startEditing(a)}>
                      Editar
                    </button>

                    <button className="delete-btn" onClick={() => handleDelete(a.id)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {toastMessage && (
          <Toast message={toastMessage} onClose={() => setToastMessage("")} />
        )}
      </div>
    </AppWrapper>
  );
}
