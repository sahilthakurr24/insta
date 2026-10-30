"use client";
import {
  conversation,
  createConversationDirect,
  createConversationGroup,
} from "@/lib/api/createConversation";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useCreateConversationDirect() {
  return useMutation({
    mutationFn: createConversationDirect,
  });
}

export function useCreateConversationGroup() {
  return useMutation({
    mutationFn: createConversationGroup,
  });
}

export function useGetConversation(conversationId: string) {
  return useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => conversation(conversationId),
    enabled: !!conversationId,
  });
}
