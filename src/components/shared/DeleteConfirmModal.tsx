import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Modal } from './Modal';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  itemType: 'Project' | 'Task' | 'Learning';
  description?: string;
  onClose: () => void;
  onConfirm: () => Promise<{ success: boolean; error?: string }>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  itemName,
  itemType,
  description,
  onClose,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    const res = await onConfirm();
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || `Failed to delete ${itemType.toLowerCase()}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
            {error}
          </div>
        )}

        <div className="flex items-start gap-3.5 p-3.5 bg-rose-500/[0.06] border border-rose-500/15 rounded-xl text-slate-300">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 flex-shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-xs leading-relaxed">
            <p className="font-semibold text-rose-300 mb-1">
              Are you sure you want to delete this {itemType.toLowerCase()}?
            </p>
            <p className="text-slate-400">
              <span className="text-slate-200 font-medium">"{itemName}"</span>{' '}
              {description ||
                `will be soft-deleted and removed from your active workspace. Historical audit logs will remain intact.`}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3.5 py-1.5 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex items-center px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {loading ? 'Deleting...' : `Delete ${itemType}`}
          </button>
        </div>
      </div>
    </Modal>
  );
};
