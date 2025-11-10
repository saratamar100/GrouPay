"use client";

import { useEffect, useState, useMemo } from "react";
import { Transactionaction, User } from "@/app/types/types";
import styles from "./GroupBalanceView.module.css";

const FAKE_CURRENT_USER_ID: string = "690c7c80618a9be71a4d28aa";

type UsersMap = Record<string, User>;
interface BalanceItem {
  userId: string;
  userName: string;
  amount: number;
}

function calculateRelativeBalances(
  transactions: Transactionaction[],
  allUsersMap: UsersMap,
  currentUserId: string
): BalanceItem[] {
  const balanceMap = new Map<string, number>();

  Object.keys(allUsersMap).forEach((userId) => {
    if (userId !== currentUserId) {
      balanceMap.set(userId, 0);
    }
  });

  for (const tx of transactions) {
    const txAmount = Number(tx.amount);
    if (isNaN(txAmount)) continue;

    if (tx.type === "expense") {
      if (tx.payerId === currentUserId) {
        for (const split of tx.split) {
          const splitAmount = Number(split.amount);
          if (split.userId !== currentUserId && !isNaN(splitAmount)) {
            const currentBalance = balanceMap.get(split.userId) || 0;
            balanceMap.set(split.userId, currentBalance + splitAmount);
          }
        }
      } else {
        const mySplit = tx.split.find((s) => s.userId === currentUserId);
        if (mySplit) {
          const mySplitAmount = Number(mySplit.amount);
          if (!isNaN(mySplitAmount)) {
            const payerBalance = balanceMap.get(tx.payerId) || 0;
            balanceMap.set(tx.payerId, payerBalance - mySplitAmount);
          }
        }
      }
    }

    if (tx.type === "payment") {
      const recipientId = tx.split[0].userId;
      if (tx.payerId === currentUserId) {
        const currentBalance = balanceMap.get(recipientId) || 0;
        balanceMap.set(recipientId, currentBalance - txAmount);
      } else if (recipientId === currentUserId) {
        const payerBalance = balanceMap.get(tx.payerId) || 0;
        balanceMap.set(tx.payerId, payerBalance + txAmount);
      }
    }
  }

  const sortedBalances: BalanceItem[] = [];
  balanceMap.forEach((amount, userId) => {
    if (Math.abs(amount) > 0.01) {
      sortedBalances.push({
        userId,
        userName: allUsersMap[userId]?.name || "משתמש לא ידוע",
        amount: amount,
      });
    }
  });

  return sortedBalances.sort((a, b) => b.amount - a.amount);
}

export function GroupBalanceView({ groupId }: { groupId: string }) {
  const currentUserId = FAKE_CURRENT_USER_ID;

  const [balances, setBalances] = useState<BalanceItem[]>([]);
  const [usersMap, setUsersMap] = useState<UsersMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!groupId || !currentUserId) return;

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const resTx = await fetch(`/api/groups/${groupId}/transactions`);
        if (!resTx.ok) {
          throw new Error(
            `Failed to fetch transactions (status: ${resTx.status})`
          );
        }
        const { actions: transactions } = (await resTx.json()) as {
          actions: Transactionaction[];
        };

        const allUserIds = new Set<string>();
        transactions.forEach((tx) => {
          allUserIds.add(tx.payerId);
          tx.split.forEach((s) => allUserIds.add(s.userId));
        });

        if (allUserIds.size === 0) {
          setIsLoading(false);
          return;
        }

        const idsString = Array.from(allUserIds).join(",");
        const resUsers = await fetch(`/api/users?ids=${idsString}`);
        if (!resUsers.ok) {
          throw new Error("Failed to fetch users");
        }
        const usersMapData: UsersMap = await resUsers.json();
        console.log("--- 🚀 התקבל מילון משתמשים ---", usersMapData);
        setUsersMap(usersMapData);

        const finalBalances = calculateRelativeBalances(
          transactions,
          usersMapData,
          currentUserId
        );
        setBalances(finalBalances);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [groupId, currentUserId]);

  const totalBalance = useMemo(() => {
    return balances.reduce((sum, item) => sum + item.amount, 0);
  }, [balances]);

  const handleSettleUp = async (otherUserId: string, amount: number) => {
    if (!groupId) return;
    setIsSubmitting(true);
    setError(null);

    const isPayingDebt = amount < 0;
    const absAmount = Math.abs(amount);

    const payment: Partial<Transactionaction> = {
      type: "payment",
      amount: absAmount,
      date: new Date(),
      name: isPayingDebt
        ? `יישוב חוב עם ${usersMap[otherUserId]?.name}`
        : `קבלת חוב מ-${usersMap[otherUserId]?.name}`,
      payerId: isPayingDebt ? currentUserId : otherUserId,
      split: [
        {
          userId: isPayingDebt ? otherUserId : currentUserId,
          amount: absAmount,
        },
      ],
    };

    try {
      const res = await fetch(`/api/groups/${groupId}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payment),
      });

      if (!res.ok) {
        throw new Error("Failed to create payment transaction");
      }
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- תצוגה ---
  if (isLoading) return <div>טוען נתונים...</div>;
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
          {balances.length === 0 && (
            <div className={styles.emptyState}>
              החשבון מאוזן. אין חובות פתוחים.
            </div>
          )}

          {balances.map((item) => {
            const isDebt = item.amount < 0;
            const absAmount = Math.abs(item.amount);

            return (
              <div key={item.userId} className={styles.transactionRow}>
                <span className={styles.amount}>{absAmount.toFixed(0)}</span>
                <span className={styles.name}>{item.userName}</span>
                <span
                  className={isDebt ? styles.statusDebt : styles.statusCredit}
                >
                  {isDebt ? "חוב" : "זכות"}
                </span>
                <button
                  className={`${styles.actionButton} ${
                    isDebt ? styles.payButton : styles.receiveButton
                  }`}
                  onClick={() => handleSettleUp(item.userId, item.amount)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "מעדכן..." : isDebt ? "שולם" : "קיבלתי"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
