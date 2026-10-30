import { db } from "@/db"
import { follows, users } from "@/db/schema"
import { requireAuth } from "@/lib/requireAuth"
import { count, desc, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { clerkId } = await requireAuth()
    const limit = Number(req.nextUrl.searchParams.get("limit")) || 20
    const page = Number(req.nextUrl.searchParams.get("page")) || 1
    const offset = (page - 1) * limit

    if (limit < 1 || limit > 50 || page < 1) {
      return NextResponse.json(
        { success: false, message: "Invalid pagination parameters" },
        { status: 400 }
      )
    }

    const [currentUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, clerkId))

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    const [[totalResult], following] = await Promise.all([
      db.select({ count: count() }).from(follows).where(eq(follows.followerId, currentUser.id)),
      db
        .select({
          id: users.id,
          username: users.username,
          name: users.name,
          avatar: users.avatarKey,
          bio: users.bio,
          followedAt: follows.createdAt,
        })
        .from(follows)
        .innerJoin(users, eq(follows.followingId, users.id))
        .where(eq(follows.followerId, currentUser.id))
        .orderBy(desc(follows.createdAt))
        .limit(limit)
        .offset(offset),
    ])

    const totalFollowing = totalResult.count

    return NextResponse.json({
      success: true,
      message: "Following fetched successfully",
      following,
      pagination: {
        page,
        limit,
        totalFollowing,
        hasMore: offset + following.length < totalFollowing,
      },
    })
  } catch (error) {
    console.error("Get following error:", error)
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    )
  }
}
