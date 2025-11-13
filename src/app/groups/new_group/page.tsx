import { getDb } from "../../services/server/mongo";
import { User } from "@/app/types/types";
import { CreateGroupForm } from "../../components/Groups/CreateGroupForm";
import Header from "../../components/Header/Header";
import { WithId, Document } from "mongodb";

async function getAllUsers(): Promise<User[]> {
  try {
    const db = await getDb();
    const usersDocs = await db.collection("user").find({}).toArray();

    const users: User[] = usersDocs.map((doc: WithId<Document>) => {
      return {
        id: doc.id  || doc._id.toString(),
        name: doc.name,
        email: doc.email,
        phone: doc.phone,
        photoURL: doc.photoURL ||  null,
      };
    });

    return users;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export default async function CreateGroupPage() {
  const allUsers = await getAllUsers();

  return (
    <div>
      <Header />
      <main>
        <CreateGroupForm allUsers={allUsers} />
      </main>
    </div>
  );
}
