import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/services/server/mongo";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const { id, name, photoURL } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "לא התקבל ID של המשתמש" },
        { status: 400 }
      );
    }

    const db = await getDb("groupay_db");
    const users = db.collection("user");

    const trimmedName = typeof name === "string" ? name.trim() : "";

    if (!trimmedName && !photoURL) {
      return NextResponse.json(
        { error: "לא נשלחו שדות לעדכון" },
        { status: 400 }
      );
    }

    const updateFields: Record<string, unknown> = {};
    if (trimmedName) updateFields.name = trimmedName;
    if (photoURL) updateFields.photoURL = photoURL;

    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "המשתמש לא נמצא במערכת" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "הפרופיל עודכן בהצלחה",
        user: {
          id: result._id.toString(),
          name: result.name,
          email: result.email,
          photoURL: result.photoURL ?? null,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    return NextResponse.json(
      { error: "שגיאה בשרת" },
      { status: 500 }
    );
  }
}
