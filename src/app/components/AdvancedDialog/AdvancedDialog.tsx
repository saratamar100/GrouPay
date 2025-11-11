"use client";

import { useMemo, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Checkbox, List, ListItem,
  ListItemText, ListItemSecondaryAction, InputAdornment,
  RadioGroup, FormControlLabel, Radio, Switch, Typography, Box
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import styles from "./AdvancedDialog.module.css";

type Member = { id: string; name: string; email: string };
type SplitItem = { userId: string; amount: number };

export type AdvancedValue = {
  name: string;
  amount: number;
  payerId: string;
  dateISO: string;
  receiptFile?: File | null;
  split: SplitItem[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  members: Member[];
  value: AdvancedValue;
  onChange: (next: AdvancedValue) => void;
  onConfirm: (finalValue: AdvancedValue) => void;
};

export default function AdvancedDialog({
  open, onClose, members, value, onChange, onConfirm
}: Props) {
  const [mode, setMode] = useState<"equal" | "custom">("equal");

  const selectedIds = useMemo(() => (value.split || []).map(s => s.userId), [value.split]);
  const allSelected = selectedIds.length > 0 && selectedIds.length === members.length;

  const setAmountNumber = (raw: string) => Number(raw.replace(/[^\d.]/g, "")) || 0;

  const toggleAll = (checked: boolean) => {
    if (checked) onChange({ ...value, split: members.map(m => ({ userId: m.id, amount: 0 })) });
    else onChange({ ...value, split: [] });
  };

  const toggleParticipant = (id: string) => {
    const exists = (value.split || []).find(s => s.userId === id);
    const next = exists
      ? (value.split || []).filter(s => s.userId !== id)
      : [...(value.split || []), { userId: id, amount: 0 }];
    onChange({ ...value, split: next });
  };

  const equalSplit = useMemo(() => {
    const ids = selectedIds;
    const n = ids.length;
    if (!n || !value.amount) return [];
    const base = Math.floor((value.amount / n) * 100) / 100;
    const rest = Math.round((value.amount - base * (n - 1)) * 100) / 100;
    return ids.map((uid, i) => ({ userId: uid, amount: i === n - 1 ? rest : base }));
  }, [selectedIds, value.amount]);

  const displaySplit = mode === "equal"
    ? equalSplit
    : (value.split || []).filter(s => selectedIds.includes(s.userId));

  const sumSplit = useMemo(
    () => Math.round((displaySplit.reduce((s, x) => s + (x.amount || 0), 0)) * 100) / 100,
    [displaySplit]
  );

  const splitMismatch = mode === "custom" && Math.abs(sumSplit - (value.amount || 0)) > 0.009;

  const setCustomAmount = (userId: string, amount: number) => {
    const base = (value.split || []).filter(s => selectedIds.includes(s.userId));
    const others = (value.split || []).filter(s => !selectedIds.includes(s.userId));
    const updated = base.some(s => s.userId === userId)
      ? base.map(s => (s.userId === userId ? { ...s, amount } : s))
      : [...base, { userId, amount }];
    onChange({ ...value, split: [...updated, ...others] });
  };

  const payerOption = useMemo(
    () => members.find(m => m.id === value.payerId) || null,
    [members, value.payerId]
  );

  const handleConfirm = () => {
    if (!selectedIds.length) return;
    const finalSplit = mode === "equal"
      ? [...equalSplit]
      : (value.split || []).filter(s => selectedIds.includes(s.userId));
    const finalValue: AdvancedValue = { ...value, split: finalSplit };
    onConfirm(finalValue);
  };

  const dateValue = (() => {
    try {
      const d = value.dateISO ? new Date(value.dateISO) : new Date();
      return d.toISOString().slice(0, 10);
    } catch {
      return new Date().toISOString().slice(0, 10);
    }
  })();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md"
            PaperProps={{ className: styles.dialogPaper }}>
      <DialogTitle className={styles.dialogTitle}>הגדרות מתקדמות</DialogTitle>

      <DialogContent className={styles.dialogContent}>
        <div className={styles.topRows}>
          <div className={styles.topRow}>
            <TextField
              label="סכום"
              value={value.amount || 0}
              onChange={(e) => onChange({ ...value, amount: setAmountNumber(e.target.value) })}
              InputProps={{ dir: "ltr", endAdornment: <InputAdornment position="end">₪</InputAdornment> }}
              className={styles.input}
            />
            <TextField
              label="שם ההוצאה"
              value={value.name}
              onChange={(e) => onChange({ ...value, name: e.target.value })}
              className={styles.input}
            />
          </div>

          <div className={styles.topRow}>
            <TextField
              label="תאריך"
              type="date"
              value={dateValue}
              onChange={(e) => {
                const d = new Date(e.target.value);
                onChange({ ...value, dateISO: new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString() });
              }}
              InputLabelProps={{ shrink: true }}
              className={styles.input}
            />
            <Autocomplete
              options={members}
              getOptionLabel={(o) => o.name ? `${o.name} (${o.email})` : o.email}
              value={payerOption}
              onChange={(_, v) => onChange({ ...value, payerId: v?.id || "" })}
              renderInput={(params) => <TextField {...params} label="מי שילם" />}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.grid}>
          <section className={styles.sectionCard}>
            <header className={styles.sectionHeader}>מי מתחלק</header>
            <div className={styles.sectionBody}>
              <div className={styles.selectAllRow}>
                <Switch checked={allSelected} onChange={(_, c) => toggleAll(c)} />
                <span>בחרי את כל הקבוצה</span>
              </div>

              <List dense className={styles.memberList}>
                {members.map((m) => {
                  const checked = selectedIds.includes(m.id);
                  const customVal = (value.split || []).find(s => s.userId === m.id)?.amount || 0;
                  const equalVal  = equalSplit.find(s => s.userId === m.id)?.amount || 0;
                  const showTopAmount = checked ? (mode === "equal" ? equalVal : customVal) : 0;

                  return (
                    <ListItem key={m.id} disableGutters className={styles.memberItemStack}>
                      <div className={styles.itemAmountAbove} dir="ltr">
                        {checked ? `${showTopAmount.toFixed(2)} ₪` : "—"}
                      </div>
                      <div className={styles.rowContent}>
                        <Checkbox edge="start" checked={checked} onChange={() => toggleParticipant(m.id)} />
                        <ListItemText
                          primary={m.name || m.email}
                          secondary={m.name ? m.email : undefined}
                        />
                      </div>
                    </ListItem>
                  );
                })}
              </List>
            </div>
          </section>

          <section className={styles.sectionCard}>
            <header className={styles.sectionHeader}>סוג החלוקה</header>
            <div className={styles.sectionBody}>
              <RadioGroup
                value={mode}
                onChange={(_, v) => setMode((v as any) || "equal")}
                className={styles.radioRow}
              >
                <FormControlLabel value="equal" control={<Radio size="small" />} label="חלוקה שווה בין הנבחרים" />
                <FormControlLabel value="custom" control={<Radio size="small" />} label="חלוקה לפי סכומים (לנבחרים בלבד)" />
              </RadioGroup>

              {!selectedIds.length && (
                <Typography variant="body2" color="text.secondary" className={styles.helpText}>
                  בחרי קודם מי משתתף בתשלום.
                </Typography>
              )}

              <List dense className={styles.memberList}>
                {members.filter(m => selectedIds.includes(m.id)).map((m) => {
                  const customVal = (value.split || []).find(s => s.userId === m.id)?.amount || 0;
                  const equalVal  = equalSplit.find(s => s.userId === m.id)?.amount || 0;

                  return (
                    <ListItem key={m.id} disableGutters className={styles.memberItem}>
                      <ListItemText
                        primary={m.name || m.email}
                        secondary={m.name ? m.email : undefined}
                      />
                      <ListItemSecondaryAction className={styles.secondary}>
                        {mode === "equal" ? (
                          <span className={styles.equalAmount} dir="ltr">
                            {equalVal ? `${equalVal.toFixed(2)} ₪` : "—"}
                          </span>
                        ) : (
                          <TextField
                            size="small"
                            className={styles.amountField}
                            value={customVal}
                            onChange={(e) =>
                              setCustomAmount(
                                m.id,
                                Number(e.target.value.replace(/[^\d.]/g, "")) || 0
                              )
                            }
                            InputProps={{ dir: "ltr", endAdornment: <InputAdornment position="end">₪</InputAdornment> }}
                          />
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>

              <div className={styles.totalsRow}>
                <span>סכום הוצאה: <b>{Number(value.amount || 0).toFixed(2)} ₪</b></span>
                <span className={!splitMismatch ? styles.splitOk : styles.splitBad}>
                  סכום בחלוקה: <b>{Number(sumSplit || 0).toFixed(2)} ₪</b>
                </span>
              </div>
            </div>
          </section>

          <section className={styles.sectionCard}>
            <header className={styles.sectionHeader}>העלאת קבלה</header>
            <div className={styles.sectionBody}>
              <Button variant="outlined" component="label" className={styles.fileBtn}>
                בחרי קובץ
                <input
                  hidden
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => onChange({ ...value, receiptFile: e.target.files?.[0] || null })}
                />
              </Button>
              <Typography variant="body2" className={styles.fileName} noWrap>
                {value.receiptFile?.name || ""}
              </Typography>
            </div>
          </section>
        </div>
      </DialogContent>

      <DialogActions className={styles.actions}>
        <Box flex={1} />
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!selectedIds.length || (mode === "custom" && splitMismatch)}
          className={styles.confirmBtn}
        >
          אישור
        </Button>
      </DialogActions>
    </Dialog>
  );
}
