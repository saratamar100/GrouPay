import { NextResponse } from "next/server";
import { Group, User } from "@/app/types/types";
import { getDb } from "../../services/server/mongo";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, memberIds } = body as { name: string; memberIds: string[] };

    if (!name || !memberIds || memberIds.length === 0) {
      return NextResponse.json(
        { message: "Name and at least one memberId are required" },
        { status: 400 }
      );
    }
    const db = await getDb("groupay_db");
    const groupsCollection = db.collection("group");
    const usersCollection = db.collection("user");

    const newGroupData = {
      name: name,
      memberIds: memberIds,
      actionIds: [],
    };

    const insertResult = await groupsCollection.insertOne(newGroupData);

    const newGroupId = insertResult.insertedId.toString();

    await usersCollection.updateMany(
      { id: { $in: memberIds } },
      { $push: { groupIds: newGroupId } }
    );

    const createdGroup: Group = {
      ...newGroupData,
      id: newGroupId,
    };

    return NextResponse.json(createdGroup, { status: 201 });
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
