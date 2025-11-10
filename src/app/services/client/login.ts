import { User } from "@/app/types/types";

export const addUser = async (userData: any): Promise<User | null> => {
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      console.error("Failed to add user:", response.statusText);
      return null;
    }
    const newUser: User = await response.json();
    return newUser;
  } catch (error) {
    console.error("Error adding user:", error);
    return null;
  }
};
