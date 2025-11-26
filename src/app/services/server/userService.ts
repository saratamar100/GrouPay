import { getDb } from "./mongo";
import { User } from "@/app/types/types";
import { WithId, Document } from "mongodb";

export async function getAllUsersFromDB(): Promise<User[]> {
  try {
    const db = await getDb();
    const usersDocs = await db.collection("user").find({}).toArray();

    const users: User[] = usersDocs.map((doc: WithId<Document>) => {
      return {
        id: doc.id || doc._id.toString(),
        name: doc.name,
        email: doc.email,
        phone: doc.phone,
        photoURL: doc.photoURL || null,
      };
    });

    return users;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}
