"use client";

import { useEffect, useMemo, useState } from "react";
import type { Member } from "@/app/types/types";
import type { SplitDetail } from "@/app/utils/split";
import { toMoney, round2 } from "@/app/utils/money";
import { calcEqual, isEqualSplit } from "@/app/utils/split";

export type UseAdvancedExpenseArgs = {
  open: boolean;
  name?: string;
  amount: number;
  members: Member[];
  initialSplit?: SplitDetail[];
  initialReceiptUrl?: string | null;
  onSave: (data: {
    split: SplitDetail[];
    receiptFile?: File | null;
    receiptUrl?: string | null;
    name?: string;
    amount?: number;
  }) => Promise<void>;
};

export function useAdvancedExpense({
  open,
  name,
  amount,
  members,
  initialSplit,
  initialReceiptUrl,
  onSave,
}: UseAdvancedExpenseArgs) {
  const [selected, setSelected] = useState<string[]>([]);
  const [perUser, setPerUser] = useState<Record<string, number>>({});
  const [equalMode, setEqualMode] = useState(true);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [nameValue, setNameValue] = useState(name || "");
  const [amountValue, setAmountValue] = useState<number>(amount || 0);

  useEffect(() => {
    if (!open) return;

    setReceiptFile(null);
    setReceiptPreview(initialReceiptUrl || null);
    setNameValue(name || "");
    setAmountValue(Number(amount) || 0);

    // if split
    if (initialSplit && initialSplit.length > 0) {
      const ids = initialSplit.map((s) => s.id);
      setSelected(ids);
      setPerUser(
        Object.fromEntries(
          initialSplit.map((s) => [s.id, Number(s.amount) || 0])
        )
      );
      const allEqual = isEqualSplit(initialSplit);
      setEqualMode(allEqual);
      return;
    }

    //equal split
    const ids = members.map((m) => m.id);
    setSelected(ids);
    const eq = calcEqual(Number(amount) || 0, ids.length || 0);
    setPerUser(Object.fromEntries(ids.map((id, i) => [id, eq[i]])));
    setEqualMode(true);
  }, [open, name, amount, members, initialSplit, initialReceiptUrl]);


  const sum = useMemo(
    () =>
      selected.reduce((acc, id) => acc + (Number(perUser[id]) || 0), 0),
    [selected, perUser]
  );

  const diff = useMemo(
    () => round2((Number(amountValue) || 0) - (sum || 0)),
    [amountValue, sum]
  );

  //add or remove member
  const toggleMember = (id: string) => {
    setSelected((prev) => {
      const has = prev.includes(id);
      const next = has ? prev.filter((x) => x !== id) : [...prev, id];

      if (!equalMode) {
        setPerUser((p) => {
          const out = { ...p };
          if (has) delete out[id];
          else out[id] = 0;
          return out;
        });
      } else {
        const eq = calcEqual(Number(amountValue) || 0, next.length || 0);
        setPerUser((p) => {
          const out: Record<string, number> = { ...p };
          next.forEach((uid, i) => {
            out[uid] = eq[i] ?? 0;
          });
          return out;
        });
      }

      return next;
    });
  };

  const setAmountFor = (id: string, value: string) => {
    setPerUser((p) => ({ ...p, [id]: toMoney(value) }));
  };

  const recalcEqualNow = () => {
    const eq = calcEqual(Number(amountValue) || 0, selected.length || 0);
    setPerUser((p) => {
      const out: Record<string, number> = { ...p };
      selected.forEach((id, i) => {
        out[id] = eq[i] ?? 0;
      });
      return out;
    });
  };

  const handleFile = (file: File | null) => {
    setReceiptFile(file);
    if (!file) {
      setReceiptPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setReceiptPreview(url);
  };

  const handleSave = () => {
    const split: SplitDetail[] = selected.map((id) => {
      const member = members.find((m) => m.id === id);
      return {
        id,
        name: member?.name ?? "",
        amount: Number(perUser[id]) || 0,
      };
    });

    void onSave({
      split,
      receiptFile,
      receiptUrl: receiptPreview,
      name: nameValue.trim(),
      amount: amountValue,
    });
  };

  return {
    selected,
    perUser,
    equalMode,
    receiptFile,
    receiptPreview,
    nameValue,
    amountValue,
    sum,
    diff,
    setNameValue,
    setAmountValue,
    setEqualMode,
    toggleMember,
    setAmountFor,
    recalcEqualNow,
    handleFile,
    handleSave,
  };
}
