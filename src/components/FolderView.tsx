import { useState, useRef, useEffect, useCallback } from "react";
import { TaskFolder, TaskFile, addFileToFolder, deleteFileFromFolder, addCommentToFolder, getFolders, getFileUrl } from "@/lib/store";
import { ArrowLeft, Upload, FileText, Trash2, Download, MessageSquare, Send, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [currentFolder, setCurrentFolder] = useState<TaskFolder>(folder);

  const refreshFolder = useCallback(async () => {
    const all = await getFolders();
    const found = all.find((f) => f.id === folder.id);
    if (found) setCurrentFolder(found);
  }, [folder.id]);

  useEffect(() => {
    refreshFolder();
  }, [refreshFolder]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      await addFileToFolder(folder.id, file);
    }

    setUploading(false);
    await refreshFolder();
    onUpdate();
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDelete = async (fileId: string) => {
    await deleteFileFromFolder(folder.id, fileId);
    await refreshFolder();
    onUpdate();
  };

  const handleDownload = (file: TaskFile) => {
    const url = getFileUrl(file.storage_path);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.target = "_blank";
    a.click();
  };

  const handleSubmitComment = async () => {
    if (!commentName.trim() || !commentText.trim()) return;
    await addCommentToFolder(folder.id, commentName.trim(), commentText.trim());
    setCommentName("");
    setCommentText("");
    setCommentOpen(false);
    await refreshFolder();
    onUpdate();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) +
      " " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="font-display text-xl font-bold tracking-wide text-foreground">{currentFolder.title}</h2>
          <p className="text-xs text-muted-foreground font-body">{currentFolder.files.length} file · {currentFolder.comments.length} komentar</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setCommentOpen(true)}
          className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10 font-display text-xs tracking-wider"
        >
          <MessageSquare className="w-3.5 h-3.5" /> KOMENTAR
        </Button>
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
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-body font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(file.size)} · {new Date(file.uploaded_at).toLocaleDateString("id-ID")}
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
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "MENGUPLOAD..." : "UPLOAD FILE"}
          </Button>
        </div>
      )}

      {/* Comments section */}
      {currentFolder.comments.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="font-display text-xs tracking-widest text-muted-foreground uppercase flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5" /> Komentar ({currentFolder.comments.length})
          </h3>
          <div className="space-y-2">
            {currentFolder.comments.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="gradient-card rounded-lg p-3 border border-border/50"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm font-body font-semibold text-foreground">{c.name}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{formatDate(c.created_at)}</span>
                </div>
                <p className="text-sm font-body text-muted-foreground pl-8">{c.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Comment Dialog */}
      <Dialog open={commentOpen} onOpenChange={setCommentOpen}>
        <DialogContent className="gradient-card glow-border border-primary/20 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg gradient-text">
              TULIS KOMENTAR
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-display tracking-wider text-muted-foreground uppercase">Nama</label>
              <Input
                placeholder="Masukkan nama kamu..."
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                className="bg-secondary border-primary/20 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display tracking-wider text-muted-foreground uppercase">Komentar</label>
              <Input
                placeholder="Tulis komentar..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="bg-secondary border-primary/20 focus:border-primary"
                onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
              />
            </div>
            <Button onClick={handleSubmitComment} className="w-full gradient-primary font-display tracking-wider gap-2">
              <Send className="w-4 h-4" /> KIRIM
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
