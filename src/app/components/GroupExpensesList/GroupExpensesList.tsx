import type { Expense } from "@/app/types/types";
import { GroupExpenseRow } from "../GroupExpenseRow/GroupExpenseRow";
import { Paper, Typography } from "@mui/material";

export function GroupExpensesList({
  expenses,
  onDelete,
}: {
  expenses: Expense[];
  onDelete: (id: string) => void;
}) {
  if (!expenses || expenses.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 1, opacity: 0.8, mt: 1 }}>
        <Typography>אין עדיין תנועות בקבוצה.</Typography>
      </Paper>
    );
  }

  return (
    <div style={{ marginTop: 8 }}>
      {expenses.map((e, idx) => (
        <GroupExpenseRow key={e.id || `${e.name}-${idx}`} e={e} onDelete={onDelete} />
      ))}
    </div>
  );
}
