"use client";

import { useEffect, useState, useMemo } from "react";
import { Debt } from "@/app/types/types";
import styles from "./GroupBalanceDisplay.module.css";
import { getUserFromLocal } from "@/app/utils/storage";

interface GroupBalanceDisplayProps {
  groupId: string;
}

export function GroupBalanceDisplay({ groupId }: GroupBalanceDisplayProps) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;

    const currentUser = getUserFromLocal();

    if (!currentUser || !currentUser.id) {
      setError("לא זוהה משתמש מחובר.");
      setIsLoading(false);
      return;
    }

    const currentUserId = currentUser.id;

    async function fetchBalance() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/groups/${groupId}/balance?userId=${currentUserId}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch group balance");
        }
        if (!res.ok) {
          throw new Error("Failed to fetch group balance");
        }
        const data: Debt[] = await res.json();
        setDebts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBalance();
  }, [groupId]);

  const totalBalance = useMemo(() => {
    return debts.reduce((sum, debt) => sum + debt.amount, 0);
  }, [debts]);

  if (isLoading) return <div>טוען מאזן...</div>;
  if (error) return <div>שגיאה: {error}</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.balanceCard}>
        <header className={styles.header}>
          <h2>תנועות בחשבון</h2>
          <div className={styles.totalBalance}>
            <span>סך הכל: </span>
            <span
              className={totalBalance >= 0 ? styles.positive : styles.negative}
            >
              {totalBalance >= 0 ? "+" : ""}
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
                <button
                  className={`${styles.actionButton} ${
                    isDebt ? styles.payButton : styles.receiveButton
                  }`}
                >
                  {isDebt ? "שולם" : "קיבלתי"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
