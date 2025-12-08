"use client";

import Link from "next/link";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.columns}>
          <div className={styles.linksColumn}>
            <h4 className={styles.linksTitle}>ניווט מהיר</h4>
            <ul className={styles.linksList}>
              <li>
                <Link href="/faq">שאלות ותשובות</Link>
              </li>
              <li>
                <Link href="/reviews">המלצות משתמשים</Link>
              </li>
              <li>
                <Link href="/contact">צור קשר</Link>
              </li>
            </ul>
          </div>

          <div className={styles.socialColumn}>
            <h4 className={styles.linksTitle}>נשארים בקשר</h4>
            <p className={styles.supportText}>
              טיפים לחלוקת הוצאות, עדכונים על פיצ׳רים חדשים
              והשראה לקבוצות חכמות יותר.
            </p>
            <div className={styles.socialIcons}>
              <a
                href="https://www.instagram.com/pikudhaoref?igsh=MWhxMnA5ZGpkcXFuOQ=="
                className={styles.socialIcon}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon sx={{ fontSize: 32 }} />
              </a>
              <a
                href="https://www.facebook.com/share/17Mc5L1kjK/?mibextid=wwXIfr"
                className={styles.socialIcon}
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FacebookIcon sx={{ fontSize: 32 }} />
              </a>
              <a
                href="https://www.linkedin.com/in/shulamit-mor-yossef/"
                className={styles.socialIcon}
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedInIcon sx={{ fontSize: 32 }} />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.bottomRow}>
          © {new Date().getFullYear()} GrouPay  כל הזכויות שמורות
        </div>
      </div>
    </footer>
  );
};

export default Footer;
