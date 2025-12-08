"use client";

import CustomModal from "@/app/components/CustomModal/CustomModal";
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
  Modal,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import LinkIcon from "@mui/icons-material/Link";
import styles from "./GroupMembersSidebar.module.css";
import { User } from "@/app/types/types";
import {
  fetchAllUsers,
  addMemberToGroup,
} from "@/app/services/client/addUserService";
import { removeMemberFromGroup } from "@/app/services/client/removeMemberService";
import { updateGroupNameApi } from "@/app/services/client/groupService";

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
  onMemberAdded?: () => void;
  groupName: string;
  onGroupNameUpdated: (newName: string) => void;
};

export function GroupMembersSidebar({
  open,
  members,
  currentUserId,
  groupId,
  onClose,
  onMemberAdded,
  groupName,
  onGroupNameUpdated,
}: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [localMembers, setLocalMembers] = useState<Member[]>(members);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [cannotLeaveModalOpen, setCannotLeaveModalOpen] = useState(false);
  const [cannotLeaveMessage, setCannotLeaveMessage] = useState("");
  const [removeSuccessModalOpen, setRemoveSuccessModalOpen] = useState(false);
  const [removeSuccessMessage, setRemoveSuccessMessage] = useState("");

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInputValue, setNameInputValue] = useState(groupName);
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => setNameInputValue(groupName), [groupName]);

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

  const handleSaveName = async () => {
    const trimmedName = nameInputValue.trim();
    if (trimmedName.length < 2 || trimmedName === groupName) {
      setNameInputValue(groupName);
      setIsEditingName(false);
      return;
    }

    if (trimmedName.length < 2) {
      alert("שם הקבוצה חייב להיות באורך של 2 תווים לפחות.");
      return;
    }

    setIsSavingName(true);

    try {
      const result = await updateGroupNameApi(groupId, trimmedName);
      const newName = result.updatedName;
      onGroupNameUpdated(newName);
      setNameInputValue(newName);
      setIsEditingName(false);
    } catch (error: any) {
      console.error("Failed to save group name:", error);
      alert(error.message || "שגיאה בעדכון שם הקבוצה בשרת.");
      setNameInputValue(groupName);
      setIsEditingName(false);
    } finally {
      setIsSavingName(false);
    }
  };

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
    const data = await removeMemberFromGroup(groupId, userId);

    if (data.ok) {
      setRemoveSuccessMessage(data.message || "חבר הוסר בהצלחה");
      setRemoveSuccessModalOpen(true);
    } else {
      setCannotLeaveMessage(data.message || "לא ניתן להסיר את המשתמש");
      setCannotLeaveModalOpen(true);
    }
  };

  const handleSelectUser = async (user: User) => {
    setIsAdding(true);
    try {
      await addMemberToGroup(groupId, user.id);
      setLocalMembers((prev) => [...prev, { id: user.id, name: user.name }]);
      setInputValue("");
      setSuggestions([]);

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

    navigator.clipboard
      .writeText(inviteLink)
      .then(() => setCopyModalOpen(true))
      .catch((err) => {
        console.error("שגיאה בהעתקת הקישור: ", err);
        setCopyModalOpen(true);
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
    const body = encodeURIComponent(
      `היי! מצטרפים לקבוצה בקישור הבא:\n${baseUrl}/groups/${groupId}/join`
    );
    const gmailLink = `https://mail.google.com/mail/u/0/?fs=1&tf=cm&su=${subject}&body=${body}`;
    window.open(gmailLink, "_blank");
  };

  if (!open) return null;

  return (
    <>
      <aside className={styles.sidebar}>
        <Box className={styles.sidebarHeader}>
          {isEditingName ? (
            <TextField
              value={nameInputValue}
              onChange={(e) => setNameInputValue(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveName();
                  e.currentTarget.blur();
                }
              }}
              size="small"
              fullWidth
              variant="standard"
              autoFocus
              disabled={isSavingName}
              InputProps={{
                style: {
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  textAlign: "right",
                },
              }}
            />
          ) : (
            <Typography
              variant="h6"
              className={styles.sidebarTitle}
              onClick={() => setIsEditingName(true)}
              sx={{ cursor: "pointer", flexGrow: 1 }}
            >
              {nameInputValue}
            </Typography>
          )}

          {isSavingName ? (
            <CircularProgress size={24} sx={{ ml: 1 }} />
          ) : (
            <IconButton size="small" onClick={onClose} disabled={isSavingName}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>

        <Divider className={styles.sidebarDivider} />

        <List className={styles.membersList}>
          {localMembers
            .filter((m) => m.id === currentUserId)
            .map((m) => (
              <ListItem key={m.id} className={styles.memberItem}>
                <ListItemText
                  primary={`${m.name} (אני)`}
                  primaryTypographyProps={{ className: styles.memberName }}
                />
              </ListItem>
            ))}
          {localMembers
            .filter((m) => m.id !== currentUserId)
            .map((m, i) => (
              <ListItem key={`${m.id}-${i}`} className={styles.memberItem}>
                <ListItemText
                  primary={m.name}
                  primaryTypographyProps={{ className: styles.memberName }}
                />
              </ListItem>
            ))}
        </List>

        <Box className={styles.inputContainer}>
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
          {isAdding && <CircularProgress size={24} sx={{ my: 2 }} />}
        </Box>

        <Box className={styles.actionButtonBox}>
          <Button
            variant="contained"
            onClick={() => handleRemoveMember(currentUserId!)}
            className={styles.leaveGroupButton}
          >
            יציאה מהקבוצה
          </Button>
        </Box>

        <Box className={styles.actionButtonBox}>
          <Button
            variant="contained"
            onClick={handleOpenInvite}
            className={styles.inviteButton}
          >
            הזמן חברים
          </Button>
        </Box>
      </aside>

      <CustomModal open={inviteOpen} onClose={handleCloseInvite}>
        <Box className={styles.inviteModalIcons}>
          <IconButton
            onClick={handleWhatsAppShare}
            sx={{ fontSize: 40, color: "#067c80" }}
          >
            <WhatsAppIcon fontSize="large" />
          </IconButton>
          <IconButton
            onClick={handleEmailShare}
            sx={{ fontSize: 40, color: "#067c80" }}
          >
            <EmailIcon fontSize="large" />
          </IconButton>
          <IconButton
            onClick={handleCopyLink}
            sx={{ fontSize: 40, color: "#067c80" }}
          >
            <LinkIcon fontSize="large" />
          </IconButton>
        </Box>
        <Button
          variant="contained"
          className={styles.inviteModalButton}
          onClick={handleCloseInvite}
        >
          סגור
        </Button>
      </CustomModal>

      <CustomModal open={copyModalOpen} onClose={() => setCopyModalOpen(false)}>
        <h3 style={{ margin: 0 }}>הקישור הועתק!</h3>
        <p style={{ marginTop: "8px" }}>עכשיו ניתן לשלוח אותו לכל מי שצריך.</p>
        <Button
          variant="contained"
          onClick={() => setCopyModalOpen(false)}
          style={{ marginTop: "16px" }}
        >
          סגור
        </Button>
      </CustomModal>

      <CustomModal
        open={cannotLeaveModalOpen}
        onClose={() => setCannotLeaveModalOpen(false)}
      >
        <h3 style={{ margin: 0 }}></h3>
        <p style={{ marginTop: "8px" }}>{cannotLeaveMessage}</p>
        <Button
          variant="contained"
          onClick={() => setCannotLeaveModalOpen(false)}
          style={{ marginTop: "16px" }}
        >
          סגור
        </Button>
      </CustomModal>

      <CustomModal
        open={removeSuccessModalOpen}
        onClose={() => {
          setRemoveSuccessModalOpen(false);
          router.push("/dashboard");
        }}
      >
        <h3 style={{ margin: 0, textAlign: "center" }}>
          {removeSuccessMessage}
        </h3>
        <Box style={{ textAlign: "center", marginTop: "16px" }}>
          <Button
            variant="contained"
            onClick={() => {
              setRemoveSuccessModalOpen(false);
              router.push("/dashboard");
            }}
          >
            סגור
          </Button>
        </Box>
      </CustomModal>
    </>
  );
}
