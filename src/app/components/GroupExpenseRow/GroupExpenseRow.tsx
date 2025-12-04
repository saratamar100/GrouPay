import type { Expense, Member } from "@/app/types/types";
import { IconButton, Paper, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { formatILS } from "@/app/utils/money";
import styles from "./GroupExpenseRow.module.css";

export function GroupExpenseRow({
  userId,
  e,
  onDelete,
  onEdit,
  payer,
  onOpenDetails,
}: {
  userId: string | undefined;
  e: Expense;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
  payer?: Member;
  onOpenDetails?: (expense: Expense) => void;
}) {
  return (
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

              <IconButton
                size="small"
                className={styles.deleteBtn}
                onClick={(event) => {
                  event.stopPropagation(); 
                  onDelete?.(e.id);
                }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </div>
      </div>
    </Paper>
  );
}
