import React from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { getStatusColor, getStatusLabel } from '../../utils/helpers';

export default function AvailabilityBadge({ status, size = 'md', showIcon = true }) {
  const colors = getStatusColor(status);
  const label = getStatusLabel(status);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  }[size] || 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;

  const renderIcon = () => {
    if (!showIcon) return <span className={`w-2 h-2 rounded-full ${colors.dot}`} />;
    if (status === 'available') return <CheckCircle2 size={iconSize} className="text-green-600 dark:text-green-400" />;
    if (status === 'unavailable') return <XCircle size={iconSize} className="text-red-600 dark:text-red-400" />;
    if (status === 'away') return <Clock size={iconSize} className="text-amber-600 dark:text-amber-400" />;
    return <span className={`w-2 h-2 rounded-full ${colors.dot}`} />;
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${sizeClasses} ${colors.bg} ${colors.text} ${colors.border}`}
      title={`Status: ${label}`}
    >
      {renderIcon()}
      <span>{label}</span>
    </span>
  );
}
