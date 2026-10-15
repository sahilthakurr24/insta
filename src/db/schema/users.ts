import {
  pgTable,
  uniqueIndex,
  uuid,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    clerkId: varchar("clerk_id", { length: 255 }).notNull(),

    username: varchar("username", { length: 30 }).notNull(),

    name: varchar("name", { length: 100 }),

    bio: varchar("bio", { length: 160 }),

    avatarKey: text("avatar_key"),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("users_clerk_id_unique").on(table.clerkId),
    uniqueIndex("users_username_unique").on(table.username),
  ],
);
