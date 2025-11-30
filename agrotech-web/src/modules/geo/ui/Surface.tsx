import React from 'react';

interface SurfaceProps {
  children: React.ReactNode;
  className?: string;
}

const Surface = ({ children, className = '' }: SurfaceProps) => {
  return (
    <div className={`bg-white dark:bg-content1 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Surface;
