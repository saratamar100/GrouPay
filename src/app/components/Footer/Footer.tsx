"use client";

import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import ChatIcon from "@mui/icons-material/Chat";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.socialIcons}>
          <a href="#" className={styles.socialIcon} aria-label="Instagram">
            <InstagramIcon sx={{ fontSize: 40 }} />
          </a>
          <a href="#" className={styles.socialIcon} aria-label="Facebook">
            <FacebookIcon sx={{ fontSize: 40 }} />
          </a>
          <a href="#" className={styles.socialIcon} aria-label="LinkedIn">
            <LinkedInIcon sx={{ fontSize: 40 }} />
          </a>
          <a href="#" className={styles.socialIcon} aria-label="WhatsApp">
            <ChatIcon sx={{ fontSize: 40 }} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
