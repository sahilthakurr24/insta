import { db } from "@/db";
import { comments, follows, likes, postMedia, posts, users } from "@/db/schema";
import { requireAuth } from "@/lib/requireAuth";
import { and, count, desc, eq, inArray, ne, notInArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function getFeed(req: NextRequest) {
  try {
    //authentication
    const { clerkId } = await requireAuth();

    //get search params
    const limit = Number(req.nextUrl.searchParams.get("limit")) || 12;
    const page = Number(req.nextUrl.searchParams.get("page")) || 1;
    const offset = (page - 1) * limit;

    //get current user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId));

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    //get users that current user follows
    const following = await db
      .select({
        followingId: follows.followingId,
      })
      .from(follows)
      .where(eq(follows.followerId, user.id));

    const followingIds = following.map((u) => u.followingId);

    //get posts from following users
    let followingFeed: unknown[] = [];

    if (followingIds.length > 0) {
      //get following users
      const followingUsers = await db
        .select()
        .from(users)
        .where(inArray(users.id, followingIds));

      //get posts
      const feedPosts = await db
        .select()
        .from(posts)
        .where(inArray(posts.userId, followingIds))
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset);

      const feedPostIds = feedPosts.map((post) => post.id);

      if (feedPostIds.length > 0) {
        //get media
        const media = await db
          .select()
          .from(postMedia)
          .where(inArray(postMedia.postId, feedPostIds));

        //get likes count
        const likesCount = await db
          .select({
            postId: likes.postId,
            count: count(),
          })
          .from(likes)
          .where(inArray(likes.postId, feedPostIds))
          .groupBy(likes.postId);

        //get comments
        const postComments = await db
          .select({
            id: comments.id,
            postId: comments.postId,
            content: comments.content,
            createdAt: comments.createdAt,
            user: {
              id: users.id,
              username: users.username,
              avatarUrl: users.avatarKey,
            },
          })
          .from(comments)
          .innerJoin(users, eq(comments.userId, users.id))
          .where(inArray(comments.postId, feedPostIds))
          .orderBy(desc(comments.createdAt));

        //build following feed
        followingFeed = feedPosts.map((post) => {
          const author = followingUsers.find((user) => user.id === post.userId);

          const postMediaItems = media.filter(
            (item) => item.postId === post.id,
          );

          const postLikes = likesCount.find((like) => like.postId === post.id);

          const postCommentItems = postComments.filter(
            (comment) => comment.postId === post.id,
          );

          return {
            id: post.id,
            caption: post.caption,
            createdAt: post.createdAt,

            user: {
              id: author?.id,
              username: author?.username,
              avatarUrl: author?.avatarKey,
            },

            media: postMediaItems,

            likes: {
              count: Number(postLikes?.count ?? 0),
            },

            comments: {
              count: postCommentItems.length,
              data: postCommentItems,
            },
          };
        });
      }
    }

    //get recommended posts
    const conditions = [eq(users.isPrivate, false), ne(users.id, user.id)];

    //don't recommend users that current user already follows
    if (followingIds.length > 0) {
      conditions.push(notInArray(users.id, followingIds));
    }

    const recommendedPosts = await db
      .select({
        post: posts,
        user: {
          id: users.id,
          username: users.username,
          avatarUrl: users.avatarKey,
        },
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(posts.createdAt))
      .limit(10);

    const recommendedPostIds = recommendedPosts.map((item) => item.post.id);

    let recommendedFeed: unknown[] = [];

    if (recommendedPostIds.length > 0) {
      //get recommended media
      const recommendedMedia = await db
        .select()
        .from(postMedia)
        .where(inArray(postMedia.postId, recommendedPostIds));

      //get recommended likes count
      const recommendedLikesCount = await db
        .select({
          postId: likes.postId,
          count: count(),
        })

        .from(likes)
        .where(inArray(likes.postId, recommendedPostIds))
        .groupBy(likes.postId);

      //get recommended comments
      const recommendedComments = await db
        .select({
          id: comments.id,
          postId: comments.postId,
          content: comments.content,
          createdAt: comments.createdAt,
          user: {
            id: users.id,
            username: users.username,
            avatarUrl: users.avatarKey,
          },
        })
        .from(comments)
        .innerJoin(users, eq(comments.userId, users.id))
        .where(inArray(comments.postId, recommendedPostIds))
        .orderBy(desc(comments.createdAt));

      //build recommended feed
      recommendedFeed = recommendedPosts.map((item) => {
        const postMediaItems = recommendedMedia.filter(
          (media) => media.postId === item.post.id,
        );

        const postLikes = recommendedLikesCount.find(
          (like) => like.postId === item.post.id,
        );

        const postCommentItems = recommendedComments.filter(
          (comment) => comment.postId === item.post.id,
        );

        return {
          id: item.post.id,
          caption: item.post.caption,
          createdAt: item.post.createdAt,

          user: item.user,

          media: postMediaItems,

          likes: {
            count: Number(postLikes?.count ?? 0),
          },

          comments: {
            count: postCommentItems.length,
            data: postCommentItems,
          },
        };
      });
    }

    //combine following and recommended feed
    const feed = [...followingFeed, ...recommendedFeed];

    //return feed
    return NextResponse.json({
      success: true,
      page,
      limit,
      hasMore: feed.length >= limit,
      posts: feed,
    });
  } catch (error) {
    console.error("GET FEED ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
