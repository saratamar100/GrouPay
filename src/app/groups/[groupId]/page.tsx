"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import Header from "@/app/components/Header/Header";
import { useGroupData } from "@/app/hooks/useGroupData";
import { GroupExpensesList } from "@/app/components/GroupExpensesList/GroupExpensesList";
import { GroupDraftRow } from "@/app/components/GroupDraftRow/GroupDraftRow";
import {GroupMembersSidebar} from "@/app/components/GroupMembersSidebar/GroupMembersSidebar"
import AdvancedExpense from "@/app/components/AdvancedExpense/AdvancedExpense";
import { useLoginStore } from "@/app/store/loginStore";
import { formatILS } from "@/app/utils/money";

import {
  Box,
  CircularProgress,
  Container,
  Divider,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";

import styles from "./GroupPage.module.css";

export default function GroupPage() {
  const route = useParams<{ id?: string; groupId?: string }>();
  const groupId = (route.groupId ?? route.id) as string | undefined;

  const router = useRouter();
  const user = useLoginStore((state) => state.loggedUser);
  const userId = user?.id;

  const [userChecked, setUserChecked] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);

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
    setUserChecked(true);
  }, []);

  useEffect(() => {
    if (!userChecked) return;

    if (!userId) {
      router.replace("/");
      return;
    }

    if (groupId) reload();
  }, [userChecked, userId, groupId, reload, router]);

  const members = state.group?.members || [];
  const expenses = Array.isArray(state.group?.expenses) ? state.group.expenses : [];

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    [expenses]
  );

  if (!userChecked) {
    return (
      <Container className={styles.centerState}>
        <CircularProgress />
      </Container>
    );
  }

  if (!groupId) {
    return (
      <div style={{ padding: 24, color: "crimson" }}>
        חסר מזהה קבוצה בנתיב
      </div>
    );
  }

  if (state.loading) {
    return (
      <Container className={styles.loaderWrapper}>
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

      <Container component="section" className={styles.pageRoot}>
        <Paper elevation={4} className={styles.pageShell}>
          <main className={styles.main}>
            <Box className={styles.topBar}>
              <Box className={styles.total}>
                <Typography component="span" className={styles.totalLabel}>
                  סה״כ:
                </Typography>
                <Typography component="strong" className={styles.totalValue} dir="ltr">
                  {formatILS(totalExpenses)}
                </Typography>
              </Box>

              <Box className={styles.breadcrumb}>
                <Typography component="span" className={styles.bcCurrent}>
                  {state.group.name}
                </Typography>
                <span className={styles.bcSep}>‹</span>
                <Link href="/dashboard" className={styles.linkLike}>
                  הקבוצות שלי
                </Link>
              </Box>
            </Box>

            <Typography
              variant="h4"
              className={styles.title}
              onClick={() => setIsMembersOpen(true)}
            >
              {state.group.name}
            </Typography>

            <Box className={styles.balanceRow}>
              <Link
                href={`/groups/${groupId}/balance`}
                className={styles.balanceLinkText}
              >
                היתרות שלי
              </Link>
            </Box>

            <Divider className={styles.divider} />

            <Box className={styles.cardsWrap}>
              <GroupExpensesList
                expenses={expenses}
                onDelete={deleteExpense}
                onEdit={openAdvancedForExisting}
                hasDraft={!!state.draft}
              />
            </Box>

            {state.draft && (
              <Box className={styles.draftWrap}>
                <GroupDraftRow
                  draft={state.draft}
                  onChange={updateDraftField}
                  onConfirm={() => addFromDraft()}
                  onCancel={cancelDraft}
                  onAdvanced={openAdvancedForDraft}
                  disabled={state.saving}
                />
              </Box>
            )}

            <Box className={styles.addRow}>
              <Fab
                color="primary"
                aria-label="הוספת הוצאה"
                onClick={startDraftExpense}
                disabled={state.saving}
              >
                <AddIcon sx={{ fontSize: 30 }} />
              </Fab>
            </Box>
          </main>

          {isMembersOpen && ( 
            <GroupMembersSidebar
            open={isMembersOpen}
            members={members}
            currentUserId={userId}
            onClose={() => setIsMembersOpen(false)}
/>

          )}
        </Paper>

        <AdvancedExpense
          open={state.adv.open}
          title={
            state.adv.mode === "existing" ? "עריכת הוצאה" : "הגדרות מתקדמות"
          }
          name={state.adv.name}
          amount={state.adv.amount}
          members={state.group?.members || []}
          initialSplit={state.adv.split}
          initialReceiptUrl={state.adv.receiptUrl}
          onClose={closeAdvanced}
          onSave={handleAdvancedSave}
        />
      </Container>
    </>
  );
}
