"use client";
import GoogleLoginButton from "../components/GoogleLoginButton/GoogleLoginButton";
import { useLoginStore } from "../store/loginStore";
import { User } from "../types/types";
import styles from "./login.module.css";

const LoginPage = () => {
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
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>ברוכים הבאים</h1>
        <p className={styles.subtitle}>התחבר/י עם החשבון שלך כדי להמשיך</p>

        <div className={styles.buttonWrapper}>
          <GoogleLoginButton onLogIn={handleLogin} />
        </div>

        <p className={styles.note}>
          בלחיצה על "התחברות" את/ מאשר/ת את
          <span className={styles.link}>תנאי השימוש שלנו</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
