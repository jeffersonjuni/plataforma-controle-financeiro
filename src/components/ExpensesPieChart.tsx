"use client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../styles/dashboard.css";

const data = [
  { categoria: "Moradia", valor: 1200 },
  { categoria: "Alimentação", valor: 800 },
  { categoria: "Transporte", valor: 400 },
  { categoria: "Lazer", valor: 300 },
  { categoria: "Outros", valor: 200 },
];

const COLORS = ["#2563eb", "#16a34a", "#ca8a04", "#dc2626", "#9333ea"];

export default function ExpensesPieChart() {
  return (
    <div className="chart-container">
      <h2> Distribuição de Despesas</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="valor"
            nameKey="categoria"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
