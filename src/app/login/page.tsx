"use client";
import GoogleLoginButton from "../components/GoogleLoginButton/GoogleLoginButton";
import { useLoginStore } from "../store/loginStore";
import { User } from "../types/types";

const LoginPage = () => {
  const loginStore = useLoginStore();
  const handleLogin = (user: User) => {
    loginStore.setLoggedUser(user);
  };
  return (
    <div>
      <GoogleLoginButton onLogIn={handleLogin} />
    </div>
  );
};

export default LoginPage;
