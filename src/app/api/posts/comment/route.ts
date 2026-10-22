import { db } from "@/db";
import { comments, posts, users } from "@/db/schema";
import { requireAuth } from "@/lib/requireAuth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

//create comment
export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ postId: string }>;
  },
) {
  try {
    const { clerkId } = await requireAuth();
    const { postId } = await params;
    const { content } = await req.json();

    //check if content exists or not
    if (!content || typeof content !== "string" || !content.trim())
      return NextResponse.json(
        {
          success: false,
          message: "Content is needed",
        },
        { status: 400 },
      );

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

    //now do comment
    const [newComment] = await db
      .insert(comments)
      .values({
        userId: user.id,
        content: content.trim(),
        postId,
      })
      .returning({ id: comments.id });

    if (!newComment)
      return NextResponse.json(
        { success: false, message: "Something went wrong" },
        { status: 500 },
      );

    return NextResponse.json(
      {
        success: true,
        message: "Comment created successfully",
        commentId: newComment.id,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}

//get comments

export async function GET({ params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;

    //check if post existed or not
    const [post] = await db.select().from(posts).where(eq(posts.id, postId));

    if (!post)
      return NextResponse.json(
        { success: false, message: "Post with this id not founc" },
        { status: 404 },
      );

    //now get comment
    const allComments = await db
      .select()
      .from(comments)
      .where(eq(comments.postId, post.id));

    if (allComments.length === 0)
      return NextResponse.json({
        succes: true,
        message: "Post has not comment",
        comments: [],
      });

    return NextResponse.json(
      {
        success: true,
        message: "Comment fetched successfully",
        comments: allComments,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
