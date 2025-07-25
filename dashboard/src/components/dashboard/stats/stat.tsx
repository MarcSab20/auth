import React from 'react';

interface StatProps {
  title: string;
  value: string;
  change: string;
}

export const Stat: React.FC<StatProps> = ({ title, value, change }) => {
  const isPositive = change.startsWith('+');
  
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
      <p className={`mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {change}
      </p>
    </div>
  );
}; 