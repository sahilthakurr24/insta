import { auth } from "@clerk/nextjs/server";

export async function requireAuth() {
  const { userId, isAuthenticated } = await auth();
  if (!isAuthenticated) throw new Error("Unauthenticated");
  return { clerkId : userId };
}
