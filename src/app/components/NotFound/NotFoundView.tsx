"use client";

import { Box, Button, Typography } from "@mui/material";
import Link from "next/link";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <Box className={styles.wrapper}>
      <Box className={styles.content}>

        <SearchOffOutlinedIcon className={styles.icon} />

        <Typography component="h1" className={styles.title}>
          העמוד לא נמצא
        </Typography>

        <Typography className={styles.subtitle}>
          ייתכן שהקישור שגוי או שהעמוד הוסר.
        </Typography>

        <Button
          component={Link}
          href="/"
          variant="contained"
          size="large"
          className={styles.button}
        >
          חזרה לעמוד הראשי
        </Button>
      </Box>
    </Box>
  );
}
