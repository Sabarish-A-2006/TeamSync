import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { availabilityService } from '../../services';
import toast from 'react-hot-toast';

export default function AvailabilityToggle({
  userId,
  isAvailable,
  availabilityStatus,
  canEdit = false,
  onStatusChange,
  showLabels = false,
}) {
  const [loading, setLoading] = useState(false);

  // Derive current boolean state
  const currentBool = availabilityStatus === 'available' ? true : false;

  const handleToggle = async (e) => {
    e.stopPropagation();
    if (!canEdit || loading) return;

    const nextAvailable = !currentBool;
    const nextStatus = nextAvailable ? 'available' : 'unavailable';
    const prevAvailable = currentBool;
    const prevStatus = availabilityStatus;

    // 1. Optimistic UI update
    if (onStatusChange) {
      onStatusChange({
        userId,
        isAvailable: nextAvailable,
        availabilityStatus: nextStatus,
      });
    }

    setLoading(true);

    try {
      // 2. Send PATCH request to backend
      const response = await availabilityService.update(userId, {
        isAvailable: nextAvailable,
        availabilityStatus: nextStatus,
      });

      const serverData = response.data?.data;
      if (onStatusChange && serverData) {
        onStatusChange({
          userId,
          isAvailable: serverData.isAvailable,
          availabilityStatus: serverData.availabilityStatus,
          updatedAt: serverData.updatedAt,
        });
      }

      toast.success(
        nextAvailable
          ? 'Status updated: You are now Available'
          : 'Status updated: You are now Unavailable'
      );
    } catch (error) {
      // 3. Rollback optimistic update on failure
      console.error('Availability update failed:', error);
      if (onStatusChange) {
        onStatusChange({
          userId,
          isAvailable: prevAvailable,
          availabilityStatus: prevStatus,
        });
      }
      const msg = error.response?.data?.message || 'Failed to update availability status';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={currentBool}
        disabled={!canEdit || loading}
        onClick={handleToggle}
        title={
          !canEdit
            ? 'You can only change your own availability status'
            : currentBool
            ? 'Click to set Unavailable'
            : 'Click to set Available'
        }
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
          currentBool ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'
        } ${!canEdit ? 'cursor-not-allowed opacity-60' : 'hover:opacity-90'} ${
          loading ? 'cursor-wait opacity-75' : ''
        }`}
      >
        <span className="sr-only">Toggle availability</span>
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`pointer-events-none inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            currentBool ? 'translate-x-5' : 'translate-x-0'
          }`}
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin text-primary-600" />
          ) : (
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                currentBool ? 'bg-green-600' : 'bg-gray-400'
              }`}
            />
          )}
        </motion.span>
      </button>

      {showLabels && (
        <span className={`text-xs font-semibold ${currentBool ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {currentBool ? 'Available' : 'Unavailable'}
        </span>
      )}
    </div>
  );
}
