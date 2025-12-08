import { NextRequest, NextResponse } from "next/server";
import { fetchGroupBalanceForUser } from "@/app/services/server/groupBalanceService";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const params = await context.params;
    const groupId = params.groupId;

    const { searchParams } = new URL(req.url);
    const currentUserId = searchParams.get("userId") || "";

    const { status, body } = await fetchGroupBalanceForUser({
      groupId,
      currentUserId,
    });

    return NextResponse.json(body, { status });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
