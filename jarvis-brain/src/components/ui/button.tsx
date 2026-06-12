import { forwardRef, type ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

const variants = {
  primary: "bg-[#6e56ff] hover:bg-[#7c67ff] text-white shadow-lg shadow-[#6e56ff]/20 active:bg-[#5d45ee]",
  secondary: "bg-white/5 hover:bg-white/8 text-white border border-white/6",
  ghost: "hover:bg-white/5 text-white/80 hover:text-white",
  danger: "bg-[#ff375f]/10 hover:bg-[#ff375f]/20 text-[#ff375f] border border-[#ff375f]/20",
  outline: "border border-white/10 hover:bg-white/5 text-white",
};

const sizes = {
  sm: "h-7 px-3 text-xs rounded-lg",
  md: "h-9 px-4 text-sm rounded-xl",
  lg: "h-11 px-6 text-base rounded-xl",
  icon: "h-9 w-9 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", mass: 0.6, stiffness: 400, damping: 25 }}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium select-none transition-colors duration-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...(props as any)}
      >
        {loading && (
          <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
        )}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
