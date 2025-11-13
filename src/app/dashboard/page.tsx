// "use client";
// import { useEffect, useState } from "react";
// import { getUserGroups } from "../services/client/dashboard";
// import { GroupShort } from "@/app/types/types";
// import { useLoginStore } from "../store/loginStore";

// export default function Dashboard() {
//   const [groups, setGroups] = useState<GroupShort[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   const user = useLoginStore((state) => state.loggedUser);
//   console.log("Logged user from store:", user);

//   useEffect(() => {
//     if (!user) return;

//     const userId = (user as any)._id || (user as any).id;
//     if (!userId) {
//       console.warn("User has no ID field!");
//       return;
//     }

//     console.log("Fetching groups for userId:", userId);

//     getUserGroups(userId)
//       .then(setGroups)
//       .catch((err) => setError(err.message));
//   }, [user]);

//   if (!user) return <div>Loading user...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div>
//       <h1>Welcome, {user.name}</h1>
//       <h2>Your Groups</h2>
//       {groups.length === 0 ? (
//         <p>No groups found</p>
//       ) : (
//         <ul>
//           {groups.map((g) => (
//             <li key={g.id}>
//               {g.name} - Balance: {g.balance}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }

"use client";
import { useEffect, useState, useMemo } from "react";
import { getUserGroups } from "../services/client/dashboard";
import { GroupShort } from "@/app/types/types";
import { useLoginStore } from "../store/loginStore";

// ייבוא קובץ ה-CSS Module
import styles from "./dashboard.module.css";
// הסרתי את כל קומפוננטות ה-Header וה-Summary שהיו בגרסה הקודמת כפי שביקשת.

export default function DashboardTest() {
  const [groups, setGroups] = useState<GroupShort[]>([]);
  const [error, setError] = useState<string | null>(null);

  const user = useLoginStore((state) => state.loggedUser);
  // console.log("Logged user from store:", user); // נשאר בפנים לצורך ניפוי שגיאות

  useEffect(() => {
    if (!user) return;

    const userId = (user as any)._id || (user as any).id;
    if (!userId) {
      console.warn("User has no ID field!");
      return;
    }

    // console.log("Fetching groups for userId:", userId); // נשאר בפנים לצורך ניפוי שגיאות

    getUserGroups(userId)
      .then(setGroups)
      .catch((err) => setError(err.message));
  }, [user]);

  const totalBalance = useMemo(() => {
    return groups.reduce((sum, g) => sum + g.balance, 0);
  }, [groups]);


  if (!user) return <div>טוען משתמש...</div>;
  if (error) return <div>שגיאה: {error}</div>;

  return (
    // עוטף את הכל במיכל כדי ליישם את ה-padding וה-max-width מה-CSS
    <div className={styles.groupsContainer}>
      
      {/* כותרת */}
      <h2 className={styles.groupsHeader}>הקבוצות שלי</h2>
      
      {/* סך הכל (כמו ה-6- בתמונה) */}
      <div style={{ textAlign: 'right', marginBottom: '15px', color: '#004d40', fontWeight: 'bold' }}>
        סך הכל: ₪{totalBalance.toFixed(0)}
      </div>

      {groups.length === 0 ? (
        <p>לא נמצאו קבוצות</p>
      ) : (
        // רשימת הקבוצות (המכילה את המלבנים)
        <ul className={styles.groupsList}>
          {groups.map((g) => {
            const isDebt = g.balance < 0;
            const balanceDisplay = Math.abs(g.balance).toFixed(0);
            
            return (
              // 🧱 מלבן הקבוצה 🧱
              <li key={g.id} className={styles.groupItem}>
                <div className={styles.groupName}>{g.name}</div>
                <div className={styles.groupBalance}>
                  {/* הצגת "חובה" או "זכות" */}
                  <span className={isDebt ? styles.debt : styles.credit}>
                     {isDebt ? "חובה" : "זכות"} 
                  </span>
                   - ₪{balanceDisplay}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}