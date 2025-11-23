"use client";

import {
  FaInstagram,
  FaFacebook,
  FaLinkedin,
  FaWhatsapp,
} from "react-icons/fa6";
import styles from "./LandingPage.module.css";
import Image from "next/image";
import { useLoginStore } from "@/app/store/loginStore";
import { User } from "@/app/types/types";
import GoogleLoginButton from "../GoogleLoginButton/GoogleLoginButton";

export function LandingPage() {
  const loginStore = useLoginStore();
  const user = loginStore.loggedUser;
  if (user) {
    window.location.href = "/dashboard";
    return null;
  }
  const handleLogin = (user: User) => {
    loginStore.setLoggedUser(user);
  };
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            לפצל הוצאות, <span>לא חברויות.</span>
          </h1>
          <p className={styles.subtitle}>
            נמאס לרדוף אחרי חברים? Groupay עוזרת לכם לעקוב אחרי הוצאות משותפות
            בטיולים, עם שותפים או באירועים, כדי שכולם יקבלו את הכסף בחזרה.
            בקלות.
          </p>
          <div className={styles.ctaContainer}>
            <GoogleLoginButton onLogIn={handleLogin} />
          </div>
        </div>
        <div className={styles.heroImageContainer}>
          <Image
            src="/images/groupay-logo.png"
            alt="לוגו Groupay - Pay it Together"
            width={450}
            height={360}
            priority
            className={styles.heroImage}
          />
        </div>
      </section>

      <div className={styles.divider} aria-hidden="true">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-17.32,168.19-17.32,250.33,0,63.63,13.38,124.37,33.35,185.77,44.55A52,52,0,0,1,975.21,111.19c87.23,1.3,172.4-14.36,251.1-40.42V0H0V56.44Z"
            className={styles.dividerShapeFill}
          ></path>
        </svg>
      </div>

      <section className={styles.mainContentSection}>
        <h2 className={styles.featuresTitle}>כל כך פשוט, שזה כמעט כיף</h2>
        <p className={styles.featuresSubtitle}>
          ניהול הוצאות קבוצתיות בשלושה צעדים פשוטים.
        </p>

        <div className={styles.featuresGrid}>
          <div
            className={styles.featureCard}
            style={{ animationDelay: "0.5s" }}
          >
            <span className={styles.featureIcon}></span>
            <h3>1. יוצרים קבוצה</h3>
            <p>
              פותחים קבוצה חדשה בקלות. מזמינים את החברים באמצעות קישור או
              ישירות מהאפליקציה.
            </p>
          </div>

          <div
            className={styles.featureCard}
            style={{ animationDelay: "0.8s" }}
          >
            <span className={styles.featureIcon}></span>
            <h3>2. מוסיפים הוצאות</h3>
            <p>
              הוסיפו הוצאות בזמן אמת. "קניות בסופר", "כרטיסי טיסה", "ארוחת
              ערב". הכל מתועד בקלות.
            </p>
          </div>

          <div
            className={styles.featureCard}
            style={{ animationDelay: "0.1.1s" }}
          >
            <span className={styles.featureIcon}></span>
            <h3>3. מתחשבנים בקליק</h3>
            <p>
              בכל שלב, Groupay מחשב אוטומטית מי חייב למי וכמה. בלי כאב ראש,
              בלי טעויות.
            </p>
          </div>
        </div>

      </section>
      <footer className={styles.footer}>
        <div className={styles["social-icons"]}>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <FaFacebook />
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <FaLinkedin />
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
          >
            <FaWhatsapp />
          </a>
        </div>
      </footer>
    </>
  );
}



      //     <div className={styles.stepWrapper}>
      //       <span className={styles.stepLabel}>פשוט</span>
      //       <div className={styles.step}>
      //         <h3>1. יוצרים קבוצה</h3>
      //         <h4>
      //           פותחים קבוצה חדשה בקלות. מזמינים חברים באמצעות קישור או
      //           ישירות מהאפליקציה.
      //         </h4>
      //       </div>
      //     </div>

      //     <div className={styles.stepWrapper}>
      //       <span className={styles.stepLabel}>מהיר</span>
      //       <div className={styles.step}>
      //         <h3>2. מוסיפים הוצאות</h3>
      //         <h4>
      //           הוסיפו הוצאות בזמן אמת: "קניות בסופר", "טיסה", "ארוחת ערב" -
      //           הכל מתועד בקלות.
      //         </h4>
      //       </div>
      //     </div>

      //     <div className={styles.stepWrapper}>
      //       <span className={styles.stepLabel}>יעיל</span>
      //       <div className={styles.step}>
      //         <h3>3. מתחשבנים בקליק</h3>
      //         <h4>
      //           בכל שלב, Groupay מחשב אוטומטית מי חייב למי וכמה. בלי כאב ראש ובלי
      //           טעויות.
      //         </h4>
      //       </div>
      //     </div>

      //   </div>
      // </section>
