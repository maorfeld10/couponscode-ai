import React from 'react';
import { CheckCircle2, Clock, EyeOff, FileEdit } from 'lucide-react';

type StatusType = 'active' | 'expired' | 'hidden' | 'draft' | 'published' | 'inactive' | 'invited' | 'subscribed' | 'unsubscribed';

interface StatusPillProps {
  status: StatusType;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, className = '' }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'active':
      case 'published':
      case 'subscribed':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-600',
          icon: <CheckCircle2 className="w-3 h-3" />
        };
      case 'expired':
      case 'inactive':
      case 'unsubscribed':
        return {
          bg: 'bg-red-50',
          text: 'text-red-600',
          icon: <EyeOff className="w-3 h-3" />
        };
      case 'draft':
      case 'invited':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-600',
          icon: <FileEdit className="w-3 h-3" />
        };
      case 'hidden':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-600',
          icon: <EyeOff className="w-3 h-3" />
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-500',
          icon: <Clock className="w-3 h-3" />
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles.bg} ${styles.text} ${className}`}>
      {styles.icon}
      {status}
    </div>
  );
};
