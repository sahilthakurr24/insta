"use client";

import { doLikeUnlike } from "@/lib/api/likes";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDoLikeUnlike(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: doLikeUnlike,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["post", postId],
      });
    },
  });
}
