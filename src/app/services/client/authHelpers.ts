import { auth } from "./firebase";
import { GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";

export async function signInWithGoogle(): Promise<User | null> {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    return user;
  } catch (error: unknown) {
    console.error("שגיאה בהתחברות עם גוגל:", error);
    return null;
  }
}
