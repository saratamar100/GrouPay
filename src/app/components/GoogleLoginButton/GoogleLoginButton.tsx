import { signInWithGoogle } from "@/app/services/client/authHelpers";

export default function GoogleLoginButton() {
  const handleLogin = async () => {
    const user = await signInWithGoogle();
    if (user) {
      console.log("מחובר כ:", user.email);
    }
    
  };
  return <button onClick={handleLogin}>התחבר עם גוגל</button>;
}
