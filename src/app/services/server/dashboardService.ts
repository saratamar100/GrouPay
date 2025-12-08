import { ObjectId } from "mongodb";
import { getDb } from "./mongo";

export async function fetchUserGroupsWithBalance(userId: string) {
  if (!userId) {
    return {
      status: 400,
      body: { error: "Missing userId" },
    };
  }

  const db = await getDb();

  const userObjectId = new ObjectId(userId);
  const user = await db.collection("user").findOne({ _id: userObjectId });

  if (!user) {
    return {
      status: 404,
      body: { error: "User not found" },
    };
  }

  if (!Array.isArray(user.groupId)) {
    return {
      status: 500,
      body: { error: "Invalid user.groupId format" },
    };
  }

  const groupObjectIds = user.groupId.map((id: string) => new ObjectId(id));

  const groups = await db
    .collection("group")
    .find({ _id: { $in: groupObjectIds } })
    .toArray();

  const result = groups
    .map((group: any) => {
      const userDebtsArray = group.group_debts?.[userId];

      if (!Array.isArray(userDebtsArray)) {
        return {
          groupId: group._id,
          groupName: group.name,
          balance: 0,
          isActive: group.isActive,
        };
      }

      const balance = userDebtsArray.reduce(
        (sum: number, d: any) => sum + (d.amount || 0),
        0
      );

      return {
        groupId: group._id,
        groupName: group.name,
        balance,
        isActive: group.isActive,
      };
    })
    .filter(Boolean);

  return {
    status: 200,
    body: result,
  };
}
