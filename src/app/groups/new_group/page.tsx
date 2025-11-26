import { CreateGroupForm } from "../../components/Groups/CreateGroupForm";
import Header from "../../components/Header/Header";

export default async function CreateGroupPage() {
  return (
    <div>
      <Header />
      <main>
        <CreateGroupForm />
      </main>
    </div>
  );
}
