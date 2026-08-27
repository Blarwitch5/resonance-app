export const LISTEN_FIELD_IDS = ["explorer-desk-genre", "explorer-sheet-genre"] as const;

export function pickListenFieldId(
  fields: ReadonlyArray<{ id: string; isVisible: boolean }>,
): string | undefined {
  return LISTEN_FIELD_IDS.find((id) => fields.some((field) => field.id === id && field.isVisible));
}

export function focusListenField(): boolean {
  const id = pickListenFieldId(
    LISTEN_FIELD_IDS.map((fieldId) => {
      const field = document.getElementById(fieldId);
      const isVisible =
        field instanceof HTMLInputElement && field.getClientRects().length > 0;

      return { id: fieldId, isVisible };
    }),
  );

  if (!id) {
    return false;
  }

  const field = document.getElementById(id);

  if (!(field instanceof HTMLInputElement)) {
    return false;
  }

  field.focus();
  field.select();
  return true;
}
