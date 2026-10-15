import {
    pgTable,
    primaryKey,
    index,
    uuid,
  } from "drizzle-orm/pg-core";
  
  import { posts } from "./posts";
  import { hashtags } from "./hashtags";
  
  export const postHashtags = pgTable(
    "post_hashtags",
    {
      postId: uuid("post_id")
        .notNull()
        .references(() => posts.id, {
          onDelete: "cascade",
        }),
  
      hashtagId: uuid("hashtag_id")
        .notNull()
        .references(() => hashtags.id, {
          onDelete: "cascade",
        }),
    },
    (table) => ({
      pk: primaryKey({
        columns: [table.postId, table.hashtagId],
      }),
  
      hashtagIdx: index("post_hashtags_hashtag_idx").on(
        table.hashtagId
      ),
    })
  );