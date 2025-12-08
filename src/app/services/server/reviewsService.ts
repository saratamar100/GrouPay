import { getDb } from "./mongo";

export async function getAllReviews() {
  const db = await getDb();
  return db.collection("reviews")
    .find({})
    .sort({ _id: -1 })
    .toArray();
}

export async function createReview(userName: string, content: string) {
  const db = await getDb();
  return db.collection("reviews").insertOne({ userName, content });
}
