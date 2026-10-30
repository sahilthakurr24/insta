"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import {
  Clapperboard,
  Compass,
  Heart,
  House,
  LogOut,
  MessageCircle,
  Search,
  SquarePlus,
} from "lucide-react"
import { useClerk } from "@clerk/nextjs"

import { cn } from "cn"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"

type NavigationItem = {
  label: string
  href: string
  icon: LucideIcon
}

const navigation: NavigationItem[] = [
  { label: "Home", href: "/", icon: House },
  { label: "Search", href: "/search", icon: Search },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Reels", href: "/reels", icon: Clapperboard },
  { label: "Messages", href: "/messages", icon: MessageCircle },
  { label: "Notifications", href: "/notifications", icon: Heart },
  { label: "Create", href: "/create", icon: SquarePlus },
]

function InstagramMark() {
  return (
    <span
      aria-hidden="true"
      className="relative grid size-7 place-items-center rounded-[9px] bg-linear-to-tr from-[#feda75] via-[#fa7e1e] via-[45%] to-[#d62976] shadow-sm"
    >
      <span className="size-4 rounded-[5px] border-[1.75px] border-white" />
      <span className="absolute size-1.5 rounded-full border-[1.5px] border-white" />
      <span className="absolute top-[6px] right-[6px] size-0.75 rounded-full bg-white" />
    </span>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const { signOut } = useClerk()

  return (
    <Sidebar
      className="border-r border-[#dbdbdb] bg-white text-[#262626] dark:border-[#262626] dark:bg-black dark:text-[#f5f5f5]"
      style={{ "--sidebar-width": "15.25rem" } as React.CSSProperties}
    >
      <SidebarHeader className="px-6 pt-9 pb-7">
        <Link
          aria-label="Instagram home"
          className="flex items-center gap-2.5 text-[#262626] dark:text-[#f5f5f5]"
          href="/"
        >
          <InstagramMark />
          <span className="font-[cursive] text-[27px] leading-none tracking-[-1.5px]">
            Instagram
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="overflow-hidden px-3">
        <nav aria-label="Primary navigation" className="flex flex-col gap-1">
          {navigation.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                className={cn(
                  "group flex h-12 items-center gap-4 rounded-lg px-3 text-[16px] tracking-[0.01em] transition-colors duration-150 hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a]",
                  active && "font-bold"
                )}
                href={item.href}
                key={item.label}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "size-6 stroke-[1.9] transition-transform duration-150 group-hover:scale-105",
                    active && item.label === "Home" && "fill-current"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            )
          })}

          <Link
            className={cn(
              "group flex h-12 items-center gap-4 rounded-lg px-3 text-[16px] tracking-[0.01em] transition-colors duration-150 hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a]",
              pathname.startsWith("/me") && "font-bold"
            )}
            href="/me"
          >
            <span className="grid size-6 place-items-center rounded-full bg-linear-to-br from-[#feda75] via-[#d62976] to-[#4f5bd5] p-0.5">
              <span className="grid size-full place-items-center rounded-full bg-white text-[9px] font-bold text-[#262626] dark:bg-[#262626] dark:text-white">
                U
              </span>
            </span>
            <span>Profile</span>
          </Link>
        </nav>
      </SidebarContent>

      <SidebarFooter className="p-3 pb-5">
        <button
          aria-label="Log out"
          className="group flex h-12 w-full items-center gap-4 rounded-lg px-3 text-left text-[16px] tracking-[0.01em] transition-colors duration-150 hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a]"
          onClick={() => signOut({ redirectUrl: "/sign-in" })}
          type="button"
        >
          <LogOut aria-hidden="true" className="size-6 stroke-[1.9] transition-transform group-hover:scale-105" />
          <span>Log out</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
