import { db } from "@/db";
import { follows, users } from "@/db/schema";
import { requireAuth } from "@/lib/requireAuth";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userName: string }> },
) {
  try {
    const { userName } = await params;
    //get user from session
    const { clerkId } = await requireAuth();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId));

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not Found" },
        { status: 404 },
      );
    }

    //find the user if its existed or not
    const [targetedUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, userName))
      .limit(1);

    // prevent from following yourself
    if (user.id === targetedUser.id) {
      return NextResponse.json(
        { success: false, message: "You cannot follow yourself" },
        { status: 400 },
      );
    }
    // check existing follow
    const [existingFollow] = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, user.id),
          eq(follows.followingId, targetedUser.id),
        ),
      );

    if (existingFollow) {
      return NextResponse.json(
        { success: false, message: "Already following this user" },
        { status: 409 },
      );
    }
    if (!targetedUser)
      return NextResponse.json(
        { success: false, message: "User not found with this username" },
        { status: 404 },
      );

    await db.insert(follows).values({
      followerId: user.id,
      followingId: targetedUser.id,
    });

    return NextResponse.json(
      { success: true, message: "User followed successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
