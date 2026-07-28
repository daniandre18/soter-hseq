import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

const paddingClasses = {
  none: "",
  sm:   "p-4",
  md:   "p-6",
  lg:   "p-8",
};

export function Card({ children, className, padding = "md", onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-sm",
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-5", className)}>
      <div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color = "brand",
  trend,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color?: "brand" | "green" | "orange" | "red" | "purple" | "blue";
  trend?: { value: string; up: boolean };
}) {
  const colorMap = {
    brand:  { bg: "bg-brand-50",  icon: "text-brand-600",  ring: "ring-brand-100" },
    green:  { bg: "bg-green-50",  icon: "text-green-600",  ring: "ring-green-100" },
    orange: { bg: "bg-orange-50", icon: "text-orange-600", ring: "ring-orange-100" },
    red:    { bg: "bg-red-50",    icon: "text-red-600",    ring: "ring-red-100" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", ring: "ring-purple-100" },
    blue:   { bg: "bg-blue-50",   icon: "text-blue-600",   ring: "ring-blue-100" },
  };

  const c = colorMap[color];

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className={cn("text-xs mt-1 font-medium", trend.up ? "text-green-600" : "text-red-500")}>
              {trend.up ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl ring-1", c.bg, c.ring)}>
          <Icon className={cn("w-5 h-5", c.icon)} />
        </div>
      </div>
    </Card>
  );
}
