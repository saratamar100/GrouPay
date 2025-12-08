import { ObjectId } from "mongodb";
import { getDb } from "./mongo";
import { Debt } from "@/app/types/types";

export async function fetchGroupBalanceForUser(params: {
  groupId: string;
  currentUserId: string;
}) {
  const { groupId, currentUserId } = params;

  if (
    !ObjectId.isValid(groupId) ||
    !currentUserId ||
    !ObjectId.isValid(currentUserId)
  ) {
    return {
      status: 400,
      body: { error: "Invalid Group or User ID format" },
    };
  }

  const db = await getDb("groupay_db");
  const groupsCollection = db.collection("group");

  const group = await groupsCollection.findOne({
    _id: new ObjectId(groupId),
  });

  if (!group || !group.group_debts || typeof group.group_debts !== "object") {
    return {
      status: 404,
      body: { error: "Group or debts not found" },
    };
  }

  const myDebtsArray = group.group_debts[currentUserId];

  if (!myDebtsArray || myDebtsArray.length === 0) {
    return {
      status: 200,
      body: [] as Debt[],
    };
  }

  const otherUserObjectIds = myDebtsArray.map((d: any) => d.id);

  if (otherUserObjectIds.length === 0) {
    return {
      status: 200,
      body: [] as Debt[],
    };
  }

  const usersCollection = db.collection("user");
  const otherUsers = await usersCollection
    .find({ _id: { $in: otherUserObjectIds } })
    .toArray();

  const userMap = new Map<string, string>();
  otherUsers.forEach((user: any) => {
    userMap.set(user._id.toString(), user.name);
  });

  const finalDebts: Debt[] = myDebtsArray
    .map((debt: any) => {
      const memberIdString = debt.id.toString();
      const memberName = userMap.get(memberIdString) || "משתמש לא ידוע";

      return {
        member: {
          id: memberIdString,
          name: memberName,
        },
        amount: Number(debt.amount),
      };
    })
    .filter((d: Debt) => d.amount !== 0);

  return {
    status: 200,
    body: finalDebts,
  };
}
