"use client";

import { Box, Divider, IconButton, List, ListItem, ListItemText, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import styles from "./GroupMembersSidebar.module.css";

type Member = {
  id: string;
  name: string;
};

type Props = {
  open: boolean;
  members: Member[];
  currentUserId: string | undefined;
  onClose: () => void;
};

export  function GroupMembersSidebar({
  open,
  members,
  currentUserId,
  onClose,
}: Props) {
  if (!open) return null;

  return (
<aside
  className={`${styles.sidebar} ${
    open ? styles.sidebarOpen : styles.sidebarClosed
  }`}
>
      <Box className={styles.sidebarHeader}>
        <Typography variant="h6" className={styles.sidebarTitle}>
          חברי הקבוצה
        </Typography>

        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider className={styles.sidebarDivider} />

      <List className={styles.membersList}>
        {members
          .filter((m) => m.id !== currentUserId)
          .map((m, index) => (
            <ListItem key={`${m.id}-${index}`} className={styles.memberItem}>
              <ListItemText
                primary={m.name}
                primaryTypographyProps={{
                  className: styles.memberName,
                }}
              />
            </ListItem>
          ))}
      </List>
    </aside>
  );
}
