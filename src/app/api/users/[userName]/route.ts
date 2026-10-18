import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

//get public user profile
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (!user)
      return NextResponse.json(
        {
          success: false,
          message: `User not found with  username: ${username}`,
        },
        { status: 404 },
      );

    return NextResponse.json(
      { success: true, message: "User fetched successfully", user },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
        { success: false, message: "Internal Server Error", error },
        { status: 500 },
      );
  }
}
