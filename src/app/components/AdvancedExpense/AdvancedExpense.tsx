"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Typography,
  Divider,
  TextField,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

import type { Member,SplitDetail } from "@/app/types/types";

import { useAdvancedExpense } from "@/app/hooks/useAdvancedExpense";
import { toMoney, formatILS } from "@/app/utils/money";

import styles from "./AdvancedExpense.module.css";
import { useState } from "react";

type AdvancedExpenseProps = {
  open: boolean;
  title?: string;
  name?: string;
  amount: number;
  members: Member[];
  initialSplit?: SplitDetail[];
  initialReceiptUrl?: string | null;
  onClose: () => void;
  onSave: (data: {
    split: SplitDetail[];
    receiptFile?: File | null;
    receiptUrl?: string | null;
    name?: string;
    amount?: number;
  }) => Promise<void>;
};

export default function AdvancedExpense({
  open,
  title = "הגדרות מתקדמות",
  name,
  amount,
  members,
  initialSplit,
  initialReceiptUrl,
  onClose,
  onSave,
}: AdvancedExpenseProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const {
    selected,
    perUser,
    equalMode,
    receiptPreview,
    nameValue,
    amountValue,
    diff,
    setNameValue,
    setAmountValue,
    setEqualMode,
    toggleMember,
    setAmountFor,
    handleFile,
    handleSave,
  } = useAdvancedExpense({
    open,
    name,
    amount,
    members,
    initialSplit,
    initialReceiptUrl,
    onSave,
  });

  const checkboxStyles = {
    color: "#067c80",
    "&.Mui-checked": { color: "#067c80" },
  };

  const diffClass =
    diff === 0 ? "" : diff > 0 ? styles.diffPositive : styles.diffNegative;

  const handleSaveWrapper = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await handleSave();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ className: styles.paper }}
    >
      <DialogTitle className={styles.title}>
        <span>{title}</span>
        <IconButton onClick={onClose} className={styles.closeBtn}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent className={styles.content}>
        <section className={styles.section}>
          <div className={styles.basicCard}>
            <TextField
              label="שם ההוצאה"
              size="small"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              fullWidth
              className={styles.metaInput}
            />

            <TextField
              label="סכום"
              size="small"
              value={amountValue}
              onChange={(e) => setAmountValue(toMoney(e.target.value))}
              fullWidth
              inputProps={{ dir: "ltr", inputMode: "decimal" }}
              className={styles.metaInput}
            />
          </div>

          <div className={styles.receiptCard}>
            <Typography className={styles.sectionTitle}>
              חשבונית / צילום מסך
            </Typography>

            <div className={styles.uploadRow}>
              <Button
                variant="contained"
                component="label"
                size="small"
                className={styles.uploadBtn}
              >
                העלאת קובץ
                <input
                  type="file"
                  hidden
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFileName(file ? file.name : null);
                    handleFile(file);
                  }}
                />
              </Button>

              {receiptPreview && (
                <div className={styles.receiptBubble}>
                  <button
                    type="button"
                    className={styles.fileNameBtn}
                    onClick={() => window.open(receiptPreview!, "_blank")}
                  >
                    {fileName || "צפייה בקובץ"}
                  </button>

                  <IconButton
                    className={styles.removeBtn}
                    onClick={() => {
                      handleFile(null);
                      setFileName(null);
                    }}
                  >
                    ✕
                  </IconButton>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.rowHeader}>
            <Typography className={styles.sectionTitle}>
              משתתפים בחלוקה
            </Typography>

            <FormControlLabel
              control={
                <Checkbox
                  checked={equalMode}
                  onChange={(e) => setEqualMode(e.target.checked)}
                  sx={checkboxStyles}
                />
              }
              label="חלוקה שווה"
              className={styles.equalToggle}
            />
          </div>

          <div className={styles.membersList}>
            {members.map((m) => {
              const checked = selected.includes(m.id);
              const value = checked ? perUser[m.id] ?? 0 : 0;

              return (
                <div key={m.id} className={styles.memberRow}>
                  <FormControlLabel
                    label={m.name}
                    className={styles.memberCheck}
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={() => toggleMember(m.id)}
                        sx={checkboxStyles}
                      />
                    }
                  />

                  <TextField
                    size="small"
                    className={styles.amountInput}
                    inputProps={{ dir: "ltr", inputMode: "decimal" }}
                    value={value}
                    onChange={(e) => setAmountFor(m.id, e.target.value)}
                    disabled={!checked || equalMode}
                  />
                </div>
              );
            })}
          </div>

          {diff !== 0 && (
            <div className={`${styles.totals} ${diffClass}`}>
              {formatILS(diff)}
            </div>
          )}
        </section>
      </DialogContent>

      <DialogActions className={styles.actions}>
        <Button onClick={onClose} className={styles.secondaryBtn}>
          ביטול
        </Button>
        <Button
          className={styles.firstBtn}
          disabled={selected.length === 0 || diff !== 0 || isSaving}
          onClick={handleSaveWrapper}
        >
          {isSaving ? "שומר..." : "שמירה"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
