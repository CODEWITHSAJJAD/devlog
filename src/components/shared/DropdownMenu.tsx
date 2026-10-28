import React, { useState, useRef, useEffect } from 'react';

export interface DropdownMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: (DropdownMenuItem | 'divider')[];
  align?: 'left' | 'right';
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-1.5 w-48 rounded-xl bg-[#14161c] border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100`}
        >
          {items.map((item, index) => {
            if (item === 'divider') {
              return <div key={`divider-${index}`} className="my-1 border-t border-white/5" />;
            }

            return (
              <button
                key={item.label}
                disabled={item.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (!item.disabled) {
                    item.onClick?.();
                    setIsOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-xs transition-colors ${
                  item.disabled
                    ? 'opacity-40 cursor-not-allowed text-slate-500'
                    : item.danger
                    ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon && <span className="w-3.5 h-3.5 opacity-70 flex-shrink-0">{item.icon}</span>}
                <span className="truncate font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
