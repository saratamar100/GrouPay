
"use client";
import { useCallback, useState } from "react";
import type { Group, Member, Expense } from "@/app/types/types";

export const toMoney = (value: string) => {
  const clean = value.replace(/[^\d.]/g, "");
  const parts = clean.split(".");
  const normalized = parts.length <= 1 ? clean : `${parts[0]}.${parts.slice(1).join("")}`;
  return Number(normalized || 0);
};
import {
  getGroup,
  createExpense,
  delExpense,
  getGroupExpenses
} from "@/app/services/client/groupService";

// local draft type compatible with your Expense
type DraftExpense = Omit<Expense, "id" | "payer"> & { id: "DRAFT"; payer: Member };

export function useGroupData(groupId: any) {
  const [group, setGroup] = useState<Group | null>(null);
  const [draft, setDraft] = useState<DraftExpense | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      console.log("Loading group data for", groupId);
      setLoading(true);
      const g = await getGroup(groupId);
      setGroup(g);
      console.log("Loaded group:", g);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "שגיאה בטעינת נתוני קבוצה");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const startDraftExpense = useCallback(() => {
    if (!group) return;
    const defaultPayer = group.members[0];
    
    setDraft({
      id: "DRAFT",
      name: "",
      amount: 0,
      payer: defaultPayer,
      split: [],
      date: new Date(),
      receiptUrl: null,
    });
    
  }, [group]);

  const cancelDraft = useCallback(() => setDraft(null), []);

  const updateDraftField = useCallback(
    (key: keyof DraftExpense, value: any) => {
      setDraft((d) => {
        if (!d) return d;
        if (key === "amount") return { ...d, amount: toMoney(String(value)) } as DraftExpense;
        return { ...d, [key]: value } as DraftExpense;
      });
    },
    []
  );

  const addFromDraft = useCallback(async () => {
    if (!draft || !group) return;

    const name = draft.name?.trim();
    const amount = Number(draft.amount);
    const payer = draft.payer.id;
    const dateISO = draft.date instanceof Date ? draft.date.toISOString() : new Date(draft.date).toISOString();

    if (!name || !Number.isFinite(amount) || amount <= 0 || !payer || !dateISO) return;

    try {
      setSaving(true);
      await createExpense(group.id, group.members, {
        name,
        amount,
        payer,
        split: (draft.split || []),
        date: dateISO as any,
        receiptUrl: draft.receiptUrl ?? null,
      });
      const fresh = await getGroupExpenses(group.id);
      setGroup({ ...group, expenses: fresh });
      setDraft(null);
    } finally {
      setSaving(false);
    }
  }, [draft, group]);

  const deleteExpense = useCallback(async (id: string) => {
    if (!group) return;
    const ok = typeof window === "undefined" ? true : window.confirm("למחוק את ההוצאה הזו?");
    if (!ok) return;
    try {
      setSaving(true);
      await delExpense(group.id, id);
      const fresh = await getGroupExpenses(group.id);
      setGroup({ ...group, expenses: fresh });
    } finally {
      setSaving(false);
    }
  }, [group]);

  return {
    state: { group, draft, loading, saving, error },
    reload,
    startDraftExpense,
    cancelDraft,
    updateDraftField,
    addFromDraft,
    deleteExpense,
  } as const;
}

