import React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "destructive" | "secondary";

export function Badge({
  children,
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  const variants: Record<Variant, string> = {
    default: "bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]",
    success: "bg-[rgb(var(--success))]/10 text-[rgb(var(--success))]",
    warning: "bg-[rgb(var(--warning))]/10 text-[rgb(var(--warning))]",
    destructive: "bg-[rgb(var(--destructive))]/10 text-[rgb(var(--destructive))]",
    secondary: "bg-card text-foreground border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
