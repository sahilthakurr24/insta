import { db } from "@/db";
import { comments, likes, posts, users } from "@/db/schema";
import { requireAuth } from "@/lib/requireAuth";
import { and, count, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

//get single post
export async function GET({ params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .innerJoin(users, eq(posts.userId, users.id));

    const [like] = await db
      .select({ count: count() })
      .from(likes)
      .where(eq(likes.postId, postId));

    const allComments = await db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .innerJoin(users, eq(comments.userId, users.id));
    if (!post)
      return NextResponse.json(
        { success: false, message: "No post found" },
        { status: 400 },
      );

    const formatedPost = {
      author: post.users.name,
      caption: post.posts.caption,
      likes: like.count,
      comments: allComments,
    };

    return NextResponse.json(
      { success: true, message: "post found successfully", post: formatedPost },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error },
      { status: 500 },
    );
  }
}

//delete post
export async function DELETE({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  try {
    const { postId } = await params;

    //authentication
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

    const [deletedPost] = await db
      .delete(posts)
      .where(and(eq(posts.id, postId), eq(posts.userId, user.id)))
      .returning({ id: posts.id });

    if (!deletedPost) {
      return NextResponse.json(
        {
          success: false,
          message: "Post not found or you are not authorized to delete it",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Post deleted successfully",
        deletedPost: deletedPost.id,
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

// update post caption
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params;

    // Authentication
    const { clerkId } = await requireAuth();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId));

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Get caption from request
    const body = await req.json();
    const { caption } = body;

    // Validate caption
    if (typeof caption !== "string" || !caption.trim()) {
      return NextResponse.json(
        { success: false, message: "Caption is required" },
        { status: 400 },
      );
    }

    // Update only if the post belongs to the logged-in user
    const [updatedPost] = await db
      .update(posts)
      .set({
        caption: caption.trim(),
        updatedAt: new Date(),
      })
      .where(and(eq(posts.id, postId), eq(posts.userId, user.id)))
      .returning({
        id: posts.id,
        caption: posts.caption,
      });

    // Post doesn't exist OR user doesn't own it
    if (!updatedPost) {
      return NextResponse.json(
        {
          success: false,
          message: "Post not found or you are not authorized to edit it",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Post updated successfully",
        post: updatedPost,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update post error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
