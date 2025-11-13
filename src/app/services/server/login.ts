import { getDb } from "./mongo";
import { User } from "@/app/types/types";

export async function addUser(user: any): Promise<[boolean, User]> {
  const db = await getDb("groupay_db");
  const users = db.collection("user");
  const existingUser = await users.findOne({ email: user.email });
  if (existingUser) {
    return [false, existingUser];
  }
  const result = await users.insertOne({ ...user, groupId: [] });
  return [true, { id: result.insertedId.toString(), ...user } ];
}
