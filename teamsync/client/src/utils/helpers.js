import { formatDistanceToNow, format } from 'date-fns';

export const getStatusColor = (status) => {
  switch (status) {
    case 'available':
      return {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-300',
        dot: 'bg-green-500',
        border: 'border-green-200 dark:border-green-800',
        ring: 'ring-green-400',
      };
    case 'unavailable':
      return {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-300',
        dot: 'bg-red-500',
        border: 'border-red-200 dark:border-red-800',
        ring: 'ring-red-400',
      };
    case 'away':
      return {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-800 dark:text-amber-300',
        dot: 'bg-amber-500',
        border: 'border-amber-200 dark:border-amber-800',
        ring: 'ring-amber-400',
      };
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-800 dark:text-gray-300',
        dot: 'bg-gray-400',
        border: 'border-gray-200 dark:border-gray-700',
        ring: 'ring-gray-400',
      };
  }
};

export const getStatusLabel = (status) => {
  switch (status) {
    case 'available':
      return 'Available';
    case 'unavailable':
      return 'Unavailable';
    case 'away':
      return 'Away';
    default:
      return 'Unknown';
  }
};

export const getInitials = (name = '') => {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const timeAgo = (date) => {
  if (!date) return 'Never';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch (e) {
    return 'Recently';
  }
};

export const formatDate = (date, fmt = 'MMM dd, yyyy') => {
  if (!date) return '';
  try {
    return format(new Date(date), fmt);
  } catch (e) {
    return '';
  }
};

export const formatDateTime = (date) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
  } catch (e) {
    return '';
  }
};

export const getAvatarUrl = (user) => {
  if (user?.profileImage) return user.profileImage;
  const name = user?.fullName || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff&size=128&bold=true`;
};
