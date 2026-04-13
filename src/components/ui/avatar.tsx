import { cn, getAvatarColor, getInitials } from "@/lib/utils"

interface AvatarProps {
  name: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Avatar({ name, size = "md", className }: AvatarProps) {
  const sizeClasses = { sm: "w-6 h-6 text-xs", md: "w-8 h-8 text-sm", lg: "w-10 h-10 text-base" }
  const colorClass = getAvatarColor(name)
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0",
        sizeClasses[size],
        colorClass,
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}
