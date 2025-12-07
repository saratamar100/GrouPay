// import { NextRequest, NextResponse } from "next/server";
// import { getDb } from "@/app/services/server/mongo";
// import { ObjectId } from "mongodb";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { groupId, userId } = body;

//     if (!groupId || !userId) {
//       return NextResponse.json(
//         { error: "groupId ו-userId דרושים" },
//         { status: 400 }
//       );
//     }

//     const db = await getDb();
//     const groupsCollection = db.collection("group");
//     const usersCollection = db.collection("user");

//     const group = await groupsCollection.findOne({ _id: new ObjectId(groupId) });
//     if (!group) {
//       return NextResponse.json({ error: "קבוצה לא נמצאה" }, { status: 404 });
//     }

//     const memberExists = group.members?.some((m: any) => m.id.equals(new ObjectId(userId)));
//     if (!memberExists) {
//       return NextResponse.json({ message: "המשתמש לא חבר בקבוצה" });
//     }

//     const canRemove =
//       (Array.isArray(group.expenses) && group.expenses.length === 0 &&
//        Array.isArray(group.payments) && group.payments.length === 0) ||
//       (!group.isActive && Object.keys(group.group_debts || {}).length === 0);

//     if (!canRemove) {
//       return NextResponse.json({ message: "לא ניתן להסיר את המשתמש – התנאים לא מתקיימים" }, { status: 400 });
//     }

//     await groupsCollection.updateOne(
//       { _id: new ObjectId(groupId) },
//       { $pull: { members: { id: new ObjectId(userId) } } }
//     );

//     await usersCollection.updateOne(
//       { _id: new ObjectId(userId) },
//       { $pull: { groupId: new ObjectId(groupId) } }
//     );

//     const updatedGroup = await groupsCollection.findOne({ _id: new ObjectId(groupId) });
//     if (!updatedGroup.members || updatedGroup.members.length === 0) {
//       await groupsCollection.deleteOne({ _id: new ObjectId(groupId) });
//       return NextResponse.json({ message: "חבר הוסר והקבוצה נמחקה כי היא ריקה" });
//     }

//     return NextResponse.json({ message: "חבר הוסר בהצלחה" });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/services/server/mongo";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { groupId, userId } = body;

    if (!groupId || !userId) {
      return NextResponse.json({ message: "groupId ו-userId דרושים" });
    }

    const db = await getDb();
    const groupsCollection = db.collection("group");
    const usersCollection = db.collection("user");

    const group = await groupsCollection.findOne({ _id: new ObjectId(groupId) });
    if (!group) {
      return NextResponse.json({ message: "קבוצה לא נמצאה" });
    }

    const memberExists = group.members?.some((m: any) => m.id.equals(new ObjectId(userId)));
    if (!memberExists) {
      return NextResponse.json({ message: "המשתמש לא חבר בקבוצה" });
    }

    const canRemove =
      (Array.isArray(group.expenses) && group.expenses.length === 0 &&
       Array.isArray(group.payments) && group.payments.length === 0) ||
      (!group.isActive && Object.keys(group.group_debts || {}).length === 0);

    if (!canRemove) {
      return NextResponse.json({ message: "לא ניתן לצאת מקבוצה פעילה", ok: false });
    }

    await groupsCollection.updateOne(
      { _id: new ObjectId(groupId) },
      { $pull: { members: { id: new ObjectId(userId) } } }
    );

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { groupId: new ObjectId(groupId) } }
    );

    const updatedGroup = await groupsCollection.findOne({ _id: new ObjectId(groupId) });
    if (!updatedGroup.members || updatedGroup.members.length === 0) {
      await groupsCollection.deleteOne({ _id: new ObjectId(groupId) });
      return NextResponse.json({ message: "חבר הוסר והקבוצה נמחקה כי היא ריקה", ok: true });
    }

    return NextResponse.json({ message: "חבר הוסר בהצלחה", ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "שגיאה בשרת", ok: false });
  }
}
