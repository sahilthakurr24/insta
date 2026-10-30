"use client"

import { Grid3X3, Lock, MapPin } from "lucide-react"
import Link from "next/link"

import { useGetCurrentUser } from "@/hooks/api/users"
import { Skeleton } from "@/components/ui/skeleton"

type ProfileResponse = {
  user: {
    username: string
    name: string | null
    avatar: string | null
    bio: string | null
    isPrivate: boolean
    createdAt: string
    followersCount: number
    followingCount: number
    totalPosts: number
  }
  posts: Array<{
    id: string
    caption: string | null
    media: Array<{ id: string; storageKey: string; mediaType: "image" | "video" }>
  }>
}

export function MeProfile() {
  const { data, isLoading, isError } = useGetCurrentUser()
  const profile = data as ProfileResponse | undefined

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-[935px] px-5 py-8 sm:px-10 sm:pt-12">
        <div className="flex gap-7 sm:gap-16">
          <Skeleton className="size-20 shrink-0 rounded-full sm:size-36" />
          <div className="flex-1 space-y-5 pt-2">
            <div className="flex gap-3"><Skeleton className="h-7 w-32" /><Skeleton className="h-8 w-24" /></div>
            <div className="hidden gap-10 sm:flex"><Skeleton className="h-4 w-14" /><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-20" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-36" /><Skeleton className="h-4 w-52" /></div>
          </div>
        </div>
        <Skeleton className="mt-12 h-px w-full" />
        <div className="mt-7 grid grid-cols-3 gap-1 sm:gap-7">
          {Array.from({ length: 6 }).map((_, index) => <Skeleton className="aspect-square rounded-none" key={index} />)}
        </div>
      </section>
    )
  }

  if (isError || !profile?.user) {
    return <div className="mx-auto w-full max-w-[935px] p-8 text-sm">We could not load your profile.</div>
  }

  const { user, posts } = profile

  return (
    <section className="mx-auto w-full max-w-[935px] px-5 py-8 sm:px-10 sm:pt-12">
      <header className="flex gap-7 sm:gap-16">
        <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] p-0.75 sm:size-36">
          <div className="grid size-full place-items-center overflow-hidden rounded-full bg-white dark:bg-black">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element -- Clerk avatars are external URLs.
              <img alt="" className="size-full object-cover" src={user.avatar} />
            ) : (
              <span className="text-3xl font-semibold text-[#737373]">{user.username.slice(0, 1).toUpperCase()}</span>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-normal">{user.username}</h1>
            <button className="rounded-lg bg-[#efefef] px-4 py-1.5 text-sm font-semibold text-[#262626] hover:bg-[#dbdbdb] dark:bg-[#262626] dark:text-white dark:hover:bg-[#363636]" type="button">
              Edit profile
            </button>
          </div>

          <dl className="my-5 hidden gap-10 text-sm sm:flex">
            <div><dt className="sr-only">Posts</dt><dd><strong>{user.totalPosts}</strong> posts</dd></div>
            <div><dt className="sr-only">Followers</dt><dd><Link href="/me/followers"><strong>{user.followersCount}</strong> followers</Link></dd></div>
            <div><dt className="sr-only">Following</dt><dd><Link href="/me/following"><strong>{user.followingCount}</strong> following</Link></dd></div>
          </dl>

          <div className="space-y-1 text-sm">
            {user.name && <p className="font-semibold">{user.name}</p>}
            {user.bio && <p className="whitespace-pre-line">{user.bio}</p>}
            <p className="flex items-center gap-1 text-xs text-[#737373]">
              {user.isPrivate && <Lock className="size-3" />}
              Member since {new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </header>

      <dl className="my-6 flex justify-around border-y border-[#dbdbdb] py-3 text-center text-sm sm:hidden dark:border-[#262626]">
        <div><dt className="font-semibold">{user.totalPosts}</dt><dd className="text-[#737373]">posts</dd></div>
        <div><dt className="font-semibold"><Link href="/me/followers">{user.followersCount}</Link></dt><dd className="text-[#737373]"><Link href="/me/followers">followers</Link></dd></div>
        <div><dt className="font-semibold"><Link href="/me/following">{user.followingCount}</Link></dt><dd className="text-[#737373]"><Link href="/me/following">following</Link></dd></div>
      </dl>

      <div className="mt-12 border-t border-[#dbdbdb] dark:border-[#262626]">
        <div className="mx-auto flex w-fit items-center gap-2 border-t border-[#262626] px-2 pt-3 text-xs font-semibold tracking-[1px] uppercase dark:border-white">
          <Grid3X3 className="size-3.5" /> Posts
        </div>

        {posts.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full border-2 border-current"><MapPin className="size-8" /></div>
            <h2 className="mt-4 text-3xl font-extrabold">Share photos</h2>
            <p className="mt-2 text-sm">When you share photos, they will appear on your profile.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 sm:gap-7">
            {posts.map((post) => {
              const firstMedia = post.media[0]
              return (
                <article className="aspect-square bg-[#efefef] dark:bg-[#262626]" key={post.id}>
                  {firstMedia?.mediaType === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Object-storage URLs may be signed.
                    <img alt={post.caption ?? "Post"} className="size-full object-cover" src={firstMedia.storageKey} />
                  ) : (
                    <div className="flex size-full items-center justify-center p-4 text-center text-xs text-[#737373]">{post.caption || "Video post"}</div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
