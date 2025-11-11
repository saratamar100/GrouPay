// File: src/app/groups/[id]/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Container,
  Paper,
  Stack,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import styles from "./group.module.css";

import type { Group, Transactionaction } from "@/app/types/types";
import {
  getGroupWithDetails,
  getGroupTransactions,
  createGroupTransaction,
  updateGroupTransaction,
  deleteGroupTransaction,
  type GroupMember,
} from "@/app/services/client/groupService";

import AdvancedDialog, {
  type AdvancedValue,
} from "@/app/components/AdvancedDialog/AdvancedDialog";
import Header from "@/app/components/Header/Header";

/** Parse money-like input to a proper number (keeps at most one decimal point). */
const toMoney = (value: string) => {
  const clean = value.replace(/[^\d.]/g, "");
  const parts = clean.split(".");
  const normalized =
    parts.length <= 1 ? clean : `${parts[0]}.${parts.slice(1).join("")}`;
  return Number(normalized || 0);
};

/** Format ILS currency for Hebrew locale. */
const formatILS = (n: number) =>
  new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" }).format(
    n
  );

/** Draft transaction shape: same as Transactionaction, except id is always "DRAFT". */
type DraftTransaction = {
  id: "DRAFT";
  date: Date | string;
} & Omit<Transactionaction, "id">;

/** Tracks which item the AdvancedDialog controls (draft vs existing). */
type AdvTarget =
  | { kind: "draft" }
  | { kind: "existing"; id: string }
  | null;

export default function GroupPage() {
  const params = useParams();
  const groupId = params.id as string;

  // Core state
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [actions, setActions] = useState<Transactionaction[]>([]);

  // UX flags
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Advanced dialog control
  const [advOpen, setAdvOpen] = useState(false);
  const [advTarget, setAdvTarget] = useState<AdvTarget>(null);

  // Single inline-editable draft row
  const [draft, setDraft] = useState<DraftTransaction | null>(null);

  // -------- Data loading --------
  useEffect(() => {
    if (!groupId) return;
    (async () => {
      try {
        setLoading(true);
        const { group: g, members: m, transactions: tx } =
          await getGroupWithDetails(groupId);
        setGroup(g);
        setActions(tx);
        setMembers(m);
        setLoadError(null);
      } catch (e: any) {
        setLoadError(e?.message || "שגיאה בטעינת נתוני קבוצה");
      } finally {
        setLoading(false);
      }
    })();
  }, [groupId]);

  // -------- Derived totals --------
  /** Sum of all expenses (type === "expense"). */
  const totalExpenses = useMemo(() => {
    return actions
      .filter((a) => a.type === "expense")
      .reduce(
        (sum, a) => sum + (Number.isFinite(a.amount) ? Number(a.amount) : 0),
        0
      );
  }, [actions]);

  // -------- Handlers --------

  /** Start a new draft row (the only inline-editable row). */
  const startDraft = useCallback(() => {
    if (draft || !group) return;
    const defaultPayer = members[0]?.id || group.memberIds?.[0] || "";
    setDraft({
      id: "DRAFT",
      groupId: group.id,
      name: "",
      type: "expense",
      amount: 0,
      payerId: defaultPayer as any,
      split: members.map((m) => ({ userId: m.id, amount: 0 })),
      date: new Date(),
      receiptUrl: null,
    });
  }, [draft, group, members]);

  /** Create a real transaction from the draft (or from an explicit source draft). */
  const addFromDraft = useCallback(
    async (source?: DraftTransaction) => {
      const current = source ?? draft;
      if (!current || !group) return;

      const name = current.name?.trim();
      const amount = Number(current.amount);
      const payerId = (
        current.payerId ||
        members[0]?.id ||
        group.memberIds?.[0] ||
        ""
      ).trim();
      const dateISO =
        current.date instanceof Date
          ? current.date.toISOString()
          : new Date(current.date).toISOString();

      // Basic client-side validation
      if (
        !name ||
        !current.type ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !payerId ||
        !dateISO
      )
        return;

      try {
        setSaving(true);
        await createGroupTransaction(group.id, {
          name,
          type: current.type,
          amount,
          payerId,
          split: (current.split || []).map((s) => ({
            userId: s.userId,
            amount: Number(s.amount || 0),
          })),
          date: dateISO,
          receiptUrl: current.receiptUrl ?? null,
        });
        const fresh = await getGroupTransactions(group.id);
        setActions(fresh);
        setDraft(null);
      } finally {
        setSaving(false);
      }
    },
    [draft, group, members]
  );

  /** Open AdvancedDialog for the draft row. */
  const openAdvancedForDraft = useCallback(() => {
    if (!draft) return;
    setAdvTarget({ kind: "draft" });
    setAdvOpen(true);
  }, [draft]);

  /** Open AdvancedDialog for an existing action. */
  const openAdvancedForExisting = useCallback((id: string) => {
    setAdvTarget({ kind: "existing", id });
    setAdvOpen(true);
  }, []);

  /** Delete an existing action with a user confirmation. */
  const handleDelete = useCallback(
    async (id: string) => {
      if (!group) return;
      const ok = window.confirm("למחוק את הפעולה הזו?");
      if (!ok) return;
      try {
        setSaving(true);
        await deleteGroupTransaction(group.id, id);
        const fresh = await getGroupTransactions(group.id);
        setActions(fresh);
      } finally {
        setSaving(false);
      }
    },
    [group]
  );

  /** Build AdvancedValue based on current advTarget (draft/existing). */
  const buildAdvValue = useCallback((): AdvancedValue => {
    if (advTarget?.kind === "draft" && draft) {
      return {
        name: draft.name || "",
        amount: Number(draft.amount || 0),
        payerId: draft.payerId || members[0]?.id || "",
        dateISO:
          draft.date instanceof Date
            ? draft.date.toISOString()
            : new Date(draft.date || new Date()).toISOString(),
        receiptFile: undefined,
        split: draft.split || [],
      };
    }
    if (advTarget?.kind === "existing") {
      const a = actions.find((x) => x.id === advTarget.id);
      if (a) {
        return {
          name: a.name || "",
          amount: Number(a.amount || 0),
          payerId: (a as any).payerId || members[0]?.id || "",
          dateISO:
            a.date instanceof Date
              ? a.date.toISOString()
              : new Date(a.date || new Date()).toISOString(),
          receiptFile: undefined,
          split: (a as any).split || [],
        };
      }
    }
    // Fallback (should not be used while dialog is open)
    return {
      name: "",
      amount: 0,
      payerId: members[0]?.id || "",
      dateISO: new Date().toISOString(),
      receiptFile: undefined,
      split: [],
    };
  }, [advTarget, draft, actions, members]);

  // -------- Early returns (loading/error) --------
  if (loading) {
    return (
      <div className={styles.pageRoot}>
        <Container maxWidth="lg" style={{ textAlign: "center", padding: "2rem" }}>
          <CircularProgress aria-label="טוען..." />
        </Container>
      </div>
    );
  }

  if (loadError || !group) {
    return (
      <div className={styles.pageRoot}>
        <Container maxWidth="lg" style={{ textAlign: "center", padding: "2rem" }}>
          <Typography color="error" role="alert">
            {loadError || "הקבוצה לא נמצאה"}
          </Typography>
        </Container>
      </div>
    );
  }

  // -------- Render --------
  return (
    <>
    <Header/>
    <div className={styles.pageRoot}>

      <Container maxWidth="lg">
        <div className={styles.layout}>
          {/* Right sidebar (static for now) */}
          <aside className={styles.sidebarRight}>
            <div className={styles.sidebarInner}>
              <button className={styles.sideBtn}>תנועות</button>
              <button className={styles.sideBtn}>חברי קבוצה</button>
            </div>
          </aside>

          {/* Main area */}
          <main className={styles.main} style={{ direction: "rtl" }}>
            {/* Top bar: totals + breadcrumb */}
            <div className={styles.topBar}>
              <div className={styles.total} aria-label="סך הכל הוצאות">
                <span>סך הכל:</span>
                <strong>
                  {formatILS(Number.isFinite(totalExpenses) ? totalExpenses : 0)}
                </strong>
              </div>
              <div className={styles.breadcrumb} aria-label="ניווט">
                <span className={styles.bcCurrent}>{group.name}</span>
                <span className={styles.bcSep} aria-hidden>
                  ‹
                </span>
                <span className={styles.linkLike}>הקבוצות שלי</span>
              </div>
            </div>

            <Typography variant="h4" className={styles.title} component="h1">
              {group.name}
            </Typography>

            {/* Draft row - advanced opens by icon */}
            {draft && (
              <Paper
                key="draft"
                elevation={0}
                className={styles.expenseCard}
                aria-label="טופס הוצאה בטיוטה"
              >
                <div className={styles.cardGrid}>
                  {/* Open Advanced for draft */}
                  <IconButton
                    size="small"
                    className={styles.leftIcon}
                    onClick={openAdvancedForDraft}
                    title="הגדרות מתקדמות"
                    aria-label="הגדרות מתקדמות לטיוטה"
                  >
                    <ListAltOutlinedIcon fontSize="small" />
                  </IconButton>

                  {/* Amount input (draft only) */}
                  <input
                    className={styles.amountInput}
                    value={draft.amount || ""}
                    placeholder="סכום"
                    onChange={(ev) =>
                      setDraft((d) => (d ? { ...d, amount: toMoney(ev.target.value) } : d))
                    }
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" && !saving) {
                        ev.preventDefault();
                        addFromDraft();
                      }
                    }}
                    dir="ltr"
                    style={{ maxWidth: 110 }}
                    autoFocus
                    aria-label="סכום"
                    inputMode="decimal"
                  />

                  {/* Name input (draft only) */}
                  <input
                    className={styles.nameInput}
                    value={draft.name}
                    placeholder="שם ההוצאה (Enter להוספה)"
                    onChange={(ev) =>
                      setDraft((d) => (d ? { ...d, name: ev.target.value } : d))
                    }
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" && !saving) {
                        ev.preventDefault();
                        addFromDraft();
                      }
                    }}
                    style={{ maxWidth: 260 }}
                    aria-label="שם ההוצאה"
                  />

                  {/* Cancel draft */}
                  <IconButton
                    size="small"
                    className={styles.rightIcon}
                    onClick={() => setDraft(null)}
                    title="ביטול טיוטה"
                    aria-label="ביטול טיוטה"
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </div>
              </Paper>
            )}

            {/* Existing actions list (READ-ONLY on the row) */}
            <Stack spacing={2} className={styles.cardsWrap}>
              {actions.length === 0 && !draft ? (
                <Paper elevation={0} className={styles.emptyCard} role="status">
                  <Typography variant="body1" sx={{ opacity: 0.8 }}>
                    אין עדיין תנועות בקבוצה. לחצי על הפלוס כדי להוסיף הוצאה חדשה.
                  </Typography>
                </Paper>
              ) : (
                actions.map((a) => (
                  <Paper key={a.id} elevation={0} className={styles.expenseCard}>
                    <div className={styles.cardGrid}>

                      <IconButton size="small" className={styles.leftIcon}
                        onClick={() => openAdvancedForExisting(a.id)}>
                        <ListAltOutlinedIcon fontSize="small" />
                      </IconButton>

                      <div className={styles.amountReadOnly} dir="ltr">
                        {formatILS(Number(a.amount) || 0)}
                      </div>

                      {/* name */}
                      <div className={styles.nameReadOnly}>
                        {a.name}
                      </div>

                      <IconButton size="small" className={styles.rightIcon}
                        onClick={() => handleDelete(a.id)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>

                    </div>
                </Paper>


                ))
              )}
            </Stack>

            <div className={styles.addRow}>
              <button
                className={styles.fabAdd}
                onClick={startDraft}
                title="הוספת הוצאה"
                aria-label="הוספת הוצאה"
                disabled={!!draft || saving}
              >
                <AddIcon />
              </button>
            </div>
          </main>
        </div>
      </Container>

      {/* Advanced dialog */}
      <AdvancedDialog
        open={advOpen}
        onClose={() => {
          setAdvOpen(false);
          setAdvTarget(null);
        }}
        members={members}
        value={buildAdvValue()}
        onChange={(next) => {
          // Keep dialog controlled with local state mirror
          if (advTarget?.kind === "draft" && draft) {
            setDraft({
              ...draft,
              name: next.name,
              amount: next.amount,
              payerId: next.payerId,
              split: next.split,
              date: new Date(next.dateISO),
            });
          } else if (advTarget?.kind === "existing") {
            // Update local UI mirror (rows remain read-only; final save is onConfirm)
            setActions((prev) =>
              prev.map((x) =>
                x.id === advTarget.id
                  ? {
                      ...x,
                      name: next.name,
                      amount: next.amount,
                      payerId: next.payerId as any,
                      split: next.split as any,
                      date: new Date(next.dateISO) as any,
                    }
                  : x
              )
            );
          }
        }}
        onConfirm={async (finalValue) => {
          if (advTarget?.kind === "draft" && draft && group) {
            const nextDraft: DraftTransaction = {
              ...draft,
              name: finalValue.name,
              amount: finalValue.amount,
              payerId: finalValue.payerId,
              split: finalValue.split,
              date: new Date(finalValue.dateISO),
            };
            setDraft(nextDraft);
            setAdvOpen(false);
            setAdvTarget(null);
            if (!saving) await addFromDraft(nextDraft); // Create new transaction
          } else if (advTarget?.kind === "existing" && group) {
            try {
              setSaving(true);
              await updateGroupTransaction(group.id, advTarget.id, {
                name: finalValue.name,
                amount: finalValue.amount,
                payerId: finalValue.payerId,
                split: finalValue.split,
                date: finalValue.dateISO,
              });
              const fresh = await getGroupTransactions(group.id);
              setActions(fresh);
            } finally {
              setSaving(false);
            }
            setAdvOpen(false);
            setAdvTarget(null);
          }
        }}
      />
    </div>
   </>

  );
}
