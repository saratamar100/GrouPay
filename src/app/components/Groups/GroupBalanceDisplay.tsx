"use client";

import { useEffect, useState, useMemo } from "react";
import { Debt } from "@/app/types/types";
import styles from "./GroupBalanceDisplay.module.css";
import { fetchGroupBalance } from "@/app/services/client/balanceService";
import { useLoginStore } from "@/app/store/loginStore";

interface GroupBalanceDisplayProps {
  groupId: string;
}

export function GroupBalanceDisplay({ groupId }: GroupBalanceDisplayProps) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = useLoginStore((state) => state.loggedUser);
  const currentUserId =
    currentUser ? ((currentUser as any)._id || (currentUser as any).id) : undefined;

  useEffect(() => {
    if (!groupId) return;

    if (!currentUser || !currentUserId){
      setError("לא זוהה משתמש מחובר.");
      setIsLoading(false);
      return;
    }


    async function loadBalance() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchGroupBalance(groupId, currentUserId);
        setDebts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadBalance();
  }, [groupId, currentUser, currentUserId]);

  const totalBalance = useMemo(
    () => debts.reduce((sum, debt) => sum + debt.amount, 0),
    [debts]
  );

  if (isLoading) return <div>טוען מאזן...</div>;
  if (error) return <div>שגיאה: {error}</div>;

  return (
    <div className={styles.pageContainer}>
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
                  >
                    תשלום
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
