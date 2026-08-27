import { Library, ScanSearch, User } from "lucide-react";

export const MAIN_NAV = [
  { href: "/collection", label: "Collection", icon: Library },
  { href: "/explorer", label: "Explorer", icon: ScanSearch },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function isMainNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function sidebarSubNavKind(href: string): "collection" | "profile" | null {
  if (href === "/collection") {
    return "collection";
  }

  if (href === "/profile") {
    return "profile";
  }

  return null;
}
