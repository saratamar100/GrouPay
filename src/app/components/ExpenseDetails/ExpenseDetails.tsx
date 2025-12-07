import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { Expense, Member } from "@/app/types/types";
import { formatILS } from "@/app/utils/money";

import styles from "./ExpenseDetails.module.css";

type SplitItem = {
  name: string;
  value: number;
  color: string;
};

const COLORS = ["#067c80", "#32b9b2", "#0a4f4d", "#5cd3c7", "#08979d", "#46c2b9"];

export default function ExpenseDetails({
  open,
  expense,
  onClose,
}: {
  open: boolean;
  expense: Expense | null;
  onClose: () => void;
}) {
  if (!open || !expense) return null;

  const splitData: SplitItem[] =
    expense.split?.map((s, i) => {
      return {
        name: s.name || "משתתף",
        value: Number(s.amount),
        color: COLORS[i % COLORS.length],
      };
    }) || [];

  const totalAmount = Number(expense.amount) || 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ className: styles.dialogPaper }}
    >
      <Box className={styles.header}>
        <Box className={styles.titleBlock}>
          <Typography className={styles.title}>{expense.name}</Typography>
          <Typography className={styles.subtitle}>
            {new Date(expense.date).toLocaleDateString("he-IL")}
          </Typography>
        </Box>

        <Box className={styles.headerRight}>
          <IconButton onClick={onClose} className={styles.closeBtn}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <DialogContent className={styles.content}>
        <Box className={styles.infoGrid}>
          <Box className={styles.infoCard}>
            <Typography className={styles.infoLabel}>שילם/ה</Typography>
            <Typography className={styles.infoValue}>
              {expense.payer.name}
            </Typography>
          </Box>

          {expense.receiptUrl && (
            <Box className={styles.infoCard}>
              <Typography className={styles.infoLabel}>קבלה</Typography>
              <IconButton
                className={styles.receiptBtn}
                onClick={() => window.open(expense.receiptUrl!, "_blank")}
              >
                <ReceiptLongOutlinedIcon />
              </IconButton>
            </Box>
          )}
        </Box>

      {splitData.length > 0 && (
        <Box className={styles.graphCard}>
      
          <Typography className={styles.sectionTitle}>
              סך הכל: {formatILS(totalAmount)}
          </Typography>
          
          <Box className={styles.graphInner}>
        
            <Box className={styles.graphWrapper}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={splitData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={80}
                    paddingAngle={0}
                    stroke="none"
                  >
                    {splitData.map((item, index) => (
                      <Cell key={index} fill={item.color} />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value, _name, props: any) => [
                      `${Number(value).toLocaleString("he-IL")} ₪`,
                      props.payload?.name || "",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>

             <Box className={styles.legendWrapper}>
              {splitData.map((item, i) => (
                <Box key={i} className={styles.legendItem}>
                  <Box
                    className={styles.legendColor}
                    style={{ backgroundColor: item.color }}
                  />
                  <Typography className={styles.legendText}>{item.name}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      </DialogContent>
    </Dialog>
  );
}
