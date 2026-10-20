import { db } from "@/db";
import { users } from "@/db/schema";
import { neonStorage } from "@/lib/neonStorage";
import { requireAuth } from "@/lib/requireAuth";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

//update profile
export async function PATCH(req: NextRequest) {
  try {
    const { clerkId } = await requireAuth();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId));

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not Found" },
        { status: 404 },
      );
    }

    const formData = await req.formData();

    const username = formData.get("username");
    const name = formData.get("name");
    const avatar = formData.get("avatar");

    // Validation
    if (
      username !== null &&
      (typeof username !== "string" || !username.trim())
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid username" },
        { status: 400 },
      );
    }

    if (name !== null && (typeof name !== "string" || !name.trim())) {
      return NextResponse.json(
        { success: false, message: "Invalid name" },
        { status: 400 },
      );
    }

    if (avatar !== null && (!(avatar instanceof File) || avatar.size === 0)) {
      return NextResponse.json(
        { success: false, message: "Invalid avatar" },
        { status: 400 },
      );
    }

    const updates: Partial<typeof users.$inferInsert> = {};

    // Username
    if (username !== null) {
      const cleanUsername = username.trim();

      const [existingUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, cleanUsername))
        .limit(1);

      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json(
          { success: false, message: "Username already taken!" },
          { status: 409 },
        );
      }

      updates.username = cleanUsername;
    }

    // Name
    if (name !== null) {
      updates.name = name.trim();
    }

    // Avatar
    if (avatar instanceof File && avatar.size > 0) {
      const buffer = Buffer.from(await avatar.arrayBuffer());

      const key = `avatar/${crypto.randomUUID()}-${avatar.name}`;

      await neonStorage.send(
        new PutObjectCommand({
          Bucket: "instagram-images",
          Key: key,
          Body: buffer,
          ContentType: avatar.type,
        }),
      );

      updates.avatarKey = key;
    }

    // Nothing to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No fields to update" },
        { status: 400 },
      );
    }

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, user.id))
      .returning({
        id: users.id,
      });

    return NextResponse.json(
      {
        success: true,
        message: "User updated successfully",
        id: updatedUser.id,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
