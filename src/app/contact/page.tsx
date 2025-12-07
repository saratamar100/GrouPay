"use client";

import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import styles from "./ContactPage.module.css";
import { useState } from "react";
import { sendContactMessage } from "@/app/services/client/contactService";
import Header from "../components/Header/Header";
import CustomModal from "@/app/components/CustomModal/CustomModal";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await sendContactMessage({
      email,
      name,
      subject,
      message,
    });

    await sendContactMessage({ email, name,subject, message });

    setModalOpen(true);

    setEmail("");
    setName("");
    setSubject("");
    setMessage("");
  };

  return (
    <>
      <Header />

      <Box className={styles.pageRoot}>
        <Paper elevation={3} className={styles.card}>
          <Typography variant="h4" className={styles.title}>
            צרו קשר
          </Typography>

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
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={styles.input}
              placeholder="נושא הפנייה"
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

            <Button type="submit" variant="contained" className={styles.button}>
              שליחת פנייה
            </Button>
          </form>
        </Paper>
      </Box>

      <CustomModal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          הפנייה נשלחה בהצלחה
        </Typography>
        <Typography sx={{ mb: 3 }}>
          תודה על יצירת הקשר! נחזור אלייך בהקדם האפשרי.
        </Typography>
        <Button variant="contained" onClick={() => setModalOpen(false)}>
          סגירה
        </Button>
      </CustomModal>
    </>
  );
}
