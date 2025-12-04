"use client";

import { Modal, Box } from "@mui/material";
import { ReactNode } from "react";
import styles from "./CustomModal.module.css";

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function CustomModal({ open, onClose, children }: CustomModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box className={styles.modalBox}>
        {children}
      </Box>
    </Modal>
  );
}
