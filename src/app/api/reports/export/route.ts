import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/authService";
import { getMonthlyReport } from "@/lib/services/reports/monthlyReport";
import { getAnnualReport } from "@/lib/services/reports/annualReport";
import { getCategoryReport } from "@/lib/services/reports/categoryReport";
import { exportToCSV } from "@/lib/services/reports/exportReports/exportCSV";
import { exportToExcel } from "@/lib/services/reports/exportReports/exportExcel";

export async function GET(req: Request) {
  try {
    // --- Autenticação ---
    let token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
    if (!token) {
      const cookie = req.headers.get("cookie");
      const match = cookie?.match(/token=([^;]+)/);
      token = match?.[1];
    }
    if (!token)
      return NextResponse.json({ error: "Token ausente" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded?.userId)
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    // --- Parâmetros ---
    const url = new URL(req.url);
    const reportType = (url.searchParams.get("type") ?? "").trim() as
      | "monthly"
      | "annual"
      | "category";
    const format = (url.searchParams.get("format") ?? "").trim() as "csv" | "excel";
    const year = Number(url.searchParams.get("year") ?? 0) || null;
    const month = Number(url.searchParams.get("month") ?? 0) || null;
    const startMonth = Number(url.searchParams.get("startMonth") ?? 0) || null;
    const endMonth = Number(url.searchParams.get("endMonth") ?? 0) || null;
    const accountIdParam = url.searchParams.get("accountId");
    const accountId = accountIdParam ? Number(accountIdParam) : undefined;


    if (!reportType || !["monthly", "annual", "category"].includes(reportType))
      return NextResponse.json({ error: "Parâmetro 'type' inválido" }, { status: 400 });
    if (!format || !["csv", "excel"].includes(format))
      return NextResponse.json({ error: "Parâmetro 'format' inválido" }, { status: 400 });

    if (
      reportType === "monthly" &&
      startMonth !== null &&
      endMonth !== null &&
      startMonth > endMonth
    )
      return NextResponse.json(
        { error: "'startMonth' não pode ser maior que 'endMonth'." },
        { status: 400 }
      );

    // --- Obter dados do relatório ---
    let data: any[] = [];
    if (reportType === "monthly") {
      const s = startMonth ?? month ?? 1;
      const e = endMonth ?? month ?? 12;
      for (let m = s; m <= e; m++) {
        const report = await getMonthlyReport(decoded.userId, m, year!, accountId);
        data.push(...report);
      }
    } else if (reportType === "annual") {
      const y = year ?? new Date().getFullYear();
      const report = await getAnnualReport(decoded.userId, y, accountId);
      data.push(...report);
    } else if (reportType === "category") {
      if (!month || !year)
        return NextResponse.json(
          { error: "Month e year obrigatórios" },
          { status: 400 }
        );
      const report = await getCategoryReport(decoded.userId, month, year, accountId);
      data.push(...report);
    }

    // --- Verificação de dados ---
    if (!data.length)
      return NextResponse.json(
        { message: "Nenhum dado para exportação com os filtros informados." },
        { status: 200 }
      );

    // --- Exportar ---
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

    const buffer = exportToExcel(data, reportType);
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
