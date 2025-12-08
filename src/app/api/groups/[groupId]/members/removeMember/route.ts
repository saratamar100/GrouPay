import { NextRequest, NextResponse } from "next/server";
import { leaveGroup } from "@/app/services/server/groupMembersService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { groupId, userId } = body;

    const { status, body: responseBody } = await leaveGroup({
      groupId,
      userId,
    });

    return NextResponse.json(responseBody, { status });
  } catch {
    return NextResponse.json(
      { message: "שגיאה בשרת", ok: false },
      { status: 500 }
    );
  }
}
