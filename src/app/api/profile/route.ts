import { NextRequest, NextResponse } from "next/server";
import { updateUserProfileService } from "@/app/services/server/profileService";

export async function POST(request: NextRequest) {
  try {
    const { id, name, photoURL } = await request.json();

    const updatedUser = await updateUserProfileService(id, name, photoURL);

    return NextResponse.json(
      {
        message: "הפרופיל עודכן בהצלחה",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    const status = error?.status ?? 500;
    const message = error?.message ?? "שגיאה בעדכון הפרופיל";

    return NextResponse.json({ error: message }, { status });
  }
}
