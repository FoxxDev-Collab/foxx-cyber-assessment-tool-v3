import React from 'react';

interface MetricCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
  bgColor?: string;
  trend?: {
    value: number;
    positive: boolean;
  };
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon,
  color = 'text-gray-900',
  bgColor = 'bg-white',
  trend
}) => {
  return (
    <div className={`rounded-lg shadow-sm border p-5 ${bgColor}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className={`mt-1 text-2xl font-semibold ${color}`}>{value}</div>
          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              {trend.positive ? (
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              <span className={`ml-1 text-xs font-medium ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
                {trend.value}%
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0">{icon}</div>
        )}
      </div>
    </div>
  );
};

export default MetricCard; 