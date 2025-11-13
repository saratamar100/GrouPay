
import type { Expense } from "@/app/types/types";
import { IconButton, Paper, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import styles from "./GroupExpenseRow.module.css";

export const toMoney = (value: string) => {
  const clean = value.replace(/[^\d.]/g, "");
  const parts = clean.split(".");
  const normalized = parts.length <= 1 ? clean : `${parts[0]}.${parts.slice(1).join("")}`;
  return Number(normalized || 0);
};
export const formatILS = (value: number) => {
  return value.toLocaleString("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export function GroupExpenseRow({
  e,
  onDelete,
  onAdvanced,
}: {
  e: Expense;
  onDelete: (id: string) => void;
  onAdvanced?: (id: string) => void;
}) {
  return (
    <Paper elevation={0} className={styles.row}>
      <div className={styles.card}>
        <div className={styles.right}>
          <Typography variant="body1" className={styles.name}>
            {e.name}
          </Typography>
        </div>

        <div className={styles.left}>
          <Typography variant="body1" className={styles.amount}>
            {formatILS(Number(e.amount) || 0)}
          </Typography>

          {/* advanced icon on far left */}
          <IconButton
            size="small"
            aria-label={`אפשרויות מתקדמות עבור ${e.name}`}
            className={styles.advancedBtn}
            onClick={() => onAdvanced?.(e.id)}
          >
            <TuneOutlinedIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            aria-label={`מחיקת ${e.name}`}
            onClick={() => onDelete(e.id)}
            className={styles.deleteBtn}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </div>
      </div>
    </Paper>
  );
}
