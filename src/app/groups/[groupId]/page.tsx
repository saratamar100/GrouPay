"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useGroupData } from "@/app/hooks/useGroupData";
import { GroupExpensesList } from "@/app/components/GroupExpensesList/GroupExpensesList";
import { GroupDraftRow } from "@/app/components/GroupDraftRow/GroupDraftRow";
import AdvancedExpense from "@/app/components/AdvancedExpense/AdvancedExpense";
import ExpenseDetails from "@/app/components/ExpenseDetails/ExpenseDetails";
import { formatILS } from "@/app/utils/money";
import styles from "./GroupPage.module.css";
import Header from "@/app/components/Header/Header";
import { CircularProgress, Container } from "@mui/material";
import { useRouter } from "next/navigation";


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
    openAdvancedForDraft,
    openAdvancedForExisting,
    closeAdvanced,
    handleAdvancedSave,
  } = useGroupData(groupId);

  useEffect(() => {
    const login = localStorage.getItem('login-storage')
    if(!login)  window.location.href = "/login";

    if (groupId) reload();
  }, [reload, groupId]);
  
  
  const members = state.group?.members || [];
  const expenses = Array.isArray(state?.group?.expenses)
  ? state.group!.expenses
  : [];

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    [expenses]
  );

  if (!groupId) {
    return (
      <div style={{ padding: 24, color: "crimson" }}>
        חסר מזהה קבוצה בנתיב
      </div>
    );
  }

  if (state.loading) {
    return (
      <Container maxWidth="lg" style={{ textAlign: "center", padding: "2rem" }}>
        <CircularProgress aria-label="טוען..." />
      </Container>
    );
  }

  if (state.error || !state.group) {
    return (
      <div style={{ padding: 24, color: "crimson" }}>
        {state.error || "הקבוצה לא נמצאה"}
      </div>
    );
  }


  return (
    <>
      <Header />
      <div className={styles.pageRoot}>
        <div className={styles.layout}>
          <main className={styles.main}>
            <div className={styles.topBar}>
              <div className={styles.total}>
                <span>סה״כ:</span>
                <strong dir="ltr">{formatILS(totalExpenses)}</strong>
              </div>
              <div className={styles.breadcrumb}>
                <span className={styles.bcCurrent}>{state.group.name}</span>
                <span className={styles.bcSep}>‹</span>
                <Link href="/groups" className={styles.linkLike}>
                  הקבוצות שלי
                </Link>
              </div>
            </div>

            <h1 className={styles.title}>{state.group.name}</h1>
          
            <p className={styles.balanceRow}>
              <Link
                href={`/groups/${groupId}/balance`}
                className={styles.balanceLinkText}
              >
                היתרות שלי
              </Link>
            </p>

            <div className={styles.cardsWrap}>
              <GroupExpensesList
                expenses={expenses}
                onDelete={deleteExpense}
                onEdit={openAdvancedForExisting}
                members={members}
              />
            </div>


            {state.draft && (
              <GroupDraftRow
                draft={state.draft}
                onChange={updateDraftField}
                onConfirm={() => addFromDraft()}
                onCancel={cancelDraft}
                onAdvanced={openAdvancedForDraft}
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

        <AdvancedExpense
          open={state.adv.open}
          title={state.adv.mode === "existing" ? "עריכת הוצאה" : "הגדרות מתקדמות"}
          name={state.adv.name}
          amount={state.adv.amount}
          members={state.group?.members || []}
          initialSplit={state.adv.split}
          initialReceiptUrl={state.adv.receiptUrl}
          onClose={closeAdvanced}
          onSave={handleAdvancedSave}
        />



      </div>
    </>
  );
}
