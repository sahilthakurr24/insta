import { pgTable, index, uuid, text, timestamp } from "drizzle-orm/pg-core";

import { users } from "./users";

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    caption: text("caption"),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("posts_user_created_at_idx").on(table.userId, table.createdAt),
  ],
);
