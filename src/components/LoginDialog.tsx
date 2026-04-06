import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Lock, User } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export default function LoginDialog({ open, onClose, onLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (
      username.toLowerCase().trim() === "daffa aufaa pratama irawan" &&
      password === "18516"
    ) {
      onLogin();
      onClose();
      setError("");
    } else {
      setError("Username atau password salah!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="gradient-card glow-border sm:max-w-md border-primary/20">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-center gradient-primary bg-clip-text text-transparent">
            LOGIN
          </DialogTitle>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pt-2"
        >
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10 bg-secondary border-primary/20 focus:border-primary"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 bg-secondary border-primary/20 focus:border-primary"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}
          <Button onClick={handleLogin} className="w-full gradient-primary font-display tracking-wider">
            MASUK
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
