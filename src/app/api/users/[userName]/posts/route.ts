import { db } from "@/db";
import { postMedia, posts, users } from "@/db/schema";
import { eq, desc, inArray, asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Get posts from user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userName: string }> },
) {
  try {
    const limit = Number(req.nextUrl.searchParams.get("limit")) || 12;
    const page = Number(req.nextUrl.searchParams.get("page")) || 1;

    const { userName } = await params;

    const skip = (page - 1) * limit;

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, userName));

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: `User not found with username: ${userName}`,
        },
        { status: 404 },
      );
    }

    // Get user's posts
    const allPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.userId, user.id))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(skip);

    if (allPosts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User has no posts",
        },
        { status: 404 },
      );
    }

    // Get media for these posts
    const postIds = allPosts.map((post) => post.id);

    const media = await db
      .select()
      .from(postMedia)
      .where(inArray(postMedia.postId, postIds))
      .orderBy(asc(postMedia.position));

    // Attach media to each post
    const postsWithMedia = allPosts.map((post) => ({
      ...post,
      media: media.filter((item) => item.postId === post.id),
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Posts fetched successfully",
        posts: postsWithMedia,
        page,
        limit,
        hasNextPage: allPosts.length === limit,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error
      },
      { status: 500 },
    );
  }
}
