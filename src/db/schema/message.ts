import {
  foreignKey,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users";

//enums
export const conversationTypeEnum = pgEnum("conversation_type", [
  "direct",
  "group",
]);

export const participantRoleEnum = pgEnum("participant_role", [
  "member",
  "admin",
]);

export const messageTypeEnum = pgEnum("message_type", ["text"]);

//conversation
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    type: conversationTypeEnum("type").notNull(),

    // Only relevant for group conversations
    name: varchar("name", { length: 100 }),

    // Optional group avatar
    avatarUrl: text("avatar_url"),
    // To fine the existin conversation
    directKey: varchar("direct_key", { length: 100 }).unique(),

    // User who created the conversation
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("conversations_created_by_idx").on(table.createdBy),

    index("conversations_updated_at_idx").on(table.updatedAt),
  ],
);

//conversation participants

export const conversationParticipants = pgTable(
  "conversation_participants",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, {
        onDelete: "cascade",
      }),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    role: participantRoleEnum("role").default("member").notNull(),

    // When the user joined the conversation
    joinedAt: timestamp("joined_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    // NULL means the user is still in the conversation
    leftAt: timestamp("left_at", {
      withTimezone: true,
    }),

    // Used for unread message calculation
    lastReadAt: timestamp("last_read_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // A user can only belong to a conversation once
    unique("conversation_participant_unique").on(
      table.conversationId,
      table.userId,
    ),

    index("conversation_participants_conversation_idx").on(
      table.conversationId,
    ),

    index("conversation_participants_user_idx").on(table.userId),
  ],
);

// messages

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, {
        onDelete: "cascade",
      }),

    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    content: text("content"),

    type: messageTypeEnum("type").default("text").notNull(),

    replyToMessageId: uuid("reply_to_message_id"),

    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
    }),

    editedAt: timestamp("edited_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("messages_conversation_created_idx").on(
      table.conversationId,
      table.createdAt,
    ),

    index("messages_sender_idx").on(table.senderId),

    index("messages_reply_to_idx").on(table.replyToMessageId),

    foreignKey({
      columns: [table.replyToMessageId],
      foreignColumns: [table.id],
      name: "messages_reply_to_message_fk",
    }).onDelete("set null"),
  ],
);
