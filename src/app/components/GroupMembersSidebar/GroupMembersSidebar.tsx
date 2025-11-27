// "use client";

// import { Box, Divider, IconButton, List, ListItem, ListItemText, Typography, Button } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
// import styles from "./GroupMembersSidebar.module.css";

// type Member = {
//   id: string;
//   name: string;
// };

// type Props = {
//   open: boolean;
//   members: Member[];
//   currentUserId: string | undefined;
//   onClose: () => void;
// };

// export function GroupMembersSidebar({
//   open,
//   members,
//   currentUserId,
//   onClose,
// }: Props) {
//   if (!open) return null;

//   return (
//     <aside
//       className={`${styles.sidebar} ${
//         open ? styles.sidebarOpen : styles.sidebarClosed
//       }`}
//     >
//       <Box className={styles.sidebarHeader}>
//         <Typography variant="h6" className={styles.sidebarTitle}>
//           חברי הקבוצה
//         </Typography>

//         <IconButton size="small" onClick={onClose}>
//           <CloseIcon />
//         </IconButton>
//       </Box>

//       <Divider className={styles.sidebarDivider} />

//       <List className={styles.membersList}>
//         {members
//           .filter((m) => m.id !== currentUserId)
//           .map((m, index) => (
//             <ListItem key={`${m.id}-${index}`} className={styles.memberItem}>
//               <ListItemText
//                 primary={m.name}
//                 primaryTypographyProps={{
//                   className: styles.memberName,
//                 }}
//               />
//             </ListItem>
//           ))}
//       </List>

//       {/* כפתור הוספת חבר */}
//       <Box sx={{ padding: "8px", textAlign: "center" }}>
//         <Button
//           variant="contained"
//           color="primary"
//           sx={{ width: "100%" }}
//         >
//           הוסף חבר
//         </Button>
//       </Box>
//     </aside>
//   );
// }



// =================================


// "use client";

// import { Box, Divider, IconButton, List, ListItem, ListItemText, Typography, Button } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
// import styles from "./GroupMembersSidebar.module.css";

// type Member = {
//   id: string;
//   name: string;
// };

// type Props = {
//   open: boolean;
//   members: Member[];
//   currentUserId: string | undefined;
//   groupId: string; // הוספנו את הפרופ
//   onClose: () => void;
// };

// export function GroupMembersSidebar({
//   open,
//   members,
//   currentUserId,
//   groupId, // קבלת הפרופ
//   onClose,
// }: Props) {
//   if (!open) return null;

//   // הדפסת groupId לקונסול
//   console.log("Group ID:", groupId);

//   return (
//     <aside
//       className={`${styles.sidebar} ${
//         open ? styles.sidebarOpen : styles.sidebarClosed
//       }`}
//     >
//       <Box className={styles.sidebarHeader}>
//         <Typography variant="h6" className={styles.sidebarTitle}>
//           חברי הקבוצה
//         </Typography>

//         <IconButton size="small" onClick={onClose}>
//           <CloseIcon />
//         </IconButton>
//       </Box>

//       <Divider className={styles.sidebarDivider} />

//       <List className={styles.membersList}>
//         {members
//           .filter((m) => m.id !== currentUserId)
//           .map((m, index) => (
//             <ListItem key={`${m.id}-${index}`} className={styles.memberItem}>
//               <ListItemText
//                 primary={m.name}
//                 primaryTypographyProps={{
//                   className: styles.memberName,
//                 }}
//               />
//             </ListItem>
//           ))}
//       </List>

//       {/* כפתור הוספת חבר */}
//       <Box sx={{ padding: "8px", textAlign: "center" }}>
//         <Button
//           variant="contained"
//           color="primary"
//           sx={{ width: "100%" }}
//         >
//           הוסף חבר
//         </Button>
//       </Box>
//     </aside>
//   );
// }



// =========================


// "use client";

// import { useState, useEffect } from "react";
// import { Box, Divider, IconButton, List, ListItem, ListItemText, Typography, Button, TextField, CircularProgress } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
// import styles from "./GroupMembersSidebar.module.css";
// import { User } from "@/app/types/types";

// type Member = {
//   id: string;
//   name: string;
// };

// type Props = {
//   open: boolean;
//   members: Member[];
//   currentUserId: string | undefined;
//   groupId: string;
//   onClose: () => void;
// };

// export function GroupMembersSidebar({ open, members, currentUserId, groupId, onClose }: Props) {
//   const [isAdding, setIsAdding] = useState(false);
//   const [allUsers, setAllUsers] = useState<User[]>([]);
//   const [suggestions, setSuggestions] = useState<User[]>([]);
//   const [inputValue, setInputValue] = useState("");
//   const [localMembers, setLocalMembers] = useState<Member[]>(members);

//   useEffect(() => {
//     setLocalMembers(members);
//   }, [members]);

//   // טעינת כל המשתמשים פעם אחת
//   useEffect(() => {
//     async function loadUsers() {
//       try {
//         const res = await fetch("/api/users"); // נקודת קצה שמחזירה את כל המשתמשים
//         const data: User[] = await res.json();
//         setAllUsers(data);
//       } catch (err) {
//         console.error("Failed to load users:", err);
//       }
//     }
//     loadUsers();
//   }, []);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setInputValue(value);

//     if (!value.trim()) {
//       setSuggestions([]);
//       return;
//     }

//     const filtered = allUsers.filter(
//       (u) =>
//         (u.name.toLowerCase().includes(value.toLowerCase()) ||
//           u.email.toLowerCase().includes(value.toLowerCase())) &&
//         !localMembers.some((m) => m.id === u.id) &&
//         u.id !== currentUserId
//     );

//     setSuggestions(filtered.slice(0, 5));
//   };

//   const handleSelectUser = async (user: User) => {
//     setIsAdding(true);
//     try {
//       const res = await fetch("/api/groups/groupId/members", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ groupId, userId: user.id }),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setLocalMembers((prev) => [...prev, { id: user.id, name: user.name }]);
//         setInputValue("");
//         setSuggestions([]);
//       } else {
//         alert(data.error || data.message);
//       }
//     } catch (err) {
//       console.error(err);
//       alert("שגיאה בשרת");
//     } finally {
//       setIsAdding(false);
//     }
//   };

//   return !open ? null : (
//     <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : styles.sidebarClosed}`}>
//       <Box className={styles.sidebarHeader}>
//         <Typography variant="h6" className={styles.sidebarTitle}>חברי הקבוצה</Typography>
//         <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
//       </Box>

//       <Divider className={styles.sidebarDivider} />

//       <List className={styles.membersList}>
//         {localMembers
//           .filter((m) => m.id !== currentUserId)
//           .map((m, i) => (
//             <ListItem key={`${m.id}-${i}`} className={styles.memberItem}>
//               <ListItemText primary={m.name} primaryTypographyProps={{ className: styles.memberName }} />
//             </ListItem>
//           ))}
//       </List>

//       {/* כפתור הוספת חבר */}
//       <Box sx={{ padding: "8px", textAlign: "center" }}>
//         {!isAdding && (
//           <>
//             <TextField
//               value={inputValue}
//               onChange={handleInputChange}
//               placeholder="הוסף חבר לפי שם/מייל"
//               size="small"
//               fullWidth
//             />
//             {suggestions.length > 0 && (
//               <Box className={styles.suggestionsList}>
//                 {suggestions.map((user) => (
//                   <Box
//                     key={user.id}
//                     sx={{ padding: "4px 8px", cursor: "pointer", "&:hover": { backgroundColor: "#eee" } }}
//                     onClick={() => handleSelectUser(user)}
//                   >
//                     {user.name} ({user.email})
//                   </Box>
//                 ))}
//               </Box>
//             )}
//           </>
//         )}
//         {isAdding && <CircularProgress size={24} />}
//       </Box>
//     </aside>
//   );
// }


// ================================


"use client";

import { useState, useEffect } from "react";
import { Box, Divider, IconButton, List, ListItem, ListItemText, Typography, TextField, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import styles from "./GroupMembersSidebar.module.css";
import { User } from "@/app/types/types";
import { fetchAllUsers, addMemberToGroup } from "@/app/services/client/addUserService";

type Member = {
  id: string;
  name: string;
};

type Props = {
  open: boolean;
  members: Member[];
  currentUserId: string | undefined;
  groupId: string;
  onClose: () => void;
};

export function GroupMembersSidebar({ open, members, currentUserId, groupId, onClose }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [localMembers, setLocalMembers] = useState<Member[]>(members);

  useEffect(() => {
    setLocalMembers(members);
  }, [members]);

  // טעינת כל המשתמשים פעם אחת
  useEffect(() => {
    async function loadUsers() {
      try {
        const users = await fetchAllUsers();
        setAllUsers(users);
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    }
    loadUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = allUsers.filter(
      (u) =>
        (u.name.toLowerCase().includes(value.toLowerCase()) ||
          u.email.toLowerCase().includes(value.toLowerCase())) &&
        !localMembers.some((m) => m.id === u.id) &&
        u.id !== currentUserId
    );

    setSuggestions(filtered.slice(0, 5));
  };

  const handleSelectUser = async (user: User) => {
    setIsAdding(true);
    try {
      await addMemberToGroup(groupId, user.id);
      setLocalMembers((prev) => [...prev, { id: user.id, name: user.name }]);
      setInputValue("");
      setSuggestions([]);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "שגיאה בשרת");
    } finally {
      setIsAdding(false);
    }
  };

  if (!open) return null;

  return (
    <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : styles.sidebarClosed}`}>
      <Box className={styles.sidebarHeader}>
        <Typography variant="h6" className={styles.sidebarTitle}>חברי הקבוצה</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </Box>

      <Divider className={styles.sidebarDivider} />

      <List className={styles.membersList}>
        {localMembers
          .filter((m) => m.id !== currentUserId)
          .map((m, i) => (
            <ListItem key={`${m.id}-${i}`} className={styles.memberItem}>
              <ListItemText primary={m.name} primaryTypographyProps={{ className: styles.memberName }} />
            </ListItem>
          ))}
      </List>

      <Box sx={{ padding: "8px", textAlign: "center" }}>
        {!isAdding && (
          <>
            <TextField
              value={inputValue}
              onChange={handleInputChange}
              placeholder="הוסף חבר לפי שם/מייל"
              size="small"
              fullWidth
            />
            {suggestions.length > 0 && (
              <Box className={styles.suggestionsList}>
                {suggestions.map((user) => (
                  <Box
                    key={user.id}
                    sx={{ padding: "4px 8px", cursor: "pointer", "&:hover": { backgroundColor: "#eee" } }}
                    onClick={() => handleSelectUser(user)}
                  >
                    {user.name} ({user.email})
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
        {isAdding && <CircularProgress size={24} />}
      </Box>
    </aside>
  );
}




