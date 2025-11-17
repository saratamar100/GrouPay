import { round2 } from "./money";

export type SplitDetail = {
  id: string;
  name: string;
  amount: number;
};

export function calcEqual(total: number, count: number): number[] {
  if (!count || total <= 0) return Array(count).fill(0);
  const base = Math.floor((total / count) * 100) / 100;
  const arr = Array(count).fill(base);
  let remainder = round2(total - base * count);
  let i = 0;
  while (remainder > 0.0009 && i < count) {
    arr[i] = round2(arr[i] + 0.01);
    remainder = round2(remainder - 0.01);
    i++;
  }
  return arr;
}

export function isEqualSplit(split: SplitDetail[]): boolean {
  if (!split.length) return true;
  const total = split.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const avg = total / split.length;
  return split.every((x) => Math.abs(Number(x.amount) - avg) < 0.01);
}
