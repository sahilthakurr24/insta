import {
    pgTable,
    uniqueIndex,
    uuid,
    varchar,
    timestamp,
  } from "drizzle-orm/pg-core";
  
  export const hashtags = pgTable(
    "hashtags",
    {
      id: uuid("id").defaultRandom().primaryKey(),
  
      name: varchar("name", { length: 100 }).notNull(),
  
      createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => ({
      nameUnique: uniqueIndex("hashtags_name_unique").on(
        table.name
      ),
    })
  );