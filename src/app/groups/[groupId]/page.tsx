"use client";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useGroupData } from "@/app/hooks/useGroupData";
import { GroupExpensesList } from "@/app/components/GroupExpensesList/GroupExpensesList";
import { GroupDraftRow } from "@/app/components/GroupDraftRow/GroupDraftRow";
import styles from "./GroupPage.module.css";
import  Header from "@/app/components/Header/Header";
import { CircularProgress, Container,Typography } from "@mui/material";


export function formatILS(value: number) {
  return value.toLocaleString("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function GroupPage() {
  const route = useParams<{ id?: string; groupId?: string }>();
  const groupId = (route.groupId ?? route.id) as string | undefined;

  const {
    state,
    startDraftExpense,
    cancelDraft,
    updateDraftField,
    addFromDraft,
    deleteExpense,
    reload,
  } = useGroupData(groupId);

  useEffect(() => {
    if (groupId) reload();
  }, [reload, groupId]);

  const expenses = Array.isArray(state?.group?.expenses) ? state.group!.expenses : [];

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    [expenses]
  );

  if (!groupId) return <div style={{ padding: 24, color: "crimson" }}>חסר מזהה קבוצה בנתיב</div>;
  if (state.loading){
     return (
        <Container maxWidth="lg" style={{ textAlign: "center", padding: "2rem" }}>
          <CircularProgress aria-label="טוען..." />
        </Container>
    );
  }
  if (state.error || !state.group)
    return <div style={{ padding: 24, color: "crimson" }}>{state.error || "הקבוצה לא נמצאה"}</div>;

  return (
    <div className={styles.pageRoot}>
      <Header/>
       <main className={styles.main}>
            <div className={styles.topBar}>
              <div className={styles.total} aria-label="סך הכל הוצאות">
                <span>סך הכל:</span>
                <strong>
                  {formatILS(Number.isFinite(totalExpenses) ? totalExpenses : 0)}
                </strong>
              </div>
              <div className={styles.breadcrumb}>
              <span className={styles.bcCurrent}>{state.group.name}</span>
                <span className={styles.bcSep} aria-hidden>
                  ‹
                </span>
                <span className={styles.linkLike}>הקבוצות שלי</span>
              </div>
            </div><Typography variant="h4" className={styles.title} component="h1">
              {state.group.name}
            </Typography>
        
          <div className={styles.cardsWrap}>
            <GroupExpensesList expenses={expenses} onDelete={deleteExpense} />
          </div>

          {state.draft && (
            <GroupDraftRow
              draft={state.draft}
              onChange={updateDraftField}
              onConfirm={() => addFromDraft()}
              onCancel={cancelDraft}
              disabled={state.saving}
            />
          )}

          <div className={styles.addRow}>
            <button
              className={styles.fabAdd}
              onClick={startDraftExpense}
              disabled={state.saving}
              aria-label="הוספת הוצאה"
            >
              +
            </button>
          </div>
        </main>
    </div>
  );
}
