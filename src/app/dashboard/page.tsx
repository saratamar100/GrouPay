"use client";

import { useEffect, useState, useMemo } from "react";
import { getUserGroups } from "../services/client/dashboard";
import { GroupShort } from "@/app/types/types";
import { useLoginStore } from "../store/loginStore";
import { useRouter } from "next/navigation";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";

import styles from "./dashboard.module.css";

export default function DashboardTest() {
  const [groups, setGroups] = useState<GroupShort[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [userChecked, setUserChecked] = useState(false);

  const user = useLoginStore((state) => state.loggedUser);
  const router = useRouter();

  useEffect(() => {
    setUserChecked(true);
  }, []);

  useEffect(() => {
    if (!userChecked) return;

    if (!user || !user.id) {
      router.replace("/");
      return;
    }

    setLoadingGroups(true);

    getUserGroups(user.id)
      .then((data) => setGroups(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingGroups(false));
  }, [user, userChecked, router]);

  const totalBalance = useMemo(() => {
    return groups.reduce((sum, g) => sum + g.balance, 0);
  }, [groups]);

  const goToGroup = (id: string) => {
    router.push(`/groups/${id}`);
  };

  const goToCreateGroup = () => {
    router.push("/groups/new_group");
  };

  const balanceClass =
    totalBalance === 0
      ? styles.totalZero
      : totalBalance > 0
      ? styles.totalPositive
      : styles.totalNegative;

  if (!userChecked) {
    return (
      <>
        <Header />
        <Box className={styles.loaderWrapper}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Box className={styles.main}>
          <Typography color="error">שגיאה: {error}</Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Header />

      <Box className={styles.main}>
        <Box className={styles.headerRow}>
          <Box className={styles.headerTexts}>
            <Typography className={styles.title}>הקבוצות שלי</Typography>

            <Box className={styles.totalInline}>
              <Typography className={styles.totalLabel}>
                סה״כ יתרה:
              </Typography>
              <Typography className={`${styles.totalValue} ${balanceClass}`}>
                ₪{totalBalance.toFixed(0)}
              </Typography>
            </Box>
          </Box>

          <Button variant="contained" onClick={goToCreateGroup}>
            יצירת קבוצה
          </Button>
        </Box>

        {loadingGroups ? (
          <Box className={styles.loaderWrapper}>
            <CircularProgress />
          </Box>
        ) : groups.length === 0 ? (
          <Box className={styles.emptyState}>
            <Typography variant="body1" className={styles.emptyText}>
              עדיין לא יצרת קבוצות.
            </Typography>
            <Typography variant="body2" className={styles.emptySubText}>
              התחילי קבוצה חדשה לטיול, שותפים לדירה או אירוע – וננהל את ההוצאות
              יחד.
            </Typography>
          </Box>
        ) : (
          <div className={styles.groupsGrid}>
            {groups.map((g) => {
              const isDebt = g.balance < 0;
              const balanceDisplay = Math.abs(g.balance).toFixed(0);

              return (
                <Card
                  key={g.id}
                  onClick={() => goToGroup(g.id)}
                  className={styles.groupCard}
                  elevation={3}
                >
                  <CardContent className={styles.groupCardContent}>
                    <Typography
                      variant="h6"
                      className={styles.groupName}
                      gutterBottom
                    >
                      {g.name}
                    </Typography>

                    <Box className={styles.groupRow}>
                      <Chip
                        label={isDebt ? "חובה" : "זכות"}
                        className={isDebt ? styles.chipDebt : styles.chipCredit}
                        size="small"
                      />
                      <Typography className={styles.groupBalanceAmount}>
                        ₪{balanceDisplay}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </Box>

    </>
  );
}
