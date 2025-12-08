import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { buildGroupExcelFile } from "@/app/services/server/exportGroupExcelService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ groupId: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { groupId } = await context.params;

    if (!groupId || !ObjectId.isValid(groupId)) {
      return NextResponse.json(
        { message: "groupId לא תקין" },
        { status: 400 }
      );
    }

    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { message: "userId חסר" },
        { status: 400 }
      );
    }

    const { buffer, groupName } = await buildGroupExcelFile(groupId, userId);

    const safeGroupName =
      groupName.replace(/[\\/:*?"<>|]/g, "_") || "group";
    const fileName = `grouPay-${safeGroupName}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          fileName
        )}"`,
      },
    });
  } catch (err: any) {
    console.error("Export group to Excel error:", err);

    const status = err?.status ?? 500;
    const message =
      err?.message || "שגיאה לא צפויה ביצירת קובץ האקסל לקבוצה";

    return NextResponse.json({ message }, { status });
  }
}
