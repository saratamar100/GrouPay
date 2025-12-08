import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/app/services/server/mongo";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "review id לא תקין" },
        { status: 400 }
      );
    }

    const db = await getDb("groupay_db");
    const reviewsCol = db.collection("reviews");

    const result = await reviewsCol.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "התגובה לא נמצאה" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "התגובה נמחקה בהצלחה" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/reviews/[id] error:", err);
    return NextResponse.json(
      { message: "שגיאת שרת כללית" },
      { status: 500 }
    );
  }
}