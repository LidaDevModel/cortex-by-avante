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
  Lock,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { USER, ROLE_LABEL } from "@/lib/user-mock";
import { useCurrentRole } from "@/lib/current-role";
import { useManageAccess } from "@/hooks/use-admin-unlocked";
import { navGroupOpen, setNavGroupOpen, useNavGroups } from "@/lib/nav-groups";
import { useIsCompactNav } from "@/hooks/use-nav-shape";
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
  { label: "Knowledge check", href: "/training/quick-check" },
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
  { label: "Knowledge check", href: "/training/quick-check" },
];

export function CortexSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const role = useCurrentRole();
  // Cortex Manage appears only once the admin is cleared for duty; a not-cleared
  // admin navigates as a learner (same nav as a field agent) until they finish
  // their required training.
  const canManage = useManageAccess();
  // The Manage nav shows to every admin, cleared or not: an admin who was
  // cleared yesterday and lost it to a newly-required module reads a vanished
  // section as a fault. Locked, each screen keeps its title and explains itself.
  const showManage = role === "admin";
  const manageLocked = showManage && !canManage;
  // Keeps the `defaultOpen` reads below current after a manual toggle — see
  // nav-groups for why a bare module write is not enough.
  useNavGroups();

  /* Which group opens with the DRAWER.
     Precedence: the section you are IN, then what you last chose, then a
     fallback. The fallback matters because "open the section you are in"
     answers nothing on the pages that belong to no section — admin Home,
     People, Flagged responses, Activity log. The drawer used to open there
     with everything shut, so every sub-item cost two taps. Content takes the
     fallback: it is the authoring surface admins spend most of their time in.
     The active section always wins, so you can never collapse your way into a
     drawer that gives no clue where you are.

     Gated on `compact` so DESKTOP IS UNTOUCHED — it keeps its route-based
     defaults and its own session state. Nothing is hidden behind a burger
     there, so "opens with everything shut" is not a problem on that surface,
     and it is a working one. Toggles still record either way, so a choice made
     on one surface carries to the other. */
  const compact = useIsCompactNav();
  const inContent = pathname.startsWith("/admin/content");
  const inLearning = !pathname.startsWith("/admin");
  const noSectionActive = !inContent && !inLearning;
  const contentGroupOpen =
    inContent || (compact && (navGroupOpen("content") ?? noSectionActive));
  const learningGroupOpen =
    inLearning || (compact && (navGroupOpen("learning") ?? false));
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
          {showManage ? (
            <>
              {/* Manage — the admin's primary work, top-level. One padlock for
                  the whole section while locked; the rows stay reachable and
                  each screen states its own reason. */}
              {manageLocked && (
                <SidebarMenuItem>
                  <div className="flex items-center gap-1.5 px-3 pt-1 pb-2 text-muted-foreground group-data-[collapsible=icon]:hidden">
                    <Lock size={12} strokeWidth={2} className="shrink-0" />
                    <span className="text-[11px] leading-[14px] font-semibold uppercase tracking-wide">
                      Locked until cleared
                    </span>
                  </div>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/admin"} tooltip="Home" className="gap-3 rounded-lg">
                  <Link href="/admin">
                    <LayoutDashboard size={16} />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Collapsible
                className="group/collapsible"
                defaultOpen={contentGroupOpen}
                onOpenChange={(o) => setNavGroupOpen("content", o)}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Content" className="gap-3 rounded-lg">
                      <Folder size={16} />
                      <span>Content</span>
                      <ChevronDown
                        size={14}
                        className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180 group-data-[collapsible=icon]:hidden"
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                    <SidebarMenuSub>
                      {contentSubItems.map((sub) => (
                        <SidebarMenuSubItem key={sub.label}>
                          <SidebarMenuSubButton
                            asChild
                            // "Library" is a prefix of "Modules", so a plain
                            // startsWith would light both on a module route.
                            // An exact match went too far the other way and
                            // lost the highlight on a document editor at
                            // /admin/content/[id]. Match the subtree, minus
                            // the one that belongs to its sibling.
                            isActive={
                              sub.href === "/admin/content"
                                ? pathname.startsWith("/admin/content") &&
                                  !pathname.startsWith("/admin/content/training")
                                : pathname.startsWith(sub.href)
                            }
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
              <Collapsible
                className="group/collapsible"
                defaultOpen={learningGroupOpen}
                onOpenChange={(o) => setNavGroupOpen("learning", o)}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Learning" className="gap-3 rounded-lg">
                      <GraduationCap size={16} />
                      <span>Learning</span>
                      <ChevronDown
                        size={14}
                        className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180 group-data-[collapsible=icon]:hidden"
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
              <Collapsible
                className="group/collapsible"
                defaultOpen={pathname.startsWith("/training") || (compact && (navGroupOpen("training") ?? false))}
                onOpenChange={(o) => setNavGroupOpen("training", o)}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Training" className="gap-3 rounded-lg">
                      <BookOpen size={16} />
                      <span>Training</span>
                      <ChevronDown
                        size={14}
                        className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180 group-data-[collapsible=icon]:hidden"
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
              {/* z-[60]: on mobile this menu is triggered from inside the nav
                  drawer (a Sheet at z-[55]); the default dropdown z-50 renders
                  it behind the panel. Lift it above the drawer. */}
              <DropdownMenuContent side="top" align="start" className="w-[200px] z-[60]">
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
