export const LISTEN_FIELD_IDS = ["explorer-desk-genre", "explorer-sheet-genre"] as const;
export const LISTEN_CONTROL_IDS = ["collection-listen"] as const;

export type ListenTarget = { kind: "field" | "control"; id: string };

export function pickListenFieldId(
  fields: ReadonlyArray<{ id: string; isVisible: boolean }>,
): string | undefined {
  return LISTEN_FIELD_IDS.find((id) => fields.some((field) => field.id === id && field.isVisible));
}

export function pickListenControlId(
  controls: ReadonlyArray<{ id: string; isVisible: boolean }>,
): string | undefined {
  return LISTEN_CONTROL_IDS.find((id) =>
    controls.some((control) => control.id === id && control.isVisible),
  );
}

export function pickListenTarget(input: {
  fields: ReadonlyArray<{ id: string; isVisible: boolean }>;
  controls: ReadonlyArray<{ id: string; isVisible: boolean }>;
}): ListenTarget | undefined {
  const fieldId = pickListenFieldId(input.fields);

  if (fieldId) {
    return { kind: "field", id: fieldId };
  }

  const controlId = pickListenControlId(input.controls);

  if (controlId) {
    return { kind: "control", id: controlId };
  }

  return undefined;
}

export function focusListenField(): boolean {
  const target = pickListenTarget({
    fields: LISTEN_FIELD_IDS.map((id) => ({ id, isVisible: isVisibleInput(id) })),
    controls: LISTEN_CONTROL_IDS.map((id) => ({ id, isVisible: isVisibleHost(id) })),
  });

  if (!target) {
    return false;
  }

  if (target.kind === "field") {
    const field = document.getElementById(target.id);

    if (!(field instanceof HTMLInputElement)) {
      return false;
    }

    field.focus();
    field.select();
    return true;
  }

  const host = document.getElementById(target.id);

  if (!host) {
    return false;
  }

  const control = [...host.querySelectorAll<HTMLElement>("a, button, input, select")].find(
    (node) => node.getClientRects().length > 0,
  );

  if (!control) {
    return false;
  }

  control.focus();
  return true;
}

function isVisibleInput(id: string): boolean {
  const field = document.getElementById(id);
  return field instanceof HTMLInputElement && field.getClientRects().length > 0;
}

function isVisibleHost(id: string): boolean {
  const host = document.getElementById(id);
  return host instanceof HTMLElement && host.getClientRects().length > 0;
}
