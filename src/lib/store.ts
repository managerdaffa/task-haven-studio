import { supabase } from "@/integrations/supabase/client";

export interface TaskFile {
  id: string;
  name: string;
  size: number;
  type: string;
  storage_path: string;
  uploaded_at: string;
  folder_id: string;
}

export interface FolderComment {
  id: string;
  name: string;
  text: string;
  created_at: string;
  folder_id: string;
}

export interface TaskFolder {
  id: string;
  title: string;
  created_at: string;
  files: TaskFile[];
  comments: FolderComment[];
}

export async function getFolders(): Promise<TaskFolder[]> {
  const { data: folders, error } = await supabase
    .from("folders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !folders) return [];

  const { data: files } = await supabase.from("files").select("*");
  const { data: comments } = await supabase.from("comments").select("*").order("created_at", { ascending: true });

  return folders.map((f) => ({
    ...f,
    files: (files || []).filter((fi) => fi.folder_id === f.id),
    comments: (comments || []).filter((c) => c.folder_id === f.id),
  }));
}

export async function createFolder(title: string): Promise<TaskFolder | null> {
  const { data, error } = await supabase
    .from("folders")
    .insert({ title })
    .select()
    .single();

  if (error || !data) return null;
  return { ...data, files: [], comments: [] };
}

export async function deleteFolder(id: string) {
  // Delete storage files first
  const { data: files } = await supabase.from("files").select("storage_path").eq("folder_id", id);
  if (files && files.length > 0) {
    const paths = files.map((f) => f.storage_path).filter(Boolean);
    if (paths.length > 0) {
      await supabase.storage.from("task-files").remove(paths);
    }
  }
  await supabase.from("folders").delete().eq("id", id);
}

export async function updateFolderTitle(id: string, title: string) {
  await supabase.from("folders").update({ title }).eq("id", id);
}

export async function addFileToFolder(folderId: string, file: File): Promise<TaskFile | null> {
  const path = `${folderId}/${crypto.randomUUID()}_${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("task-files")
    .upload(path, file);

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return null;
  }

  const { data, error } = await supabase
    .from("files")
    .insert({
      folder_id: folderId,
      name: file.name,
      size: file.size,
      type: file.type,
      storage_path: path,
    })
    .select()
    .single();

  if (error || !data) return null;
  return data;
}

export async function deleteFileFromFolder(folderId: string, fileId: string) {
  const { data } = await supabase.from("files").select("storage_path").eq("id", fileId).single();
  if (data?.storage_path) {
    await supabase.storage.from("task-files").remove([data.storage_path]);
  }
  await supabase.from("files").delete().eq("id", fileId);
}

export function getFileUrl(storagePath: string): string {
  const { data } = supabase.storage.from("task-files").getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function addCommentToFolder(folderId: string, name: string, text: string): Promise<FolderComment | null> {
  const { data, error } = await supabase
    .from("comments")
    .insert({ folder_id: folderId, name, text })
    .select()
    .single();

  if (error || !data) return null;
  return data;
}
