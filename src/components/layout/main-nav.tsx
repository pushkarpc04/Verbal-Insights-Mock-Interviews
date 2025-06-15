
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  TooltipContent
} from "@/components/ui/sidebar";
import type { TooltipProps } from "@radix-ui/react-tooltip";

interface NavItem {
  title: string;
  href: string;
  icon: keyof typeof Icons;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  description?: string;
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
  items?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "home",
    tooltip: "Overview of your activities",
  },
  {
    title: "Mock Interviews",
    href: "/interviews",
    icon: "mic",
    tooltip: "Practice your interview skills",
    items: [
       { title: "Start New Interview", href: "/interviews/new", icon: "add" },
       { title: "Past Sessions", href: "/interviews/history", icon: "list" },
    ]
  },
  {
    title: "Question Sets",
    href: "/question-sets",
    icon: "questionSet",
    tooltip: "Manage your custom question sets",
  },
  {
    title: "Progress",
    href: "/progress",
    icon: "progress",
    tooltip: "Track your improvement",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: "settings",
    tooltip: "Configure your preferences",
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const Icon = Icons[item.icon || "add"];
        const isActive = item.items
          ? item.items.some(subItem => pathname.startsWith(subItem.href)) || pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild={!item.items}
              isActive={isActive}
              className="w-full"
              tooltip={item.tooltip as string | undefined}
            >
              {item.items ? (
                <>
                  <Icon className="mr-2 h-5 w-5" />
                  <span>{item.title}</span>
                </>
              ) : (
                <Link href={item.href} className="flex items-center">
                  <Icon className="mr-2 h-5 w-5" />
                  {item.title}
                </Link>
              )}
            </SidebarMenuButton>
            {item.items && isActive && (
              <SidebarMenuSub>
                {item.items.map((subItem) => {
                  const SubIcon = Icons[subItem.icon || "add"];
                  const isSubActive = pathname.startsWith(subItem.href);
                  return (
                    <SidebarMenuSubItem key={subItem.href}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isSubActive}
                      >
                        <Link href={subItem.href} className="flex items-center">
                          <SubIcon className="mr-2 h-4 w-4" />
                          {subItem.title}
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  );
                })}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
