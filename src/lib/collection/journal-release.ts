/** Classes for the compact journal “let this one go” trigger beside Save. */
export function journalReleaseTriggerClass(): string {
  return [
    "size-11 shrink-0 cursor-pointer border border-error/40 bg-transparent px-0 text-error",
    "hover:border-error hover:bg-error-soft hover:text-error",
    "sm:size-12 sm:min-h-12 sm:px-0 focus-visible:ring-error",
  ].join(" ");
}
