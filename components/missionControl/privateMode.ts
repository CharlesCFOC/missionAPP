export type PrivateModeMap = Record<string, boolean>;

const STORAGE_KEY = "cfoc-private-mode";

export const readPrivateMode = (): PrivateModeMap => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as PrivateModeMap;
  } catch {
    return {};
  }
};

export const writePrivateMode = (next: PrivateModeMap) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};
