import { LucideIcon } from "lucide-react";

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color = "#00a050",
}: {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-ocp-border p-5 card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-ocp-gray-dark">{title}</p>
          <p className="text-2xl font-bold text-ocp-navy mt-1">{value}</p>
          {change && (
            <p className="text-xs font-medium text-ocp-green mt-2">{change}</p>
          )}
        </div>
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={22} style={{ color }} />
        </div>
      </div>
    </div>
  );
}
