import { useState, useCallback } from "react";
import Header from "@/components/Header";
import FolderCard from "@/components/FolderCard";
import FolderView from "@/components/FolderView";
import { getFolders, createFolder, deleteFolder, updateFolderTitle, TaskFolder } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function Index() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [folders, setFolders] = useState<TaskFolder[]>(getFolders());
  const [activeFolder, setActiveFolder] = useState<TaskFolder | null>(null);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const refresh = useCallback(() => setFolders(getFolders()), []);

  const handleCreateFolder = () => {
    if (!newTitle.trim()) return;
    const f = createFolder(newTitle.trim());
    setNewTitle("");
    setNewFolderOpen(false);
    refresh();
    setActiveFolder(f);
  };

  const handleEditFolder = (id: string) => {
    if (!editTitle.trim()) return;
    updateFolderTitle(id, editTitle.trim());
    setEditId(null);
    refresh();
  };

  const handleDeleteFolder = (id: string) => {
    deleteFolder(id);
    refresh();
  };

  return (
    <div className="min-h-screen gradient-bg grid-pattern relative">
      {/* Ambient blobs */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-glow pointer-events-none" style={{ animationDelay: "1s" }} />

      <Header loggedIn={loggedIn} onLogin={() => setLoggedIn(true)} onLogout={() => setLoggedIn(false)} />

      <main className="container mx-auto px-4 pt-24 pb-16 max-w-4xl relative z-10">
        <AnimatePresence mode="wait">
          {activeFolder ? (
            <FolderView
              key="folder-view"
              folder={activeFolder}
              loggedIn={loggedIn}
              onBack={() => { setActiveFolder(null); refresh(); }}
              onUpdate={refresh}
            />
          ) : (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Hero */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <p className="text-sm font-body text-muted-foreground tracking-widest uppercase mb-2">
                  Selamat Datang di
                </p>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-wider glow-text text-foreground mb-3">
                  WEBSITE UPLOAD TUGAS
                </h1>
                <p className="text-muted-foreground font-body text-lg">
                  Milik{" "}
                  <span className="gradient-primary bg-clip-text text-transparent font-semibold">
                    @DAFFA AUFAA PRATAMA IRAWAN
                  </span>
                </p>
                <div className="mt-4 w-24 h-0.5 mx-auto gradient-primary rounded-full" />
              </motion.div>

              {/* Folders */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-sm tracking-widest text-muted-foreground uppercase">
                    Daftar Tugas
                  </h2>
                  {loggedIn && (
                    <Button
                      size="sm"
                      onClick={() => setNewFolderOpen(true)}
                      className="gradient-primary font-display text-xs tracking-wider gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> FOLDER BARU
                    </Button>
                  )}
                </div>

                {folders.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4 animate-float" />
                    <p className="text-muted-foreground font-body">Belum ada tugas yang diupload</p>
                  </motion.div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {folders.map((folder, i) => (
                      <motion.div key={folder.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <FolderCard
                          folder={folder}
                          loggedIn={loggedIn}
                          onClick={() => setActiveFolder(folder)}
                          onDelete={() => handleDeleteFolder(folder.id)}
                          onEdit={() => { setEditId(folder.id); setEditTitle(folder.title); }}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Copyright */}
              <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-20 text-center"
              >
                <div className="w-16 h-px mx-auto bg-border mb-4" />
                <p className="text-xs text-muted-foreground font-body tracking-wider">
                  © 2026 @daffaaufaapratamairawan2026. All rights reserved.
                </p>
              </motion.footer>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* New Folder Dialog */}
      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent className="gradient-card glow-border border-primary/20 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg gradient-primary bg-clip-text text-transparent">
              BUAT FOLDER BARU
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="Judul folder..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="bg-secondary border-primary/20 focus:border-primary"
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            />
            <Button onClick={handleCreateFolder} className="w-full gradient-primary font-display tracking-wider">
              BUAT
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={!!editId} onOpenChange={() => setEditId(null)}>
        <DialogContent className="gradient-card glow-border border-primary/20 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg gradient-primary bg-clip-text text-transparent">
              EDIT FOLDER
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="Judul baru..."
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="bg-secondary border-primary/20 focus:border-primary"
              onKeyDown={(e) => e.key === "Enter" && editId && handleEditFolder(editId)}
            />
            <Button onClick={() => editId && handleEditFolder(editId)} className="w-full gradient-primary font-display tracking-wider">
              SIMPAN
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
