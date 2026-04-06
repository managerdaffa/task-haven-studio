export interface TaskFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  uploadedAt: string;
}

export interface FolderComment {
  id: string;
  name: string;
  text: string;
  createdAt: string;
}

export interface TaskFolder {
  id: string;
  title: string;
  createdAt: string;
  files: TaskFile[];
  comments: FolderComment[];
}

const STORAGE_KEY = "task-folders";

export function getFolders(): TaskFolder[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const folders: TaskFolder[] = JSON.parse(raw);
  // Migrate: ensure comments array exists
  return folders.map((f) => ({ ...f, comments: f.comments || [] }));
}

export function saveFolders(folders: TaskFolder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
}

export function createFolder(title: string): TaskFolder {
  const folder: TaskFolder = {
    id: crypto.randomUUID(),
    title,
    createdAt: new Date().toISOString(),
    files: [],
    comments: [],
  };
  const folders = getFolders();
  folders.unshift(folder);
  saveFolders(folders);
  return folder;
}

export function deleteFolder(id: string) {
  saveFolders(getFolders().filter((f) => f.id !== id));
}

export function updateFolderTitle(id: string, title: string) {
  const folders = getFolders();
  const f = folders.find((f) => f.id === id);
  if (f) f.title = title;
  saveFolders(folders);
}

export function addFileToFolder(folderId: string, file: TaskFile) {
  const folders = getFolders();
  const f = folders.find((f) => f.id === folderId);
  if (f) f.files.push(file);
  saveFolders(folders);
}

export function deleteFileFromFolder(folderId: string, fileId: string) {
  const folders = getFolders();
  const f = folders.find((f) => f.id === folderId);
  if (f) f.files = f.files.filter((fi) => fi.id !== fileId);
  saveFolders(folders);
}

export function addCommentToFolder(folderId: string, name: string, text: string): FolderComment {
  const comment: FolderComment = {
    id: crypto.randomUUID(),
    name,
    text,
    createdAt: new Date().toISOString(),
  };
  const folders = getFolders();
  const f = folders.find((f) => f.id === folderId);
  if (f) f.comments.push(comment);
  saveFolders(folders);
  return comment;
}
