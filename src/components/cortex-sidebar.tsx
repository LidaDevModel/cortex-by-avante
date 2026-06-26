"use client";

import { usePathname } from "next/navigation";
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
  LayoutDashboard,
  MessageCircle,
  Library,
  BookOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "AI Chat", icon: MessageCircle, href: "/chat" },
  { label: "Library", icon: Library, href: "/library" },
];

const trainingSubItems = [
  { label: "Modules", href: "/training/modules" },
  { label: "Knowledge Check", href: "/training/quick-check" },
];

export function CortexSidebar() {
  const pathname = usePathname();
  return (
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
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={item.label}
                className="gap-3 rounded-lg"
              >
                <a href={item.href}>
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </a>
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
                        <a href={sub.href}>{sub.label}</a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="shadcn · m@example.com"
              className="gap-3 h-auto py-2 rounded-lg"
            >
              <Avatar className="h-7 w-7 rounded-lg shrink-0">
                <AvatarFallback className="rounded-lg bg-secondary text-primary font-semibold text-xs">
                  MM
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium leading-tight truncate">shadcn</span>
                <span className="text-xs text-muted-foreground leading-tight truncate">
                  m@example.com
                </span>
              </div>
              <ChevronRight size={14} className="ml-auto text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
