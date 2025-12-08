"use client";

import { useState, MouseEvent } from "react";
import type { Expense, Member } from "@/app/types/types";
import { IconButton, Paper, Typography, Button, Box } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { formatILS } from "@/app/utils/money";
import styles from "./GroupExpenseRow.module.css";
import CustomModal from "../CustomModal/CustomModal";

export function GroupExpenseRow({
  userId,
  e,
  onDelete,
  onEdit,
  payer,
  onOpenDetails,
  disabled,
}: {
  userId: string | undefined;
  e: Expense;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
  payer?: Member;
  onOpenDetails?: (expense: Expense) => void;
  disabled?: boolean;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleOpenConfirm = (event: MouseEvent) => {
    event.stopPropagation();
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
  };

  const handleConfirmDelete = () => {
    onDelete(e.id);
    setConfirmOpen(false);
  };

  return (
    <>
      <Paper elevation={0} className={styles.row}>
        <div
          className={styles.card}
          onClick={() => onOpenDetails?.(e)}
        >
          <div className={styles.right}>
            <Typography variant="body1" className={styles.name}>
              {e.name}
            </Typography>
            {payer && (
              <Typography variant="body2" className={styles.payer}>
                {`שילם/ה: ${payer?.name}`}
              </Typography>
            )}
          </div>

          <div className={styles.left}>
            <Typography variant="body1" className={styles.amount}>
              {formatILS(Number(e.amount) || 0)}
            </Typography>

            {userId === payer?.id && (
              <>
                {!disabled && (
                  <IconButton
                    size="small"
                    className={styles.editBtn}
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit?.(e.id);
                    }}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                )}

                {!disabled && (
                  <IconButton
                    size="small"
                    className={styles.deleteBtn}
                    onClick={handleOpenConfirm}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                )}
              </>
            )}
          </div>
        </div>
      </Paper>

      <CustomModal open={confirmOpen} onClose={handleCloseConfirm}>
        <Typography variant="h6" className={styles.confirmTitle}>
          למחוק את ההוצאה הזו?
        </Typography>
        <Typography variant="body2" className={styles.confirmMessage}>
          אי אפשר לבטל את הפעולה לאחר המחיקה.
        </Typography>

<Box className={styles.confirmActions}>
  <Button
    onClick={handleConfirmDelete}
    className={`${styles.confirmBtn} ${styles.confirmPrimary}`}
  >
    מחיקה
  </Button>
  <Button
    onClick={handleCloseConfirm}
    className={`${styles.confirmBtn} ${styles.confirmSecondary}`}
  >
    ביטול
  </Button>
</Box>

      </CustomModal>
    </>
  );
}
