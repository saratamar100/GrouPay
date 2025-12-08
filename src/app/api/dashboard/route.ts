import { NextRequest, NextResponse } from "next/server";
import { fetchUserGroupsWithBalance } from "@/app/services/server/dashboardService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "";

    const { status, body } = await fetchUserGroupsWithBalance(userId);

    return NextResponse.json(body, { status });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
