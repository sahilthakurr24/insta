"use client";
import { getCurrentUser, getUserProfile } from "@/lib/api/userProfie";
import { useQuery } from "@tanstack/react-query";

//get user profile
export function useGetUserProfile(userName: string) {
  return useQuery({
    queryKey: ["userName", userName],
    queryFn: () => getUserProfile(userName),
    enabled: !!userName,
  });
}

export function useGetCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });
}
