import { Library, ScanSearch, UserRound } from "lucide-react";

export const MAIN_NAV = [
  { href: "/collection", id: "collection", label: "Collection", icon: Library },
  { href: "/explorer", id: "explorer", label: "Explorer", icon: ScanSearch },
  { href: "/profile", id: "profile", label: "Profile", icon: UserRound },
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
