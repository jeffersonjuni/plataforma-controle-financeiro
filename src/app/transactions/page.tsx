
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppWrapper from "@/components/AppWrapper";
import "@/styles/transactions.css";

type Transaction = {
  id: string;
  accountId: string;
  description: string;
  amount: number;
  type: "ENTRADA" | "SAIDA";
  category: string;
  date: string;
};

type Summary = { entrada: number; saida: number; saldoTotal: number };

export default function TransactionsPage() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary>({ entrada: 0, saida: 0, saldoTotal: 0 });
  const [form, setForm] = useState({
    accountId: "",
    description: "",
    amount: "",
    type: "ENTRADA",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 21 }, (_, i) => 2020 + i);

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      const res = await fetch("/api/transactions/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao buscar resumo");
      }

      const data = await res.json();
      setSummary(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      const res = await fetch(`/api/transactions?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao carregar transações");
      }

      const data = await res.json();
      setTransactions(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, [month, year]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar transação");

      setForm({
        accountId: "",
        description: "",
        amount: "",
        type: "ENTRADA",
        category: "",
        date: new Date().toISOString().split("T")[0],
      });

      fetchTransactions();
      fetchSummary();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <AppWrapper>
      <div className="transactions-container">
        <header className="transactions-header">
          <h2>Transações</h2>
        </header>

        {/* Resumo Financeiro */}
        <div className="summary-container">
          <div className="summary-card entrada">
            <h3>Entradas</h3>
            <p>R$ {summary.entrada.toFixed(2)}</p>
          </div>
          <div className="summary-card saida">
            <h3>Saídas</h3>
            <p>R$ {summary.saida.toFixed(2)}</p>
          </div>
          <div className="summary-card saldo">
            <h3>Saldo Total</h3>
            <p>R$ {summary.saldoTotal.toFixed(2)}</p>
          </div>
        </div>

        {/* Formulário */}
        <form className="transaction-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="ID da Conta" value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })} required />
          <input type="text" placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <input type="number" placeholder="Valor" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="ENTRADA">Entrada</option>
            <option value="SAIDA">Saída</option>
          </select>
          <input type="text" placeholder="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <button type="submit">Adicionar</button>
        </form>

        {/* Filtros */}
        <div className="filters">
          <label>
            Mês:
            <select value={month} onChange={(e) => {
              const newMonth = Number(e.target.value);
              setMonth(newMonth);
              localStorage.setItem("selectedMonth", String(newMonth));
            }}>
              {months.map((m) => <option key={m} value={m}>{m.toString().padStart(2, "0")}</option>)}
            </select>
          </label>

          <label>
            Ano:
            <select value={year} onChange={(e) => {
              const newYear = Number(e.target.value);
              setYear(newYear);
              localStorage.setItem("selectedYear", String(newYear));
            }}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
        </div>

        {/* Loading e Erro */}
        {loading && <p className="loading">Carregando...</p>}
        {error && <p className="error">{error}</p>}

        {/* Tabela */}
        {!loading && transactions.length > 0 && (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Tipo</th>
                <th>Categoria</th>
                <th>Valor (R$)</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.description}</td>
                  <td className={t.type === "ENTRADA" ? "type-income" : "type-expense"}>{t.type}</td>
                  <td>{t.category}</td>
                  <td>{Number(t.amount).toFixed(2)}</td>
                  <td>{new Date(t.date).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppWrapper>
  );
}
