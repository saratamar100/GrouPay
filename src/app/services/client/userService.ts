import { User } from "@/app/types/types";

export async function fetchAllUsers(): Promise<User[]> {
  const res = await fetch("/api/users");

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ message: "Unknown API error" }));
    throw new Error(
      `Failed to fetch users: ${errorData.message || res.statusText}`
    );
  }

  const data: User[] = await res.json();
  return data;
}
