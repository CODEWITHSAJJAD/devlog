import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidth?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidth = 'max-w-lg',
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Apple Translucent Dimming Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/30 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      />

      {/* Centering Wrapper: min-h-full flex items-start sm:items-center prevents upper side from clipping */}
      <div className="min-h-full flex items-start sm:items-center justify-center p-3 sm:p-6">
        {/* Apple Sheet Dialog Surface */}
        <div
          className={`relative w-full ${maxWidth} max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3.5rem)] flex flex-col rounded-2xl bg-white border border-black/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.15),0_4px_16px_rgba(0,0,0,0.06)] z-10 animate-in fade-in zoom-in-95 duration-150 p-4 sm:p-6 my-auto overflow-hidden`}
        >
          {/* Header (pinned at top, flex-shrink-0 so upper side is always visible) */}
          <div className="flex items-start justify-between pb-3 sm:pb-3.5 border-b border-black/[0.06] mb-3 sm:mb-4 flex-shrink-0">
            <div className="min-w-0 pr-2">
              <h3 className="text-sm sm:text-base font-bold text-[#1D1D1F] tracking-tight truncate">{title}</h3>
              {subtitle && <p className="text-[11px] sm:text-xs text-[#6E6E73] mt-0.5 leading-relaxed truncate">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-[#86868B] hover:text-[#1D1D1F] p-1.5 rounded-full hover:bg-black/[0.05] transition-colors flex items-center gap-1 cursor-pointer flex-shrink-0"
              title="Close (Esc)"
            >
              <span className="text-[10px] font-mono text-[#86868B] uppercase tracking-widest hidden sm:inline mr-1">
                ESC
              </span>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Content with Auto Scroll */}
          <div className="overflow-y-auto flex-1 min-h-0 pr-1 -mr-1">{children}</div>
        </div>
      </div>
    </div>
  );
};
