"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";

export function QueryProvider({children} : {children : React.ReactNode}){
    //we initialize in this way because we dont want to initialize the query client in every render
    const [queryClient] = useState(()=>  new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}