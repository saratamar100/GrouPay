"use client";

import React, { useEffect } from "react";
import GroupIcon from "@mui/icons-material/Group";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import InsightsIcon from "@mui/icons-material/Insights";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoginStore } from "@/app/store/loginStore";
import { User } from "@/app/types/types";
import GoogleLoginButton from "@/app/components/GoogleLoginButton/GoogleLoginButton";
import styles from "./LandingPage.module.css";
import Footer from "../Footer/Footer";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Container,
} from "@mui/material";

export function LandingPage() {
  const loginStore = useLoginStore();
  const user = loginStore.loggedUser;
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  useEffect(() => {
    if (!user) return;
    router.replace(next || "/dashboard");
  }, [user, next, router]);

  const handleLogin = (user: User) => {
    loginStore.setLoggedUser(user);
  };

  const scrollToSteps = () => {
    const stepsSection = document.getElementById("steps-section");
    if (stepsSection) {
      stepsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const steps = [
    {
      icon: <GroupIcon sx={{ fontSize: 56 }} />,
      title: "יוצרים קבוצה",
      description:
        "פתחו קבוצה חדשה תוך שניות. הזמינו את החברים באמצעות קישור פשוט או ישירות מהאפליקציה.",
    },
    {
      icon: <CreditCardIcon sx={{ fontSize: 56 }} />,
      title: "מוסיפים הוצאות",
      description:
        "כל אחד מוסיף הוצאות בזמן אמת. קניות בסופר, כרטיסי טיסה, ארוחת ערב. הכל מתועד.",
    },
    {
      icon: <InsightsIcon sx={{ fontSize: 56 }} />,
      title: "מתחשבנים בקליק",
      description:
        "בסוף הטיול, Groupay מחשב אוטומטית מי חייב למי וכמה. בלי כאב ראש, בלי טעויות.",
    },
  ];

  return (
    <>
      <Box className={styles.heroSection}>
          <Box className={styles.heroContent}>
            <Box className={styles.heroText}>
              <h1 className={styles.title}>
                לפצל הוצאות,{" "}
                <span className={styles.titleHighlight}>לא חברויות.</span>
              </h1>
              <p className={styles.subtitle}>
                נמאס לרדוף אחרי חברים? Groupay עוזרת לכם לעקוב אחרי הוצאות
                משותפות בטיולים, עם שותפים או באירועים, כדי שכולם יקבלו את
                הכסף בחזרה. בקלות.
              </p>
              <Box className={styles.buttonContainer}>
                <GoogleLoginButton onLogIn={handleLogin} />
                <Button onClick= {scrollToSteps} variant = "outlined"> למד עוד</Button>
                
               
              </Box>
            </Box>

            <Box className={styles.heroImage}>
              <img
                src="/images/groupay-logo.png"
                alt="לוגו Groupay"
                className={styles.logo}
              />
            </Box>
          </Box>
      </Box>

      <Box id="steps-section" className={styles.stepsSection}>
        <Box className={styles.stepsContainer}>
          <Box className={styles.stepsHeader}>
            <h2 className={styles.stepsTitle}>כל כך פשוט, שזה כמעט כיף</h2>
            <p className={styles.stepsSubtitle}>
              ניהול הוצאות קבוצתיות בשלושה צעדים פשוטים.
            </p>
          </Box>

          <Box className={styles.stepsGrid}>
            {steps.map((step, index) => (

              <Card key={index} className={styles.stepCard}>
                <Box className={styles.stepIcon}>{step.icon}</Box>
                <h3 className={styles.stepTitle}>
                  {index + 1}. {step.title}
                </h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>
      <Footer/>
    </>
  );
}