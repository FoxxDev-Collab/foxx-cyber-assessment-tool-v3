import React from 'react';

interface MetricCardProps {
  title: string;
  value: number;
  color: string;
  description?: string;
}

// Get dark mode compatible colors 
const getColorClass = (colorKey: string): string => {
  switch (colorKey) {
    case 'text-green-600':
      return 'text-green-600 dark:text-green-400';
    case 'text-orange-500':
      return 'text-orange-500 dark:text-orange-400';
    case 'text-blue-500':
      return 'text-blue-500 dark:text-blue-400';
    case 'text-red-500':
      return 'text-red-500 dark:text-red-400';
    case 'text-gray-500':
      return 'text-gray-500 dark:text-gray-400';
    default:
      return colorKey;
  }
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  color,
  description
}) => {
  const colorClass = getColorClass(color);
  
  return (
    <div className="bg-card p-4 rounded-lg border shadow-sm">
      <h3 className={`text-base font-medium ${colorClass}`}>{title}</h3>
      <div className="mt-2 flex justify-between items-end">
        <div className="text-3xl font-bold">{value}</div>
        {description && (
          <div className="text-xs text-muted-foreground">{description}</div>
        )}
      </div>
    </div>
  );
};

export default MetricCard; 