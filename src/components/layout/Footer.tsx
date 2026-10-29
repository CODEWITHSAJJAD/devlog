import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Globe,
  Mail,
} from 'lucide-react';
import { AppLogo } from '../shared/AppLogo';

interface FooterProps {
  onOpenCommandPalette?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenCommandPalette }) => {
  return (
    <footer className="w-full bg-white/70 backdrop-blur-xl border-t border-black/[0.06] select-none mt-auto transition-colors">
      <div className="max-w-[96rem] mx-auto px-4 sm:px-6 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-10 border-b border-black/[0.06]">
          {/* Brand & Creator Bio */}
          <div className="md:col-span-5 space-y-3.5">
            <AppLogo size="sm" showText={true} />
            <p className="text-xs text-[#6E6E73] leading-relaxed max-w-sm">
              The high-velocity engineering workspace and sprint orchestration system designed by <strong className="text-[#1D1D1F] font-semibold">Sajjad Shahid</strong> for modern product teams. Track initiatives, measure progress, and preserve institutional knowledge.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#6E6E73] pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>All Systems Operational</span>
              <span className="text-[#86868B]/40">•</span>
              <span>Multi-Tenant Isolated</span>
            </div>
          </div>

          {/* Navigation Matrix */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#1D1D1F] font-bold">
              Workspace Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/"
                  className="text-[#6E6E73] hover:text-[#0071E3] transition-colors"
                >
                  Initiatives & Projects
                </Link>
              </li>
              <li>
                <Link
                  to="/knowledge-base"
                  className="text-[#6E6E73] hover:text-[#0071E3] transition-colors"
                >
                  Second Brain (Knowledge Base)
                </Link>
              </li>
              <li>
                <button
                  onClick={onOpenCommandPalette}
                  className="text-[#6E6E73] hover:text-[#0071E3] transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <span>Spotlight Search</span>
                  <kbd className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-black/[0.04] border border-black/[0.08] text-[#86868B]">
                    ⌘K
                  </kbd>
                </button>
              </li>
            </ul>
          </div>

          {/* Lead Engineer & Architecture Specs */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#1D1D1F] font-bold">
              Engineering & Author
            </h4>
            <div className="p-3 bg-white border border-black/[0.06] rounded-xl shadow-2xs space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#E8F2FE] border border-[#0071E3]/20 text-[#0071E3] flex items-center justify-center font-bold text-xs font-mono">
                  SS
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1D1D1F] flex items-center gap-1.5">
                    <span>Sajjad Shahid</span>
                    <span className="text-xs text-[#86868B] font-normal">
                      • Lead Architect
                    </span>
                  </div>
                  <a
                    href="mailto:chsajjadshahid@gmail.com"
                    className="text-[11px] font-mono text-[#0071E3] hover:underline flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3" /> chsajjadshahid@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-[#6E6E73] pt-1">
              <div className="flex items-center justify-between py-0.5">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#0071E3]" /> Edge Runtime
                </span>
                <span className="font-mono text-[11px] text-[#86868B]">Cloudflare D1 + Pages</span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#FF9500]" /> Design System
                </span>
                <span className="font-mono text-[11px] text-[#86868B]">Apple Human Interface</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Attribution Ribbon */}
        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#86868B] font-mono">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} DevLog</span>
            <span>•</span>
            <span>Crafted with precision by <strong className="text-[#1D1D1F] font-semibold">Sajjad Shahid</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <span>v2.4.0</span>
            <span>•</span>
            <span>Cloudflare Global Network</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
