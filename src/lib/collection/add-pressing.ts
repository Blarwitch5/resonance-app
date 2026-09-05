export function shouldShowAddPressing(pathname: string, isSignedIn: boolean): boolean {
  if (!isSignedIn) {
    return false;
  }

  return pathname === "/collection" || pathname === "/explorer";
}
