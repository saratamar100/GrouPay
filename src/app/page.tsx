import { getDb } from "./services/server/mongo";

export default async function Home() {
  const db = await getDb();
  const result = await db.command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!", result);

  return (
    <>
      <h1>Hello world</h1>
    </>
  );
}
