"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, CircularProgress, Typography } from "@mui/material";

export default function JoinGroupPage() {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const groupId = params.groupId;

  useEffect(() => {
    if (!groupId) return;

    const run = async () => {
      const raw = localStorage.getItem("login-storage");

      if (!raw) {
        const next = `/${groupId}/join`;
        router.replace(`/login?next=${encodeURIComponent(next)}`);
        return;
      }

      try {
        const parsed = JSON.parse(raw);
        const user = parsed?.state?.loggedUser;
        const userId: string | undefined = user?._id;
        const name: string | undefined = user?.name;

        if (!userId || !name) {
          const next = `/${groupId}/join`;
          router.replace(`/login?next=${encodeURIComponent(next)}`);
          return;
        }

        await fetch(`/api/groups/${groupId}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, name }),
        });

        router.replace(`/groups/${groupId}`);
      } catch (err) {
        console.error("join error", err);
        router.replace(`/groups/${groupId}`);
      }
    };

    run();
  }, [groupId, router]);

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
