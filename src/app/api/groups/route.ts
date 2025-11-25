import { NextResponse } from "next/server";
import { Group, User, Member } from "@/app/types/types";
import { getDb } from "../../services/server/mongo";
import { ObjectId } from "mongodb";

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
      name: name,
      members: membersForDB,
      expenses: [],
      payments:[],
      group_debts: {},
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

export async function GET() {
  try {
    const db = await getDb("groupay_db");
    const groupsCollection = db.collection("group");
    const groups = await groupsCollection.find({}).toArray();

    return NextResponse.json(groups, { status: 200 });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
