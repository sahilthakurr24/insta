import { db } from "@/db";
import { comments, likes, posts, users } from "@/db/schema";
import { count, eq } from "drizzle-orm";
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
