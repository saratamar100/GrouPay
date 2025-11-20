import { ObjectId } from "mongodb";
import { getDb } from "./mongo";

export async function joinGroup(params: {
  groupId: string;
  userId: string;
  name: string;
}) {
  const { groupId, userId, name } = params;

  if (!groupId || !ObjectId.isValid(groupId)) {
    const err = new Error("Invalid or missing groupId");
    (err as any).status = 400;
    throw err;
  }

  if (!userId || typeof userId !== "string" || !name || typeof name !== "string") {
    const err = new Error("Missing user data");
    (err as any).status = 400;
    throw err;
  }

  if (!ObjectId.isValid(userId)) {
    const err = new Error("Invalid userId");
    (err as any).status = 400;
    throw err;
  }

  const userObjectId = new ObjectId(userId);
  const groupObjectId = new ObjectId(groupId);

  const db = await getDb("groupay_db");
  const groups = db.collection("group");
  const users = db.collection("user");

  const userInDb = await users.findOne({ _id: userObjectId });
  if (!userInDb) {
    const err = new Error("User does not exist in system");
    (err as any).status = 400;
    throw err;
  }

  const group = await groups.findOne(
    { _id: groupObjectId },
    { projection: { members: 1 } }
  );
  if (!group) {
    const err = new Error("Group not found");
    (err as any).status = 404;
    throw err;
  }

  const alreadyMember = (group.members || []).some(
    (m: any) => (m.id as ObjectId).equals(userObjectId)
  );

  if (alreadyMember) {
    return { ok: true, alreadyMember: true };
  }

  await groups.updateOne(
    { _id: groupObjectId },
    {
      $push: {
        members: { id: userObjectId, name },
      },
    }
  );

  await users.updateOne(
    { _id: userObjectId },
    {
      $addToSet: {
        groupId: groupObjectId,
      },
    }
  );

  return { ok: true, alreadyMember: false };
}
