// neon.ts

import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  preview: {
    buckets: {
      "instagram-images": {
        access: "public_read",
      },
    },
  },
});