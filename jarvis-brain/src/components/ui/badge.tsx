import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "success" | "danger" | "warning";
  className?: string;
}

const variants = {
  default: "bg-white/8 text-white/70",
  accent: "bg-[#6e56ff]/15 text-[#9c85ff]",
  success: "bg-[#30d158]/12 text-[#30d158]",
  danger: "bg-[#ff375f]/12 text-[#ff375f]",
  warning: "bg-[#ffd60a]/12 text-[#ffd60a]",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
