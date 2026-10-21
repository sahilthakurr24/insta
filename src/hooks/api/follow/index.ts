"use client";

import { follow } from "@/lib/api/follow";
import { useMutation } from "@tanstack/react-query";

export function useFollow() {
  return useMutation({
    mutationFn: follow,
  });
}
