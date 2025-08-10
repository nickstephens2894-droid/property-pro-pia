export type Mode = 'auto' | 'manual';

export type Triplet<T> = {
  mode: Mode;
  auto: T | null;
  manual: T | null;
};

export const resolve = <T,>(t: Triplet<T> | undefined | null): T | null => {
  if (!t) return null;
  return t.mode === 'manual' && t.manual != null ? t.manual : t.auto ?? null;
};
