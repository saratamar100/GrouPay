import { auth } from "./firebase";
import { GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";

export async function signInWithGoogle(): Promise<User | null> {
  const provider = new GoogleAuthProvider();

  provider.setCustomParameters({
    prompt: "select_account",
  });

  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: unknown) {
    console.error("שגיאה בהתחברות עם גוגל:", error);
    return null;
  }
}
