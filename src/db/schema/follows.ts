import {
    pgTable,
    primaryKey,
    index,
    uuid,
    timestamp,
  } from "drizzle-orm/pg-core";
  
  import { users } from "./users";
  
  export const follows = pgTable(
    "follows",
    {
      followerId: uuid("follower_id")
        .notNull()
        .references(() => users.id, {
          onDelete: "cascade",
        }),
  
      followingId: uuid("following_id")
        .notNull()
        .references(() => users.id, {
          onDelete: "cascade",
        }),
  
      createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => ({
      pk: primaryKey({
        columns: [table.followerId, table.followingId],
      }),
  
      followingIdx: index("follows_following_idx").on(
        table.followingId
      ),
    })
  );