import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md";
  color?: "brand" | "green" | "orange" | "red";
}

const colorClasses = {
  brand:  "bg-brand-600",
  green:  "bg-green-500",
  orange: "bg-orange-500",
  red:    "bg-red-500",
};

export function ProgressBar({
  value,
  className,
  showLabel = false,
  size = "md",
  color = "brand",
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex-1 bg-gray-100 rounded-full overflow-hidden",
          size === "sm" ? "h-1.5" : "h-2"
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            colorClasses[color]
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-gray-600 w-8 text-right">{clamped}%</span>
      )}
    </div>
  );
}
