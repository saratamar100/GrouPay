import { useMemo } from "react";
import type { Expense, Member } from "@/app/types/types";
import { GroupExpenseRow } from "../GroupExpenseRow/GroupExpenseRow";
import { Paper, Typography } from "@mui/material";
import styles from "./GroupExpensesList.module.css";

export function GroupExpensesList({
  expenses,
  onDelete,
  onEdit,
  hasDraft
}: {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
  hasDraft?: boolean;

  
  
}) {
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
    <div className={styles.list}>
      {expenses.map((e) => (
        <GroupExpenseRow
          key={e.id}
          e={e}
          onDelete={onDelete}
          onEdit={onEdit}
          payerName={e.payer.name}
        />
      ))}
    </div>
  );
}
