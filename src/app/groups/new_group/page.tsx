import { getDb } from "../../services/server/mongo";
import { User } from "@/app/types/types";
import { CreateGroupForm } from "../../components/Groups/CreateGroupForm";
// import Header from "../../components/Header/Header";
import { WithId, Document } from "mongodb";

async function getAllUsers(): Promise<User[]> {
  try {
    const db = await getDb();
    const usersDocs = await db.collection("user").find({}).toArray();

    const users: User[] = usersDocs.map((doc: WithId<Document>) => {
      return {
        id: doc.id || doc._id.toString(),
        name: doc.name,
        email: doc.email,
        phone: doc.phone,
        passwordHash: doc.passwordHash,
        groupIds: doc.groupIds,
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
      {/* <Header /> */}
      <main>
        <h1>Create New Group</h1>

        {/* 2. העברת המשתמשים כ-prop לקומפוננטת הטופס */}
        {/* אנו מעבירים 'allUsers' כדי שהטופס יוכל להציג רשימה לבחירה */}
        <CreateGroupForm allUsers={allUsers} />
      </main>
    </div>
  );
}
