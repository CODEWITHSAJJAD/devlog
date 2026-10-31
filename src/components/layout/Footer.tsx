import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ExternalLink, ShieldCheck, Cpu, Code2 } from 'lucide-react';
import { AppLogo } from '../shared/AppLogo';

interface FooterProps {
  onOpenCommandPalette?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenCommandPalette }) => {
  return (
    <footer className="w-full bg-[#FAFAFA] border-t border-black/[0.08] select-none mt-auto transition-colors text-xs text-[#6E6E73]">
      <div className="max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Grid: 5 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-black/[0.06]">
          {/* Brand & Mission Statement (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <AppLogo size="sm" showText={true} />
            <p className="text-xs text-[#6E6E73] leading-relaxed max-w-sm">
              The high-velocity engineering workspace and sprint orchestration platform. Plan sprints, track initiatives on multi-lane Kanban boards, and preserve architectural knowledge in your second brain.
            </p>

            {/* Live Operational Status */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-black/[0.06] shadow-2xs text-[11px] font-mono text-[#1D1D1F]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>All Systems Operational</span>
              <span className="text-[#86868B]/40">•</span>
              <span className="text-emerald-700 font-semibold">99.99% Uptime</span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com/CODEWITHSAJJAD"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl bg-white border border-black/[0.08] hover:border-black/[0.2] hover:bg-black hover:text-white text-[#1D1D1F] flex items-center justify-center transition-all shadow-2xs group"
                title="GitHub - @CODEWITHSAJJAD"
              >
                <svg className="w-4 h-4 fill-current transition-colors" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </a>

              <a
                href="https://instagram.com/suq00n_"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl bg-white border border-black/[0.08] hover:border-pink-300 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 hover:text-white text-[#1D1D1F] flex items-center justify-center transition-all shadow-2xs group"
                title="Instagram - @suq00n_"
              >
                <svg className="w-4 h-4 fill-current transition-colors" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              <a
                href="mailto:chsajjadshahid@gmail.com"
                className="w-8 h-8 rounded-xl bg-white border border-black/[0.08] hover:border-[#0071E3] hover:bg-[#0071E3] hover:text-white text-[#1D1D1F] flex items-center justify-center transition-all shadow-2xs group"
                title="Email - chsajjadshahid@gmail.com"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product & Solutions (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#1D1D1F] font-bold">
              Workspace Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="text-[#6E6E73] hover:text-[#0071E3] transition-colors">
                  Initiatives &amp; Projects
                </Link>
              </li>
              <li>
                <Link to="/knowledge-base" className="text-[#6E6E73] hover:text-[#0071E3] transition-colors">
                  Second Brain Knowledge Base
                </Link>
              </li>
              <li>
                <span className="text-[#6E6E73]">Agile Sprint Orchestration</span>
              </li>
              <li>
                <span className="text-[#6E6E73]">Multi-Lane Kanban Engine</span>
              </li>
              {onOpenCommandPalette && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenCommandPalette}
                    className="text-[#6E6E73] hover:text-[#0071E3] transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <span>Spotlight Search</span>
                    <kbd className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-black/[0.04] border border-black/[0.08] text-[#86868B]">
                      ⌘K
                    </kbd>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Architecture & Infrastructure (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#1D1D1F] font-bold">
              Architecture
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-[#6E6E73]">
                <Cpu className="w-3.5 h-3.5 text-[#0071E3]" />
                <span>Cloudflare Pages</span>
              </li>
              <li className="flex items-center gap-1.5 text-[#6E6E73]">
                <Code2 className="w-3.5 h-3.5 text-[#FF9500]" />
                <span>D1 Serverless SQL</span>
              </li>
              <li className="flex items-center gap-1.5 text-[#6E6E73]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#34C759]" />
                <span>PBKDF2 WebCrypto</span>
              </li>
              <li className="text-[#6E6E73]">
                <span>Apple Human Interface</span>
              </li>
              <li className="text-[#6E6E73]">
                <span>Multi-Tenant Isolated</span>
              </li>
            </ul>
          </div>

          {/* Author & Creator Profile (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#1D1D1F] font-bold">
              Designed &amp; Engineered By
            </h4>
            <div className="p-3.5 bg-white border border-black/[0.06] rounded-2xl shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E8F2FE] border border-[#0071E3]/20 text-[#0071E3] flex items-center justify-center font-bold text-xs font-mono flex-shrink-0">
                  SS
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1D1D1F] flex items-center gap-1.5">
                    <span>Sajjad Shahid</span>
                  </div>
                  <p className="text-[11px] text-[#86868B]">Full Stack Systems Architect</p>
                </div>
              </div>

              <div className="pt-2 border-t border-black/[0.04] space-y-1.5 text-[11px]">
                <a
                  href="https://github.com/CODEWITHSAJJAD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-[#6E6E73] hover:text-[#0071E3] transition-colors py-0.5 group"
                >
                  <span className="font-mono">github/CODEWITHSAJJAD</span>
                  <ExternalLink className="w-3 h-3 text-[#86868B] group-hover:text-[#0071E3]" />
                </a>
                <a
                  href="https://instagram.com/suq00n_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-[#6E6E73] hover:text-[#0071E3] transition-colors py-0.5 group"
                >
                  <span className="font-mono">insta/@suq00n_</span>
                  <ExternalLink className="w-3 h-3 text-[#86868B] group-hover:text-[#0071E3]" />
                </a>
                <a
                  href="mailto:chsajjadshahid@gmail.com"
                  className="flex items-center justify-between text-[#6E6E73] hover:text-[#0071E3] transition-colors py-0.5 group"
                >
                  <span className="font-mono">chsajjadshahid@gmail.com</span>
                  <Mail className="w-3 h-3 text-[#86868B] group-hover:text-[#0071E3]" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Attribution Ribbon */}
        <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#86868B]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>&copy; {new Date().getFullYear()} DevLog, Inc. All rights reserved.</span>
            <span>•</span>
            <span>
              Crafted by{' '}
              <a
                href="https://github.com/CODEWITHSAJJAD"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1D1D1F] font-semibold hover:text-[#0071E3] transition-colors"
              >
                Sajjad Shahid
              </a>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-[#86868B]">
            <a
              href="https://github.com/CODEWITHSAJJAD"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1D1D1F] transition-colors"
            >
              GitHub
            </a>
            <span>•</span>
            <a
              href="https://instagram.com/suq00n_"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1D1D1F] transition-colors"
            >
              Instagram
            </a>
            <span>•</span>
            <span className="text-emerald-600 font-semibold">Production v2.5.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
