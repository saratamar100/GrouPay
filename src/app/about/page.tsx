import React, { FC } from "react";
import { Container, Typography, Paper, Box } from "@mui/material";
import styles from "./about.module.css";
import Header from "../components/Header/Header";

const AboutPage: FC = () => {
  return (
    <>
      <Header />

      <Container className={styles.container} maxWidth="md">
        <Typography
          variant="h3"
          component="h1"
          className={styles.title}
          color="primary"
          gutterBottom
        >
          אודות 
        </Typography>

        <Box className={styles.fullWidthCardWrapper}>
          <Paper className={styles.paperCard} elevation={3}>
            <Typography variant="h5" component="h2" gutterBottom>
              מי אנחנו?
            </Typography>
            <Typography variant="body1" className={styles.textBody}>
              GrouPay היא פלטפורמה חדשנית לניהול חובות והוצאות משותפות בין חברים,
              שותפים לדירה, או קבוצות טיולים.
              המטרה שלנו היא לפשט את תהליך חישוב התשלומים ולהפוך את החיים
              הפיננסיים המשותפים לקלים ושקופים יותר.
            </Typography>
          </Paper>
        </Box>

        <Box className={styles.twoColumnWrapper}>
          <Box className={styles.halfWidthCard}>
            <Paper className={styles.paperCard} elevation={3}>
              <Typography variant="h5" component="h2" gutterBottom>
                החזון שלנו
              </Typography>
              <Typography variant="body1" className={styles.textBody}>
                אנו מאמינים בשקיפות פיננסית מוחלטת ובפתרונות ידידותיים למשתמש
                המונעים אי-נעימויות בנושאי כסף.
                GrouPay נועדה להיות הגשר בין הנאה משותפת לניהול פיננסי אחראי.
              </Typography>
            </Paper>
          </Box>

          <Box className={styles.halfWidthCard}>
            <Paper className={styles.paperCard} elevation={3}>
              <Typography variant="h5" component="h2" gutterBottom>
                יצירת קשר
              </Typography>
              <Typography variant="body1" className={styles.textBody}>
                לכל שאלה, תמיכה או שותפות, אתם מוזמנים ליצור איתנו קשר. אנחנו כאן בשבילכם:
                <br />
                📧 <strong>Email:</strong> support@groupay.com
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default AboutPage;
