import {
    pgTable,
    primaryKey,
    index,
    uuid,
    timestamp,
  } from "drizzle-orm/pg-core";
  
  import { users } from "./users";
  import { posts } from "./posts";
  
  export const likes = pgTable(
    "likes",
    {
      userId: uuid("user_id")
        .notNull()
        .references(() => users.id, {
          onDelete: "cascade",
        }),
  
      postId: uuid("post_id")
        .notNull()
        .references(() => posts.id, {
          onDelete: "cascade",
        }),
  
      createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => ({
      pk: primaryKey({
        columns: [table.userId, table.postId],
      }),
  
      postIdx: index("likes_post_idx").on(table.postId),
    })
  );