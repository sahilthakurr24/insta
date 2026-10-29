CREATE TYPE "conversation_type" AS ENUM('direct', 'group');--> statement-breakpoint
CREATE TYPE "message_type" AS ENUM('text');--> statement-breakpoint
CREATE TYPE "participant_role" AS ENUM('member', 'admin');--> statement-breakpoint
CREATE TABLE "conversation_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"conversation_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "participant_role" DEFAULT 'member'::"participant_role" NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"left_at" timestamp with time zone,
	"last_read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversation_participant_unique" UNIQUE("conversation_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"type" "conversation_type" NOT NULL,
	"name" varchar(100),
	"avatar_url" text,
	"direct_key" varchar(100) UNIQUE,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"content" text,
	"type" "message_type" DEFAULT 'text'::"message_type" NOT NULL,
	"reply_to_message_id" uuid,
	"deleted_at" timestamp with time zone,
	"edited_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "conversation_participants_conversation_idx" ON "conversation_participants" ("conversation_id");--> statement-breakpoint
CREATE INDEX "conversation_participants_user_idx" ON "conversation_participants" ("user_id");--> statement-breakpoint
CREATE INDEX "conversations_created_by_idx" ON "conversations" ("created_by");--> statement-breakpoint
CREATE INDEX "conversations_updated_at_idx" ON "conversations" ("updated_at");--> statement-breakpoint
CREATE INDEX "messages_conversation_created_idx" ON "messages" ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "messages_sender_idx" ON "messages" ("sender_id");--> statement-breakpoint
CREATE INDEX "messages_reply_to_idx" ON "messages" ("reply_to_message_id");--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_conversations_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_message_fk" FOREIGN KEY ("reply_to_message_id") REFERENCES "messages"("id") ON DELETE SET NULL;