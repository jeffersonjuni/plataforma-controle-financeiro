"use client";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import "../styles/dashboard.css";

const data = [
  { mes: "Jan", receitas: 4000, despesas: 2400 },
  { mes: "Fev", receitas: 3000, despesas: 1398 },
  { mes: "Mar", receitas: 5000, despesas: 2000 },
  { mes: "Abr", receitas: 4780, despesas: 3080 },
  { mes: "Mai", receitas: 5890, despesas: 2500 },
  { mes: "Jun", receitas: 4390, despesas: 2100 },
];

export default function FinanceChart() {
  return (
    <div className="chart-container">
      <h2> Receitas x Despesas (exemplo)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="receitas" stroke="var(--color-accent)" strokeWidth={3} />
          <Line type="monotone" dataKey="despesas" stroke="var(--color-danger)" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
