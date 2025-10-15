import React from "react";
import { cn } from "@/lib/utils";

export function Empty({
  title = "Nothing here yet",
  description,
  className,
  children,
}: {
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-md border p-6 text-center text-sm text-muted", className)}>
      <div className="font-medium text-foreground/90">{title}</div>
      {description ? <div className="mt-1">{description}</div> : null}
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}
