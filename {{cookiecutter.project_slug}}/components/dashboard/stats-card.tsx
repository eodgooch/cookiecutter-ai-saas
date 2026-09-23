interface StatsCardProps {
  label: string;
  value: number | string;
  variant?: "default" | "success" | "warning" | "error";
}

export function StatsCard({ label, value, variant = "default" }: StatsCardProps) {
  const valueColor = {
    default: "",
    success: "text-success",
    warning: "text-warning",
    error: "text-error",
  }[variant];

  return (
    <div className="bg-base-200 rounded-lg p-4">
      <p className="text-xs text-base-content/60">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
    </div>
  );
}
