import { useMemo } from "react";
import type { Expense, Member } from "@/app/types/types";
import { GroupExpenseRow } from "../GroupExpenseRow/GroupExpenseRow";
import { Paper, Typography } from "@mui/material";
import styles from "./GroupExpensesList.module.css";

export function GroupExpensesList({
  expenses,
  onDelete,
  onEdit,
  members,
}: {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
  members: Member[];
}) {

  if (!expenses || expenses.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 1, opacity: 0.8, mt: 1 }}>
        <Typography>אין עדיין תנועות בקבוצה.</Typography>
      </Paper>
    );
  }

  console.log(expenses)

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

