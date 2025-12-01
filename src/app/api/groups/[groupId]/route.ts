import { NextRequest, NextResponse } from "next/server";
import { getGroupWithExpensesService } from "@/app/services/server/group";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ groupId: string }> } // שימי לב: Promise
) {
  try {
    const { groupId } = await context.params;

    const userId = req.nextUrl.searchParams.get("userId");

    if (!groupId) {
      return NextResponse.json(
        { error: "Missing group id" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Missing user id" },
        { status: 400 }
      );
    }

    const group = await getGroupWithExpensesService(groupId, userId);

    return NextResponse.json(group, { status: 200 });
  } catch (error: any) {
    const status = error?.status ?? 500;
    const message = error?.message ?? "Error fetching group data";

    console.error("Error fetching group data:", error);

    return NextResponse.json({ error: message }, { status });
  }
}
