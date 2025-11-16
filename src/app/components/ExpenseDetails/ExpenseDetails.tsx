"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { IconButton, Typography, Button, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import type { Expense, Member } from "@/app/types/types";
import { formatILS } from "@/app/utils/money";
import styles from "./ExpenseDetails.module.css";

type Props = {
  open: boolean;
  expense: Expense | null;
  members: Member[];
  onClose: () => void;
};

export default function ExpenseDetails({ open, expense, members, onClose }: Props) {
  if (!expense) return null;

  const payerId =
    typeof expense.payer === "string"
      ? expense.payer
      : expense.payer && "id" in expense.payer
      ? expense.payer.id
      : undefined;

  const nameById = new Map<string, string>(members.map((m) => [m.id, m.name]));
  const payerName = payerId ? nameById.get(payerId) || payerId : "";

  const formattedDate = formatDate(expense.date);
  const split = expense.split || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ className: styles.paper }}
    >
      <DialogTitle className={styles.header}>
        <div className={styles.headerText}>
          <Typography variant="subtitle2" className={styles.subtitle}>
            פרטי הוצאה
          </Typography>
          <Typography variant="h6" className={styles.title}>
            {expense.name}
          </Typography>
        </div>
        <IconButton onClick={onClose} className={styles.closeBtn} aria-label="סגירה">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent className={styles.content} dividers>
        <div className={styles.section}>
          <div className={styles.row}>
            <Typography className={styles.label}>סכום</Typography>
            <Typography className={styles.value} dir="ltr">
              {formatILS(Number(expense.amount) || 0)}
            </Typography>
          </div>

          <div className={styles.row}>
            <Typography className={styles.label}>מי שילם</Typography>
            <Typography className={styles.value}>
              {payerName || "לא ידוע"}
            </Typography>
          </div>

          <div className={styles.row}>
            <Typography className={styles.label}>תאריך</Typography>
            <Typography className={styles.value}>{formattedDate}</Typography>
          </div>
        </div>

        <Divider className={styles.divider} />

        <div className={styles.section}>
          <Typography className={styles.sectionTitle}>מי חייב וכמה</Typography>
          {split.length === 0 && (
            <Typography className={styles.emptySplit}>
              אין חלוקה שמורה עבור הוצאה זו.
            </Typography>
          )}

          {split.length > 0 && (
            <div className={styles.splitList}>
              {split.map((item, idx) => {
                const memberName = nameById.get(item.userId) || item.userId;
                return (
                  <div key={item.userId + "-" + idx} className={styles.splitRow}>
                    <Typography className={styles.splitName}>{memberName}</Typography>
                    <Typography className={styles.splitAmount} dir="ltr">
                      {formatILS(Number(item.amount) || 0)}
                    </Typography>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {expense.receiptUrl && (
          <>
            <Divider className={styles.divider} />
            <div className={styles.section}>
              <Typography className={styles.sectionTitle}>קבלה</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ReceiptLongOutlinedIcon />}
                href={expense.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryBtn}
              >
                הצגת קבלה
              </Button>
            </div>
          </>
        )}
      </DialogContent>

      <DialogActions className={styles.actions}>
        <Button onClick={onClose} variant="contained" className={styles.primaryBtn}>
          סגירה
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function formatDate(value: string | Date) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("he-IL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
