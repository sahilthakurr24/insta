"use client";
import { getUserProfile } from "@/lib/api/userProfie";
import { useQuery } from "@tanstack/react-query";

//get user profile
export function useGetUserProfile(userName: string) {
  return useQuery({
    queryKey: ["userName", userName],
    queryFn: () => getUserProfile(userName),
    enabled: !!userName,
  });
}
