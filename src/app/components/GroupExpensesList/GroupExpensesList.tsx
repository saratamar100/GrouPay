import { useState } from "react";
import type { Expense, Member } from "@/app/types/types";
import { GroupExpenseRow } from "../GroupExpenseRow/GroupExpenseRow";
import { Paper, Typography } from "@mui/material";
import ExpenseDetails from "../ExpenseDetails/ExpenseDetails"; // תעדכני את הנתיב לפי הפרויקט שלך
import styles from "./GroupExpensesList.module.css";

export function GroupExpensesList({
  userId,
  expenses,
  onDelete,
  onEdit,
  hasDraft,
}: {
  userId: string | undefined;
  expenses: Expense[];
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
  hasDraft?: boolean;
}) {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleOpenDetails = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedExpense(null);
  };

  if ((!expenses || expenses.length === 0) && !hasDraft) {
    return (
      <Paper elevation={0} className={styles.emptyState}>
        <Typography className={styles.emptyText}>
          אין עדיין תנועות בקבוצה.
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <div className={styles.list}>
        {expenses.map((e) => (
          <GroupExpenseRow
            key={e.id}
            userId={userId}
            e={e}
            payer={e.payer}
            onDelete={onDelete}
            onEdit={onEdit}
            onOpenDetails={handleOpenDetails} 
          />
        ))}
      </div>

      <ExpenseDetails
        open={isDetailsOpen}
        expense={selectedExpense}
        onClose={handleCloseDetails}
      />
    </>
  );
}
