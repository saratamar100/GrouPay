// "use client";
// import { useEffect, useState, useMemo } from "react";
// import { getUserGroups } from "../services/client/dashboard";
// import { GroupShort } from "@/app/types/types";
// import { useLoginStore } from "../store/loginStore";

// import styles from "./dashboard.module.css";

// export default function DashboardTest() {
//   const [groups, setGroups] = useState<GroupShort[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   const user = useLoginStore((state) => state.loggedUser);

//   useEffect(() => {
//     if (!user) return;

//     const userId = (user as any)._id || (user as any).id;
//     if (!userId) {
//       console.warn("User has no ID field!");
//       return;
//     }


//     getUserGroups(userId)
//       .then(setGroups)
//       .catch((err) => setError(err.message));
//   }, [user]);

//   const totalBalance = useMemo(() => {
//     return groups.reduce((sum, g) => sum + g.balance, 0);
//   }, [groups]);


//   if (!user) return <div>טוען משתמש...</div>;
//   if (error) return <div>שגיאה: {error}</div>;

//   return (
//     <div className={styles.groupsContainer}>
      
//       <h2 className={styles.groupsHeader}>הקבוצות שלי</h2>
      
//       <div style={{ textAlign: 'right', marginBottom: '15px', color: '#004d40', fontWeight: 'bold' }}>
//         סך הכל: ₪{totalBalance.toFixed(0)}
//       </div>

//       {groups.length === 0 ? (
//         <p>לא נמצאו קבוצות</p>
//       ) : (
//         <ul className={styles.groupsList}>
//           {groups.map((g) => {
//             const isDebt = g.balance < 0;
//             const balanceDisplay = Math.abs(g.balance).toFixed(0);
            
//             return (
//               <li key={g.id} className={styles.groupItem}>
//                 <div className={styles.groupName}>{g.name}</div>
//                 <div className={styles.groupBalance}>
//                   <span className={isDebt ? styles.debt : styles.credit}>
//                      {isDebt ? "חובה" : "זכות"} 
//                   </span>
//                    - ₪{balanceDisplay}
//                 </div>
//               </li>
//             );
//           })}
//         </ul>
//       )}
//     </div>
//   );
// }

// =============================================================


// "use client";

// import { useEffect, useState, useMemo } from "react";
// import { getUserGroups } from "../services/client/dashboard";
// import { GroupShort } from "@/app/types/types";
// import { useLoginStore } from "../store/loginStore";

// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   Chip,
// } from "@mui/material";

// import styles from "./dashboard.module.css";

// export default function DashboardTest() {
//   const [groups, setGroups] = useState<GroupShort[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   const user = useLoginStore((state) => state.loggedUser);

//   useEffect(() => {
//     if (!user) return;

//     const userId = (user as any)._id || (user as any).id;
//     if (!userId) return;

//     getUserGroups(userId)
//       .then(setGroups)
//       .catch((err) => setError(err.message));
//   }, [user]);

//   const totalBalance = useMemo(() => {
//     return groups.reduce((sum, g) => sum + g.balance, 0);
//   }, [groups]);

//   if (!user) return <div>טוען משתמש...</div>;
//   if (error) return <div>שגיאה: {error}</div>;

//   return (
//     <Box className={styles.pageRoot}>
//       <Box className={styles.main}>

//         <Box className={styles.topBar}>
//           <Box className={styles.total}>
//             <Typography variant="body1">סה״כ:</Typography>
//             <strong>₪{totalBalance.toFixed(0)}</strong>
//           </Box>
//         </Box>

//         <Typography className={styles.title}>הקבוצות שלי</Typography>

//         {groups.length === 0 ? (
//           <Typography textAlign="center">לא נמצאו קבוצות</Typography>
//         ) : (
//           <div className={styles.groupsGrid}>
//             {groups.map((g) => {
//               const isDebt = g.balance < 0;
//               const balanceDisplay = Math.abs(g.balance).toFixed(0);

//               return (
//                 <Card
//                   key={g.id}
//                   className={styles.groupCard}
//                   sx={{
//                     cursor: "pointer",
//                     borderRadius: "12px",
//                     boxShadow: "0 3px 8px rgba(0,0,0,0.12)",
//                     textAlign: "right",
//                   }}
//                 >
//                   <CardContent>
//                     <Typography
//                       variant="h6"
//                       sx={{
//                         color: "#047680",
//                         fontWeight: 700,
//                         mb: 1,
//                       }}
//                     >
//                       {g.name}
//                     </Typography>

//                     <Box display="flex" alignItems="center" gap={1}>
//                       <Chip
//                         label={isDebt ? "חובה" : "זכות"}
//                         sx={{
//                           fontWeight: 700,
//                           color: isDebt ? "#c62828" : "#2e7d32",
//                           background: "#f2fdfd",
//                           border: `1px solid ${
//                             isDebt ? "#c62828" : "#2e7d32"
//                           }`,
//                         }}
//                       />

//                       <Typography fontWeight={600}>
//                          ₪{balanceDisplay}
//                       </Typography>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               );
//             })}
//           </div>
//         )}
//       </Box>
//     </Box>
//   );
// }


// =============================================================


// "use client";

// import { useEffect, useState, useMemo } from "react";
// import { getUserGroups } from "../services/client/dashboard";
// import { GroupShort } from "@/app/types/types";
// import { useLoginStore } from "../store/loginStore";
// import { useRouter } from "next/navigation";

// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   Chip,
// } from "@mui/material";

// import styles from "./dashboard.module.css";

// export default function DashboardTest() {
//   const [groups, setGroups] = useState<GroupShort[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   const user = useLoginStore((state) => state.loggedUser);
//   const router = useRouter();

//   useEffect(() => {
//     if (!user) return;

//     const userId = (user as any)._id || (user as any).id;
//     if (!userId) return;

//     getUserGroups(userId)
//       .then(setGroups)
//       .catch((err) => setError(err.message));
//   }, [user]);

//   const totalBalance = useMemo(() => {
//     return groups.reduce((sum, g) => sum + g.balance, 0);
//   }, [groups]);

//   if (!user) return <div>טוען משתמש...</div>;
//   if (error) return <div>שגיאה: {error}</div>;

//   const goToGroup = (id: string) => {
//     router.push(`/groups/${id}`);
//   };

//   return (
//     <Box className={styles.pageRoot}>
//       <Box className={styles.main}>

//         <Box className={styles.topBar}>
//           <Box className={styles.total}>
//             <Typography variant="body1">סה״כ:</Typography>
//             <strong>₪{totalBalance.toFixed(0)}</strong>
//           </Box>
//         </Box>

//         <Typography className={styles.title}>הקבוצות שלי</Typography>

//         {groups.length === 0 ? (
//           <Typography textAlign="center">לא נמצאו קבוצות</Typography>
//         ) : (
//           <div className={styles.groupsGrid}>
//             {groups.map((g) => {
//               const isDebt = g.balance < 0;
//               const balanceDisplay = Math.abs(g.balance).toFixed(0);

//               return (
//                 <Card
//                   key={g.id}
//                   onClick={() => goToGroup(g.id)}
//                   className={styles.groupCard}
//                   sx={{
//                     cursor: "pointer",
//                     borderRadius: "12px",
//                     boxShadow: "0 3px 8px rgba(0,0,0,0.12)",
//                     textAlign: "right",
//                   }}
//                 >
//                   <CardContent>
//                     <Typography
//                       variant="h6"
//                       sx={{
//                         color: "#047680",
//                         fontWeight: 700,
//                         mb: 1,
//                       }}
//                     >
//                       {g.name}
//                     </Typography>

//                     <Box display="flex" alignItems="center" gap={1}>
//                       <Chip
//                         label={isDebt ? "חובה" : "זכות"}
//                         sx={{
//                           fontWeight: 700,
//                           color: isDebt ? "#c62828" : "#2e7d32",
//                           background: "#f2fdfd",
//                           border: `1px solid ${
//                             isDebt ? "#c62828" : "#2e7d32"
//                           }`,
//                         }}
//                       />

//                       <Typography fontWeight={600}>
//                         ₪{balanceDisplay}
//                       </Typography>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               );
//             })}
//           </div>
//         )}
//       </Box>
//     </Box>
//   );
// }

// ================================================

// "use client";

// import { useEffect, useState, useMemo } from "react";
// import { getUserGroups } from "../services/client/dashboard";
// import { GroupShort } from "@/app/types/types";
// import { useLoginStore } from "../store/loginStore";
// import { useRouter } from "next/navigation";

// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   Chip,
//   Button
// } from "@mui/material";

// import styles from "./dashboard.module.css";

// export default function DashboardTest() {
//   const [groups, setGroups] = useState<GroupShort[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   const user = useLoginStore((state) => state.loggedUser);
//   const router = useRouter();

//   useEffect(() => {
//     if (!user) return;

//     const userId = (user as any)._id || (user as any).id;
//     if (!userId) return;

//     getUserGroups(userId)
//       .then(setGroups)
//       .catch((err) => setError(err.message));
//   }, [user]);

//   const totalBalance = useMemo(() => {
//     return groups.reduce((sum, g) => sum + g.balance, 0);
//   }, [groups]);

//   if (!user) return <div>טוען משתמש...</div>;
//   if (error) return <div>שגיאה: {error}</div>;

//   const goToGroup = (id: string) => {
//     router.push(`/dashboard/group/${id}`);
//   };

//   const goToCreateGroup = () => {
//     router.push("/groups/new_group");
//   };

//   return (
//     <Box className={styles.pageRoot}>
//       <Box className={styles.main}>

//         <Box className={styles.topBar}>
//           <Box className={styles.total}>
//             <Typography variant="body1">סה״כ:</Typography>
//             <strong>₪{totalBalance.toFixed(0)}</strong>
//           </Box>
//         </Box>

//         <Box
//           display="flex"
//           justifyContent="space-between"
//           alignItems="center"
//           mt={2}
//           mb={1}
//         >
//           <Typography className={styles.title}>הקבוצות שלי</Typography>

//           <Button
//             variant="contained"
//             sx={{
//               background: "#047680",
//               fontWeight: 600,
//               borderRadius: "12px",
//               paddingX: 2.5,
//               paddingY: 1,
//             }}
//             onClick={goToCreateGroup}
//           >
//             יצירת קבוצה חדשה
//           </Button>
//         </Box>

//         {groups.length === 0 ? (
//           <Typography textAlign="center">לא נמצאו קבוצות</Typography>
//         ) : (
//           <div className={styles.groupsGrid}>
//             {groups.map((g) => {
//               const isDebt = g.balance < 0;
//               const balanceDisplay = Math.abs(g.balance).toFixed(0);

//               return (
//                 <Card
//                   key={g.id}
//                   onClick={() => goToGroup(g.id)}
//                   className={styles.groupCard}
//                   sx={{
//                     cursor: "pointer",
//                     borderRadius: "12px",
//                     boxShadow: "0 3px 8px rgba(0,0,0,0.12)",
//                     textAlign: "right",
//                   }}
//                 >
//                   <CardContent>
//                     <Typography
//                       variant="h6"
//                       sx={{
//                         color: "#047680",
//                         fontWeight: 700,
//                         mb: 1,
//                       }}
//                     >
//                       {g.name}
//                     </Typography>

//                     <Box display="flex" alignItems="center" gap={1}>
//                       <Chip
//                         label={isDebt ? "חובה" : "זכות"}
//                         sx={{
//                           fontWeight: 700,
//                           color: isDebt ? "#c62828" : "#2e7d32",
//                           background: "#f2fdfd",
//                           border: `1px solid ${
//                             isDebt ? "#c62828" : "#2e7d32"
//                           }`,
//                         }}
//                       />

//                       <Typography fontWeight={600}>
//                         ₪{balanceDisplay}
//                       </Typography>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               );
//             })}
//           </div>
//         )}
//       </Box>
//     </Box>
//   );
// }



// ====================================================



"use client";

import { useEffect, useState, useMemo } from "react";
import { getUserGroups } from "../services/client/dashboard";
import { GroupShort } from "@/app/types/types";
import { useLoginStore } from "../store/loginStore";
import { useRouter } from "next/navigation";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button
} from "@mui/material";

import styles from "./dashboard.module.css";

export default function DashboardTest() {
  const [groups, setGroups] = useState<GroupShort[]>([]);
  const [error, setError] = useState<string | null>(null);

  const user = useLoginStore((state) => state.loggedUser);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    
    const userId = user ? user.id : null;
    if (!userId) return;

    getUserGroups(userId)
      .then(setGroups)
      .catch((err) => setError(err.message));
  }, [user]);

  const totalBalance = useMemo(() => {
    return groups.reduce((sum, g) => sum + g.balance, 0);
  }, [groups]);

  if (!user) return <div>טוען משתמש...</div>;
  if (error) return <div>שגיאה: {error}</div>;

  const goToGroup = (id: string) => {
    router.push(`/groups/${id}`);
  };

  const goToCreateGroup = () => {
    router.push("/groups/new_group");
  };

  return (
    <Box className={styles.pageRoot}>
      <Box className={styles.main}>

        <Box className={styles.topBar}>
          <Box className={styles.total}>
            <Typography variant="body1">סה״כ:</Typography>
            <strong>₪{totalBalance.toFixed(0)}</strong>
          </Box>
        </Box>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={2}
          mb={1}
        >
          <Typography className={styles.title}>הקבוצות שלי</Typography>

          <Button
            variant="contained"
            className={styles.buttonNewGroup}
            onClick={goToCreateGroup}
          >
            יצירת קבוצה חדשה
          </Button>
        </Box>

        {groups.length === 0 ? (
          <Typography textAlign="center">לא נמצאו קבוצות</Typography>
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
                >
                  <CardContent>
                    <Typography variant="h6" className={styles.groupName}>
                      {g.name}
                    </Typography>

                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={isDebt ? "חובה" : "זכות"}
                        className={isDebt ? styles.chipDebt : styles.chipCredit}
                      />

                      <Typography fontWeight={600}>
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
    </Box>
  );
}
