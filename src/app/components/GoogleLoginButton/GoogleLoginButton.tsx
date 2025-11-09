import { signInWithGoogle } from "@/app/services/client/authHelpers";
import { addUser } from "@/app/services/client/login";

export default function GoogleLoginButton() {
  const handleLogin = async () => {
    const user = await signInWithGoogle();
    if (user) {
      const userData = {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      };
      try {
        addUser(userData);
      } catch (error) {
        console.error("Error sending user data to server:", error);
      }
    }
  };
  return <button onClick={handleLogin}>התחבר עם גוגל</button>;
}
