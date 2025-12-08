import { NextRequest, NextResponse } from "next/server";
import {
  getGroupMembers,
  addMemberToGroup,
} from "@/app/services/server/groupMembersService";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await context.params;

    const { status, body } = await getGroupMembers(groupId);

    return NextResponse.json(body, { status });
  } catch {
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { groupId, userId } = body;

    const { status, body: responseBody } = await addMemberToGroup({
      groupId,
      userId,
    });

    return NextResponse.json(responseBody, { status });
  } catch {
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
