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
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <div className="flex items-start gap-3.5 p-4 bg-rose-50 border border-rose-200/80 rounded-2xl text-[#1D1D1F]">
          <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-xs leading-relaxed">
            <p className="font-semibold text-rose-900 mb-1">
              Are you sure you want to delete this {itemType.toLowerCase()}?
            </p>
            <p className="text-[#6E6E73]">
              <span className="text-[#1D1D1F] font-semibold">"{itemName}"</span>{' '}
              {description ||
                `will be permanently deleted and removed from your active workspace.`}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/[0.04] rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-xs"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{loading ? 'Deleting...' : `Delete ${itemType}`}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
