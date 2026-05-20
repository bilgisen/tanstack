import React from 'react';

interface ContextBarProps {
  label: string;
  min: number;
  max: number;
  current: number;
  formatValue?: (val: number) => string;
}

export function ContextBar({ label, min, max, current, formatValue = (v) => v.toString() }: ContextBarProps) {
  // Calculate percentage for the marker position
  // Ensure the dot stays between 0% and 100%
  let percentage = ((current - min) / (max - min)) * 100;
  if (percentage < 0) percentage = 0;
  if (percentage > 100) percentage = 100;
  
  if (max === min) percentage = 50; // Fallback

  return (
    <div className="flex flex-col gap-1 w-full mt-2">
      <div className="flex justify-between items-center text-xs text-zinc-500 font-medium">
        <span>{label}</span>
        <span className="text-zinc-300 font-bold">{formatValue(current)}</span>
      </div>
      
      <div className="relative w-full h-1.5 bg-zinc-800 rounded-full mt-1">
        {/* Fill line up to current (optional: depends on style preference) */}
        <div 
          className="absolute top-0 left-0 h-full bg-zinc-600 rounded-l-full" 
          style={{ width: `${percentage}%` }}
        />
        
        {/* The dot marker */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-zinc-200 border-2 border-zinc-900 rounded-full shadow-sm z-10 transition-all duration-500"
          style={{ left: `calc(${percentage}% - 6px)` }}
        />
      </div>
      
      <div className="flex justify-between items-center mt-1 text-[10px] text-zinc-600 font-medium px-0.5">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}
