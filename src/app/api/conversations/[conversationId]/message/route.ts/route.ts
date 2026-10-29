import { db } from "@/db";
import {
  conversationParticipants,
  conversations,
  messages,
  users,
} from "@/db/schema";
import { requireAuth } from "@/lib/requireAuth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

//get conversation
export async function GET({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  try {
    const { clerkId } = await requireAuth();
    const { conversationId } = await params;
    // authentication
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId));

    if (!user)
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );

    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!conversation) {
      return NextResponse.json(
        { success: false, message: "Conversation not found", messages: [] },
        { status: 404 },
      );
    }

    // get participants;
    const participants = await db
      .select({
        userId: conversationParticipants.userId,
        role: conversationParticipants.role,
        joinedAt: conversationParticipants.joinedAt,
        username: users.username,
        avatarUrl: users.avatarKey,
      })
      .from(conversationParticipants)
      .innerJoin(users, eq(conversationParticipants.userId, users.id))
      .where(eq(conversationParticipants.conversationId, conversationId));

    if (participants.length === 0)
      return NextResponse.json(
        { success: false, message: "No participants" },
        { status: 404 },
      );
    //find if currentUser is participant or not

    const currentParticipant = participants.find(
      (participant) => participant.userId === user.id,
    );

    if (!currentParticipant) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not a participant of this conversation",
        },
        { status: 403 },
      );
    }

    //const get messages

    const allMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId));
    if (allMessages.length === 0) {
      return NextResponse.json({ success: false, message: [] });
    }

    const formatedMessage = allMessages.map((mess) => ({
      ...mess,
      isMine: mess.senderId === user.id,
    }));

    const finalConversation = {
      id: conversation.id,
      type: "direct",
      name: null,
      participants,
      messages: formatedMessage,
    };
    return NextResponse.json(
      {
        success: true,
        message: "message fetched successfully",
        conversation: finalConversation,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
