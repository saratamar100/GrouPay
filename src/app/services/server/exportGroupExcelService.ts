import { ObjectId } from "mongodb";
import { getDb } from "@/app/services/server/mongo";
import { getGroupWithExpensesService } from "@/app/services/server/groupService";

function formatDate(value: any): string {
  if (!value) return "";
  const d =
    value instanceof Date
      ? value
      : typeof value === "string" || typeof value === "number"
      ? new Date(value)
      : null;
  if (!d || Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

export async function buildGroupExcelFile(
  groupId: string,
  userId: string
): Promise<{ buffer: ArrayBuffer; groupName: string }> {
  const group = await getGroupWithExpensesService(groupId, userId);

  const db = await getDb("groupay_db");
  const paymentsCol = db.collection("payment");

  const rawPayments = await paymentsCol
    .find({ groupId: new ObjectId(groupId) })
    .toArray();

  const payments = rawPayments.map((p: any) => {
    const fromName = p.payer?.name || "";
    const toName = p.receiver?.name || p.payee?.name || p.to?.name || "";

    return {
      id: p._id.toString(),
      date: p.createdAt ?? p.date ?? null,
      amount:
        typeof p.amount === "number"
          ? p.amount
          : Number(p.amount ?? 0) || 0,
      fromName,
      toName,
    };
  });

  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "GrouPay";
  workbook.created = new Date();

  const expensesSheet = workbook.addWorksheet("הוצאות");

  expensesSheet.columns = [
    { header: "תאריך", key: "date", width: 14 },
    { header: "שם הוצאה", key: "name", width: 24 },
    { header: "משלם", key: "payer", width: 20 },
    { header: "סכום (₪)", key: "amount", width: 14 },
  ];

  for (const e of group.expenses) {
    const date = formatDate(e.date);
    const payerName = e.payer?.name ?? "";

    expensesSheet.addRow({
      date,
      name: e.name ?? "",
      payer: payerName,
      amount:
        typeof e.amount === "number" ? e.amount : Number(e.amount ?? 0) || 0,
    });
  }

  expensesSheet.getRow(1).font = { bold: true };
  expensesSheet.getRow(1).alignment = { horizontal: "center" };

  const paymentsSheet = workbook.addWorksheet("תשלומים");

  paymentsSheet.columns = [
    { header: "תאריך", key: "date", width: 14 },
    { header: "משלם", key: "fromName", width: 20 },
    { header: "מקבל", key: "toName", width: 20 },
    { header: "סכום (₪)", key: "amount", width: 14 },
  ];

  for (const p of payments) {
    const date = formatDate(p.date);

    paymentsSheet.addRow({
      date,
      fromName: p.fromName,
      toName: p.toName,
      amount: p.amount,
    });
  }

  paymentsSheet.getRow(1).font = { bold: true };
  paymentsSheet.getRow(1).alignment = { horizontal: "center" };

  const buffer = (await workbook.xlsx.writeBuffer()) as ArrayBuffer;

  return {
    buffer,
    groupName: group.name ?? "group",
  };
}
