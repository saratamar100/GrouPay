"use client";
import type { Expense, Member } from "@/app/types/types";
import { Paper, TextField, IconButton, Button, Tooltip } from "@mui/material";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import styles from "./GroupDraftRow.module.css";

export type DraftExpense = Omit<Expense, "id">;

export function GroupDraftRow({
  draft,
  onChange,
  onConfirm,
  onCancel,
  onAdvanced,
  disabled,
}: {
  draft: DraftExpense;
  onChange: (key: keyof DraftExpense, value: any) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onAdvanced?: () => void;
  disabled?: boolean;
}) {
  return (
    <Paper elevation={0} className={styles.row}>
      <div className={styles.card}>
        {/* Inputs section */}
        <div className={styles.inputs}>
          <TextField
            label="שם ההוצאה"
            variant="outlined"
            size="small"
            value={draft.name}
            onChange={(e) => onChange("name", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !disabled) onConfirm();
            }}
            className={styles.nameInput}
          />

          <TextField
            label="סכום"
            variant="outlined"
            size="small"
            value={draft.amount ?? ""}
            onChange={(e) => onChange("amount", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !disabled) onConfirm();
            }}
            inputMode="decimal"
            dir="ltr"
            className={styles.amountInput}
          />
        </div>

        <div className={styles.controls}>
          <Tooltip title="אפשרויות מתקדמות">
            <IconButton
              size="small"
              aria-label="אפשרויות מתקדמות לטיוטה"
              className={styles.advancedBtn}
              onClick={onAdvanced}
            >
              <TuneOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <div className={styles.actions}>
            <Button
              variant="contained"
              onClick={onConfirm}
              disabled={disabled}
              size="small"
              className={styles.primaryBtn}
            >
              אישור
            </Button>
            <Button
              variant="outlined"
              onClick={onCancel}
              size="small"
              className={styles.secondaryBtn}
            >
              ביטול
            </Button>
          </div>
        </div>
      </div>
    </Paper>
  );
}
