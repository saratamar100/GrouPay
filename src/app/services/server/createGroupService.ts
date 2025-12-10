import { ObjectId } from "mongodb";
import { getDb } from "./mongo";
import type { Group, Member } from "@/app/types/types";

export async function createGroup(params: {
  name: string;
  memberIds: string[];
  notifications?: boolean;
  isActive?: boolean;
  budget? : number
}) {
  const { name, memberIds, notifications ,budget } = params;

  if (!name || !memberIds || memberIds.length === 0) {
    return {
      status: 400,
      body: { message: "Name and at least one memberId are required" },
    };
  }

  const db = await getDb("groupay_db");
  const groupsCollection = db.collection("group");
  const usersCollection = db.collection("user");

  const memberObjectIds = memberIds
    .map((id) => (ObjectId.isValid(id) ? new ObjectId(id) : null))
    .filter((id) => id !== null) as ObjectId[];

  const users = await usersCollection
    .find({ _id: { $in: memberObjectIds } })
    .toArray();

  const membersForDB = users.map((user: any) => ({
    id: user._id,
    name: user.name,
  }));

  const newGroupData = {
    name,
    members: membersForDB,
    expenses: [],
    payments: [],
    group_debts: {},
    isActive: true,
    notifications: notifications ?? true,
    ...(budget !== undefined ? { budget } : {}),

  };
  const insertResult = await groupsCollection.insertOne(newGroupData);
  const newGroupIdAsObjectId = insertResult.insertedId;

  await usersCollection.updateMany(
    { _id: { $in: memberObjectIds } },
    { $push: { groupId: newGroupIdAsObjectId } }
  );

  const membersForClient: Member[] = membersForDB.map((member: any) => ({
    id: member.id.toString(),
    name: member.name,
  }));

  const createdGroup: Group = {
    id: newGroupIdAsObjectId.toString(),
    name: newGroupData.name,
    members: membersForClient,
    expenses: newGroupData.expenses,
    isActive: newGroupData.isActive,
    notifications: newGroupData.notifications,
  };

  return {
    status: 201,
    body: createdGroup,
  };
}
