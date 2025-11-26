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
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import PersonIcon from '@mui/icons-material/Person';

const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const loginStore = useLoginStore();

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const logout = () => {
    loginStore.setLoggedUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("profileImage");
    }
    router.push("/");
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const isDashboard = pathname === "/dashboard";
  const isAbout = pathname === "/about";
  const isProfile = pathname.startsWith("/profile");

  return (
    <AppBar>
      <Toolbar className={styles.toolbar}>
        <Box className={styles.rightSection}>
            <img
              src="/images/groupay-white-logo.png"
              alt="GrouPay Logo"
              className={styles.logo}
            />
            <span className={styles.brandText}></span>
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
              onClick={handleAvatarClick}
            >
              <PersonIcon sx={{ fontSize: 32 }} />
            </IconButton>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            className={styles.menu}
          >
            <MenuItem
              onClick={() => router.push("/profile")}
              className={styles.menuItem}
            >
              <PersonIcon fontSize="small" />
              <span>פרופיל</span>
            </MenuItem>

            <MenuItem
              onClick={logout}
              className={styles.logoutItem}
            >
              <ExitToAppIcon fontSize="small" />
              <span>התנתקות</span>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
