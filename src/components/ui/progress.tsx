import React from 'react';

interface ProgressProps {
  value: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, className }) => {
  return (
    <div className={`relative w-full h-4 bg-gray-200 rounded ${className}`}>
      <div
        className="absolute top-0 left-0 h-4 bg-blue-500 rounded"
        style={{ width: `${value}%` }}
      />
    </div>
  );
};
