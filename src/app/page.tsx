import { getDb } from "./services/server/mongo";
import { LandingPage } from "@/app/components/Home/LandingPage";
import { Suspense } from "react";


export default async function Home() {
  // const db = await getDb();
  // const result = await db.command({ ping: 1 });
  // console.log(
  //   "Pinged your deployment. You successfully connected to MongoDB!",
  //   result
  // );
  return (

    <Suspense>
      <LandingPage/>
    </Suspense>

  )
  
}
