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
            <span className={styles.featureIcon}>👥</span>
            <h3>1. יוצרים קבוצה</h3>
            <p>
              פתחו קבוצה חדשה תוך שניות. הזמינו את החברים באמצעות קישור פשוט או
              ישירות מהאפליקציה.
            </p>
          </div>

          <div
            className={styles.featureCard}
            style={{ animationDelay: "0.8s" }}
          >
            <span className={styles.featureIcon}>💳</span>
            <h3>2. מוסיפים הוצאות</h3>
            <p>
              כל אחד מוסיף הוצאות בזמן אמת. "קניות בסופר", "כרטיסי טיסה", "ארוחת
              ערב". צלמו קבלה והכל מתועד.
            </p>
          </div>

          <div
            className={styles.featureCard}
            style={{ animationDelay: "0.1.1s" }}
          >
            <span className={styles.featureIcon}>📊</span>
            <h3>3. מתחשבנים בקליק</h3>
            <p>
              בסוף הטיול, Groupay מחשב אוטומטית מי חייב למי וכמה. בלי כאב ראש,
              בלי טעויות.
            </p>
          </div>
        </div>

        <div className={styles.testimonialSection}>
          <div className={styles.testimonialCard}>
            <blockquote className={styles.testimonialQuote}>
              "השתמשתי ב-Groupay בטיול האחרון שלנו לתאילנד. זה חסך לנו שעות של
              ויכוחים וחישובים. פשוט, גאוני."
            </blockquote>
            <cite className={styles.testimonialAuthor}>
              מאיה לוי, <span>נסיינית בטא</span>
            </cite>
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
