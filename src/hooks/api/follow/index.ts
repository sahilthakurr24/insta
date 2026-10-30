"use client";

import { follow, getFollowers, getFollowing } from "@/lib/api/follow";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useFollow(userName: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: follow,
    //update the stale data
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userName", userName],
      });
    },
  });
}

export function useGetFollowers(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["followers", page, limit],
    queryFn: () => getFollowers(page, limit),
  });
}

export function useGetFollowing(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["following", page, limit],
    queryFn: () => getFollowing(page, limit),
  });
}

export function useGetConnections(
  type: "followers" | "following",
  page = 1,
  limit = 20
) {
  return useQuery({
    queryKey: [type, page, limit],
    queryFn: () =>
      type === "followers"
        ? getFollowers(page, limit)
        : getFollowing(page, limit),
  });
}
