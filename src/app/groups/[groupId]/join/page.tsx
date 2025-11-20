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
  const userId =
    currentUser ? ((currentUser as any)._id || (currentUser as any).id) : undefined;
  const name = currentUser?.name;

  useEffect(() => {
    if (!groupId) return;

    const run = async () => {
      const next = `/groups/${groupId}/join`;

      if (!currentUser || !userId || !name) {
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
  }, [groupId, router, currentUser, userId, name]);

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
      <CircularProgress aria-label="מצרף אותך לקבוצה..." />
      <Typography>מצרפים אותך לקבוצה…</Typography>
    </Container>
  );
}
