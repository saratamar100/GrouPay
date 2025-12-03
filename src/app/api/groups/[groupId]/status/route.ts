import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/services/server/mongo";
import { ObjectId } from "mongodb";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const params = await context.params;
    const groupId = params.groupId;
    const { isActive } = await req.json();

    if (
      !groupId ||
      !ObjectId.isValid(groupId) ||
      typeof isActive !== "boolean"
    ) {
      return NextResponse.json(
        { message: "Invalid request data" },
        { status: 400 }
      );
    }

    const db = await getDb("groupay_db");
    const result = await db
      .collection("group")
      .updateOne(
        { _id: new ObjectId(groupId) },
        { $set: { isActive: isActive } }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Group not found" }, { status: 404 });
    }

    return NextResponse.json({ isActive }, { status: 200 });
  } catch (error) {
    console.error("Error updating group status:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
