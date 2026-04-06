import { useState } from "react";
import { UserCircle, LogOut } from "lucide-react";
import LoginDialog from "./LoginDialog";
import { motion } from "framer-motion";

interface Props {
  loggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export default function Header({ loggedIn, onLogin, onLogout }: Props) {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-primary/10 backdrop-blur-xl bg-background/70">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded gradient-primary flex items-center justify-center font-display text-sm font-bold text-primary-foreground">
              T
            </div>
            <span className="font-display text-lg tracking-wider text-foreground">
              TASK<span className="text-primary">UPLOAD</span>
            </span>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {loggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground font-body hidden sm:block">
                  Daffa Aufaa
                </span>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setLoginOpen(true)}
                className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-primary"
              >
                <UserCircle className="w-7 h-7" />
              </button>
            )}
          </motion.div>
        </div>
      </header>

      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={onLogin} />
    </>
  );
}
