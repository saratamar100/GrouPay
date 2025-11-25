import { createPayment } from "@/app/services/server/paymentsService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { payeeId, payerId, amount, groupId } = body;

    if (!payeeId || !payerId || !amount || !groupId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await createPayment({ payeeId, payerId, amount, groupId });

    return NextResponse.json(result.success ? [true, result.payment] : [false, result.payment], {
      status: result.success ? 201 : 200,
    });
  } catch (err) {
    console.error("POST /api/payments error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
