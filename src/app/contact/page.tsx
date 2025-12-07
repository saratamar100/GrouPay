"use client";

import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import styles from "./ContactPage.module.css";
import { useState } from "react";
import { sendContactMessage } from "@/app/services/client/contactService";
import Header from "../components/Header/Header";
import CustomModal from "../components/CustomModal/CustomModal";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault();

    // במידה ותרצה להפעיל שליחה אמיתית:
    // await sendContactMessage({ email, name, message });

    setModalOpen(true);

    setEmail("");
    setMessage("");
    setName("");
  };

  return (
    <>
      <Header />
      <Box className={styles.pageRoot}>
        <Paper elevation={3} className={styles.card}>
          <Typography variant="h4" className={styles.title}>צרו קשר</Typography>

          <Typography className={styles.subtitle}>
            זמן תגובה ממוצע: עד יום עסקים אחד
          </Typography>

          <form onSubmit={handleSubmit} className={styles.form}>
            <TextField
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="אימייל"
            />

            <TextField
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              placeholder="שם מלא"
            />

            <TextField
              fullWidth
              required
              multiline
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={styles.input}
              placeholder="תוכן הפנייה"
            />

            <Button
              type="submit"
              variant="contained"
              className={styles.button}
            >
              שליחת פנייה
            </Button>
          </form>
        </Paper>
      </Box>

      <CustomModal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
          הפנייה נשלחה בהצלחה!
        </Typography>
        <Button
          variant="contained"
          onClick={() => setModalOpen(false)}
          fullWidth
        >
          סגור
        </Button>
      </CustomModal>
    </>
  );
}
