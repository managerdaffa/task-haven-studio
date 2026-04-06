import { TaskFolder } from "@/lib/store";
import { Folder, FileText, Trash2, Pencil, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  folder: TaskFolder;
  loggedIn: boolean;
  onClick: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export default function FolderCard({ folder, loggedIn, onClick, onDelete, onEdit }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="gradient-card glow-border rounded-lg p-5 cursor-pointer group relative overflow-hidden"
      onClick={onClick}
    >
      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-16 h-16 gradient-primary opacity-5 rounded-bl-full" />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <Folder className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display text-sm tracking-wide text-foreground group-hover:text-primary transition-colors">
              {folder.title}
            </h3>
            <p className="text-xs text-muted-foreground font-body mt-1 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {folder.files.length} file
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {loggedIn && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3 font-body">
        {new Date(folder.createdAt).toLocaleDateString("id-ID", {
          day: "numeric", month: "long", year: "numeric",
        })}
      </p>
    </motion.div>
  );
}
