import { group } from "console";
import { getDb } from "./mongo";
import { User } from "@/app/types/types";

export async function addUser(user: User): Promise<boolean> {
  const db = await getDb("groupay_db");
  const users = db.collection("user");
  const existingUser = await users.findOne({ email: user.email });
  if (existingUser) {
    console.log("User already exists:", user.email);
    return false;
  }
  await users.insertOne({ ...user, groupId: [] });
  console.log("User added:", user.email);
  return true;
}
