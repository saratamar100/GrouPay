export function toMoney(value: string): number {
  const clean = value.replace(/[^\d.]/g, "");
  const parts = clean.split(".");
  const normalized = parts.length <= 1 ? clean : `${parts[0]}.${parts.slice(1).join("")}`;
  const n = Number(normalized || 0);
  return Number.isFinite(n) ? n : 0;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatILS(n: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
  }).format(n || 0);
}
