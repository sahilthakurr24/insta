import { db } from "@/db";
import { conversationParticipants, conversations, users } from "@/db/schema";
import { neonStorage } from "@/lib/neonStorage";
import { requireAuth } from "@/lib/requireAuth";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

//group creation
export async function POST(req: NextRequest) {
  let uploadedKey: string | null = null;

  try {
    const { clerkId } = await requireAuth();

    // authentication
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

    const formData = await req.formData();

    const name = formData.get("name");
    const participantIdsRaw = formData.get("participantIds");
    const image = formData.get("image");

    // validate required fields
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof participantIdsRaw !== "string" ||
      !image
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 },
      );
    }

    // parse participant IDs
    let participantIds: unknown;

    try {
      participantIds = JSON.parse(participantIdsRaw);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid participantIds",
        },
        { status: 400 },
      );
    }

    if (
      !Array.isArray(participantIds) ||
      participantIds.length === 0 ||
      !participantIds.every((id) => typeof id === "string")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid participant IDs",
        },
        { status: 400 },
      );
    }

    // validate image
    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Group image is required",
        },
        { status: 400 },
      );
    }

    // validate image type
    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        {
          success: false,
          message: "Only image files are allowed",
        },
        { status: 400 },
      );
    }

    // max image size: 5 MB
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          message: "Image must be less than 5MB",
        },
        { status: 400 },
      );
    }

    // remove duplicate participant IDs
    const uniqueParticipantIds = [...new Set(participantIds)];

    // make sure all participants exist
    const existingUsers = await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(inArray(users.id, uniqueParticipantIds));

    if (existingUsers.length !== uniqueParticipantIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more participants not found",
        },
        { status: 404 },
      );
    }

    // upload image to Neon Bucket
    const buffer = Buffer.from(await image.arrayBuffer());

    const extension = image.name.split(".").pop()?.toLowerCase() || "jpg";

    const key = `group-avatar/${crypto.randomUUID()}.${extension}`;

    await neonStorage.send(
      new PutObjectCommand({
        Bucket: "instagram-images",
        Key: key,
        Body: buffer,
        ContentType: image.type,
      }),
    );

    uploadedKey = key;

    // create conversation + participants atomically
    const conversationId = await db.transaction(async (tx) => {
      const [conversation] = await tx
        .insert(conversations)
        .values({
          type: "group",
          name: name.trim(),
          avatarUrl: key,
          createdBy: user.id,
        })
        .returning({
          id: conversations.id,
        });

      const participantRows = [
        {
          conversationId: conversation.id,
          userId: user.id,
          role: "admin" as const,
        },

        ...uniqueParticipantIds
          .filter((id) => id !== user.id)
          .map((userId) => ({
            conversationId: conversation.id,
            userId,
            role: "member" as const,
          })),
      ];

      await tx.insert(conversationParticipants).values(participantRows);

      return conversation.id;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Group created successfully",
        conversationId,
        avatarKey: key,
      },
      { status: 201 },
    );
  } catch (error) {
    // remove uploaded image if database operation failed
    if (uploadedKey) {
      try {
        await neonStorage.send(
          new DeleteObjectCommand({
            Bucket: "instagram-images",
            Key: uploadedKey,
          }),
        );
      } catch (deleteError) {
        console.error("DELETE_ORPHANED_GROUP_IMAGE_ERROR:", deleteError);
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}
