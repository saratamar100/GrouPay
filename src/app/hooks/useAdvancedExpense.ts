"use client";

import { useEffect, useMemo, useState } from "react";
import type { Member } from "@/app/types/types";
import type { SplitDetail } from "@/app/types/types";
import { toMoney, round2 } from "@/app/utils/money";
import { calcEqual, isEqualSplit } from "@/app/utils/split";
import { buildSplit } from "@/app/utils/advancedExpense";
import { useFilePreview } from "@/app/hooks/useFilePreview";

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
  const [nameValue, setNameValue] = useState(name || "");
  const [amountValue, setAmountValue] = useState<number>(amount || 0);

  const { file: receiptFile, previewUrl: receiptPreview, setFile } =
    useFilePreview(initialReceiptUrl);

  useEffect(() => {
    if (!open) return;

    setNameValue(name || "");
    setAmountValue(Number(amount) || 0);

    if (initialSplit && initialSplit.length > 0) {
      const ids = initialSplit.map((s) => s.userId);
      setSelected(ids);
      setPerUser(
        Object.fromEntries(
          initialSplit.map((s) => [s.userId, Number(s.amount) || 0])
        )
      );
      setEqualMode(isEqualSplit(initialSplit));
      return;
    }

    const ids = members.map((m) => m.id);
    setSelected(ids);
    const eq = calcEqual(Number(amount) || 0, ids.length || 0);
    setPerUser(Object.fromEntries(ids.map((id, i) => [id, eq[i]])));
    setEqualMode(true);
  }, [open, name, amount, members, initialSplit]);

  useEffect(() => {
    if (!open || !equalMode || !selected.length) return;

    const eq = calcEqual(Number(amountValue) || 0, selected.length);

    setPerUser((prev) => {
      const next: Record<string, number> = { ...prev };
      selected.forEach((id, i) => {
        next[id] = eq[i] ?? 0;
      });
      return next;
    });
  }, [open, equalMode, amountValue, selected]);

  const sum = useMemo(
    () => selected.reduce((acc, id) => acc + (Number(perUser[id]) || 0), 0),
    [selected, perUser]
  );

  const diff = useMemo(
    () => round2((Number(amountValue) || 0) - (sum || 0)),
    [amountValue, sum]
  );

  const toggleMember = (id: string) => {
    setSelected((prev) => {
      const has = prev.includes(id);
      const next = has ? prev.filter((x) => x !== id) : [...prev, id];

      if (equalMode) {
        const eq = calcEqual(Number(amountValue) || 0, next.length || 0);
        setPerUser((p) => {
          const out: Record<string, number> = { ...p };
          next.forEach((uid, i) => {
            out[uid] = eq[i] ?? 0;
          });
          return out;
        });
      } else {
        setPerUser((p) => {
          const out = { ...p };
          if (has) delete out[id];
          else out[id] = 0;
          return out;
        });
      }

      return next;
    });
  };

  const setAmountFor = (id: string, value: string) => {
    setPerUser((p) => ({ ...p, [id]: toMoney(value) }));
  };

  

  const handleSave = () => {
    const split = buildSplit(selected, members, perUser);

    void onSave({
      split,
      receiptFile,
      receiptUrl: receiptPreview,
      name: nameValue.trim(),
      amount: amountValue,
    });
  };

  const resetReceipt = () => {
    setFile(null);
  };


  return {
    selected,
    perUser,
    equalMode,
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
    handleFile: setFile,
    handleSave,
    resetReceipt,

  };
}
