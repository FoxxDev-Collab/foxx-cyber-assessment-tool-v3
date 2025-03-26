import React from 'react';

interface MetricCardProps {
  title: string;
  value: number;
  color: string;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  color,
  description
}) => {
  return (
    <div className="bg-card p-4 rounded-lg border shadow-sm">
      <h3 className={`text-base font-medium ${color}`}>{title}</h3>
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