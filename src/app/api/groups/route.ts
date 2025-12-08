import { NextRequest, NextResponse } from "next/server";
import {createGroup,} from "@/app/services/server/createGroupService";



export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { status, body: responseBody } = await createGroup(body);

    return NextResponse.json(responseBody, { status });
  } catch {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
