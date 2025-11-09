import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/services/server/mongo";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const { id, name, email, phone } = await request.json();

    if (!id)
      return NextResponse.json(
        { error: "לא התקבל ID של המשתמש" },
        { status: 400 }
      );

    const db = await getDb("groupay_db");
    const users = db.collection("user");

    const updateFields: any = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;

    if (Object.keys(updateFields).length === 0)
      return NextResponse.json(
        { error: "לא נשלחו שדות לעדכון" },
        { status: 400 }
      );

    const result = await users.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0)
      return NextResponse.json(
        { error: "המשתמש לא נמצא במערכת" },
        { status: 404 }
      );

    return NextResponse.json(
      { message: "הפרטים עודכנו בהצלחה" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "שגיאה בשרת" },
      { status: 500 }
    );
  }
}
