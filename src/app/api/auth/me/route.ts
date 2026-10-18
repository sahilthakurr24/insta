import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAuth } from "@/lib/requireAuth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

//get me 
export async function GET() {
  try {
    const { clerkId } = await requireAuth();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId));
    if (!user)
      return NextResponse.json(
        { success: false, message: "User not Found" },
        { status: 404 },
      );
    return NextResponse.json(
      { success: true, message: "User fetched Successfuly", user },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error },
      { status: 500 },
    );
  }
}
