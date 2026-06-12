import { forwardRef, type InputHTMLAttributes, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, rightElement, type, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPass ? "text" : "password") : type;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider px-1">
            {label}
          </label>
        )}
        <motion.div
          animate={{ borderColor: focused ? "rgba(110, 86, 255, 0.5)" : error ? "rgba(255, 55, 95, 0.4)" : "rgba(255,255,255,0.06)" }}
          transition={{ duration: 0.15 }}
          className="relative flex items-center rounded-xl border bg-white/[0.03] overflow-hidden"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          {icon && (
            <span className="absolute left-3 text-white/30 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            type={inputType}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={cn(
              "w-full h-11 bg-transparent text-white placeholder:text-white/25 text-sm px-4 outline-none",
              icon && "pl-10",
              (isPassword || rightElement) && "pr-10",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              className="absolute right-3 text-white/30 hover:text-white/60 transition-colors"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
          {!isPassword && rightElement && (
            <span className="absolute right-3">{rightElement}</span>
          )}
        </motion.div>
        {error && <p className="text-xs text-[#ff375f] px-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider px-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full min-h-[100px] rounded-xl border border-white/6 bg-white/[0.03] text-white placeholder:text-white/25 text-sm px-4 py-3 outline-none focus:border-[#6e56ff]/50 resize-none transition-colors",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
