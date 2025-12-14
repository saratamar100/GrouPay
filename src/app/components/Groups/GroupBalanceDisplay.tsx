"use client";

import { useEffect, useState, useMemo } from "react";
import { Debt, Payment } from "@/app/types/types";
import styles from "./GroupBalanceDisplay.module.css";
import { fetchGroupBalance } from "@/app/services/client/balanceService";
import { useLoginStore } from "@/app/store/loginStore";
import { formatILS } from "@/app/utils/money";
import { getGroup } from "@/app/services/client/groupService";

import { Box, Link, Typography, CircularProgress } from "@mui/material";

import {
  createPayment,
  fetchPendingPayments,
  updatePaymentStatus,
  fetchCompletedPayments,
} from "@/app/services/client/paymentsService";

interface GroupBalanceDisplayProps {
  groupId: string;
}

export function GroupBalanceDisplay({ groupId }: GroupBalanceDisplayProps) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [completedPayments, setCompletedPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string | null>(null);

  const currentUser = useLoginStore((state) => state.loggedUser);
  const currentUserId = currentUser?.id;

  useEffect(() => {
    if (!groupId || !currentUserId) return;

    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        const groupDetails = await getGroup(groupId, currentUserId);
        setGroupName(groupDetails.name);

        const [balanceData, pendingData, completedData] = await Promise.all([
          fetchGroupBalance(groupId, currentUserId as string),
          fetchPendingPayments(groupId, currentUserId as string),
          fetchCompletedPayments(groupId, currentUserId as string),
        ]);

        setDebts(balanceData);
        setPendingPayments(pendingData);
        setCompletedPayments(completedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [groupId, groupName, currentUserId]);

  const totalBalance = useMemo(
    () => debts.reduce((sum, debt) => sum + debt.amount, 0),
    [debts]
  );

 if (isLoading) {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.loaderWrapper}>
        <CircularProgress />
      </div>
    </div>
  );
}

if (error) return <div>שגיאה: {error}</div>;

  const refreshData = async () => {
    if (!currentUserId) return;
    const [balanceData, pendingData, completedData] = await Promise.all([
      fetchGroupBalance(groupId, currentUserId),
      fetchPendingPayments(groupId, currentUserId),
      fetchCompletedPayments(groupId, currentUserId),
    ]);
    setDebts(balanceData);
    setPendingPayments(pendingData);
    setCompletedPayments(completedData);
  };

  const handleCreatePayment = async (debt: Debt) => {
    if (!currentUserId) return;
    try {
      await createPayment(debt.member, debt.amount, groupId, {
        id: currentUserId,
        name: currentUser?.name || "Unknown",
      });
      await refreshData();
    } catch (err: any) {
      console.error("Error creating payment:", err.message);
    }
  };

  const handleConfirm = async (payment: Payment) => {
    try {
      if (!payment) return;
      const success = await updatePaymentStatus(payment, groupId, "completed");
      if (success) {
        await refreshData();
      }
    } catch (err: any) {
      console.error("Error confirming payment:", err.message);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.balanceCard}>
        <header className={styles.header}>
          <Box className={styles.breadcrumb}>
            <Link href="/dashboard" className={styles.linkLike}>
              <Typography component="span" className={styles.bcBase}>
                הקבוצות שלי
              </Typography>
            </Link>

            <span className={styles.bcSep}> ‹ </span>

            <Link href={`/groups/${groupId}`} className={styles.linkLike}>
              <Typography component="span" className={styles.bcBase}>
                {groupName}
              </Typography>
            </Link>

            <span className={styles.bcSep}> ‹ </span>

            <Typography component="span" className={styles.bcCurrent}>
              היתרות שלי
            </Typography>
          </Box>

          <h2>יתרות בחשבון</h2>
          <div className={styles.totalBalance}>
            <span>סך הכל: </span>
            <span
              className={totalBalance >= 0 ? styles.positive : styles.negative}
            >
              {formatILS(Math.abs(totalBalance))}
            </span>
          </div>
        </header>

        <div className={styles.transactionsList}>
          {debts.length === 0 && (
            <div className={styles.emptyState}>החשבון מאוזן.</div>
          )}

          {debts.map((debt) => {
            const isDebt = debt.amount < 0;
            const alreadyPending = pendingPayments.some(
              (p) =>
                p.payer.id === currentUserId &&
                p.payee.id === debt.member.id &&
                Math.abs(p.amount) === Math.abs(debt.amount)
            );

            return (
              <div key={debt.member.id} className={styles.transactionRow}>
                <span className={styles.amount}>{formatILS(Math.abs(debt.amount))}</span>
                <span className={styles.name}>{debt.member.name}</span>
                <span
                  className={`${styles.status} ${
                    isDebt ? styles.statusDebt : styles.statusCredit
                  }`}
                >
                  {isDebt ? "חוב" : "זכות"}
                </span>
                {isDebt && !alreadyPending && (
                  <button
                    className={`${styles.actionButton} ${styles.payButton}`}
                    onClick={() => handleCreatePayment(debt)}
                  >
                    תשלום
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <header className={styles.header} style={{ marginTop: "2rem" }}>
          <h2>תשלומים ממתינים</h2>
        </header>

        <div className={styles.transactionsList}>
          {pendingPayments.length === 0 && (
            <div className={styles.emptyState}>אין תשלומים ממתינים.</div>
          )}

          {pendingPayments.map((p: Payment) => {
            const isPayer = p.payer.id === currentUserId;
            const otherUser = isPayer ? p.payee : p.payer;

            return (
              <div key={p.id} className={styles.transactionRow}>
                <span className={styles.amount}>{formatILS(Math.abs(p.amount))}</span>
                <span className={styles.name}>{otherUser.name}</span>
                {isPayer && <span className={styles.status}>ממתין לאישור</span>}
                {!isPayer && (
                  <button
                    className={`${styles.actionButton} ${styles.payButton}`}
                    onClick={() => handleConfirm(p)}
                  >
                    אשר תקבול
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <header className={styles.header} style={{ marginTop: "2rem" }}>
          <h2>תשלומים שהושלמו</h2>
        </header>

        <div className={styles.transactionsList}>
          {completedPayments.map((p: Payment) => {
            const isPayer = p.payer.id === currentUserId;
            const otherUser = isPayer ? p.payee : p.payer;

            return (
              <div key={p.id} className={styles.transactionRow}>
                <span className={styles.amount}>{formatILS(Math.abs(p.amount))}</span>
                <span className={styles.name}>{otherUser.name}</span>
                <span className={styles.status}>
                  {isPayer
                    ? `שילמת ל־${otherUser.name}`
                    : `קיבלת מ־${otherUser.name}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
