import { db } from "@/db";
import { postMedia, posts, users } from "@/db/schema";
import { requireAuth } from "@/lib/requireAuth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { neonStorage } from "@/lib/neonStorage";
import sharp from "sharp";

type MediaData = {
  storageKey: string;
  mediaType: "image";
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  position: number;
};

// create post
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const { clerkId } = await requireAuth();

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

    //  Get form data

    const formData = await req.formData();

    const caption = formData.get("caption");
    const images = formData.getAll("image");

    //  Validate caption

    if (typeof caption !== "string" || !caption.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Caption is required",
        },
        { status: 400 },
      );
    }

    // Validate images

    if (
      images.length === 0 ||
      !images.every((image) => image instanceof File)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one valid image is required",
        },
        { status: 400 },
      );
    }

    //  Maximum number of images

    const MAX_IMAGES = 5;

    if (images.length > MAX_IMAGES) {
      return NextResponse.json(
        {
          success: false,
          message: `Maximum ${MAX_IMAGES} images are allowed`,
        },
        { status: 400 },
      );
    }

    //  Maximum image size

    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB

    if (images.some((image) => image.size > MAX_IMAGE_SIZE)) {
      return NextResponse.json(
        {
          success: false,
          message: "Each image must be less than 10 MB",
        },
        { status: 400 },
      );
    }

    // Process images

    const mediaData: MediaData[] = [];

    for (let position = 0; position < images.length; position++) {
      const image = images[position];

      // Convert File → Buffer
      const buffer = Buffer.from(await image.arrayBuffer());

      // Validate actual image using Sharp
      let metadata;

      try {
        metadata = await sharp(buffer).metadata();
      } catch {
        return NextResponse.json(
          {
            success: false,
            message: `${image.name} is not a valid image`,
          },
          { status: 400 },
        );
      }

      // Validate image format
      const allowedFormats = ["jpeg", "png", "webp", "avif"];

      if (!metadata.format || !allowedFormats.includes(metadata.format)) {
        return NextResponse.json(
          {
            success: false,
            message: `${image.name} has an unsupported image format`,
          },
          { status: 400 },
        );
      }

      // Generate storage key
      const key = `posts/${crypto.randomUUID()}-${image.name}`;

      // Upload image
      await neonStorage.send(
        new PutObjectCommand({
          Bucket: "instagram-images",
          Key: key,
          Body: buffer,
          ContentType: image.type,
        }),
      );

      // Keep information needed for DB
      mediaData.push({
        storageKey: key,
        mediaType: "image" as const,
        mimeType: image.type,
        size: image.size,
        width: metadata.width ?? null,
        height: metadata.height ?? null,
        duration: null,
        position,
      });
    }

    //  Create post + media using transaction for consistency

    const postId = await db.transaction(async (tx) => {
      const [post] = await tx
        .insert(posts)
        .values({
          userId: user.id,
          caption: caption.trim(),
        })
        .returning({
          postId: posts.id,
        });

      if (!post) {
        throw new Error("Failed to create post");
      }

      await tx.insert(postMedia).values(
        mediaData.map((media) => ({
          postId: post.postId,
          storageKey: media.storageKey,
          mediaType: media.mediaType,
          mimeType: media.mimeType,
          size: media.size,
          width: media.width,
          height: media.height,
          duration: media.duration,
          position: media.position,
        })),
      );

      return post.postId;
    });

    // Response

    return NextResponse.json(
      {
        success: true,
        message: "Post created successfully",
        postId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create post error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
