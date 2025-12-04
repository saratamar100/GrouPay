import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/services/server/mongo";
import { ObjectId } from "mongodb";
import { inactiveGroupReminder } from "@/app/services/server/remindersService";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const params = await context.params;
    const groupId = params.groupId;
    const { isActive: newStatus } = await req.json();

    if (
      !groupId ||
      !ObjectId.isValid(groupId) ||
      typeof newStatus !== "boolean"
    ) {
      return NextResponse.json(
        { message: "Invalid request data" },
        { status: 400 }
      );
    }

    const db = await getDb("groupay_db");
    const currentGroup = await db
      .collection("group")
      .findOne({ _id: new ObjectId(groupId) }, { projection: { isActive: 1 } });

    console.log("Current group status:", currentGroup?.isActive);
    const currentStatus = currentGroup?.isActive;

    const isTransitionToInactive =
      currentStatus === true && newStatus === false;

    if (isTransitionToInactive) {
      console.log(
        `Group ${groupId} is being set to inactive. Triggering reminders...`
      );
      await inactiveGroupReminder(groupId.toString());
    }

    const result = await db
      .collection("group")
      .updateOne(
        { _id: new ObjectId(groupId) },
        { $set: { isActive: newStatus } }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Group not found" }, { status: 404 });
    }

    return NextResponse.json({ isActive: newStatus }, { status: 200 });
  } catch (error) {
    console.error("Error updating group status:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
