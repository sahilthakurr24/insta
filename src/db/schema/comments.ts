import {
    pgTable,
    index,
    uuid,
    text,
    timestamp,
  } from "drizzle-orm/pg-core";
  
  import { users } from "./users";
  import { posts } from "./posts";
  
  export const comments = pgTable(
    "comments",
    {
      id: uuid("id").defaultRandom().primaryKey(),
  
      postId: uuid("post_id")
        .notNull()
        .references(() => posts.id, {
          onDelete: "cascade",
        }),
  
      userId: uuid("user_id")
        .notNull()
        .references(() => users.id, {
          onDelete: "cascade",
        }),
  
      content: text("content").notNull(),
  
      createdAt: timestamp("created_at").defaultNow().notNull(),
  
      updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
      postCreatedAtIdx: index("comments_post_created_at_idx").on(
        table.postId,
        table.createdAt
      ),
    })
  );