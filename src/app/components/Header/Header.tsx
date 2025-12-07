"use client";

import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import styles from "./Header.module.css";
import { useLoginStore } from "@/app/store/loginStore";
import { fetchLogout } from "@/app/services/client/logoutService";
import { signInWithGoogle } from "@/app/services/client/authHelpers";
import { addUser } from "@/app/services/client/login";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import PersonIcon from "@mui/icons-material/Person";

const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const loggedUser = useLoginStore((state) => state.loggedUser);
  const setLoggedUser = useLoginStore((state) => state.setLoggedUser);
  const logout = useLoginStore((state) => state.logout);

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleLogout = () => {
    logout();
    fetchLogout();
    setMenuAnchor(null);
    router.push("/");
  };

const handleLogin = async () => {
  if (loading) return;
  setLoading(true);

  try {
    const user = await signInWithGoogle();
    if (!user) {
      setLoading(false);
      return;
    }

    const userData = {
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    };

    const addedUser = await addUser(userData);

    if (addedUser) {
      setLoggedUser(addedUser);
      router.push("/dashboard"); 
    }
  } catch (error) {
    console.error("Error sending user data to server:", error);
  } finally {
    setLoading(false);
  }
};

  const handleProfileIconClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!loggedUser) {
      handleLogin();
      return;
    }
    handleAvatarClick(event);
  };

  const isDashboard = pathname === "/dashboard";
  const isAbout = pathname === "/about";
  const isProfile = pathname ==="/profile";

  return (
    <AppBar>
      <Toolbar className={styles.toolbar}>
        <Box className={styles.rightSection}>
          <img
            src="/images/groupay-white-logo.png"
            alt="GrouPay Logo"
            className={styles.logo}
          />
        </Box>

        <Box className={styles.leftSection}>
          <IconButton
            className={isDashboard ? styles.activeIcon : styles.iconButton}
            onClick={() => router.push("/dashboard")}
          >
            <HomeIcon />
          </IconButton>

          <IconButton
            className={isAbout ? styles.activeIcon : styles.iconButton}
            onClick={() => router.push("/about")}
          >
            <InfoIcon />
          </IconButton>

          <IconButton
            className={isProfile ? styles.activeIcon : styles.iconButton}
            onClick={handleProfileIconClick}
            disabled={loading}
          >
            <PersonIcon sx={{ fontSize: 32 }} />
          </IconButton>

          {loggedUser && (
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              className={styles.menu}
            >
              <MenuItem
                onClick={() => {
                  router.push("/profile");
                  setMenuAnchor(null);
                }}
                className={styles.menuItem}
              >
                <PersonIcon fontSize="small" />
                <span>פרופיל</span>
              </MenuItem>

              <MenuItem onClick={handleLogout} className={styles.logoutItem}>
                <ExitToAppIcon fontSize="small" />
                <span>התנתקות</span>
              </MenuItem>
            </Menu>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
