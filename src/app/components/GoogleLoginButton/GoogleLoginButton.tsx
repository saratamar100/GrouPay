import { signInWithGoogle } from "@/app/services/client/authHelpers";
import { addUser } from "@/app/services/client/login";
import { User } from "@/app/types/types";
import styles from "./GoogleLoginBotton.module.css"
interface GoogleLoginButtonProps {
  onLogIn: (user: User) => void;
}
const GoogleLoginButton = ({ onLogIn }: GoogleLoginButtonProps) => {
  const handleLogin = async () => {
    const user = await signInWithGoogle();
    if (user) {
      const userData = {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      };
      try {
        const addedUser = await addUser(userData);
        if (addedUser) {
          onLogIn(addedUser);
        }
      } catch (error) {
        console.error("Error sending user data to server:", error);
      }
    }
  };
  return <button className={styles.btn} onClick={handleLogin}>התחבר עם גוגל</button>;
};
export default GoogleLoginButton;
