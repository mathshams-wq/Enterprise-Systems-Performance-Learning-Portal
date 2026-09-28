import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Users,
  LogOut,
  LogIn,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Shield,
  Layers,
  BarChart3,
  Plus,
  ListFilter,
  Palette,
  Moon,
  Droplets,
  Leaf,
  ChevronDown,
} from 'lucide-react';
import { TeamMember, GoogleSheetsConfig } from '../types';
import { AppTheme } from '../services/storageService';
import { DblGroupLogo } from './logos/DblGroupLogo';
import { DblDigitalLogo } from './logos/DblDigitalLogo';

interface NavbarProps {
  currentUser: TeamMember | null;
  sheetsConfig: GoogleSheetsConfig;
  currentTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenSheetsModal: () => void;
  onOpenExportModal: () => void;
  onOpenRosterModal: () => void;
  onOpenLovModal: () => void;
  onOpenAccomplishmentModal: () => void;
  onOpenLearningModal: () => void;
  activeTab: 'dashboard' | 'growth' | 'accomplishments' | 'learning';
  setActiveTab: (tab: 'dashboard' | 'growth' | 'accomplishments' | 'learning') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  sheetsConfig,
  currentTheme,
  onThemeChange,
  onOpenLogin,
  onLogout,
  onOpenSheetsModal,
  onOpenExportModal,
  onOpenRosterModal,
  onOpenLovModal,
  onOpenAccomplishmentModal,
  onOpenLearningModal,
  activeTab,
  setActiveTab,
}) => {
  const [showThemeMenu, setShowThemeMenu] = React.useState(false);

  const themeOptions: { id: AppTheme; label: string; icon: any; colorDot: string }[] = [
    { id: 'dark', label: 'Dark', icon: Moon, colorDot: 'bg-slate-500' },
    { id: 'ocean-blue', label: 'Ocean Blue', icon: Droplets, colorDot: 'bg-sky-400' },
    { id: 'olive', label: 'Olive', icon: Leaf, colorDot: 'bg-lime-500' },
  ];

  const currentThemeObj = themeOptions.find((t) => t.id === currentTheme) || themeOptions[0];
  const CurrentIcon = currentThemeObj.icon;
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title (Top Left: DBL Group Logo) */}
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-xl shadow-md border border-slate-200 flex items-center justify-center shrink-0">
              <DblGroupLogo height={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-base sm:text-lg tracking-tight">
                  Enterprise Systems
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-full">
                  RMG Division
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Monthly Accomplishments & Quarterly Growth Portal (19 Members)
              </p>
            </div>
          </div>

          {/* Quick Actions & User Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Google Sheets Sync Pill */}
            <button
              onClick={onOpenSheetsModal}
              title={
                sheetsConfig.isConnected
                  ? `Google Sheet connected: ${sheetsConfig.title}`
                  : 'Connect Google Sheet database'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                sheetsConfig.isConnected
                  ? 'bg-emerald-950/60 border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">
                {sheetsConfig.isConnected ? 'Google Sheet Active' : 'Connect Google Sheet'}
              </span>
              {sheetsConfig.isConnected && (
                <CheckCircle2 className="w-3 h-3 text-emerald-400 hidden sm:inline" />
              )}
            </button>

            {/* Quick Export Button */}
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm"
              title="Download Excel & PDF reports"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Export (Excel/PDF)</span>
            </button>

            {/* Theme Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm"
                title="Change theme: Dark, Ocean Blue, or Olive"
              >
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">{currentThemeObj.label}</span>
                <span className={`w-2 h-2 rounded-full ${currentThemeObj.colorDot}`} />
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showThemeMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowThemeMenu(false)} />
                  <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1.5 z-50 text-xs">
                    <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 mb-1">
                      Select Theme
                    </div>
                    {themeOptions.map((opt) => {
                      const OptIcon = opt.icon;
                      const isCurrent = currentTheme === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            onThemeChange(opt.id);
                            setShowThemeMenu(false);
                          }}
                          className={`w-full px-3 py-2 flex items-center justify-between transition-colors ${
                            isCurrent
                              ? 'bg-sky-500/20 text-sky-300 font-semibold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <OptIcon className="w-3.5 h-3.5" />
                            <span>{opt.label}</span>
                          </div>
                          <span className={`w-2.5 h-2.5 rounded-full ${opt.colorDot}`} />
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Team Roster (Admin) */}
            {currentUser?.role === 'admin' && (
              <>
                <button
                  onClick={onOpenRosterModal}
                  className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm"
                  title="Manage 19 Team Members & Add Users"
                >
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Roster (19)</span>
                </button>
                <button
                  onClick={onOpenLovModal}
                  className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm"
                  title="Manage LOVs: Departments, Systems, Work Types, Skill Areas, Institutes"
                >
                  <ListFilter className="w-3.5 h-3.5 text-amber-400" />
                  <span>LOVs</span>
                </button>
              </>
            )}

            {/* User Profile / Login */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-left transition-all border border-slate-700/60"
                  title="Click to switch user or view details"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden md:block">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                        {currentUser.name}
                      </span>
                      {currentUser.role === 'admin' && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-medium">
                          Admin (Full)
                        </span>
                      )}
                      {currentUser.role === 'viewer' && (
                        <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.5 rounded font-medium">
                          Viewer
                        </span>
                      )}
                      {(currentUser.role === 'user' || currentUser.role === 'member') && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-medium">
                          User (Entry)
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {currentUser.id}
                    </span>
                  </div>
                </button>
                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-all shadow"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In by ID</span>
              </button>
            )}

            {/* Top Right: DBL Digital Logo */}
            <div className="flex items-center pl-2 sm:pl-3 border-l border-slate-800">
              <div
                className="bg-white p-1 rounded-xl shadow-md border border-slate-200 flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
                title="DBL Digital"
              >
                <DblDigitalLogo height={32} />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-t border-slate-800/80 py-2 overflow-x-auto scrollbar-none">
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-sky-500 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>
                {currentUser?.role === 'admin'
                  ? 'Enterprise Dashboard'
                  : currentUser?.role === 'viewer'
                  ? 'Enterprise Dashboard'
                  : 'My Dashboard'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('growth')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'growth'
                  ? 'bg-sky-500 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Quarterly Growth</span>
            </button>

            <button
              onClick={() => setActiveTab('accomplishments')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'accomplishments'
                  ? 'bg-sky-500 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>
                {currentUser?.role === 'user' || currentUser?.role === 'member'
                  ? 'My Accomplishments'
                  : 'Accomplishments'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('learning')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'learning'
                  ? 'bg-sky-500 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>
                {currentUser?.role === 'user' || currentUser?.role === 'member'
                  ? 'My Learning & Certs'
                  : 'Learning & Certifications'}
              </span>
            </button>
          </nav>

          {/* Quick Entry Action Buttons (Restricted for Viewer) */}
          <div className="flex items-center gap-1.5 pl-3">
            {currentUser?.role === 'viewer' ? (
              <div className="px-2.5 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span className="hidden sm:inline">Viewer Access:</span> Read-Only
              </div>
            ) : (
              <>
                <button
                  onClick={onOpenAccomplishmentModal}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-all whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Log</span> Accomplishment
                </button>
                <button
                  onClick={onOpenLearningModal}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Log</span> Learning
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
