import { ObjectId } from "mongodb";
import { getDb } from "./mongo";

export async function getGroupMembers(groupId: string) {
  if (!groupId || !ObjectId.isValid(groupId)) {
    return {
      status: 400,
      body: { error: "מזהה קבוצה לא תקין" },
    };
  }

  const db = await getDb("groupay_db");
  const groups = db.collection("group");
  const users = db.collection("user");

  const group = await groups.findOne({ _id: new ObjectId(groupId) });

  if (!group) {
    return {
      status: 404,
      body: { error: "הקבוצה לא נמצאה" },
    };
  }

  const memberIds = (group as any).memberIds;

  if (!Array.isArray(memberIds) || memberIds.length === 0) {
    return {
      status: 200,
      body: {
        group,
        members: [],
      },
    };
  }

  const objectIds = memberIds.map((u: string) =>
    ObjectId.isValid(u) ? new ObjectId(u) : u
  );

  const members = await users
    .find(
      { _id: { $in: objectIds } },
      { projection: { _id: 1, name: 1, email: 1 } }
    )
    .toArray();

  return {
    status: 200,
    body: {
      groupId,
      members,
    },
  };
}

export async function addMemberToGroup(params: {
  groupId: string;
  userId: string;
}) {
  const { groupId, userId } = params;

  if (!groupId || !userId) {
    return {
      status: 400,
      body: { error: "groupId ו-userId דרושים" },
    };
  }

  if (!ObjectId.isValid(groupId) || !ObjectId.isValid(userId)) {
    return {
      status: 400,
      body: { error: "פורמט מזהה קבוצה או משתמש אינו תקין" },
    };
  }

  const db = await getDb("groupay_db");
  const groupsCollection = db.collection("group");
  const usersCollection = db.collection("user");

  const groupObjectId = new ObjectId(groupId);
  const userObjectId = new ObjectId(userId);

  const group = await groupsCollection.findOne({ _id: groupObjectId });

  if (!group) {
    return {
      status: 404,
      body: { error: "קבוצה לא נמצאה" },
    };
  }

  if ((group as any).members?.some((m: any) => m.id === userId)) {
    return {
      status: 200,
      body: { message: "המשתמש כבר חבר בקבוצה" },
    };
  }

  const user = await usersCollection.findOne({ _id: userObjectId });

  if (!user) {
    return {
      status: 404,
      body: { error: "משתמש לא נמצא" },
    };
  }

  await groupsCollection.updateOne(
    { _id: groupObjectId },
    { $push: { members: { id: userId, name: (user as any).name } } }
  );

  await usersCollection.updateOne(
    { _id: userObjectId },
    {
      $addToSet: { groupId: groupObjectId },
    }
  );

  return {
    status: 200,
    body: { message: "חבר נוסף בהצלחה" },
  };
}

export async function leaveGroup(params: { groupId: string; userId: string }) {
  const { groupId, userId } = params;

  if (!groupId || !userId) {
    return {
      status: 400,
      body: { message: "groupId ו-userId דרושים", ok: false },
    };
  }

  if (!ObjectId.isValid(groupId) || !ObjectId.isValid(userId)) {
    return {
      status: 400,
      body: { message: "פורמט מזהה קבוצה או משתמש אינו תקין", ok: false },
    };
  }

  const db = await getDb();
  const groupsCollection = db.collection("group");
  const usersCollection = db.collection("user");

  const groupObjectId = new ObjectId(groupId);
  const userObjectId = new ObjectId(userId);

  const group = await groupsCollection.findOne({ _id: groupObjectId });

  if (!group) {
    return {
      status: 404,
      body: { message: "קבוצה לא נמצאה", ok: false },
    };
  }

  const memberExists =
    Array.isArray(group.members) &&
    group.members.some((m: any) =>
      m.id instanceof ObjectId
        ? m.id.equals(userObjectId)
        : m.id?.toString() === userId
    );

  if (!memberExists) {
    return {
      status: 403,
      body: { message: "המשתמש לא חבר בקבוצה", ok: false },
    };
  }

  const hasExpenses =
    Array.isArray(group.expenses) && group.expenses.length > 0;
  const hasPayments =
    Array.isArray(group.payments) && group.payments.length > 0;
  const hasDebts =
    group.group_debts && Object.keys(group.group_debts || {}).length > 0;

  const canRemove =
    (!hasExpenses && !hasPayments) || (!group.isActive && !hasDebts);

  if (!canRemove) {
    return {
      status: 400,
      body: { message: "לא ניתן לצאת מקבוצה פעילה", ok: false },
    };
  }

  await groupsCollection.updateOne(
    { _id: groupObjectId },
    { $pull: { members: { id: userObjectId } } }
  );

  await usersCollection.updateOne(
    { _id: userObjectId },
    { $pull: { groupId: groupObjectId } }
  );

  const updatedGroup = await groupsCollection.findOne({ _id: groupObjectId });

  if (!updatedGroup?.members || updatedGroup.members.length === 0) {
    await groupsCollection.deleteOne({ _id: groupObjectId });
    return {
      status: 200,
      body: {
        message: "חבר הוסר והקבוצה נמחקה כי היא ריקה",
        ok: true,
      },
    };
  }

  return {
    status: 200,
    body: { message: "חבר הוסר בהצלחה", ok: true },
  };
}
