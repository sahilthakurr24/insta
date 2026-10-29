import { db } from "@/db";
import { conversationParticipants, conversations, users } from "@/db/schema";
import { requireAuth } from "@/lib/requireAuth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

//create converstaiion (direct)
export async function POST({
  params,
}: {
  params: Promise<{ participantId: string }>;
}) {
  try {
    const { clerkId } = await requireAuth();
    const { participantId } = await params;

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

    // find participant
    const [participant] = await db
      .select()
      .from(users)
      .where(eq(users.id, participantId));

    if (!participant)
      return NextResponse.json(
        { success: false, message: "Participant not found" },
        { status: 404 },
      );

    // check if existing convo exist
    const directKey = [user.id, participant.id].sort().join(":");

    const [existingConvo] = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(eq(conversations.directKey, directKey));

    if (existingConvo)
      return NextResponse.json(
        {
          success: true,
          message: "Conversation existed already",
          conversationId: existingConvo.id,
        },
        { status: 200 },
      );

    // no conversation exist create conversation
    const conversationId = await db.transaction(async (tx) => {
      const [conversation] = await tx
        .insert(conversations)
        .values({
          type: "direct",
          directKey,
        })
        .returning({ id: conversations.id });

      const participants = [
        {
          conversationId: conversation.id,
          userId: user.id,
        },
        {
          conversationId: conversation.id,
          userId: participant.id,
        },
      ];

      // create participants
      await tx.insert(conversationParticipants).values(participants);

      return conversation.id;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Conversation created successfully",
        conversationId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CREATE_DIRECT_CONVERSATION_ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
