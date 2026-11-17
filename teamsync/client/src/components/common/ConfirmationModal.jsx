import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-xl max-w-md w-full"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  isDanger
                    ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                    : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            {message}
          </p>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary text-sm"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
                isDanger
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
