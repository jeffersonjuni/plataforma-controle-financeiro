import prisma from "@/lib/prisma";

export type LogLevel = "INFO" | "WARN" | "ERROR" | "AUDIT";

export async function createLog(
  level: LogLevel,
  message: string,
  meta?: Record<string, any>,
  userId?: number
) {
  try {
    // salva no console também (útil em dev e para logs imediatos)
    console[level === "ERROR" ? "error" : "log"](
      `[${level}] ${message}`,
      meta ? JSON.stringify(meta) : ""
    );

    // persiste no banco
    await prisma.log.create({
      data: {
        level,
        message,
        meta: meta ?? undefined,
        userId: userId ?? undefined,
      },
    });
  } catch (err) {
    // se falhar ao logar no banco, não interrompe a aplicação — só console.error
    console.error("[LOG SERVICE ERROR] Falha ao gravar log no banco", err);
  }
}
