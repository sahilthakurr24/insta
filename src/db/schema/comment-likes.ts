import {
    pgTable,
    primaryKey,
    index,
    uuid,
    timestamp,
  } from "drizzle-orm/pg-core";
  
  import { users } from "./users";
  import { comments } from "./comments";
  
  export const commentLikes = pgTable(
    "comment_likes",
    {
      userId: uuid("user_id")
        .notNull()
        .references(() => users.id, {
          onDelete: "cascade",
        }),
  
      commentId: uuid("comment_id")
        .notNull()
        .references(() => comments.id, {
          onDelete: "cascade",
        }),
  
      createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => ({
      pk: primaryKey({
        columns: [table.userId, table.commentId],
      }),
  
      commentIdx: index("comment_likes_comment_idx").on(
        table.commentId
      ),
    })
  );