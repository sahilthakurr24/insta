import { db } from "@/db";
import { follows, postMedia, posts, users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { count, desc, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

//get public user profile
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userName: string }> },
) {
  try {
    const { userName } = await params;
    console.log(userName);
    //clerk auth
    const { userId } = await auth();
    const limit = Number(req.nextUrl.searchParams.get("limit")) || 12;
    const page = Number(req.nextUrl.searchParams.get("page")) || 1;
    const offset = (page - 1) * limit;

    if (limit < 1 || limit > 50 || page < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid pagination parameters",
        },
        { status: 400 },
      );
    }

    //get user
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        avatar: users.avatarKey,
        bio: users.bio,
        createdAt: users.createdAt,
      })
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

    //check if its own profile or not
    let currentUser = null;
    if (userId) {
      [currentUser] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, userId));
    }
    const isOwnProfile = currentUser ? currentUser.clerkId === user.id : false;

    //get followers, following and posts count
    const [[followersResult], [followingResult], [postsResult]] =
      await Promise.all([
        db
          .select({ count: count() })
          .from(follows)
          .where(eq(follows.followingId, user.id)),

        db
          .select({ count: count() })
          .from(follows)
          .where(eq(follows.followerId, user.id)),

        db
          .select({ count: count() })
          .from(posts)
          .where(eq(posts.userId, user.id)),
      ]);

    const followersCount = followersResult.count;
    const followingCount = followingResult.count;
    const totalPosts = postsResult.count;

    //get posts
    const userPosts = await db
      .select({
        id: posts.id,
        caption: posts.caption,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .where(eq(posts.userId, user.id))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    //get post media
    let media: (typeof postMedia.$inferSelect)[] = [];

    if (userPosts.length > 0) {
      const postIds = userPosts.map((post) => post.id);

      media = await db
        .select()
        .from(postMedia)
        .where(inArray(postMedia.postId, postIds));
    }

    //add media to posts
    const formattedPosts = userPosts.map((post) => ({
      ...post,
      media: media.filter((item) => item.postId === post.id),
    }));

    const hasMore = offset + userPosts.length < totalPosts;

    return NextResponse.json(
      {
        success: true,
        message: "User fetched successfully",
        user: {
          ...user,
          followersCount,
          followingCount,
          totalPosts,
        },
        posts: formattedPosts,
        isOwnProfile,
        pagination: {
          page,
          limit,
          totalPosts,
          hasMore,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
