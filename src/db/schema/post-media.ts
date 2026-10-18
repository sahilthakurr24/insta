import {
  pgEnum,
  pgTable,
  index,
  uuid,
  text,
  varchar,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

import { posts } from "./posts";

export const mediaTypeEnum = pgEnum("media_type", ["image", "video"]);

export const postMedia = pgTable(
  "post_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, {
        onDelete: "cascade",
      }),

    storageKey: text("storage_key").notNull(),

    mediaType: mediaTypeEnum("media_type").notNull(),

    mimeType: varchar("mime_type", { length: 100 }),

    size: integer("size"),

    width: integer("width"),

    height: integer("height"),

    duration: integer("duration"),

    position: integer("position").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    postPositionIdx: index("post_media_post_position_idx").on(
      table.postId,
      table.position,
    ),
  }),
);
