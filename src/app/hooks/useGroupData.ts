"use client";
import { useCallback, useMemo, useState } from "react";
import type { Group, Member, Expense } from "@/app/types/types";
import {
  getGroup,
  createExpense,
  delExpense,
  getGroupExpenses,
  updateExpense,
} from "@/app/services/client/groupService";
import type { SplitDetail } from "@/app/types/types";
import {uploadToCloudinary} from "@/app/services/client/uploadService"
import { toMoney } from "../utils/money";
import { useLoginStore } from "@/app/store/loginStore";



type DraftExpense = Omit<Expense, "id" | "payer"> & {
  id: "DRAFT";
  payer: Member;
};

type AdvState =
  | {
      open: false;
      mode: null;
      name: string;
      amount: number;
      split: SplitDetail[];
      receiptUrl: string | null;
      expenseId?: string;
    }
  | {
      open: true;
      mode: "draft" | "existing";
      name: string;
      amount: number;
      split: SplitDetail[];
      receiptUrl: string | null;
      expenseId?: string;
    };

export function useGroupData(groupId: string | undefined,userId:string|undefined) {
  const [group, setGroup] = useState<Group | null>(null);
  const [draft, setDraft] = useState<DraftExpense | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [adv, setAdv] = useState<AdvState>({
    open: false,
    mode: null,
    name: "",
    amount: 0,
    split: [],
    receiptUrl: null,
  });


  const expenses: Expense[] = useMemo(
    () => (Array.isArray(group?.expenses) ? group!.expenses : []),
    [group]
  );

  const currentUser = useLoginStore((state) => state.loggedUser);
  const currentUserId = currentUser ? currentUser.id : null;
  const currentUserName = currentUser ? currentUser.name : null;


 const reload = useCallback(() => {
  if (!groupId) return;
  
  setLoading(true);

  getGroup(groupId, userId)
    .then((g) => {
      console.log(g);
      setGroup(g);
      setError(null);
    })
    .catch((e: any) => {
      setError(e?.message || "שגיאה בטעינת נתוני קבוצה");
    })
    .finally(() => {
      setLoading(false);
    });

}, [groupId, userId]);


  const startDraftExpense = useCallback(() => {
    if (!group) return;

    let payer: Member | null = null;

    currentUser ? (currentUser as any).name : undefined;
    if (typeof window !== "undefined" && currentUserId && currentUserName) {
      payer = { id: currentUserId, name: currentUserName };
    }
    if (!payer) {
      return
    }

    setDraft({
      id: "DRAFT",
      name: "",
      amount: 0,
      payer,
      split: [],
      date: new Date(),
      receiptUrl: null,
    });
  }, [group]);

  const cancelDraft = useCallback(() => setDraft(null), []);

  const updateDraftField = useCallback((key: keyof DraftExpense, value: any) => {
    setDraft((d) => {
      if (!d) return d;
      if (key === "amount") {
        return { ...d, amount: toMoney(String(value)) } as DraftExpense;
      }
      return { ...d, [key]: value } as DraftExpense;
    });
  }, []);

  const addFromDraft = useCallback(async () => {
    if (!draft || !group) return;

    const name = draft.name?.trim();
    const amount = Number(draft.amount);
    const payer = draft.payer.id;
    const dateISO =
      draft.date instanceof Date
        ? draft.date.toISOString()
        : new Date(draft.date).toISOString();

    if (!name || !Number.isFinite(amount) || amount <= 0 || !payer || !dateISO)
      return;

    try {
      setSaving(true);
      const apiSplit =
        Array.isArray(draft.split) && draft.split.length > 0
          ? draft.split.map((s: any) => ({
              userId: s.id ?? s.userId ?? s.user,
              amount: Number(s.amount) || 0,
              name : s.name
            }))
          : [];

      await createExpense(group.id, group.members, {
        name,
        amount,
        payer,
        split: apiSplit,
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

  const deleteExpense = useCallback(
    async (id: string) => {
      if (!group) return;
      const ok =
        typeof window === "undefined" ? true : window.confirm("למחוק את ההוצאה הזו?");
      if (!ok) return;
      try {
        setSaving(true);
        await delExpense(group.id, id ,userId);
        const fresh = await getGroupExpenses(group.id);
        setGroup({ ...group, expenses: fresh });
      } catch (e: any) {
        alert(e?.message || "שגיאה במחיקת ההוצאה");
      } finally {
        setSaving(false);
      }
    },
    [group]
  );

  /*========Advanced Expenced========*/

  const openAdvancedForDraft = useCallback(() => {
    if (!draft || !group) return;

    let uiSplit: SplitDetail[] = [];

    if (Array.isArray(draft.split) && draft.split.length > 0) {
      uiSplit = draft.split.map((item: any) => {
        const id = item.id ?? item.userId ?? item.user ?? "";
        const member = group.members.find((m) => m.id === id);
        return {
          userId:id,
          name: member?.name ?? "",
          amount: Number(item.amount) || 0,
        };
      });
    }

    setAdv({
      open: true,
      mode: "draft",
      name: draft.name || "",
      amount: Number(draft.amount) || 0,
      split: uiSplit,
      receiptUrl: draft.receiptUrl ?? null,
    });
  }, [draft, group]);

  const openAdvancedForExisting = useCallback(
    (expenseId: string) => {
      if (!group) return;

      const exp = expenses.find((e) => e.id === expenseId);
      if (!exp) return;

      let uiSplit: SplitDetail[] = [];

      if (Array.isArray(exp.split)) {
        uiSplit = exp.split.map((item: any) => {
          const id = item.id ?? item.userId ?? item.user ?? "";
          const member = group.members.find((m) => m.id === id);
          return {
            userId:id,
            name: member?.name ?? "",
            amount: Number(item.amount) || 0,
          };
        });
      }

      setAdv({
        open: true,
        mode: "existing",
        name: exp.name || "",
        amount: Number(exp.amount) || 0,
        split: uiSplit,
        receiptUrl: exp.receiptUrl ?? null,
        expenseId: exp.id,
      });
    },
    [expenses, group]
  );

  const closeAdvanced = useCallback(() => {
    setAdv({
      open: false,
      mode: null,
      name: "",
      amount: 0,
      split: [],
      receiptUrl: null,
      expenseId: undefined,
    });
  }, []);

  const handleAdvancedSave = useCallback(
  async (payload: {
    split: SplitDetail[];
    receiptFile?: File | null;
    receiptUrl?: string | null;
    name?: string;
    amount?: number;
  }) => {
    
    if (!adv.open || !adv.mode) return;

    const { split, receiptFile, receiptUrl, name, amount } = payload;

    let finalReceiptUrl: string | null = null;
    if (receiptFile) {
      try {
        finalReceiptUrl = await uploadToCloudinary(receiptFile);
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        finalReceiptUrl = receiptUrl ?? null;
      }
    } else {
      finalReceiptUrl = receiptUrl ?? null;
    }

    if (adv.mode === "draft") {
      if (!draft || !group) return;

      const payerId = draft.payer.id;
      const dateISO =
        draft.date instanceof Date
          ? draft.date.toISOString()
          : new Date(draft.date).toISOString();

      const finalName = (name ?? draft.name ?? "").trim();
      const finalAmount = Number(amount ?? draft.amount ?? 0) || 0;

      const finalSplitUI =
        (split && split.length > 0 ? split : adv.split) || [];

      if (!finalName || !Number.isFinite(finalAmount) || finalAmount <= 0) {
        return;
      }

      try {
        setSaving(true);

        const apiSplit = finalSplitUI.map((s) => ({
          userId: s.userId,
          amount: s.amount,
          name: s.name
        }));

        await createExpense(group.id, group.members, {
          name: finalName,
          amount: finalAmount,
          payer: payerId,
          split: apiSplit,
          date: dateISO as any,
          receiptUrl: finalReceiptUrl,
        });

        const fresh = await getGroupExpenses(group.id);
        setGroup({ ...group, expenses: fresh });
        setDraft(null);
      } finally {
        setSaving(false);
      }

      closeAdvanced();
      return;
    }

    if (adv.mode === "existing" && adv.expenseId && group) {
      const current = expenses.find((e) => e.id === adv.expenseId) || null;

      const finalName = (name ?? current?.name ?? "").trim();
      const finalAmount = Number(amount ?? current?.amount ?? 0) || 0;

      const finalSplitUI =
        (split && split.length > 0 ? split : adv.split) || [];

      if (!finalName || !Number.isFinite(finalAmount) || finalAmount <= 0) {
        return;
      }

      

      try {
        setSaving(true);

        const apiSplit = finalSplitUI.map((s) => ({
          userId: s.userId,
          amount: s.amount,
        }));

        await updateExpense(group.id, adv.expenseId,userId, {
          name: finalName,
          amount: finalAmount,
          split: apiSplit,
          receiptUrl: finalReceiptUrl,
        });

        const fresh = await getGroupExpenses(group.id);
        setGroup({ ...group, expenses: fresh });
      } catch (e: any) {
        alert(e?.message || "שגיאה בעדכון ההוצאה");
      } finally {
        setSaving(false);
      }

      closeAdvanced();
      return;
    }
  },
  [adv, draft, group, expenses, closeAdvanced]
);


  return {
    state: {
      group,
      draft,
      loading,
      saving,
      error,
      expenses,
      adv,
    },
    reload,
    startDraftExpense,
    cancelDraft,
    updateDraftField,
    addFromDraft,
    deleteExpense,
    openAdvancedForDraft,
    openAdvancedForExisting,
    closeAdvanced,
    handleAdvancedSave,
  } as const;
}
