"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  InputAdornment,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Header from "@/app/components/Header/Header";
import { useGroupData } from "@/app/hooks/useGroupData";
import { GroupExpensesList } from "@/app/components/GroupExpensesList/GroupExpensesList";
import { GroupDraftRow } from "@/app/components/GroupDraftRow/GroupDraftRow";
import { GroupMembersSidebar } from "@/app/components/GroupMembersSidebar/GroupMembersSidebar";
import AdvancedExpense from "@/app/components/AdvancedExpense/AdvancedExpense";
import { useLoginStore } from "@/app/store/loginStore";
import { formatILS } from "@/app/utils/money";
import Link from "next/link";

import {
  Box,
  CircularProgress,
  Container,
  Divider,
  Fab,
  Paper,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import styles from "./GroupPage.module.css";

export default function GroupPage() {
  const route = useParams<{ id?: string; groupId?: string }>();
  const groupId = (route.groupId ?? route.id) as string | undefined;

  const router = useRouter();
  const user = useLoginStore((state) => state.loggedUser);
  const userId = user?.id;
  const [isMembersOpen, setIsMembersOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterPayerId, setFilterPayerId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<
    "dateDesc" | "dateAsc" | "amountDesc" | "amountAsc"
  >("dateDesc");

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
    setGroupActiveStatus,
  } = useGroupData(groupId, userId);

  const handleToggleActive = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newStatus = event.target.checked;
    const currentGroupId = state.group?.id;
    if (!currentGroupId) return;

    try {
      await setGroupActiveStatus(newStatus);
    } catch (error) {
      console.error("Error updating group status:", error);
      alert(`אירעה שגיאה בעדכון מצב הקבוצה. נסה שוב.`);
    }
  };

  useEffect(() => {
    console.log(
      `DEBUG: Checking Dependencies. GroupID: ${groupId}, UserID: ${userId}`
    );
    if (!groupId || !userId) {
      console.log("DEBUG: Fetch skipped due to missing ID/User.");
      return;
    }

    reload();
  }, [groupId, userId, reload]);

  useEffect(() => {
    if (!state.loading && (state.error || !state.group)) {
      console.log(state.error || "הקבוצה לא נמצאה");
      router.replace("/");
    }
  }, [state.loading, state.error, state.group, router]);

  console.log("GroupPage render - state:", state.group);
  const members = state.group?.members || [];
  const expenses = Array.isArray(state.group?.expenses)
    ? state.group.expenses
    : [];

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    [expenses]
  );

  const filteredAndSortedExpenses = useMemo(() => {
    let list = expenses;

    if (searchTerm) {
      const termLower = searchTerm.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(termLower));
    }

    if (filterPayerId) {
      list = list.filter((e) => {
        if (!e.payer || !e.payer.id) return false;
        const expensePayerIdString = e.payer.id.toString();
        return expensePayerIdString === filterPayerId;
      });
    }

    list = [...list].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      const amountA = Number(a.amount || 0);
      const amountB = Number(b.amount || 0);

      if (sortBy === "dateDesc") return dateB - dateA;
      if (sortBy === "dateAsc") return dateA - dateB;
      if (sortBy === "amountDesc") return amountB - amountA;
      if (sortBy === "amountAsc") return amountA - amountB;
      return 0;
    });

    return list;
  }, [expenses, searchTerm, filterPayerId, sortBy]);

  if (state.loading) {
    return (
      <Container className={styles.loaderWrapper}>
        <CircularProgress aria-label="טוען..." />
      </Container>
    );
  }

  if (state.error || !state.group) {
    return null;
  }

  const isActiveStatus = state.group?.isActive || false;

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
                <Typography
                  component="strong"
                  className={styles.totalValue}
                  dir="ltr"
                >
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

            <Box className={styles.statusToggleContainer}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isActiveStatus}
                    onChange={handleToggleActive}
                    name="isActiveSwitch"
                    color="primary"
                  />
                }
                label={isActiveStatus ? "קבוצה פעילה" : "קבוצה לא פעילה"}
                labelPlacement="start"
              />
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

            <Box className={styles.controlsSection}>
              <Box className={styles.filterOptionsBar}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>שולם ע״י</InputLabel>
                  <Select
                    value={filterPayerId || ""}
                    label="שולם ע״י"
                    onChange={(e) => setFilterPayerId(e.target.value as string)}
                  >
                    <MenuItem value="">כל המשלמים</MenuItem>
                    {members.map((member) => (
                      <MenuItem key={member.id} value={member.id}>
                        {member.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>מיון</InputLabel>
                  <Select
                    value={sortBy}
                    label="מיון"
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  >
                    <MenuItem value="dateDesc">תאריך: חדש לישן</MenuItem>
                    <MenuItem value="dateAsc">תאריך: ישן לחדש</MenuItem>
                    <MenuItem value="amountDesc">סכום: מהגבוה לנמוך</MenuItem>
                    <MenuItem value="amountAsc">סכום: מהנמוך לגבוה</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <TextField
                size="small"
                label="חיפוש הוצאה"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box className={styles.cardsWrap}>
              <GroupExpensesList
                userId={userId}
                expenses={filteredAndSortedExpenses}
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

          {isMembersOpen && groupId && (
            <GroupMembersSidebar
              open={isMembersOpen}
              members={members}
              currentUserId={userId}
              groupId={groupId}
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
