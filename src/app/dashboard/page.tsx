"use client";
import { useEffect, useState } from "react";
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

export default function Dashboard() {
  const [summary, setSummary] = useState<any>({ balance: 0, income: 0, expense: 0 });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [categoryExpenses, setCategoryExpenses] = useState<any[]>([]);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const COLORS = ["#4caf50", "#f44336", "#2196f3", "#ff9800", "#9c27b0", "#ff5722"];

  const normalize = (obj: any, mapping: Record<string, string>, defaults = {}) => {
    if (!obj) return defaults;
    const normalized: any = { ...defaults, ...obj };
    for (const [oldKey, newKey] of Object.entries(mapping)) {
      if (obj[oldKey] !== undefined) {
        normalized[newKey] = obj[oldKey];
      }
    }
    return normalized;
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return console.error("Token não encontrado. Faça login primeiro.");
      const headers = { Authorization: `Bearer ${token}` };

      // 📌 Summary
      const resSummary = await fetch(`/api/transactions/summary?month=${month}&year=${year}`, { headers });
      const summaryData = await resSummary.json();
      const normalizedSummary = normalize(
        summaryData,
        {
          balance: "balance",
          saldoTotal: "balance",
          income: "income",
          entrada: "income",
          expense: "expense",
          saida: "expense",
        },
        { balance: 0, income: 0, expense: 0 }
      );
      console.log("✅ Summary normalizado:", normalizedSummary);
      setSummary(normalizedSummary);

      // 📌 Relatório mensal
      const resMonthly = await fetch(`/api/reports/monthly?month=${month}&year=${year}`, { headers });
      const monthly = await resMonthly.json();
      const normalizedMonthly = Array.isArray(monthly)
        ? monthly.map((item, index) =>
            normalize(
              item,
              {
                month: "month",
                mes: "month",
                income: "income",
                receita: "income",
                expense: "expense",
                despesa: "expense",
                balance: "balance",
                saldoTotal: "balance",
              },
              { month: "", income: 0, expense: 0, balance: 0, monthIndex: index + 1 }
            )
          )
        : [];
      console.log("✅ Monthly normalizado:", normalizedMonthly);
      setMonthlyData(normalizedMonthly.length > 0 ? normalizedMonthly : []);

      // 📌 Distribuição por conta
      const resPie = await fetch(`/api/accounts/distribution`, { headers });
      const pie = await resPie.json();
      const normalizedPie = Array.isArray(pie)
        ? pie.map((item) =>
            normalize(item, { name: "name", conta: "name", value: "value", valor: "value" }, { name: "Desconhecido", value: 0 })
          )
        : [];
      console.log("✅ PieData normalizado:", normalizedPie);
      setPieData(normalizedPie.length > 0 ? normalizedPie : []);

      // 📌 Categoria de despesas
      const resCategory = await fetch(`/api/reports/category-expenses?month=${month}&year=${year}`, { headers });
      const category = await resCategory.json();
      const normalizedCategory = Array.isArray(category)
        ? category.map((item) =>
            normalize(item, { category: "category", categoria: "category", amount: "amount", valor: "amount" }, { category: "Outro", amount: 0 })
          )
        : [];
      console.log("✅ CategoryExpenses normalizado:", normalizedCategory);
      setCategoryExpenses(normalizedCategory.length > 0 ? normalizedCategory : []);

    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    }
  };

  useEffect(() => { fetchDashboardData(); }, [month, year]);

  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-bold">{label}</p>
          {payload.map((entry: any) => (
            <p key={entry.dataKey} className="text-sm">
              {entry.name}: R$ {(entry.value ?? 0).toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 21 }, (_, i) => 2020 + i);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📊 Dashboard Financeiro</h1>

      {/* Filtros */}
      <div className="flex gap-4 items-center mb-4">
        <label className="flex flex-col">
          Mês:
          <select
            id="month"
            name="month"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="mt-1 p-2 border rounded"
          >
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col">
          Ano:
          <select
            id="year"
            name="year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="mt-1 p-2 border rounded"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="font-semibold">Saldo Total</h2>
          <p className="text-2xl font-bold text-green-600">R$ {(summary?.balance ?? 0).toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="font-semibold">Entradas</h2>
          <p className="text-xl text-blue-600">R$ {(summary?.income ?? 0).toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="font-semibold">Saídas</h2>
          <p className="text-xl text-red-600">R$ {(summary?.expense ?? 0).toFixed(2)}</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="bg-white p-4 rounded-2xl shadow">
        <h2 className="mb-4 font-semibold">Receitas x Despesas por Mês</h2>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={renderCustomTooltip} />
              <Legend />
              <Bar dataKey="income" fill="#4caf50" name="Receitas" />
              <Bar dataKey="expense" fill="#f44336" name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        ) : <p>Nenhum dado disponível</p>}
      </div>

      <div className="bg-white p-4 rounded-2xl shadow">
        <h2 className="mb-4 font-semibold">Evolução do Saldo Mensal</h2>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={renderCustomTooltip} />
              <Legend />
              <Line type="monotone" dataKey="balance" stroke="#2196f3" strokeWidth={2} name="Saldo" />
            </LineChart>
          </ResponsiveContainer>
        ) : <p>Nenhum dado disponível</p>}
      </div>

      <div className="bg-white p-4 rounded-2xl shadow">
        <h2 className="mb-4 font-semibold">Distribuição por Conta</h2>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={renderCustomTooltip} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : <p>Nenhuma conta registrada</p>}
      </div>

      <div className="bg-white p-4 rounded-2xl shadow">
        <h2 className="mb-4 font-semibold">Despesas Fixas x Variáveis</h2>
        {categoryExpenses.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={categoryExpenses}>
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip content={renderCustomTooltip} />
              <Legend />
              <Bar dataKey="amount" fill="#ff9800" name="Valor" label={{ position: "top" }} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p>Nenhuma despesa registrada</p>}
      </div>
    </div>
  );
}
