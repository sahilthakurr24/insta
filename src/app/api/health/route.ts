import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json(
      {
        success: true,
        message: "Healthy hai bhai",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error },
      { status: 500 },
    );
  }
}
