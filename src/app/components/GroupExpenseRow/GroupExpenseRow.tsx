
import type { Expense } from "@/app/types/types";
import { IconButton, Paper, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {formatILS} from "@/app/utils/money"
import styles from "./GroupExpenseRow.module.css";



export function GroupExpenseRow({
  e,
  onDelete,
  onEdit,
  payerName,
}: {
  e: Expense;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
  payerName?: string;
}) {
  
  return (
    <Paper elevation={0} className={styles.row}>
      <div className={styles.card}
>
        <div className={styles.right}>
          <Typography variant="body1" className={styles.name}>
            {e.name}
          </Typography>
          {payerName && (
            <Typography variant="body2" className={styles.payer}>
              {`שילם/ה: ${payerName}`}
            </Typography>
          )}
        </div>

        <div className={styles.left}>
          <Typography variant="body1" className={styles.amount}>
            {formatILS(Number(e.amount) || 0)}
          </Typography>

          <IconButton
            size="small"
            className={styles.advancedBtn}
            onClick={() => {onEdit?.(e.id);}}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => onDelete(e.id)}
            className={styles.deleteBtn}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </div>
      </div>
    </Paper>
  );
}
