import "../styles/dashboard.css";
import FinanceChart from "../components/FinanceChart";
import ExpensesPieChart from "../components/ExpensesPieChart";

export default function Home() {
  return (
    <section className="dashboard">
      <h1>Bem-vindo ao Controle Financeiro</h1>
      <p>Gerencie suas finanças de forma simples e segura.</p>

      <div className="cards">
        <div className="card green">
          <h2>💵 Saldo</h2>
          <p>R$ 5.000,00</p>
        </div>

        <div className="card red">
          <h2>📉 Despesas</h2>
          <p>R$ 2.500,00</p>
        </div>

        <div className="card blue">
          <h2>📈 Receitas</h2>
          <p>R$ 3.200,00</p>
        </div>

        <div className="card yellow">
          <h2>⚠️ Contas Pendentes</h2>
          <p>3 contas</p>
        </div>
      </div>

      {/* Gráfico interativo de linhas */}
      <FinanceChart />

      {/* Gráfico interativo de pizza */}
      <ExpensesPieChart />
    </section>
  );
}
