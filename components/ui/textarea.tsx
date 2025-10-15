import * as React from "react"

import { cn } from "../../lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border-2 border-neutral-200 bg-white px-4 py-3 text-base transition-all duration-200 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary hover:border-neutral-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50 resize-none",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }