import { NextRequest, NextResponse } from "next/server";
import { analyzeReviewSentiment } from "@/app/services/server/aiReviews";

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const isPositive = await analyzeReviewSentiment(content);

    return NextResponse.json({ isPositive });
  } catch (error) {
    console.error("Analyze Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
