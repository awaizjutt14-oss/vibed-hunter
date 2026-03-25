import * as React from "react";
import { cn } from "@/lib/utils/cn";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn("flex h-11 w-full rounded-2xl border border-border bg-background px-4 py-2 text-sm text-foreground", className)}
      {...props}
    />
  )
);
Input.displayName = "Input";
