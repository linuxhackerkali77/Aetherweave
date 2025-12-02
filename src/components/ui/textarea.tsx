import * as React from "react"
import { useCursor } from "@/hooks/use-cursor"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const { setCursorMode } = useCursor();

    const handleMouseEnter = React.useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
        setCursorMode('text');
        onMouseEnter?.(e);
    }, [setCursorMode, onMouseEnter]);

    const handleMouseLeave = React.useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
        setCursorMode('default');
        onMouseLeave?.(e);
    }, [setCursorMode, onMouseLeave]);

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
