import {
    pgEnum,
    pgTable,
    index,
    uuid,
    boolean,
    timestamp,
  } from "drizzle-orm/pg-core";
  
  import { users } from "./users";
  import { posts } from "./posts";
  import { comments } from "./comments";
  
  export const notificationTypeEnum = pgEnum(
    "notification_type",
    ["like", "comment", "follow"]
  );
  
  export const notifications = pgTable(
    "notifications",
    {
      id: uuid("id").defaultRandom().primaryKey(),
  
      recipientId: uuid("recipient_id")
        .notNull()
        .references(() => users.id, {
          onDelete: "cascade",
        }),
  
      actorId: uuid("actor_id")
        .notNull()
        .references(() => users.id, {
          onDelete: "cascade",
        }),
  
      type: notificationTypeEnum("type").notNull(),
  
      postId: uuid("post_id").references(() => posts.id, {
        onDelete: "cascade",
      }),
  
      commentId: uuid("comment_id").references(() => comments.id, {
        onDelete: "cascade",
      }),
  
      read: boolean("read").default(false).notNull(),
  
      createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => ({
      recipientCreatedAtIdx: index(
        "notifications_recipient_created_at_idx"
      ).on(table.recipientId, table.createdAt),
    })
  );