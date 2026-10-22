import { db } from "@/db";
import { likes, posts, users } from "@/db/schema";
import { requireAuth } from "@/lib/requireAuth";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

//like/unlike 
export async function POST({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  try {
    const { clerkId } = await requireAuth();
    const { postId } = await params;

    //authentication
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId));

    if (!user)
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );

    //check if post existed or not
    const [post] = await db.select().from(posts).where(eq(posts.id, postId));

    if (!post)
      return NextResponse.json(
        { success: false, message: "Post with this id not founc" },
        { status: 404 },
      );

    //check if user already like -> so we need to unlike the post

    const [existingLike] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.postId, postId), eq(likes.userId, user.id)));

    if (existingLike) {
      // Unlike
      await db
        .delete(likes)
        .where(and(eq(likes.postId, postId), eq(likes.userId, user.id)));

      return NextResponse.json(
        { success: true, message: "Post unliked succesfully", liked: false },
        { status: 200 },
      );
    }
    //insert the like
    const [newLike] = await db
      .insert(likes)
      .values({
        postId,
        userId: user.id,
      })
      .returning({ id: likes.postId });

    if (!newLike)
      return NextResponse.json(
        { success: false, message: "Something went wront" },
        { status: 500 },
      );

    return NextResponse.json(
      { success: true, message: "Like successful", liked: true },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
