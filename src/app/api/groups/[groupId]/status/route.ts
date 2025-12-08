import { NextRequest, NextResponse } from "next/server";
import { updateGroupActiveStatus } from "@/app/services/server/groupService";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await context.params;
    const { isActive: newStatus } = await req.json();

    const { status, body } = await updateGroupActiveStatus({
      groupId,
      newStatus,
    });

    return NextResponse.json(body, { status });
  } catch {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
