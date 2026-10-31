import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Search } from 'lucide-react';
import { AppLogo } from '../shared/AppLogo';

interface FooterProps {
  onOpenCommandPalette?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenCommandPalette }) => {
  return (
    <footer className="w-full bg-white/70 backdrop-blur-xl border-t border-black/[0.06] select-none mt-auto transition-colors">
      <div className="max-w-[96rem] mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-black/[0.06]">
          {/* Brand & Mission */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <AppLogo size="sm" showText={true} />
            <span className="hidden sm:inline-block text-[#86868B]/40">•</span>
            <p className="text-xs text-[#6E6E73] max-w-md">
              High-velocity engineering workspace, agile sprint orchestration, and institutional knowledge base.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#6E6E73]">
            <Link
              to="/"
              className="hover:text-[#0071E3] transition-colors"
            >
              Projects
            </Link>
            <Link
              to="/knowledge-base"
              className="hover:text-[#0071E3] transition-colors"
            >
              Knowledge Base
            </Link>
            {onOpenCommandPalette && (
              <button
                type="button"
                onClick={onOpenCommandPalette}
                className="hover:text-[#0071E3] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-[#86868B]" />
                <span>Spotlight</span>
                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/[0.04] border border-black/[0.08] text-[#86868B]">
                  ⌘K
                </kbd>
              </button>
            )}
            <a
              href="mailto:chsajjadshahid@gmail.com"
              className="hover:text-[#0071E3] transition-colors flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-[#86868B]" />
              <span>Contact</span>
            </a>
          </nav>
        </div>

        {/* Bottom Attribution & Copyright */}
        <div className="pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#86868B]">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} DevLog</span>
            <span>•</span>
            <span>All rights reserved.</span>
          </div>
          <div>
            <span>
              Designed &amp; engineered by{' '}
              <a
                href="mailto:chsajjadshahid@gmail.com"
                className="font-semibold text-[#1D1D1F] hover:text-[#0071E3] transition-colors"
              >
                Sajjad Shahid
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
