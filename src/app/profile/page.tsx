"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  Paper,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
  InputAdornment,
  createTheme,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import toast, { Toaster } from "react-hot-toast";
import { updateUserProfile } from "@/app/services/client/profileService";
import styles from "./profile.module.css";


const theme = createTheme({
  direction: "rtl",
  palette: {
    primary: { main: "#067c80" },
    background: { default: "#eef8f8" },
  },
});


type User = { id: string; name: string; email: string; phone: string };
type Errors = Partial<Record<keyof User, string>>;

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

  const handleChange = (field: keyof User, value: string) => {
    setDrafts((prev) => ({ ...prev, [field]: value }));
    const msg = validateField(field, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (msg) next[field] = msg;
      else delete next[field];
      return next;
    });
  };

  const save = async () => {    
    if (!dirty) {
      setCanEdit(false);
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
      toast.success(result.message, {
        style: { direction: "rtl", fontFamily: "Heebo" },
      });
      setCanEdit(false);
    } else {
      toast.error(result.message, {
        style: { direction: "rtl", fontFamily: "Heebo" },
      });
    }
  };

  const handleCTA = () => {
    if (!canEdit) {
      setDrafts(user);
      setErrors({});
      setCanEdit(true);
    } else {
      save();
    }
  };

  const fieldBlocks = [
    {
      key: "name" as const,
      label: "שם מלא",
      icon: <PersonOutlineIcon color="primary" />,
    },
    {
      key: "email" as const,
      label: "אימייל",
      icon: <MailOutlineIcon color="primary" />,
      type: "email" as const,
    },
    {
      key: "phone" as const,
      label: "טלפון",
      icon: <PhoneAndroidIcon color="primary" />,
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="bottom-center" />
      <Box className={styles.pageRoot}>
        <Container maxWidth="sm">
          <Paper elevation={8} className={styles.card}>
            <Typography variant="h4" className={styles.title}>
              פרופיל משתמש
            </Typography>
            <Stack spacing={2}>
              {fieldBlocks.map(({ key, label, icon, type }) => (
                <div key={key} className={styles.fieldBlock}>
                  <TextField
                    label={label}
                    type={type}
                    value={drafts[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    fullWidth
                    helperText={" "}
                    className={`${styles.fieldRoot} ${canEdit ? styles.editable : styles.locked}`}
                    InputProps={{
                      readOnly: !canEdit,
                      startAdornment: (
                        <InputAdornment position="start">{icon}</InputAdornment>
                      ),
                    }}
                    inputProps={{
                      tabIndex: canEdit ? 0 : -1,
                    }}
                  />
                  {errors[key] && (
                    <Typography variant="caption" color="error" className={styles.errorText}>
                      {errors[key]}
                    </Typography>
                  )}
                </div>
              ))}
            </Stack>
            <Stack direction="row" justifyContent="flex-end" className={styles.ctaRow}>
              <Button
                onClick={handleCTA}
                variant="contained"
                disabled={saving || (canEdit && Object.keys(errors).length > 0)}
                className={styles.primaryButton}
              >
                {saving ? "שומר..." : canEdit ? "שמור" : "ערוך פרופיל"}
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
