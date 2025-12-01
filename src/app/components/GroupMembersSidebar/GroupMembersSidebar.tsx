"use client";

import { useRouter } from "next/navigation"; 
import { useState, useEffect } from "react";
import { Box, Divider, IconButton, List, ListItem, ListItemText, Typography, TextField, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import styles from "./GroupMembersSidebar.module.css";
import { User } from "@/app/types/types";
import { fetchAllUsers, addMemberToGroup } from "@/app/services/client/addUserService";
import { Button } from "@mui/material"; 
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
};

export function GroupMembersSidebar({ open, members, currentUserId, groupId, onClose }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [localMembers, setLocalMembers] = useState<Member[]>(members);

  const router = useRouter(); 

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

  const handleRemoveMember = async (userId: string) => {
    console.log("in func", userId, groupId)
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
      <Box sx={{ padding: "8px", textAlign: "center" }}>
        <Button variant="contained" onClick={() => handleRemoveMember(currentUserId!)}>
          יציאה מהקבוצה
        </Button>
      </Box>

    </aside>
  );
}




