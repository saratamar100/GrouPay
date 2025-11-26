import { getAllUsersFromDB } from "../../services/server/userService"; 
import { CreateGroupForm } from "../../components/Groups/CreateGroupForm";
import Header from "../../components/Header/Header";

export default async function CreateGroupPage() {
    const allUsers = await getAllUsersFromDB(); 

  return (
    <div>
      <Header />
      <main>
        <CreateGroupForm allUsers={allUsers} />
      </main>
    </div>
  );
}