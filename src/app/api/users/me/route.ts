import { db } from "@/db"
import { follows, postMedia, posts, users } from "@/db/schema"
import { auth } from "@clerk/nextjs/server"
import { count, desc, eq, inArray } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated" },
      { status: 401 }
    )
  }

  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      avatar: users.avatarKey,
      bio: users.bio,
      isPrivate: users.isPrivate,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.clerkId, userId))

  if (!user) {
    return NextResponse.json(
      { success: false, message: "User profile not found" },
      { status: 404 }
    )
  }

  const [[followersResult], [followingResult], [postsResult], userPosts] =
    await Promise.all([
      db.select({ count: count() }).from(follows).where(eq(follows.followingId, user.id)),
      db.select({ count: count() }).from(follows).where(eq(follows.followerId, user.id)),
      db.select({ count: count() }).from(posts).where(eq(posts.userId, user.id)),
      db
        .select({
          id: posts.id,
          caption: posts.caption,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
        })
        .from(posts)
        .where(eq(posts.userId, user.id))
        .orderBy(desc(posts.createdAt)),
    ])

  const postIds = userPosts.map((post) => post.id)
  const media =
    postIds.length > 0
      ? await db.select().from(postMedia).where(inArray(postMedia.postId, postIds))
      : []

  return NextResponse.json({
    success: true,
    user: {
      ...user,
      followersCount: followersResult.count,
      followingCount: followingResult.count,
      totalPosts: postsResult.count,
    },
    posts: userPosts.map((post) => ({
      ...post,
      media: media.filter((item) => item.postId === post.id),
    })),
  })
}
