import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={`bg-white shadow-md rounded-lg p-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`border-b pb-2 mb-2 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <h2 className={`text-lg font-bold text-gray-900 ${className}`}>
      {children}
    </h2>
  );
}

export function CardContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-gray-900">
      {children}
    </div>
  );
}
