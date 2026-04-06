import { useState, useRef } from "react";
import { TaskFolder, TaskFile, addFileToFolder, deleteFileFromFolder, getFolders } from "@/lib/store";
import { ArrowLeft, Upload, FileText, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  folder: TaskFolder;
  loggedIn: boolean;
  onBack: () => void;
  onUpdate: () => void;
}

export default function FolderView({ folder, loggedIn, onBack, onUpdate }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Re-read folder from store to get latest files
  const currentFolder = getFolders().find((f) => f.id === folder.id) || folder;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const dataUrl = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(file);
      });

      const taskFile: TaskFile = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl,
        uploadedAt: new Date().toISOString(),
      };
      addFileToFolder(folder.id, taskFile);
    }

    setUploading(false);
    onUpdate();
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDelete = (fileId: string) => {
    deleteFileFromFolder(folder.id, fileId);
    onUpdate();
  };

  const handleDownload = (file: TaskFile) => {
    const a = document.createElement("a");
    a.href = file.dataUrl;
    a.download = file.name;
    a.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-display text-xl tracking-wider text-foreground">{currentFolder.title}</h2>
          <p className="text-xs text-muted-foreground font-body">{currentFolder.files.length} file</p>
        </div>
      </div>

      {/* File list */}
      <div className="space-y-3">
        <AnimatePresence>
          {currentFolder.files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="gradient-card glow-border rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded gradient-primary/20 flex items-center justify-center shrink-0 bg-primary/10">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-body text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(file.size)} •{" "}
                    {new Date(file.uploadedAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleDownload(file)}
                  className="p-2 rounded hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
                {loggedIn && (
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-2 rounded hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {currentFolder.files.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-body">Belum ada file dalam folder ini</p>
          </div>
        )}
      </div>

      {/* Upload button */}
      {loggedIn && (
        <div className="pt-4">
          <input ref={inputRef} type="file" multiple className="hidden" onChange={handleUpload} />
          <Button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full gradient-primary font-display tracking-wider gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploading ? "MENGUPLOAD..." : "UPLOAD TUGAS"}
          </Button>
        </div>
      )}
    </motion.div>
  );
}
