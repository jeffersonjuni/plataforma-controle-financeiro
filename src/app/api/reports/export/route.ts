import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/authService";
import { getMonthlyReport } from "@/lib/services/reports/monthlyReport";
import { getAnnualReport } from "@/lib/services/reports/annualReport";
import { getCategoryReport } from "@/lib/services/reports/categoryReport";
import { exportToCSV } from "@/lib/services/reports/exportReports/exportCSV";
import { exportToExcel } from "@/lib/services/reports/exportReports/exportExcel";

/**
 * Tipos
 */
type TransactionReport = {
  date: Date | null;
  account: string;
  category: string;
  type: string;
  amount: number;
  balanceAccumulated: number;
  year?: number;
};

type ValidatedParams = {
  reportType: "monthly" | "annual" | "category";
  format: "csv" | "excel";
  year: number | null;
  month: number | null;
  startMonth: number | null;
  endMonth: number | null;
};

/**
 * Helpers de parsing / validação
 */
function parseStringParam(value: string | null) {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  return v === "" ? null : v;
}

function parseNumberParam(value: string | null) {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function clampMonth(n: number | null) {
  if (n === null) return null;
  if (n < 1) return 1;
  if (n > 12) return 12;
  return Math.floor(n);
}

/**
 * Valida e normaliza todos os query params usados pela rota
 */
function validateAndNormalizeParams(url: URL): { ok: true; params: ValidatedParams } | { ok: false; error: string } {
  const rawType = parseStringParam(url.searchParams.get("type"));
  const rawFormat = parseStringParam(url.searchParams.get("format"));
  const rawYear = parseNumberParam(url.searchParams.get("year"));
  const rawMonth = parseNumberParam(url.searchParams.get("month"));
  const rawStartMonth = parseNumberParam(url.searchParams.get("startMonth"));
  const rawEndMonth = parseNumberParam(url.searchParams.get("endMonth"));

  if (!rawType) return { ok: false, error: "Parâmetro 'type' obrigatório (monthly | annual | category)." };
  if (!["monthly", "annual", "category"].includes(rawType))
    return { ok: false, error: "Parâmetro 'type' inválido. Use: monthly, annual ou category." };

  if (!rawFormat) return { ok: false, error: "Parâmetro 'format' obrigatório (csv | excel)." };
  if (!["csv", "excel"].includes(rawFormat))
    return { ok: false, error: "Parâmetro 'format' inválido. Use: csv ou excel." };

  const year = rawYear ?? null;
  const month = clampMonth(rawMonth);
  const startMonth = clampMonth(rawStartMonth ?? null);
  const endMonth = clampMonth(rawEndMonth ?? null);

  // Regras por tipo
  if (rawType === "monthly") {
    if (!year) return { ok: false, error: "Relatório 'monthly' requer parâmetro 'year'." };
    // se start/end fornecidos, validar lógica
    if (startMonth !== null && endMonth !== null && startMonth > endMonth)
      return { ok: false, error: "'startMonth' não pode ser maior que 'endMonth'." };
  }

  if (rawType === "category") {
    if (!year || month === null) return { ok: false, error: "Relatório 'category' requer 'month' e 'year'." };
  }

  // tudo ok
  return {
    ok: true,
    params: {
      reportType: rawType as "monthly" | "annual" | "category",
      format: rawFormat as "csv" | "excel",
      year,
      month,
      startMonth,
      endMonth,
    },
  };
}

/**
 * Rota GET /api/reports/export
 */
export async function GET(req: Request) {
  try {
    // Autenticação
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Token ausente" }, { status: 401 });
    const token = authHeader.replace("Bearer ", "").trim();
    const decoded = verifyToken(token);
    if (!decoded?.userId) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    // Validar e normalizar query params
    const url = new URL(req.url);
    const validate = validateAndNormalizeParams(url);
    if (!validate.ok) {
      return NextResponse.json({ error: validate.error }, { status: 400 });
    }
    const { reportType, format, year, month, startMonth, endMonth } = validate.params;

    // Preparar dados a exportar
    let data: TransactionReport[] = [];

    if (reportType === "monthly") {
      // garantir ano
      const y = year as number;
      const s = startMonth ?? month ?? 1;
      const e = endMonth ?? month ?? 12;
      for (let m = s; m <= e; m++) {
        const report = await getMonthlyReport(decoded.userId, m, y);
        // garantir shape TransactionReport (os services devem retornar esse shape)
        data.push(
          ...report.map((t) => ({
            date: t.date ?? null,
            account: t.account ?? "",
            category: t.category ?? "",
            type: t.type ?? "",
            amount: Number(t.amount ?? 0),
            balanceAccumulated: Number(t.balanceAccumulated ?? 0),
            year: y,
          }))
        );
      }
    } else if (reportType === "annual") {
      const startY = year ?? 2023;
      const endY = year ?? new Date().getFullYear();
      for (let y = startY; y <= endY; y++) {
        const report = await getAnnualReport(decoded.userId, y);
        data.push(
          ...report.map((t) => ({
            date: t.date ?? null,
            account: t.account ?? "",
            category: t.category ?? "",
            type: t.type ?? "",
            amount: Number(t.amount ?? 0),
            balanceAccumulated: Number(t.balanceAccumulated ?? 0),
            year: y,
          }))
        );
      }
    } else if (reportType === "category") {
      const y = year as number;
      const m = month as number;
      const categoryData = await getCategoryReport(decoded.userId, m, y); // retorna {category, amount}[]
      // mapear para TransactionReport com placeholders
      data = categoryData.map((c) => ({
        date: null,
        account: "",
        category: c.category,
        type: "SAIDA",
        amount: Number(c.amount ?? 0),
        balanceAccumulated: 0,
        year: y,
      }));
    }

    // Se não há dados, retornar mensagem amigável
    if (!data.length) {
      return NextResponse.json({ message: "Nenhum dado para exportação com os filtros informados." }, { status: 204 });
    }

    // Exportar
    if (format === "csv") {
      const csv = exportToCSV(data);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${reportType}_${year ?? "all"}.csv"`,
        },
      });
    }

    // excel
    const buffer = exportToExcel(data, reportType);
    // next server espera BodyInit; usar Uint8Array para Buffer
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${reportType}_${year ?? "all"}.xlsx"`,
      },
    });
  } catch (err: any) {
    console.error("Erro ao exportar relatório:", err);
    return NextResponse.json({ error: err.message ?? "Erro interno" }, { status: 500 });
  }
}
