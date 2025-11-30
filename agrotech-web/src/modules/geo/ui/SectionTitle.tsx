import React from 'react';

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

const SectionTitle = ({ children, className = '' }: SectionTitleProps) => {
  return (
    <h3 className={`text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider ${className}`}>
      {children}
    </h3>
  );
};

export default SectionTitle;
