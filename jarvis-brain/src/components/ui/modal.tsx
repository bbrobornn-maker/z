import { useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

const spring = { type: "spring" as const, mass: 0.6, stiffness: 320, damping: 28 };

export function Modal({ open, onClose, title, children, size = "md", className }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={spring}
            className={cn(
              "relative w-full glass-panel rounded-2xl shadow-2xl overflow-hidden z-10",
              sizes[size],
              className
            )}
          >
            {title && (
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5">
                <h2 className="text-base font-semibold text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: "bottom" | "right";
}

export function Sheet({ open, onClose, title, children, side = "bottom" }: SheetProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isBottom = side === "bottom";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={isBottom ? { y: "100%" } : { x: "100%" }}
            animate={isBottom ? { y: 0 } : { x: 0 }}
            exit={isBottom ? { y: "100%" } : { x: "100%" }}
            transition={{ type: "spring", mass: 0.6, stiffness: 280, damping: 28 }}
            className={cn(
              "absolute glass-panel shadow-2xl overflow-y-auto",
              isBottom
                ? "bottom-0 left-0 right-0 rounded-t-3xl max-h-[90dvh] pb-[env(safe-area-inset-bottom)]"
                : "top-0 right-0 bottom-0 w-full max-w-md rounded-l-2xl"
            )}
          >
            <div className="sticky top-0 z-10 bg-[#090909]/90 backdrop-blur-md border-b border-white/5 px-6 py-4">
              {isBottom && (
                <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-4" />
              )}
              {title && (
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold">{title}</h2>
                  <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
