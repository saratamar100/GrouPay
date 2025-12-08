import { NextRequest, NextResponse } from "next/server";
import { updateGroupNameInDb } from "@/app/services/server/groupService";
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await context.params;

    const { name: rawName } = await req.json();
    const newName = String(rawName || "").trim();

    const { status, body } = await updateGroupNameInDb({
      groupId,
      newName,
    });

    return NextResponse.json(body, { status });
  } catch (error) {
    console.error("Group name PATCH route failed:", error);

    return NextResponse.json(
      { message: "שגיאת שרת פנימית בעדכון השם." },
      { status: 500 }
    );
  }
}
