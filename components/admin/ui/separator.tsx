import * as React from "react"

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
}

export function Separator({
  className = "",
  orientation = "horizontal",
  ...props
}: SeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={`
        shrink-0 bg-black
        ${orientation === "horizontal" ? "h-[1px] w-full" : "h-4 w-[1px]"}
        ${className}
      `}
      {...props}
    />
  )
}
