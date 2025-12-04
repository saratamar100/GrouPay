"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  TextField,
} from "@mui/material";
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
    resetReceipt,

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
    "&.Mui-checked": {
      color: "#067c80",
    },
  };

  const diffClass =
    diff === 0
      ? ""
      : diff > 0
      ? styles.diffPositive
      : styles.diffNegative;

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
      fullWidth
      maxWidth="sm"
      PaperProps={{ className: styles.paper }}
    >
      <DialogTitle className={styles.title}>
        <span>{title}</span>
      </DialogTitle>

      <DialogContent className={styles.content}>
        <section className={`${styles.section} ${styles.firstCard}`}>
          <div className={styles.grid}>
            <TextField
              label="שם ההוצאה"
              size="small"
              fullWidth
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              className={styles.metaInput}
            />
            <TextField
              label="סכום"
              size="small"
              fullWidth
              value={amountValue}
              onChange={(e) => setAmountValue(toMoney(e.target.value))}
              className={styles.metaInput}
            />
          </div>
        </section>

        <section className={styles.section}>
          <Typography className={styles.sectionTitle}>
            חשבונית / קובץ מצורף
          </Typography>

          <div className={styles.receiptRow}>
            {receiptPreview ? (
              <div className={styles.receiptBubble}>
                <button
                  type="button"
                  className={styles.fileNameBtn}
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.open(receiptPreview, "_blank");
                    }
                  }}
                >

                  <span>{fileName || "צפייה בקובץ"}</span>
                </button>

              </div>
            ) : (
              <div className={styles.noFile}>לא הועלה קובץ</div>
            )}

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
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.rowHeader}>
            <Typography className={styles.sectionTitle}>
              משתתפים בחלוקה
            </Typography>

            <FormControlLabel
              label="חלוקה שווה"
              control={
                <Checkbox
                  checked={equalMode}
                  onChange={(e) => setEqualMode(e.target.checked)}
                  sx={checkboxStyles}
                />
              }
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
                        sx={checkboxStyles}
                        onChange={() => toggleMember(m.id)}
                      />
                    }
                  />
                  <TextField
                    size="small"
                    className={styles.amountInput}
                    inputProps={{ inputMode: "decimal", dir: "ltr" }}
                    value={value}
                    onChange={(e) => setAmountFor(m.id, e.target.value)}
                    disabled={!checked || equalMode}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {diff !== 0 && (
          <div className={`${styles.totals} ${diffClass}`}>
            <Typography>
              הפרש:
              <strong dir="ltr"> {formatILS(diff)}</strong>
            </Typography>
          </div>
        )}
      </DialogContent>

      <DialogActions className={styles.actions}>
        <Button
          variant="text"
          onClick={() => {
            setFileName(null); 
            resetReceipt();
            onClose();        
  }}
          className={styles.secondaryBtn}
          disabled={isSaving}
        >
          ביטול
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveWrapper}
          disabled={selected.length === 0 || diff !== 0 || isSaving}
          className={styles.firstBtn}
        >
          {isSaving ? "שומר..." : "שמירה"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
