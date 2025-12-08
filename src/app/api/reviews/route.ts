import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/services/server/mongo";


export async function GET() {
  const db = await getDb();
  const reviews = await db.collection("reviews")
    .find({})
    .sort({ _id: -1 })
    .toArray();

  return NextResponse.json({ reviews });
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userName, content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    const db = await getDb();

    await db.collection("reviews").insertOne({
      userName,
      content
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
