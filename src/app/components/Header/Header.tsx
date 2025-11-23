"use client";
import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import Link from "next/link";
import styles from "./Header.module.css";
import { useLoginStore } from "@/app/store/loginStore";

const Header: React.FC = () => {
  const loginStore = useLoginStore();
  const logout = () => {
    loginStore.setLoggedUser(null);
    const user = loginStore.loggedUser;
    if (!user) {
      window.location.href = "/";
    }
  };
  const navLinks = [
    { title: "אודות", path: "/about" },
    { title: "פרופיל", path: "/profile" },
    { title: "התנתקות", action: logout },
  ];
  return (
    <AppBar position="static" className={styles.appBar}>
      <Toolbar className={styles.toolbar}>
        <Box className={styles.navContainer}>
          {navLinks.map((link) =>
            link.path ? (
              <Link key={link.title} href={link.path}>
                <Button color="inherit" className={styles.navButton}>
                  {link.title}
                </Button>
              </Link>
            ) : (
              <Button
                key={link.title}
                color="inherit"
                className={styles.navButton}
                onClick={link.action}
              >
                {link.title}
              </Button>
            )
          )}
        </Box>

        <Typography variant="h5" component="div" className={styles.logo}>
          GrouPay
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;