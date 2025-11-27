import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types/types";

interface LoginState {
  loggedUser: User | null;
  setLoggedUser: (user: User | null) => void;
  logout: () => void;
}

export const useLoginStore = create<LoginState>()(
  persist(
    (set) => ({
      loggedUser: null,
      setLoggedUser: (user) => set({ loggedUser: user }),
      logout: () => set({ loggedUser: null }),
    }),
    {
      name: "login-storage",
    }
  )
);
