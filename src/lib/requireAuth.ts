import { auth } from "@clerk/nextjs/server";

export async function requireAuth() {
  //clerk automatically sends the req with clerk session
  const { userId, isAuthenticated } = await auth();
  if (!isAuthenticated) throw new Error("Unauthenticated");
  return { clerkId: userId };
}
