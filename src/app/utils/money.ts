
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatILS(n: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
  }).format(n || 0);
}
