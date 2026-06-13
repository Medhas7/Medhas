import {
  Brain,
  CalendarCheck,
  FolderKanban,
  Gauge,
  History,
  MessageSquare,
  Network,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/command", label: "Command Center", short: "Command", icon: MessageSquare, description: "Converse with SARATHI" },
  { href: "/today", label: "Today Cockpit", short: "Today", icon: CalendarCheck, description: "Priorities, rhythm, rituals" },
  { href: "/nodes", label: "Life Node Graph", short: "Nodes", icon: Network, description: "The ten areas of life" },
  { href: "/projects", label: "Projects", short: "Projects", icon: FolderKanban, description: "Ventures and their tasks" },
  { href: "/memory", label: "Memory Vault", short: "Memory", icon: Brain, description: "What SARATHI remembers" },
  { href: "/review", label: "Daily Review", short: "Review", icon: Gauge, description: "Score the day across eight dimensions" },
  { href: "/runs", label: "Agent Runs", short: "Runs", icon: History, description: "Every agent call, logged" },
  { href: "/settings", label: "Settings", short: "Settings", icon: Settings, description: "Providers, permissions, privacy" },
];
