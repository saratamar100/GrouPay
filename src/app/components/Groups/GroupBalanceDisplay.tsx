"use client";

import { useEffect, useState, useMemo } from "react";
import { Debt, Payment } from "@/app/types/types";
import styles from "./GroupBalanceDisplay.module.css";
import { fetchGroupBalance } from "@/app/services/client/balanceService";
import { useLoginStore } from "@/app/store/loginStore";
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

  const currentUser = useLoginStore((state) => state.loggedUser);
  const currentUserId = currentUser?.id;

  useEffect(() => {
    if (!groupId || !currentUserId) return;

    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
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
  }, [groupId, currentUserId]);

  const totalBalance = useMemo(
    () => debts.reduce((sum, debt) => sum + debt.amount, 0),
    [debts]
  );

  if (!currentUserId) return <div>משתמש לא מחובר.</div>;
  if (isLoading) return <div>טוען נתונים...</div>;
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
      await createPayment(debt.member, Math.abs(debt.amount), groupId, {
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
      {/* יתרות בחשבון */}
      <div className={styles.balanceCard}>
        <header className={styles.header}>
          <h2>יתרות בחשבון</h2>
          <div className={styles.totalBalance}>
            <span>סך הכל: </span>
            <span
              className={totalBalance >= 0 ? styles.positive : styles.negative}
            >
              {totalBalance > 0 ? "+" : ""}
              {totalBalance.toFixed(2)}
            </span>
          </div>
        </header>

        <div className={styles.transactionsList}>
          {debts.length === 0 && (
            <div className={styles.emptyState}>החשבון מאוזן.</div>
          )}

          {debts.map((debt) => {
            const isDebt = debt.amount < 0;
            const absAmount = Math.abs(debt.amount);

            return (
              <div key={debt.member.id} className={styles.transactionRow}>
                <span className={styles.amount}>{absAmount.toFixed(0)}</span>
                <span className={styles.name}>{debt.member.name}</span>
                <span
                  className={`${styles.status} ${
                    isDebt ? styles.statusDebt : styles.statusCredit
                  }`}
                >
                  {isDebt ? "חוב" : "זכות"}
                </span>
                {isDebt && (
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

        {/* תשלומים ממתינים */}
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
                <span className={styles.amount}>{p.amount}</span>
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

        {/* תשלומים שהושלמו */}
        <header className={styles.header} style={{ marginTop: "2rem" }}>
          <h2>תשלומים שהושלמו</h2>
        </header>

        <div className={styles.transactionsList}>
          {completedPayments.map((p: Payment) => {
            const isPayer = p.payer.id === currentUserId;
            const otherUser = isPayer ? p.payee : p.payer;

            return (
              <div key={p.id} className={styles.transactionRow}>
                <span className={styles.amount}>{p.amount}</span>
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
