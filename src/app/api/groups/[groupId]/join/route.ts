import { NextRequest, NextResponse } from "next/server";
import { joinGroup } from "@/app/services/server/join";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await context.params;
    const body = await req.json();
    const { userId, name } = body ?? {};

    const result = await joinGroup({ groupId, userId, name });

    if (result.alreadyMember) {
      return NextResponse.json(
        { ok: true, message: "Already member" },
        { status: 200 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    const status = err?.status ?? 500;
    const message = err?.message ?? "Internal server error";

    console.error("Join error:", err);

    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
