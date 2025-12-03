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
import { useRef } from "react";
import {User} from "@/app/types/types"

import { useLoginStore } from "@/app/store/loginStore";
import { useProfile } from "@/app/hooks/useProfile";
import { useFilePreview } from "@/app/hooks/useFilePreview";
import Header from "@/app/components/Header/Header"
import Footer from "../components/Footer/Footer";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const loginStore = useLoginStore();
  const user = loginStore.loggedUser;

  
 
  const {
    canEdit,
    setCanEdit,
    drafts,
    errors,
    touched,
    saving,
    handleChange,
    handleBlur,
    handleFocus,
    save,
    setDrafts,
  } = useProfile(user);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { file: avatarFile, previewUrl, setFile } = useFilePreview(
    user?.photoURL || null
  );

  if (!user) return null;

  const handleSave = (user: User) => {
      loginStore.setLoggedUser(user);
  };

  const handleAvatarClick = () => {
    if (!canEdit) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
    }
  };

  const handleAction = async () => {
    if (!canEdit) {
      setDrafts({
        name: user.name,
      });
      setCanEdit(true);
      return;
    }

    const result = await save(avatarFile);

    if (result.success) {
      if (result.user) {
        handleSave(result.user)
      }
      toast.success("הפרופיל עודכן בהצלחה");
    } else {
      toast.error("נא לתקן שגיאות או לנסות שוב");
    }
  };

  return (
    <>
      <Header/>
      <Toaster position="bottom-center" />

      <Box className={styles.pageRoot}>
        <Container maxWidth="sm">
          <Paper elevation={10} className={styles.card}>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            <Avatar className={`${styles.avatar} ${canEdit ? styles.avatarEditable : ""}`}
              src={previewUrl || user.photoURL || undefined}
              onClick={handleAvatarClick}
           
            >
              {user.name[0]}
            </Avatar>

            <Typography variant="h4" className={styles.title}>
              פרופיל משתמש
            </Typography>

            <Stack spacing={2} sx={{ mt: 2 }}>
              <div className={styles.fieldBlock}>
                <label className={styles.fieldLabel}>שם מלא</label>
                {!canEdit ? (
                  <div className={styles.fieldText}>{user.name}</div>
                ) : (
                  <>
                    <input
                      className={`${styles.fieldInput} ${
                        touched.name && errors.name
                          ? styles.fieldInputError
                          : ""
                      }`}
                      value={drafts.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      onFocus={() => handleFocus("name")}
                      onBlur={() => handleBlur("name")}
                    />
                    {touched.name && errors.name && (
                      <span className={styles.errorText}>{errors.name}</span>
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
              <button
                type="button"
                onClick={handleAction}
                className={`${styles.fabInline} ${
                  canEdit ? styles.fabSave : styles.fabEdit
                }`}
                disabled={saving}
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