// "use client";

// import { useRouter } from "next/navigation"; 
// import { useState, useEffect } from "react";
// import {
//   Box,
//   Divider,
//   IconButton,
//   List,
//   ListItem,
//   ListItemText,
//   Typography,
//   TextField,
//   CircularProgress,
//   Button,
//   Modal
// } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
// import WhatsAppIcon from "@mui/icons-material/WhatsApp";
// import EmailIcon from "@mui/icons-material/Email";
// import LinkIcon from "@mui/icons-material/Link";
// import styles from "./GroupMembersSidebar.module.css";
// import { User } from "@/app/types/types";
// import { fetchAllUsers, addMemberToGroup } from "@/app/services/client/addUserService";
// import { removeMemberFromGroup } from "@/app/services/client/removeMemberService";

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
//   const [inviteOpen, setInviteOpen] = useState(false);

//   const router = useRouter(); 

//   useEffect(() => setLocalMembers(members), [members]);

//   useEffect(() => {
//     async function loadUsers() {
//       try {
//         const users = await fetchAllUsers();
//         setAllUsers(users);
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

//   const handleRemoveMember = async (userId: string) => {
//     try {
//       await removeMemberFromGroup(groupId, userId);
//       router.push("/dashboard");
//     } catch (err: any) {
//       alert(err.message || "שגיאה בהסרת המשתמש");
//     }
//   };

//   const handleSelectUser = async (user: User) => {
//     setIsAdding(true);
//     try {
//       await addMemberToGroup(groupId, user.id);
//       setLocalMembers((prev) => [...prev, { id: user.id, name: user.name }]);
//       setInputValue("");
//       setSuggestions([]);
//     } catch (err: any) {
//       console.error(err);
//       alert(err.message || "שגיאה בשרת");
//     } finally {
//       setIsAdding(false);
//     }
//   };

//   const handleOpenInvite = () => setInviteOpen(true);
//   const handleCloseInvite = () => setInviteOpen(false);

//   const baseUrl = window.location.origin;

//   const handleCopyLink = () => {
//     const inviteLink = `${baseUrl}/groups/${groupId}/join`;
//     navigator.clipboard.writeText(inviteLink)
//       .then(() => alert("קישור הועתק בהצלחה ללוח!"))
//       .catch((err) => {
//         console.error("שגיאה בהעתקת הקישור: ", err);
//         alert("לא הצלחנו להעתיק את הקישור");
//       });
//   };

//   const handleWhatsAppShare = () => {
//     const inviteLink = `${baseUrl}/groups/${groupId}/join`;
//     const text = `היי! מוזמן להצטרף לקבוצה שלי:\n${inviteLink}`;
//     const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
//     window.open(url, "_blank");
//   };

//   const handleEmailShare = () => {
//     const subject = encodeURIComponent("הזמנה לקבוצה");
//     const body = encodeURIComponent(`היי! מצטרפים לקבוצה בקישור הבא:\n${baseUrl}/groups/${groupId}/join`);
//     const gmailLink = `https://mail.google.com/mail/u/0/?fs=1&tf=cm&su=${subject}&body=${body}`;
//     window.open(gmailLink, "_blank");
//   };

//   if (!open) return null;

//   return (
//     <>
//       <aside className={`${styles.sidebar}`}>
//         <Box className={styles.sidebarHeader}>
//           <Typography variant="h6" className={styles.sidebarTitle}>חברי הקבוצה</Typography>
//           <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
//         </Box>

//         <Divider className={styles.sidebarDivider} />

//         <List className={styles.membersList}>
//           {localMembers.filter((m) => m.id !== currentUserId).map((m, i) => (
//             <ListItem key={`${m.id}-${i}`} className={styles.memberItem}>
//               <ListItemText primary={m.name} primaryTypographyProps={{ className: styles.memberName }} />
//             </ListItem>
//           ))}
//         </List>

//         <Box className="p-2 text-center">
//           {!isAdding && (
//             <>
//               <TextField
//                 value={inputValue}
//                 onChange={handleInputChange}
//                 placeholder="הוסף חבר לפי שם/מייל"
//                 size="small"
//                 fullWidth
//               />
//               {suggestions.length > 0 && (
//                 <Box className={styles.suggestionsList}>
//                   {suggestions.map((user) => (
//                     <Box
//                       key={user.id}
//                       className={styles.suggestionItem}
//                       onClick={() => handleSelectUser(user)}
//                     >
//                       {user.name} ({user.email})
//                     </Box>
//                   ))}
//                 </Box>
//               )}
//             </>
//           )}
//           {isAdding && <CircularProgress size={24} />}
//         </Box>

//         <Box className="p-2 text-center">
//           <Button variant="contained" onClick={() => handleRemoveMember(currentUserId!)}>
//             יציאה מהקבוצה
//           </Button>
//         </Box>

//         <Box className="p-2 text-center">
//           <Button variant="contained" className={styles.inviteModalButton} onClick={handleOpenInvite}>
//             הזמן חברים
//           </Button>
//         </Box>
//       </aside>

//       {/* מודאל */}
//       <Modal open={inviteOpen} onClose={handleCloseInvite}>
//         <Box className={styles.inviteModal}>
//           <Box className={styles.inviteModalIcons}>
//             <IconButton onClick={handleWhatsAppShare} sx={{ fontSize: 40, color: "#067c80" }}>
//               <WhatsAppIcon fontSize="large" />
//             </IconButton>
//             <IconButton onClick={handleEmailShare} sx={{ fontSize: 40, color: "#067c80" }}>
//               <EmailIcon fontSize="large" />
//             </IconButton>
//             <IconButton onClick={handleCopyLink} sx={{ fontSize: 40, color: "#067c80" }}>
//               <LinkIcon fontSize="large" />
//             </IconButton>
//           </Box>
//           <Button variant="contained" className={styles.inviteModalButton} onClick={handleCloseInvite}>
//             סגור
//           </Button>
//         </Box>
//       </Modal>
//     </>
//   );
// }



"use client";

import { useRouter } from "next/navigation"; 
import { useState, useEffect } from "react";
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  TextField,
  CircularProgress,
  Button,
  Modal
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import LinkIcon from "@mui/icons-material/Link";
import styles from "./GroupMembersSidebar.module.css";
import { User } from "@/app/types/types";
import { fetchAllUsers, addMemberToGroup } from "@/app/services/client/addUserService";
import { removeMemberFromGroup } from "@/app/services/client/removeMemberService";

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
  onMemberAdded?: () => void; // חדש
};

export function GroupMembersSidebar({ open, members, currentUserId, groupId, onClose, onMemberAdded }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [localMembers, setLocalMembers] = useState<Member[]>(members);
  const [inviteOpen, setInviteOpen] = useState(false);

  const router = useRouter(); 

  useEffect(() => setLocalMembers(members), [members]);

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

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMemberFromGroup(groupId, userId);
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message || "שגיאה בהסרת המשתמש");
    }
  };

  const handleSelectUser = async (user: User) => {
    setIsAdding(true);
    try {
      await addMemberToGroup(groupId, user.id);
      setLocalMembers((prev) => [...prev, { id: user.id, name: user.name }]);
      setInputValue("");
      setSuggestions([]);

      // חדש - קורא ל-reload של הדף הראשי
      if (typeof onMemberAdded === "function") {
        onMemberAdded();
      }

    } catch (err: any) {
      console.error(err);
      alert(err.message || "שגיאה בשרת");
    } finally {
      setIsAdding(false);
    }
  };

  const handleOpenInvite = () => setInviteOpen(true);
  const handleCloseInvite = () => setInviteOpen(false);

  const baseUrl = window.location.origin;

  const handleCopyLink = () => {
    const inviteLink = `${baseUrl}/groups/${groupId}/join`;
    navigator.clipboard.writeText(inviteLink)
      .then(() => alert("קישור הועתק בהצלחה ללוח!"))
      .catch((err) => {
        console.error("שגיאה בהעתקת הקישור: ", err);
        alert("לא הצלחנו להעתיק את הקישור");
      });
  };

  const handleWhatsAppShare = () => {
    const inviteLink = `${baseUrl}/groups/${groupId}/join`;
    const text = `היי! מוזמן להצטרף לקבוצה שלי:\n${inviteLink}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent("הזמנה לקבוצה");
    const body = encodeURIComponent(`היי! מצטרפים לקבוצה בקישור הבא:\n${baseUrl}/groups/${groupId}/join`);
    const gmailLink = `https://mail.google.com/mail/u/0/?fs=1&tf=cm&su=${subject}&body=${body}`;
    window.open(gmailLink, "_blank");
  };

  if (!open) return null;

  return (
    <>
      <aside className={`${styles.sidebar}`}>
        <Box className={styles.sidebarHeader}>
          <Typography variant="h6" className={styles.sidebarTitle}>חברי הקבוצה</Typography>
          <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
        </Box>

        <Divider className={styles.sidebarDivider} />

        <List className={styles.membersList}>
          {localMembers.filter((m) => m.id !== currentUserId).map((m, i) => (
            <ListItem key={`${m.id}-${i}`} className={styles.memberItem}>
              <ListItemText primary={m.name} primaryTypographyProps={{ className: styles.memberName }} />
            </ListItem>
          ))}
        </List>

        <Box className="p-2 text-center">
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
                      className={styles.suggestionItem}
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

        <Box className="p-2 text-center">
          <Button variant="contained" onClick={() => handleRemoveMember(currentUserId!)}>
            יציאה מהקבוצה
          </Button>
        </Box>

        <Box className="p-2 text-center">
          <Button variant="contained" className={styles.inviteModalButton} onClick={handleOpenInvite}>
            הזמן חברים
          </Button>
        </Box>
      </aside>

      {/* מודאל */}
      <Modal open={inviteOpen} onClose={handleCloseInvite}>
        <Box className={styles.inviteModal}>
          <Box className={styles.inviteModalIcons}>
            <IconButton onClick={handleWhatsAppShare} sx={{ fontSize: 40, color: "#067c80" }}>
              <WhatsAppIcon fontSize="large" />
            </IconButton>
            <IconButton onClick={handleEmailShare} sx={{ fontSize: 40, color: "#067c80" }}>
              <EmailIcon fontSize="large" />
            </IconButton>
            <IconButton onClick={handleCopyLink} sx={{ fontSize: 40, color: "#067c80" }}>
              <LinkIcon fontSize="large" />
            </IconButton>
          </Box>
          <Button variant="contained" className={styles.inviteModalButton} onClick={handleCloseInvite}>
            סגור
          </Button>
        </Box>
      </Modal>
    </>
  );
}
