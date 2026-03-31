import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils/cn.ts";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border border-border bg-background text-foreground",
        success: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
        warning: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
        error: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
        info: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  ),
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
