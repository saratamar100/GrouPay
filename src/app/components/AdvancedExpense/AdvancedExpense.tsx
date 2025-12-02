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
import type { Member } from "@/app/types/types";
import type { SplitDetail } from "@/app/utils/split";
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
    } catch (err) {
      console.error(err);
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
        <IconButton
          aria-label="close"
          onClick={onClose}
          className={styles.closeBtn}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers className={styles.content}>
        <section className={`${styles.section} ${styles.basicSection}`}>
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
              inputProps={{ inputMode: "decimal", dir: "ltr" }}
              className={styles.metaInput}
            />
          </div>

          <div className={styles.receiptCard}>
            <Typography variant="subtitle2" className={styles.sectionTitle}>
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
                  onChange={(e) =>
                    handleFile(
                      e.target.files?.[0] ? e.target.files[0] : null
                    )
                  }
                />
              </Button>

              {receiptPreview && (
                <div className={styles.previewWrap}>
                  <img
                    src={receiptPreview}
                    alt="תצוגה מקדימה"
                    className={styles.previewImg}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        <Divider className={styles.divider} />

        <section className={styles.section}>
          <div className={styles.rowHeader}>
            <Typography variant="subtitle1" className={styles.sectionTitle}>
              משתתפים בחלוקה
            </Typography>

            <div className={styles.rightTools}>
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
          onClick={onClose}
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
