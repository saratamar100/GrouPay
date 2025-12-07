"use client";

import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  Avatar,
} from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import toast, { Toaster } from "react-hot-toast";
import { useRef, useState, useEffect } from "react";
import { useLoginStore } from "@/app/store/loginStore";
import { useFilePreview } from "@/app/hooks/useFilePreview";
import { updateUserProfile } from "@/app/services/client/profileService";
import { uploadToCloudinary } from "@/app/services/client/uploadService";
import Header from "@/app/components/Header/Header";
import Footer from "../components/Footer/Footer";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const { loggedUser, setLoggedUser } = useLoginStore();
  const user = loggedUser;

  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
    setError(null);
  }, [user?.name]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { file: avatarFile, previewUrl, setFile } = useFilePreview(
    user?.photoURL || null
  );

  if (!user) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    if (!editMode) {
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("שם הוא שדה חובה");
      toast.error("נא למלא שם");
      return;
    }

    const hasNameChange = trimmedName !== user.name;
    const hasAvatarChange = !!avatarFile;


    if (!hasNameChange && !hasAvatarChange) {
      setEditMode(false);
      setError(null);
      return;
    }

    setSaving(true);

    let uploadedAvatarUrl: string | undefined;
    if (avatarFile) {
      try {
        uploadedAvatarUrl = await uploadToCloudinary(avatarFile);
      } catch (err) {
        setSaving(false);
        toast.error("שגיאה בהעלאת תמונה");
        return;
      }
    }

    const result = await updateUserProfile(
      user.id,
      trimmedName,
      uploadedAvatarUrl
    );
    setSaving(false);

    if (result.success && result.user) {
      setLoggedUser(result.user);
      setEditMode(false);
      setError(null);
      toast.success("הפרופיל עודכן");
    } else {
      toast.error("נא לתקן שגיאות");
    }
  };

  return (
    <>
      <Header />
      <Toaster position="bottom-center" />

      <Box className={styles.pageRoot}>
        <Container maxWidth="sm">
          <Paper elevation={10} className={styles.card}>
            <form onSubmit={onSubmit}>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFile(f);
                }}
              />

              <Avatar
                className={`${styles.avatar} ${
                  editMode ? styles.avatarEditable : ""
                }`}
                src={previewUrl || user.photoURL || undefined}
                onClick={() => {
                  if (editMode) fileInputRef.current?.click();
                }}
              >
                {user.name[0]}
              </Avatar>

              <Typography variant="h4" className={styles.title}>
                פרופיל משתמש
              </Typography>

              <Stack spacing={2} sx={{ mt: 2 }}>
                <div className={styles.fieldBlock}>
                  <label className={styles.fieldLabel}>שם מלא</label>

                  {!editMode ? (
                    <div className={styles.fieldText}>{user.name}</div>
                  ) : (
                    <>
                      <input
                        className={`${styles.fieldInput} ${
                          error ? styles.fieldInputError : ""
                        }`}
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setError(null);
                        }}
                      />
                      {error && (
                        <span className={styles.errorText}>{error}</span>
                      )}
                    </>
                  )}
                </div>

                <div className={styles.fieldBlock}>
                  <label className={styles.fieldLabel}>אימייל</label>
                  <div className={styles.fieldText}>{user.email}</div>
                </div>
              </Stack>

              <div className={styles.ctaRow}>
                {!editMode ? (
                  <button
                    type="button"
                    className={`${styles.fabInline} ${styles.fabEdit}`}
                    onClick={(ev) => {
                      ev.preventDefault();
                      ev.stopPropagation();
                      setEditMode(true);
                    }}
                  >
                    <EditOutlinedIcon style={{ fontSize: "1.8rem" }} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className={`${styles.fabInline} ${styles.fabSave}`}
                    disabled={saving}
                  >
                    {saving ? (
                      <CircularProgress size={28} sx={{ color: "white" }} />
                    ) : (
                      <SaveOutlinedIcon style={{ fontSize: "1.8rem" }} />
                    )}
                  </button>
                )}
              </div>
            </form>
          </Paper>
        </Container>
      </Box>

      <Footer />
    </>
  );
}
