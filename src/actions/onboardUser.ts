"use server";
import { db } from "@/db/index";
import { users } from "@/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function onboardUser() {
  const { userId } = await auth();
  if (!userId) {
    return;
  }

  const user = await currentUser();
  if (!user) {
    return;
  }

  const formattedUser = {
    clerkId: user.id,
    username: user.username?.toLowerCase() ?? user.id.toLowerCase(),
    name: [user.firstName, user.lastName].filter(Boolean).join(" ").trim(),
    avatarKey: user.imageUrl,
  };

  await db.insert(users).values(formattedUser).onConflictDoNothing({
    target: users.clerkId,
  });
}
