import { User } from "@/app/types/types";
import { getDb } from "./mongo";

export async function addUser(user: User): Promise<boolean> {
  const db = await getDb("groupay_db");
  const users = db.collection("user");
  await users.insertOne(user);
  return true;
}
