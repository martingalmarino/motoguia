export type CollectionEntry<_T extends string> = { id: string; data: any; body?: string };

export async function getCollection() {
  return [];
}

export async function getEntry() {
  return undefined;
}

export async function render() {
  return { Content: null };
}
