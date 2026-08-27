export interface TonightRecord {
  id: string;
  isFavorite: boolean;
}

export function tonightDayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function tonightFromShelf(records: readonly TonightRecord[], dayKey: string): string | null {
  const close = records.filter((record) => record.isFavorite);
  const pool = [...(close.length > 0 ? close : records)].sort((left, right) => left.id.localeCompare(right.id));

  if (pool.length === 0) {
    return null;
  }

  return pool[hashIndex(dayKey, pool.length)]?.id ?? null;
}

function hashIndex(dayKey: string, length: number): number {
  let hash = 2166136261;

  for (let index = 0; index < dayKey.length; index += 1) {
    hash ^= dayKey.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) % length;
}
