import { db } from "@/db";
import { comments, users } from "@/db/schema";
import { requireAuth } from "@/lib/requireAuth";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

//delete comment
export async function DELETE({
  params,
}: {
  params: Promise<{ commentId: string }>;
}) {
  try {
    const { clerkId } = await requireAuth();
    const { commentId } = await params;

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

    //delete comment
    const [deletedComment] = await db
      .delete(comments)
      .where(and(eq(comments.id, commentId), eq(comments.userId, user.id)))
      .returning({ id: comments.id });

    if (!deletedComment) {
      return NextResponse.json(
        {
          success: false,
          message: "Comment not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Comment deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
