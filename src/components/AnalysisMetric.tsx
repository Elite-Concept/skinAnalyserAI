
import { LucideIcon } from 'lucide-react';

interface AnalysisMetricProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
}

export default function AnalysisMetric({ icon: Icon, label, value, color }: AnalysisMetricProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`text-${color}`} />
        <span className="font-medium">{label}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`bg-${color} rounded-full h-2 transition-all duration-500 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}