"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  House,
  MessageCircle,
  Library,
  BookOpen,
  ChevronDown,
  ChevronRight,
  LogOut,
  Settings,
  UserRound,
  LayoutDashboard,
  Users,
  GraduationCap,
  Folder,
  Flag,
  History,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { USER, ROLE_LABEL } from "@/lib/user-mock";
import { useCurrentRole } from "@/lib/current-role";
import { getAuthProfile, signOut } from "@/lib/auth-mock";
import { ExitConfirmDialog } from "@/components/ui/exit-confirm-dialog";

const navItems = [
  // "Home" everywhere (tab bar, sidebar, breadcrumb) — the route stays /dashboard.
  { label: "Home", icon: House, href: "/dashboard" },
  { label: "AI Chat", icon: MessageCircle, href: "/chat" },
  { label: "Library", icon: Library, href: "/library" },
];

const trainingSubItems = [
  { label: "Modules", href: "/training/modules" },
  { label: "Knowledge Check", href: "/training/quick-check" },
];

// Content authoring — Library documents and training Modules.
const contentSubItems = [
  { label: "Library", href: "/admin/content" },
  { label: "Modules", href: "/admin/content/training" },
];

// The admin's own learning surfaces, grouped under "Learning". Modules and
// Knowledge Check sit flat here to avoid a group inside a group.
const learningSubItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "AI Chat", href: "/chat" },
  { label: "Library", href: "/library" },
  { label: "Modules", href: "/training/modules" },
  { label: "Knowledge Check", href: "/training/quick-check" },
];

export function CortexSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const role = useCurrentRole();
  // Read once per mount — the shell renders post-AuthGate, so localStorage is safe.
  const avatarUrl = getAuthProfile().avatarUrl;
  return (
    <>
    {/* fragment: sidebar + the sign-out confirm */}
    <Sidebar collapsible="icon" variant="inset" className="border-none bg-transparent">
      <SidebarHeader className="px-4 pt-5 pb-4">
        {/* Collapsed: "C" placeholder. Expanded: "Cortex" */}
        <span className="text-base font-semibold text-foreground tracking-tight group-data-[collapsible=icon]:hidden">
          Cortex
        </span>
        <span className="text-base font-semibold text-foreground tracking-tight hidden group-data-[collapsible=icon]:block">
          C
        </span>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarMenu>
          {role === "admin" ? (
            <>
              {/* Manage — the admin's primary work, top-level. (Content and
                  Reports arrive with their phases.) */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/admin"} tooltip="Home" className="gap-3 rounded-lg">
                  <Link href="/admin">
                    <LayoutDashboard size={16} />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Collapsible defaultOpen={pathname.startsWith("/admin/content")}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Content" className="gap-3 rounded-lg">
                      <Folder size={16} />
                      <span>Content</span>
                      <ChevronDown
                        size={14}
                        className="ml-auto transition-transform duration-200 [[data-state=open]_&]:rotate-180 group-data-[collapsible=icon]:hidden"
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                    <SidebarMenuSub>
                      {contentSubItems.map((sub) => (
                        <SidebarMenuSubItem key={sub.label}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={sub.href === "/admin/content" ? pathname === "/admin/content" : pathname.startsWith(sub.href)}
                          >
                            <Link href={sub.href}>{sub.label}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Flagged responses and the activity log are different jobs —
                  each stands alone, like People. */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/reports/flagged")} tooltip="Flagged responses" className="gap-3 rounded-lg">
                  <Link href="/admin/reports/flagged">
                    <Flag size={16} />
                    <span>Flagged responses</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/reports/activity")} tooltip="Activity log" className="gap-3 rounded-lg">
                  <Link href="/admin/reports/activity">
                    <History size={16} />
                    <span>Activity log</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/people")} tooltip="People" className="gap-3 rounded-lg">
                  <Link href="/admin/people">
                    <Users size={16} />
                    <span>People</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Learning — the admin's own training surfaces, grouped and
                  demoted below Manage. Opens by default on a learner route. */}
              <Collapsible defaultOpen={!pathname.startsWith("/admin")}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Learning" className="gap-3 rounded-lg">
                      <GraduationCap size={16} />
                      <span>Learning</span>
                      <ChevronDown
                        size={14}
                        className="ml-auto transition-transform duration-200 [[data-state=open]_&]:rotate-180 group-data-[collapsible=icon]:hidden"
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                    <SidebarMenuSub>
                      {learningSubItems.map((sub) => (
                        <SidebarMenuSubItem key={sub.label}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={sub.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(sub.href)}
                          >
                            <Link href={sub.href}>{sub.label}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </>
          ) : (
            <>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                    className="gap-3 rounded-lg"
                  >
                    <Link href={item.href}>
                      <item.icon size={16} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Training — collapsible sub-menu, icon-only when sidebar is collapsed */}
              <Collapsible defaultOpen={pathname.startsWith("/training")}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Training" className="gap-3 rounded-lg">
                      <BookOpen size={16} />
                      <span>Training</span>
                      <ChevronDown
                        size={14}
                        className="ml-auto transition-transform duration-200 [[data-state=open]_&]:rotate-180 group-data-[collapsible=icon]:hidden"
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                    <SidebarMenuSub>
                      {trainingSubItems.map((sub) => (
                        <SidebarMenuSubItem key={sub.label}>
                          <SidebarMenuSubButton asChild isActive={pathname.startsWith(sub.href)}>
                            <Link href={sub.href}>{sub.label}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  tooltip={`${USER.fullName} · ${ROLE_LABEL[role]}`}
                  className="gap-3 h-auto py-2 rounded-lg"
                >
                  <Avatar className="h-7 w-7 rounded-full shrink-0">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
                    <AvatarFallback className="rounded-full bg-secondary text-primary font-semibold text-xs">
                      {USER.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start min-w-0 group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium leading-tight truncate">{USER.fullName}</span>
                    <span className="text-xs text-muted-foreground leading-tight truncate">
                      {ROLE_LABEL[role]}
                    </span>
                  </div>
                  <ChevronRight size={14} className="ml-auto text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-[200px]">
                {/* Destinations only — editing launches from the profile page
                    itself. Mirrors the mobile avatar dial (Profile · Settings). */}
                <DropdownMenuItem onSelect={() => router.push("/profile")}>
                  <UserRound size={16} strokeWidth={1.5} />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push("/settings")}>
                  <Settings size={16} strokeWidth={1.5} />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setSignOutOpen(true)}>
                  <LogOut size={16} strokeWidth={1.5} />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>

    <ExitConfirmDialog
      open={signOutOpen}
      onOpenChange={setSignOutOpen}
      title="Sign out?"
      description="You'll need to sign in again to continue."
      exitLabel="Sign out"
      cancelLabel="Stay signed in"
      onExit={() => {
        signOut();
        router.push("/sign-in");
      }}
    />
    </>
  );
}
