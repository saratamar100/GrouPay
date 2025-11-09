"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import toast, { Toaster } from "react-hot-toast";
import { updateUserProfile } from "@/app/services/client/profileService";
import styles from "./profile.module.css";

type User = { id: string; name: string; email: string; phone: string };
type Errors = Partial<Record<keyof User, string>>;
type Touched = Partial<Record<keyof User, boolean>>;

const isEmail = (v: string) => /\S+@\S+\.\S+/.test(v);
const isPhone = (v: string) => /^\+?[0-9]{7,15}$/.test(v);
const isRequired = (v: string) => v.trim().length > 0;

export default function Profile() {
  const [user, setUser] = useState<User>({
    id: "690c7c80618a9be71a4d28aa",
    name: "אסתי רבינוביץ",
    email: "esty@example.com",
    phone: "0501234567",
  });

  const [canEdit, setCanEdit] = useState(false);
  const [drafts, setDrafts] = useState<User>({ ...user });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});
  const [focused, setFocused] = useState<keyof User | null>(null);
  const [saving, setSaving] = useState(false);

  const dirty = useMemo(
    () =>
      drafts.name !== user.name ||
      drafts.email !== user.email ||
      drafts.phone !== user.phone,
    [drafts, user]
  );

  const validateField = (field: keyof User, value: string) => {
    if (field === "name") return isRequired(value) ? "" : "שם הוא שדה חובה";
    if (field === "email") {
      if (!isRequired(value)) return "אימייל הוא שדה חובה";
      return isEmail(value) ? "" : "אימייל לא תקין";
    }
    if (field === "phone") {
      if (!isRequired(value)) return "טלפון הוא שדה חובה";
      return isPhone(value) ? "" : "טלפון לא תקין";
    }
    return "";
  };

  const setFieldError = (field: keyof User, value: string, force = false) => {
    if (!force && !touched[field]) return;
    const msg = validateField(field, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (msg) next[field] = msg;
      else delete next[field];
      return next;
    });
  };

  const handleChange = (field: keyof User, value: string) => {
    setDrafts((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) setFieldError(field, value, true);
  };

  const handleFocus = (field: keyof User) => setFocused(field);

  const handleBlur = (field: keyof User) => {
    setFocused((prev) => (prev === field ? null : prev));
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFieldError(field, drafts[field], true);
  };

  const validateAll = () => {
    const fields: (keyof User)[] = ["name", "email", "phone"];
    const nextErrors: Errors = {};
    const nextTouched: Touched = { name: true, email: true, phone: true };
    for (const f of fields) {
      const msg = validateField(f, drafts[f]);
      if (msg) nextErrors[f] = msg;
    }
    setTouched(nextTouched);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const save = async () => {
    const ok = validateAll();
    if (!dirty || !ok) {
      if (!ok) toast.error("נא לתקן את השגיאות לפני שמירה");
      return;
    }
    setSaving(true);
    const result = await updateUserProfile({
      id: user.id,
      name: drafts.name,
      email: drafts.email,
      phone: drafts.phone,
    });
    setSaving(false);
    if (result.success) {
      setUser(drafts);
      toast.success(result.message);
      setCanEdit(false);
    } else {
      toast.error(result.message);
    }
  };

  const handleAction = () => {
    if (!canEdit) {
      setDrafts(user);
      setErrors({});
      setTouched({});
      setFocused(null);
      setCanEdit(true);
    } else {
      save();
    }
  };

  const fieldBlocks = [
    { key: "name" as const, label: "שם מלא", icon: <PersonOutlineIcon className={styles.fieldIcon} /> },
    { key: "email" as const, label: "אימייל", icon: <MailOutlineIcon className={styles.fieldIcon} /> },
    { key: "phone" as const, label: "טלפון", icon: <PhoneAndroidIcon className={styles.fieldIcon} /> },
  ];

  return (
    <>
      <Toaster position="bottom-center" />

      <Box className={styles.pageRoot}>
        <Container maxWidth="sm">
          <Paper
            elevation={8}
            className={`${styles.card} ${
              canEdit ? `${styles.cardEdit} ${styles.editActive}` : styles.cardView
            }`}
            aria-busy={saving || undefined}
          >
            <Typography variant="h4" className={styles.title}>
              פרופיל משתמש
            </Typography>

            <Stack spacing={2}>
              {fieldBlocks.map(({ key, label, icon }) => {
                const isFocused = focused === key;
                const showError = Boolean(!isFocused && touched[key] && errors[key]);
                return (
                  <div key={key} className={styles.fieldBlock}>
                    <div className={styles.fieldLabel}>
                      {icon}
                      <span>{label}</span>
                    </div>

                    {!canEdit ? (
                      <div className={styles.fieldText}>{user[key]}</div>
                    ) : (
                      <>
                        <input
                          className={[
                            styles.fieldInput,
                            showError ? styles.fieldInputError : ""
                          ].join(" ")}
                          value={drafts[key]}
                          onChange={(e) => handleChange(key, e.target.value)}
                          onFocus={() => handleFocus(key)}
                          onBlur={() => handleBlur(key)}
                          aria-invalid={showError || undefined}
                        />
                        {showError && (
                          <span className={styles.errorText}>
                            {errors[key]}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </Stack>

            <div className={styles.ctaRow}>
              <button
                type="button"
                onClick={handleAction}
                className={[
                  styles.fabInline,
                  canEdit ? styles.fabSave : styles.fabEdit
                ].join(" ")}
                disabled={saving}
                aria-live="polite"
                aria-label={saving ? "שומר..." : canEdit ? "שמור" : "ערוך"}
                title={saving ? "שומר..." : canEdit ? "שמור" : "ערוך"}
              >
                {saving ? (
                  <CircularProgress size={28} sx={{ color: "white" }} />
                ) : canEdit ? (
                  <SaveOutlinedIcon style={{ fontSize: "1.8rem" }} />
                ) : (
                  <EditOutlinedIcon style={{ fontSize: "1.8rem" }} />
                )}
              </button>
            </div>
          </Paper>
        </Container>
      </Box>
    </>
  );
}
