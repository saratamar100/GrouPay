"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, CircularProgress, Typography } from "@mui/material";
import { joinGroup } from "@/app/services/client/linkService";
import { useLoginStore } from "@/app/store/loginStore";

export default function JoinGroupPage() {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const groupId = params.groupId;

  const currentUser = useLoginStore((state) => state.loggedUser);
  const userId = currentUser ? currentUser.id : null;
  const name = currentUser ? currentUser.name : null;

  
  useEffect(() => {
    if (!groupId) return;

    const run = async () => {
      const next = `/groups/${groupId}/join`;

      if (!userId || !name) {
        router.replace(`/?next=${encodeURIComponent(next)}`);
        return;
      }

      try {
        await joinGroup(groupId, userId, name);
      } catch (err) {
        console.error("join error", err);
      } finally {
        router.replace(`/groups/${groupId}`);
      }
    };

    run();
  }, [groupId, router, userId, name]);

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        textAlign: "center",
      }}
    >
     {userId && ( 
      <>
        <CircularProgress aria-label="מצרף אותך לקבוצה..." />
        <Typography>מצרפים אותך לקבוצה…</Typography>
      </>
)}

    </Container>
  );
}
