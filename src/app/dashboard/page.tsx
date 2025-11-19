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
import Toast from "@/components/Toast";
import "@/styles/dashboard.css";
import { formatCurrency } from "@/utils/formatCurrency";

type Summary = { income: number; expense: number; balance: number };
type MonthlyData = { month: number; income: number; expense: number; balance: number };
type PieData = { name: string; value: number };
type CategoryExpense = { name: string; value: number };
type Account = { id: string; name: string };

type DashboardResponse = {
  success: boolean;
  filtros: { period?: string };
  summary: Summary;
  monthlyData: MonthlyData[];
  pieData: PieData[];
  categoryExpenses: CategoryExpense[];
  transactions: any[];
};

export default function DashboardPage() {
  const router = useRouter();

  const [summary, setSummary] = useState<Summary>({ income: 0, expense: 0, balance: 0 });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [pieData, setPieData] = useState<PieData[]>([]);
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpense[]>([]);
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const COLORS = ["#4caf50", "#f44336", "#2196f3", "#ff9800", "#9c27b0", "#ff5722"];

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 21 }, (_, i) => 2020 + i);

  // Carregar contas
  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      const res = await fetch("/api/accounts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setAccounts(data);
    } catch {
      setToastMessage("❌ Falha ao carregar contas");
    }
  };

  // Buscar dados do dashboard
  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      const res = await fetch(
        `/api/dashboard?period=${period}&month=${month}&year=${year}${
          accountId ? `&accountId=${accountId}` : ""
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Erro ao buscar dados do dashboard");

      const data: DashboardResponse = await res.json();
      setSummary(data.summary);
      setMonthlyData(data.monthlyData);
      setPieData(data.pieData);
      setCategoryExpenses(data.categoryExpenses);

      setToastMessage("✅ Dashboard atualizado com sucesso!");
    } catch (err: any) {
      setError(err.message);
      setToastMessage("❌ Erro ao atualizar dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [period, month, year, accountId]);

  const renderTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (!active || !payload?.length) return null;

    return (
      <div className="tooltip">
        <p className="font-bold">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i}>{`${entry.name}: ${formatCurrency(entry.value ?? 0)}`}</p>
        ))}
      </div>
    );
  };

  return (
    <AppWrapper>
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Dashboard Financeiro</h1>

          <div className="filters">
            <label>
              Conta:
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                <option value="">💼 Todas as Contas</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Período:
              <select value={period} onChange={(e) => setPeriod(e.target.value as any)}>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
              </select>
            </label>

            {period !== "yearly" && (
              <label>
                Ano:
                <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {period === "monthly" && (
              <label>
                Mês:
                <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {period === "weekly" && (
              <label>
                Semana:
                <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                  {Array.from({ length: 52 }, (_, i) => i + 1).map((w) => (
                    <option key={w} value={w}>
                      Semana {w}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </header>

        {/* cards */}
        <div className="cards">
          <div className="card green">
            <h2>Saldo Total</h2>
            <p>{formatCurrency(summary.balance)}</p>
          </div>

          <div className="card blue">
            <h2>Entradas</h2>
            <p>{formatCurrency(summary.income)}</p>
          </div>

          <div className="card red">
            <h2>Saídas</h2>
            <p>{formatCurrency(summary.expense)}</p>
          </div>
        </div>

        {/* charts */}
        <div className="charts">
          <div className="chart-container">
            <h2>Receitas x Despesas por Mês</h2>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={renderTooltip} />
                <Legend />
                <Bar dataKey="income" fill="#4caf50" />
                <Bar dataKey="expense" fill="#f44336" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h2>Evolução do Saldo</h2>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={renderTooltip} />
                <Legend />
                <Line type="monotone" dataKey="balance" stroke="#2196f3" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h2>Distribuição por Conta</h2>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={renderTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h2>Despesas por Categoria</h2>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryExpenses}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={renderTooltip} />
                <Legend />
                <Bar dataKey="value" fill="#ff9800" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage("")} />}
    </AppWrapper>
  );
}
