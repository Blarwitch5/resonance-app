export const FOCUS_SEARCH_KEY = "resonance-focus-search";
export const SEARCH_FIELD_IDS = ["collection-q", "explorer-q", "profile-q"] as const;

export function focusSearchField(): boolean {
  for (const id of SEARCH_FIELD_IDS) {
    const field = document.getElementById(id);

    if (field instanceof HTMLInputElement) {
      field.focus();
      field.select();
      return true;
    }
  }

  return false;
}
