export type MissionControlItemType = "mission" | "project";

export type StoredFinanceFolder = {
  id: string;
  name: string;
  refType: MissionControlItemType;
  refId: string;
  files: number;
};

export type StoredDriveFolder = {
  id: string;
  name: string;
  refType: MissionControlItemType;
  refId: string;
};

export type StoredTodoList = {
  id: string;
  title: string;
  type: MissionControlItemType;
  location?: string;
  progress?: number;
};

export const FINANCE_FOLDERS_STORAGE_KEY = "cfoc-finance-folders";
export const DRIVE_FOLDERS_STORAGE_KEY = "cfoc-drive-folders";
export const TODO_LISTS_STORAGE_KEY = "cfoc-todo-lists";

const readArray = <T,>(key: string): T[] => {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch (error) {
    console.error(`Failed to parse ${key}`, error);
    return [];
  }
};

const writeArray = <T,>(key: string, value: T[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const normalizeType = (value: unknown): MissionControlItemType | null => {
  if (value === "mission" || value === "project") return value;
  return null;
};

export const readStoredFinanceFolders = (): StoredFinanceFolder[] => {
  return readArray<StoredFinanceFolder>(FINANCE_FOLDERS_STORAGE_KEY)
    .map((item) => {
      const refType = normalizeType(item?.refType);
      if (!refType || typeof item?.id !== "string" || typeof item?.name !== "string") {
        return null;
      }
      return {
        id: item.id,
        name: item.name,
        refType,
        refId: typeof item.refId === "string" ? item.refId : item.id,
        files: typeof item.files === "number" ? item.files : 0,
      };
    })
    .filter(Boolean) as StoredFinanceFolder[];
};

export const readStoredDriveFolders = (): StoredDriveFolder[] => {
  return readArray<StoredDriveFolder>(DRIVE_FOLDERS_STORAGE_KEY)
    .map((item) => {
      const refType = normalizeType(item?.refType);
      if (!refType || typeof item?.id !== "string" || typeof item?.name !== "string") {
        return null;
      }
      return {
        id: item.id,
        name: item.name,
        refType,
        refId: typeof item.refId === "string" ? item.refId : item.id,
      };
    })
    .filter(Boolean) as StoredDriveFolder[];
};

export const readStoredTodoLists = (): StoredTodoList[] => {
  return readArray<StoredTodoList>(TODO_LISTS_STORAGE_KEY)
    .map((item) => {
      const type = normalizeType(item?.type);
      if (!type || typeof item?.id !== "string" || typeof item?.title !== "string") {
        return null;
      }
      return {
        id: item.id,
        title: item.title,
        type,
        location: typeof item.location === "string" ? item.location : undefined,
        progress: typeof item.progress === "number" ? item.progress : undefined,
      };
    })
    .filter(Boolean) as StoredTodoList[];
};

export const ensureMissionControlFolders = (params: {
  type: MissionControlItemType;
  id: string;
  name: string;
  location?: string;
}) => {
  if (typeof window === "undefined") return;
  const name = params.name.trim() || (params.type === "mission" ? "Untitled Mission" : "Untitled Project");
  const financeName = params.type === "mission" ? `${name} (Mission)` : name;

  const financeFolders = readStoredFinanceFolders();
  if (!financeFolders.some((item) => item.refType === params.type && item.refId === params.id)) {
    financeFolders.push({
      id: `finance-${params.type}-${params.id}`,
      name: financeName,
      refType: params.type,
      refId: params.id,
      files: 0,
    });
    writeArray(FINANCE_FOLDERS_STORAGE_KEY, financeFolders);
  }

  const driveFolders = readStoredDriveFolders();
  if (!driveFolders.some((item) => item.refType === params.type && item.refId === params.id)) {
    driveFolders.push({
      id: `drive-${params.type}-${params.id}`,
      name,
      refType: params.type,
      refId: params.id,
    });
    writeArray(DRIVE_FOLDERS_STORAGE_KEY, driveFolders);
  }

  const todoLists = readStoredTodoLists();
  if (!todoLists.some((item) => item.type === params.type && item.id === params.id)) {
    todoLists.push({
      id: params.id,
      title: name,
      type: params.type,
      location: params.location?.trim() || undefined,
      progress: 0,
    });
    writeArray(TODO_LISTS_STORAGE_KEY, todoLists);
  }
};

export const updateStoredFinanceFolderName = (id: string, name: string) => {
  if (typeof window === "undefined") return;
  const folders = readStoredFinanceFolders();
  const index = folders.findIndex((folder) => folder.id === id);
  if (index < 0) return;
  folders[index] = { ...folders[index], name };
  writeArray(FINANCE_FOLDERS_STORAGE_KEY, folders);
};

export const removeStoredFinanceFolder = (id: string) => {
  if (typeof window === "undefined") return;
  const folders = readStoredFinanceFolders();
  const next = folders.filter((folder) => folder.id !== id);
  if (next.length !== folders.length) {
    writeArray(FINANCE_FOLDERS_STORAGE_KEY, next);
  }
};

export const updateStoredDriveFolderName = (id: string, name: string) => {
  if (typeof window === "undefined") return;
  const folders = readStoredDriveFolders();
  const index = folders.findIndex((folder) => folder.id === id);
  if (index < 0) return;
  folders[index] = { ...folders[index], name };
  writeArray(DRIVE_FOLDERS_STORAGE_KEY, folders);
};

export const removeStoredDriveFolder = (id: string) => {
  if (typeof window === "undefined") return;
  const folders = readStoredDriveFolders();
  const next = folders.filter((folder) => folder.id !== id);
  if (next.length !== folders.length) {
    writeArray(DRIVE_FOLDERS_STORAGE_KEY, next);
  }
};
