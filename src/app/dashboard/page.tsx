
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import AppWrapper from "@/components/AppWrapper";
import "@/styles/dashboard.css";

type Summary = { balance: number; income: number; expense: number };
type MonthlyData = { month: number; income: number; expense: number; balance: number };
type PieData = { name: string; value: number };
type CategoryExpense = { category: string; amount: number };

export default function DashboardPage() {
  const router = useRouter();

  const [summary, setSummary] = useState<Summary>({ balance: 0, income: 0, expense: 0 });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [pieData, setPieData] = useState<PieData[]>([]);
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpense[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const COLORS = ["#4caf50", "#f44336", "#2196f3", "#ff9800", "#9c27b0", "#ff5722"];

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Resumo Financeiro
      const resSummary = await fetch(`/api/transactions/summary?month=${month}&year=${year}`, { headers });
      if (!resSummary.ok) throw new Error("Erro ao buscar resumo");
      const summaryData = await resSummary.json();
      setSummary({
        balance: summaryData.balance ?? 0,
        income: summaryData.income ?? 0,
        expense: summaryData.expense ?? 0,
      });

      // Receitas x Despesas Mensais
      const resMonthly = await fetch(`/api/reports/monthly?month=${month}&year=${year}`, { headers });
      if (!resMonthly.ok) throw new Error("Erro ao buscar relatório mensal");
      const monthly = await resMonthly.json();
      setMonthlyData(Array.isArray(monthly) ? monthly : []);

      // Distribuição por Conta
      const resPie = await fetch("/api/accounts/distribution", { headers });
      if (!resPie.ok) throw new Error("Erro ao buscar distribuição de contas");
      const pie = await resPie.json();
      setPieData(Array.isArray(pie) ? pie : []);

      // Despesas por Categoria
      const resCategory = await fetch(`/api/reports/category-expenses?month=${month}&year=${year}`, { headers });
      if (!resCategory.ok) throw new Error("Erro ao buscar despesas por categoria");
      const category = await resCategory.json();
      setCategoryExpenses(Array.isArray(category) ? category : []);
    } catch (err: any) {
      console.error("Erro ao carregar dashboard:", err);
      setError(err.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // atualiza a cada minuto
    return () => clearInterval(interval);
  }, [month, year]);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 21 }, (_, i) => 2020 + i);

  const renderTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length > 0) {
      return (
        <div className="tooltip">
          <p className="font-bold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index}>
              {entry.name}: R$ {(entry.value ?? 0).toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <AppWrapper>
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Dashboard Financeiro</h1>
        </header>

        <div className="filters">
          <label>
            Mês:
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
          <label>
            Ano:
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>
        </div>

        {loading && <p>Carregando dados...</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="cards">
          <div className="card green">
            <h2>Saldo Total</h2>
            <p>R$ {summary.balance.toFixed(2)}</p>
          </div>
          <div className="card blue">
            <h2>Entradas</h2>
            <p>R$ {summary.income.toFixed(2)}</p>
          </div>
          <div className="card red">
            <h2>Saídas</h2>
            <p>R$ {summary.expense.toFixed(2)}</p>
          </div>
        </div>

      <div className="charts">
        {/* Receitas x Despesas Mensais */}
        <div className="chart-container">
          <h2>Receitas x Despesas por Mês</h2>
          {loading ? <p>Carregando gráfico...</p> : monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={renderTooltip} />
                <Legend />
                <Bar dataKey="income" fill="#4caf50" name="Receitas" />
                <Bar dataKey="expense" fill="#f44336" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p>Nenhum dado disponível</p>}
        </div>

        {/* Evolução do Saldo */}
        <div className="chart-container">
          <h2>Evolução do Saldo Mensal</h2>
          {loading ? <p>Carregando gráfico...</p> : monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={renderTooltip} />
                <Legend />
                <Line type="monotone" dataKey="balance" stroke="#2196f3" strokeWidth={2} name="Saldo" />
              </LineChart>
            </ResponsiveContainer>
          ) : <p>Nenhum dado disponível</p>}
        </div>

        {/* Distribuição por Conta */}
        <div className="chart-container">
          <h2>Distribuição por Conta</h2>
          {loading ? <p>Carregando gráfico...</p> : pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={renderTooltip} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p>Nenhuma conta registrada</p>}
        </div>

        {/* Despesas por Categoria */}
        <div className="chart-container">
          <h2>Despesas por Categoria</h2>
          {loading ? <p>Carregando gráfico...</p> : categoryExpenses.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryExpenses}>
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip content={renderTooltip} />
                <Legend />
                <Bar dataKey="amount" fill="#ff9800" name="Valor" label={{ position: "top" }} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p>Nenhuma despesa registrada</p>}
        </div>
      </div>
    </div>
    </AppWrapper>
  );
}
