import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  variant?: "primary" | "secondary" | "danger" | "neutral";
  delay?: number;
}

export function StatCard({ label, value, icon: Icon, variant = "neutral", delay = 0 }: StatCardProps) {
  const styles = {
    primary: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
    secondary: "from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400",
    danger: "from-red-500/20 to-red-500/5 border-red-500/20 text-red-400",
    neutral: "from-white/10 to-white/5 border-white/10 text-white",
  };

  const iconStyles = {
    primary: "bg-emerald-500/20 text-emerald-400",
    secondary: "bg-blue-500/20 text-blue-400",
    danger: "bg-red-500/20 text-red-400",
    neutral: "bg-white/10 text-white",
  };

  return (
    <div 
      className={clsx(
        "relative overflow-hidden rounded-2xl p-4 border bg-gradient-to-br transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-in",
        styles[variant]
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-70 mb-1">{label}</p>
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
        </div>
        <div className={clsx("p-2 rounded-xl", iconStyles[variant])}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
