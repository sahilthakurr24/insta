"use client"

import Link from "next/link"
import { ArrowLeft, Users } from "lucide-react"

import { useGetConnections } from "@/hooks/api/follow"
import { Skeleton } from "@/components/ui/skeleton"

type Connection = {
  id: string
  username: string
  name: string | null
  avatar: string | null
  bio: string | null
}

type ConnectionsResponse = {
  followers?: Connection[]
  following?: Connection[]
}

export function ConnectionsList({ type }: { type: "followers" | "following" }) {
  const query = useGetConnections(type)
  const data = query.data as ConnectionsResponse | undefined
  const people = type === "followers" ? data?.followers : data?.following
  const title = type === "followers" ? "Followers" : "Following"

  if (query.isLoading) {
    return (
      <main className="min-h-svh w-full bg-white dark:bg-black">
        <header className="relative flex h-14 items-center justify-center border-b border-[#dbdbdb] dark:border-[#262626]">
          <Skeleton className="absolute left-5 size-5 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </header>
        <div className="space-y-1 px-4 py-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <div className="flex items-center gap-3 py-2" key={index}>
              <Skeleton className="size-11 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))}
        </div>
      </main>
    )
  }

  if (query.isError) {
    return <main className="w-full p-8 text-sm">We could not load your {title.toLowerCase()}.</main>
  }

  return (
    <main className="min-h-svh w-full bg-white dark:bg-black">
      <header className="relative flex h-14 items-center justify-center border-b border-[#dbdbdb] dark:border-[#262626]">
        <Link aria-label="Back to profile" className="absolute left-4 rounded-full p-2 hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a]" href="/me">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-base font-semibold">{title}</h1>
      </header>

      {people && people.length > 0 ? (
        <ul className="divide-y divide-[#efefef] dark:divide-[#262626]">
          {people.map((person) => (
            <li className="flex items-center gap-3 px-4 py-3" key={person.id}>
              <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[#efefef] text-sm font-semibold text-[#737373] dark:bg-[#262626]">
                {person.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element -- Clerk avatars are external URLs.
                  <img alt="" className="size-full object-cover" src={person.avatar} />
                ) : (
                  person.username.slice(0, 1).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{person.username}</p>
                {(person.name || person.bio) && <p className="truncate text-sm text-[#737373]">{person.name || person.bio}</p>}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center px-6 py-24 text-center">
          <div className="grid size-16 place-items-center rounded-full border-2 border-current"><Users className="size-8" /></div>
          <h2 className="mt-4 text-xl font-bold">No {title.toLowerCase()} yet</h2>
          <p className="mt-2 text-sm text-[#737373]">People you connect with will appear here.</p>
        </div>
      )}
    </main>
  )
}
