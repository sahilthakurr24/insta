"use client";
import { createPost, deletePost, getPost } from "@/lib/api/posts";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useCreatePost() {
  return useMutation({
    mutationFn: createPost,
  });
}

export function useGetPost(postId: string) {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPost(postId),
    enabled: !!postId,
  });
}

export function useDeletePost() {
  return useMutation({
    mutationFn: deletePost,
  });
}
