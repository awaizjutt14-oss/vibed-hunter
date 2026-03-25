import * as React from "react";
import { cn } from "@/lib/utils/cn";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn("min-h-[120px] w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground", className)}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
