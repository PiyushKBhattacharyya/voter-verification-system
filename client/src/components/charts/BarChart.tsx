import { Card } from "@/components/ui/card";

interface BarChartProps {
  data: {
    hour: string;
    value: number;
  }[];
  height?: string;
  title?: string;
  className?: string;
}

export default function BarChart({ data, height = "h-64", title, className = "" }: BarChartProps) {
  // Find the maximum value to scale bars properly
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className={className}>
      {title && <h3 className="text-lg font-medium text-neutral-800 mb-4">{title}</h3>}
      <div className={`${height} border border-neutral-100 rounded-md p-4 bg-neutral-50`}>
        <div className="h-full flex items-end space-x-2">
          {data.map((item, index) => {
            const percentage = (item.value / maxValue) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="chart-bar bg-primary w-full rounded-t" 
                  style={{ height: `${percentage}%` }}
                />
                <span className="text-xs text-neutral-500 mt-1">{item.hour}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
