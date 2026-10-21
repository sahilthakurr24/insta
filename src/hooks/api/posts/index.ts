"use client";
import { createPost, deletePost, getPost } from "@/lib/api/posts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCreatePost(userName: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userName", userName],
      });
    },
  });
}

export function useGetPost(postId: string) {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPost(postId),
    enabled: !!postId,
  });
}

export function useDeletePost(userName: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userName", userName],
      });
    },
  });
}
