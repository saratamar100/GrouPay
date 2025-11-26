"use client";
import type { Expense } from "@/app/types/types";
import {
  Paper,
  TextField,
  IconButton,
  Tooltip,
  Box,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
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
      <Box className={styles.card}>
        <Tooltip title="ביטול">
          <IconButton
            size="small"
            onClick={onCancel}
            disabled={disabled}
            className={styles.cancelBtn}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="אישור">
          <IconButton
            size="small"
            onClick={onConfirm}
            disabled={disabled}
            className={styles.confirmBtn}
          >
            <CheckIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {onAdvanced && (
          <Tooltip title="אפשרויות מתקדמות">
            <IconButton
              size="small"
              onClick={onAdvanced}
              className={styles.advancedBtn}
            >
              <MoreHorizIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        <Box className={styles.inputs}>
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

          <TextField
            label="שם ההוצאה"
            variant="outlined"
            size="small"
            value={draft.name}
            onChange={(e) => onChange("name", e.target.value)}
            className={styles.nameInput}
          />
        </Box>
      </Box>
    </Paper>
  );
}
