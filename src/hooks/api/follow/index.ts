"use client";

import { follow } from "@/lib/api/follow";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
