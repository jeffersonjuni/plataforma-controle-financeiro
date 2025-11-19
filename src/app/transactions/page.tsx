"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppWrapper from "@/components/AppWrapper";
import Toast from "@/components/Toast";
import "@/styles/transactions.css";

type Account = {
  id: number;
  name: string;
  type: string;
  balance: number;
};

type Transaction = {
  id: string;
  accountId: string;
  description: string;
  amount: number;
  type: "ENTRADA" | "SAIDA";
  category: string;
  date: string;
};

type Summary = {
  entrada: number;
  saida: number;
  saldoTotal: number;
};

export default function TransactionsPage() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const [summary, setSummary] = useState<Summary>({
    entrada: 0,
    saida: 0,
    saldoTotal: 0,
  });

  const [form, setForm] = useState({
    accountId: "",
    description: "",
    amount: "",
    type: "ENTRADA",
    category: "VARIAVEL",
    date: new Date().toISOString().split("T")[0],
  });

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 21 }, (_, i) => 2020 + i);

  // === Buscar Contas ===
  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      const res = await fetch("/api/accounts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erro ao carregar contas");

      const data = await res.json();
      setAccounts(data);

      if (data.length > 0 && !selectedAccount) {
        setSelectedAccount(String(data[0].id));
        setForm((prev) => ({ ...prev, accountId: String(data[0].id) }));
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // === Buscar Resumo ===
  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");
      if (!selectedAccount) return;

      const res = await fetch(
        `/api/transactions/summary?accountId=${selectedAccount}&month=${month}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Erro ao buscar resumo");

      const data = await res.json();
      setSummary(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // === Buscar Transações ===
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");
      if (!selectedAccount) return;

      const res = await fetch(
        `/api/transactions?accountId=${selectedAccount}&month=${month}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Erro ao carregar transações");

      const data = await res.json();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchTransactions();
      fetchSummary();
    }
  }, [selectedAccount, month, year]);

  // === Criar Transação ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setToastMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          accountId: selectedAccount,
          amount: Number(form.amount),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar transação");

      setForm({
        accountId: selectedAccount,
        description: "",
        amount: "",
        type: "ENTRADA",
        category: "",
        date: new Date().toISOString().split("T")[0],
      });

      await Promise.all([fetchTransactions(), fetchSummary(), fetchAccounts()]);
      setToastMessage("✅ Transação adicionada com sucesso!");
    } catch (err: any) {
      setError(err.message);
      setToastMessage("❌ Erro ao adicionar transação.");
    }
  };

  // === Excluir ===
  const handleDelete = async (id: string, accountId: string) => {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir esta transação?"
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ accountId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao excluir transação");

      await Promise.all([fetchTransactions(), fetchSummary(), fetchAccounts()]);
      setToastMessage("🗑️ Transação excluída com sucesso!");
    } catch (err: any) {
      setError(err.message);
      setToastMessage("❌ Erro ao excluir transação.");
    }
  };

  // === Editar ===
  const handleEdit = async (t: Transaction) => {
    const newDesc = prompt("Descrição:", t.description);
    if (newDesc === null) return;
    const newAmount = prompt("Valor:", t.amount.toString());
    if (newAmount === null) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      const res = await fetch(`/api/transactions/${t.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountId: t.accountId,
          description: newDesc,
          amount: Number(newAmount),
          type: t.type,
          category: t.category,
          date: t.date,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar transação");

      await Promise.all([fetchTransactions(), fetchSummary(), fetchAccounts()]);
      setToastMessage("✏️ Transação atualizada com sucesso!");
    } catch (err: any) {
      setError(err.message);
      setToastMessage("❌ Erro ao atualizar transação.");
    }
  };

  return (
    <AppWrapper>
      <div className="transactions-container">
        <header className="transactions-header">
          <h2>Transações</h2>
        </header>

        <div className="filters">
          <label>
            Conta:
            <select
              value={selectedAccount}
              onChange={(e) => {
                setSelectedAccount(e.target.value);
                setForm((prev) => ({ ...prev, accountId: e.target.value }));
              }}
            >
              {accounts.length > 0 ? (
                accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} —{" "}
                    {acc.balance.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </option>
                ))
              ) : (
                <option value="">Nenhuma conta encontrada</option>
              )}
            </select>
          </label>

          <label>
            Mês:
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
          </label>

          <label>
            Ano:
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="summary-container">
          <div className="summary-card entrada">
            <h3>Entradas</h3>
            <p>
              {summary.entrada.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
          <div className="summary-card saida">
            <h3>Saídas</h3>
            <p>
              {summary.saida.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
          <div className="summary-card saldo">
            <h3>Saldo Total</h3>
            <p>
              {summary.saldoTotal.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
        </div>

        <form className="transaction-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Descrição"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Valor"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="ENTRADA">Entrada</option>
            <option value="SAIDA">Saída</option>
          </select>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
          >
            <option value="">Selecione a categoria</option>
            <option value="FIXA">Fixa</option>
            <option value="VARIAVEL">Variável</option>
          </select>

          <input
            type="date"
            value={form.date}
            onChange={(e) => {
              const date = e.target.value;
              setForm({ ...form, date });
            }}
          />

          <button type="submit">Adicionar</button>
        </form>

        {loading && <p className="loading">Carregando...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && transactions.length > 0 && (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Tipo</th>
                <th>Categoria</th>
                <th>Valor</th>
                <th>Data</th>
                <th className="actions-header">Ações</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.description}</td>
                  <td
                    className={
                      t.type === "ENTRADA" ? "type-income" : "type-expense"
                    }
                  >
                    {t.type}
                  </td>
                  <td>{t.category}</td>
                  <td>
                    {t.amount.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td>{new Date(t.date).toLocaleDateString("pt-BR")}</td>
                  <td className="actions">
                    <button onClick={() => handleEdit(t)} className="edit-btn">
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(t.id, t.accountId)}
                      className="delete-btn"
                    >
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
