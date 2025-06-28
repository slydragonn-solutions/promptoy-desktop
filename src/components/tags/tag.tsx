import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TagColorScheme, getTagColorClasses } from '@/constants/tags';

export interface TagProps {
  name: string;
  color?: TagColorScheme | string;
  className?: string;
  onRemove?: (e: React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
}

export function Tag({ 
  name, 
  color, 
  className, 
  onRemove, 
  onClick 
}: TagProps) {
  // If color is a string (legacy support) or undefined, use default gray
  const colorClasses = typeof color === 'object' && color !== null 
    ? getTagColorClasses(color)
    : 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600';
  
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        'transition-colors duration-200',
        colorClasses,
        className,
        onRemove && 'pr-1.5' // Add padding when remove button is present
      )}
      onClick={onClick}
    >
      {name}
      {onRemove && (
        <button
          type="button"
          className="ml-0.5 -mr-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(e);
          }}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
