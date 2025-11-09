import { getDb } from "./services/server/mongo";
import { LandingPage } from "@/app/components/Home/LandingPage";

export default async function Home() {
  const db = await getDb();
  const result = await db.command({ ping: 1 });
  console.log(
    "Pinged your deployment. You successfully connected to MongoDB!",
    result
  );

  return <LandingPage />;
}
