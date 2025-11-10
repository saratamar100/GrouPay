import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../types/types";

interface LoginState {
  loggedUser: User | null;
  setLoggedUser: (user: User | null) => void;
}

export const useLoginStore = create<LoginState>()(
  persist(
    (set) => ({
      loggedUser: null,
      setLoggedUser: (user) => set({ loggedUser: user }),
    }),
    {
      name: "login-storage", 
    }
  )
);
