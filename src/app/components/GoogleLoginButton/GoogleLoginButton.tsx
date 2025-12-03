"use client";
import { useState } from "react";
import { signInWithGoogle } from "@/app/services/client/authHelpers";
import { addUser } from "@/app/services/client/login";
import { User } from "@/app/types/types";
import { Button } from "@mui/material";

interface GoogleLoginButtonProps {
  onLogIn: (user: User) => void;
}

const GoogleLoginButton = ({ onLogIn }: GoogleLoginButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return; 
    setLoading(true);

    try {
      const user = await signInWithGoogle();
      if (!user) {
        setLoading(false);
        return;
      }

      const userData = {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      };

      const addedUser = await addUser(userData);
      if (addedUser) {
        onLogIn(addedUser);
      }
    } catch (error) {
      console.error("Error sending user data to server:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogin}
      variant="outlined"
      disabled={loading}
    >
      {loading ? "מתחבר..." : "התחבר עם גוגל"}
    </Button>
  );
};

export default GoogleLoginButton;
