// app/relatorios/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppWrapper from "@/components/AppWrapper";
import Toast from "@/components/Toast";
import "@/styles/relatorios.css";

export default function RelatoriosPage() {
  const router = useRouter();

  const [reportType, setReportType] = useState("monthly");
  const [format, setFormat] = useState("csv");
  const [year, setYear] = useState<number | "">("");
  const [month, setMonth] = useState<number | "">("");
  const [startMonth, setStartMonth] = useState<number | "">("");
  const [endMonth, setEndMonth] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  const months = [
    { value: 1, label: "Janeiro" }, { value: 2, label: "Fevereiro" }, { value: 3, label: "Março" },
    { value: 4, label: "Abril" }, { value: 5, label: "Maio" }, { value: 6, label: "Junho" },
    { value: 7, label: "Julho" }, { value: 8, label: "Agosto" }, { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" }, { value: 11, label: "Novembro" }, { value: 12, label: "Dezembro" },
  ];

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setToastMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      const params = new URLSearchParams();
      params.append("type", reportType);
      params.append("format", format);
      if (year) params.append("year", String(year));
      if (month && reportType === "category") params.append("month", String(month));
      if (startMonth && endMonth && reportType === "monthly") {
        params.append("startMonth", String(startMonth));
        params.append("endMonth", String(endMonth));
      }

      const response = await fetch(`/api/reports/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 204) {
        setError("Nenhum dado encontrado para os filtros selecionados.");
        return;
      }

      if (!response.ok) {
        const err = await response.json();
        setError(err.error || "Erro ao exportar relatório.");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const ext = format === "csv" ? "csv" : "xlsx";
      link.href = url;
      link.download = `relatorio_${reportType}.${ext}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setToastMessage("✅ Relatório exportado com sucesso!");
    } catch (err) {
      console.error(err);
      setError("Erro ao gerar relatório.");
      setToastMessage("❌ Ocorreu um erro na exportação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppWrapper>
      <section className="reports-container">
        <header className="reports-header">
          <h2>Exportar Relatórios Financeiros</h2>
        </header>

        <div className="filters-container">
          <div className="form-group">
            <label>Tipo de Relatório</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="monthly">Mensal</option>
              <option value="annual">Anual</option>
              <option value="category">Por Categoria</option>
            </select>
          </div>

          <div className="form-group">
            <label>Ano</label>
            <input
              type="number"
              placeholder="Ex: 2025"
              value={year}
              onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")}
            />
          </div>

          {reportType === "category" && (
            <div className="form-group">
              <label>Mês</label>
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                <option value="">Selecione</option>
                {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          )}

          {reportType === "monthly" && (
            <>
              <div className="form-group">
                <label>Mês Inicial</label>
                <select value={startMonth} onChange={(e) => setStartMonth(Number(e.target.value))}>
                  <option value="">Selecione</option>
                  {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Mês Final</label>
                <select value={endMonth} onChange={(e) => setEndMonth(Number(e.target.value))}>
                  <option value="">Selecione</option>
                  {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Formato</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
            </select>
          </div>
        </div>

        <button className="export-button" onClick={handleExport} disabled={loading}>
          {loading ? "Gerando..." : "Gerar Relatório"}
        </button>

        {/* Mensagens de erro e toast */}
        {error && <p className="error-message">{error}</p>}
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage("")} />}
      </section>
    </AppWrapper>
  );
}
