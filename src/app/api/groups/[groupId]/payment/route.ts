import { calculateTotalDebt } from "@/app/services/server/debtsService";
import { createPayment, updatePaymentStatus } from "@/app/services/server/paymentsService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { payee, payer, amount, groupId } = body;

    if (!payee || !payer || !amount || !groupId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await createPayment({ payee, payer, amount, groupId });

    return NextResponse.json(result.success ? [true, result.payment] : [false, result.payment], {
      status: result.success ? 201 : 200,
    });
  } catch (err) {
    console.error("POST /api/payments error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {// Update payment status
  try {
    const body = await req.json();
    const { paymentId, status, groupId } = body;
    if (!paymentId || !status) {
      return NextResponse.json(
        { error: "Missing paymentId or status" },
        { status: 400 }
      );
    }
    const success = await updatePaymentStatus(paymentId, status);
    calculateTotalDebt(groupId);
    return NextResponse.json({ success }, { status: success ? 200 : 400 });
  } catch (err) {
    console.error("PUT /api/payments error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}