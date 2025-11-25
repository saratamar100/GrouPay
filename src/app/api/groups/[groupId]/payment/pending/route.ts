import { fetchPPendingPaymentsForGroup } from "@/app/services/server/paymentsService";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params; 

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "missing userId" }, { status: 400 });
    }

    const payments = await fetchPPendingPaymentsForGroup(groupId, userId);

    return NextResponse.json(payments, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
