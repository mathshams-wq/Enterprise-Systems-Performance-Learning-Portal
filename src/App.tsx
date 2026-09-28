import React, { useState, useEffect } from 'react';
import {
  TeamMember,
  Accomplishment,
  LearningRecord,
  GoogleSheetsConfig,
} from './types';
import {
  getTeamMembers,
  getAccomplishments,
  getLearningRecords,
  getCurrentUser,
  setCurrentUser,
  getGoogleSheetConfig,
  saveGoogleSheetConfig,
  subscribeToStorageChanges,
  deleteAccomplishment,
  deleteLearningRecord,
  getAppTheme,
  setAppTheme,
  AppTheme,
} from './services/storageService';
import { initGoogleAuth } from './services/googleSheetsService';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { AccomplishmentForm } from './components/AccomplishmentForm';
import { LearningForm } from './components/LearningForm';
import { AdminDashboard } from './components/AdminDashboard';
import { MemberDashboard } from './components/MemberDashboard';
import { QuarterlyGrowthView } from './components/QuarterlyGrowthView';
import { GoogleSheetSyncModal } from './components/GoogleSheetSyncModal';
import { ExportModal } from './components/ExportModal';
import { RosterModal } from './components/RosterModal';
import { LovManagerModal } from './components/LovManagerModal';
import {
  Sparkles,
  Award,
  Clock,
  Layers,
  FileSpreadsheet,
  Download,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Plus,
  ListFilter,
} from 'lucide-react';

export default function App() {
  const [currentUser, setUser] = useState<TeamMember | null>(() => {
    const existing = getCurrentUser();
    if (existing) return existing;
    // Default to Shamsuddin (Lead / Admin) for instant access
    const members = getTeamMembers();
    return members.find((m) => m.role === 'admin') || members[0] || null;
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(getTeamMembers());
  const [accomplishments, setAccomplishments] = useState<Accomplishment[]>(getAccomplishments());
  const [learningRecords, setLearningRecords] = useState<LearningRecord[]>(getLearningRecords());
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(getGoogleSheetConfig());
  const [theme, setTheme] = useState<AppTheme>(getAppTheme);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'growth' | 'accomplishments' | 'learning'>('dashboard');

  // Modals
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAccomplishmentOpen, setIsAccomplishmentOpen] = useState(false);
  const [editAccomplishmentItem, setEditAccomplishmentItem] = useState<Accomplishment | null>(null);
  const [isLearningOpen, setIsLearningOpen] = useState(false);
  const [editLearningItem, setEditLearningItem] = useState<LearningRecord | null>(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isLovModalOpen, setIsLovModalOpen] = useState(false);

  // Search in tabs
  const [tabSearchQuery, setTabSearchQuery] = useState('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Subscribe to storage updates
  useEffect(() => {
    const unsubscribe = subscribeToStorageChanges(() => {
      setTeamMembers(getTeamMembers());
      setAccomplishments(getAccomplishments());
      setLearningRecords(getLearningRecords());
      setSheetsConfig(getGoogleSheetConfig());
      setUser(getCurrentUser());
    });
    return unsubscribe;
  }, []);

  // Sync theme attribute on documentElement
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Listen to Google Auth state
  useEffect(() => {
    initGoogleAuth(
      (user, token) => {
        // Connected
        const cfg = getGoogleSheetConfig();
        if (!cfg.isConnected) {
          saveGoogleSheetConfig({
            ...cfg,
            connectedAccountEmail: user.email || 'shams.uddin@dbl-digital.com',
            isConnected: true,
          });
        }
      },
      () => {
        // Disconnected
      }
    );
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
    setIsLoginOpen(true);
    showToast('Signed out of session');
  };

  const handleLoginSuccess = (user: TeamMember) => {
    setUser(user);
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleThemeChange = (newTheme: AppTheme) => {
    setTheme(newTheme);
    setAppTheme(newTheme);
    showToast(`Theme changed to ${newTheme === 'dark' ? 'Dark' : newTheme === 'ocean-blue' ? 'Ocean Blue' : 'Olive'}`);
  };

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white"
      data-theme={theme}
    >
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        sheetsConfig={sheetsConfig}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenRosterModal={() => setIsRosterModalOpen(true)}
        onOpenLovModal={() => setIsLovModalOpen(true)}
        onOpenAccomplishmentModal={() => {
          setEditAccomplishmentItem(null);
          setIsAccomplishmentOpen(true);
        }}
        onOpenLearningModal={() => {
          setEditLearningItem(null);
          setIsLearningOpen(true);
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs sm:text-sm text-slate-100 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Google Sheets Connection Banner if not yet connected */}
      {!sheetsConfig.isConnected && currentUser?.role === 'admin' && (
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-sky-950/80 border-b border-emerald-800/40 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-300">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Google Sheets Database:</strong> Connect your official Google account to initialize live synchronization for all 19 members.
              </span>
            </div>
            <button
              onClick={() => setIsSheetsModalOpen(true)}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shrink-0 shadow-sm"
            >
              Connect Google Sheet
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: Dashboard (Admin, Viewer, or Member) */}
        {activeTab === 'dashboard' && (
          <>
            {currentUser?.role === 'admin' || currentUser?.role === 'viewer' ? (
              <AdminDashboard
                currentUser={currentUser}
                teamMembers={teamMembers}
                accomplishments={accomplishments}
                learningRecords={learningRecords}
                onEditAccomplishment={(acc) => {
                  setEditAccomplishmentItem(acc);
                  setIsAccomplishmentOpen(true);
                }}
                onDeleteAccomplishment={(id) => {
                  deleteAccomplishment(id);
                  showToast('Accomplishment deleted.');
                }}
                onEditLearning={(lrn) => {
                  setEditLearningItem(lrn);
                  setIsLearningOpen(true);
                }}
                onDeleteLearning={(id) => {
                  deleteLearningRecord(id);
                  showToast('Learning record deleted.');
                }}
                onOpenExportModal={() => setIsExportModalOpen(true)}
                onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
                onOpenAccomplishmentModal={() => {
                  setEditAccomplishmentItem(null);
                  setIsAccomplishmentOpen(true);
                }}
                onOpenLearningModal={() => {
                  setEditLearningItem(null);
                  setIsLearningOpen(true);
                }}
                onOpenRosterModal={() => setIsRosterModalOpen(true)}
                onOpenLovModal={() => setIsLovModalOpen(true)}
              />
            ) : currentUser ? (
              <MemberDashboard
                currentUser={currentUser}
                accomplishments={accomplishments}
                learningRecords={learningRecords}
                onOpenAccomplishmentModal={() => {
                  setEditAccomplishmentItem(null);
                  setIsAccomplishmentOpen(true);
                }}
                onOpenLearningModal={() => {
                  setEditLearningItem(null);
                  setIsLearningOpen(true);
                }}
                onEditAccomplishment={(acc) => {
                  setEditAccomplishmentItem(acc);
                  setIsAccomplishmentOpen(true);
                }}
                onDeleteAccomplishment={(id) => {
                  deleteAccomplishment(id);
                  showToast('Accomplishment deleted.');
                }}
                onEditLearning={(lrn) => {
                  setEditLearningItem(lrn);
                  setIsLearningOpen(true);
                }}
                onDeleteLearning={(id) => {
                  deleteLearningRecord(id);
                  showToast('Learning record deleted.');
                }}
                onOpenExportModal={() => setIsExportModalOpen(true)}
                onViewQuarterlyGrowth={() => setActiveTab('growth')}
              />
            ) : null}
          </>
        )}

        {/* Tab 2: Quarterly Growth Metrics */}
        {activeTab === 'growth' && (
          <QuarterlyGrowthView
            accomplishments={accomplishments}
            learningRecords={learningRecords}
            teamMembers={teamMembers}
            currentUser={currentUser}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />
        )}

        {/* Tab 3: Accomplishments Registry */}
        {activeTab === 'accomplishments' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span>
                    {currentUser?.role === 'user' || currentUser?.role === 'member'
                      ? 'My Accomplishments'
                      : currentUser?.role === 'viewer'
                      ? 'Enterprise Systems Accomplishments (Viewer)'
                      : 'Enterprise Systems Accomplishments'}
                  </span>
                  {(currentUser?.role === 'user' || currentUser?.role === 'member') && (
                    <span className="text-xs font-normal text-slate-400">
                      (Personal Records for ID: {currentUser.id})
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400">
                  {currentUser?.role === 'user' || currentUser?.role === 'member'
                    ? 'Only your personal accomplishments and time savings are visible here'
                    : 'All monthly accomplishment entries and process time savings across 19 members'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={tabSearchQuery}
                    onChange={(e) => setTabSearchQuery(e.target.value)}
                    placeholder="Search accomplishments..."
                    className="bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                </div>
                {currentUser?.role !== 'viewer' ? (
                  <button
                    onClick={() => {
                      setEditAccomplishmentItem(null);
                      setIsAccomplishmentOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Accomplishment</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download All Data</span>
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accomplishments
                .filter((a) => {
                  // User role: only see their own inputted data
                  if ((currentUser?.role === 'user' || currentUser?.role === 'member') && a.officialId !== currentUser?.id) {
                    return false;
                  }
                  if (!tabSearchQuery.trim()) return true;
                  const q = tabSearchQuery.toLowerCase();
                  return (
                    a.memberName.toLowerCase().includes(q) ||
                    a.officialId.toLowerCase().includes(q) ||
                    a.accomplishment.toLowerCase().includes(q) ||
                    a.forDepartment.toLowerCase().includes(q) ||
                    a.workType.toLowerCase().includes(q)
                  );
                })
                .map((acc) => (
                  <div
                    key={acc.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-md flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-sky-400">
                          {acc.month} {acc.year}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium text-[11px]">
                          {acc.workType}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-100">{acc.memberName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({acc.officialId})</span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                        {acc.accomplishment}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <span className="text-slate-400 block text-[11px]">
                          Dept: <strong className="text-slate-200">{acc.forDepartment}</strong>
                        </span>
                        {acc.timeSavedMin ? (
                          <span className="text-emerald-400 font-mono font-bold text-[11px]">
                            Saved: {acc.timeSavedMin} min per run
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            acc.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          }`}
                        >
                          {acc.status}
                        </span>
                        {currentUser?.role === 'admin' || (currentUser?.role !== 'viewer' && currentUser?.id === acc.officialId) ? (
                          <button
                            onClick={() => {
                              setEditAccomplishmentItem(acc);
                              setIsAccomplishmentOpen(true);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                            title="Edit"
                          >
                            Edit
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 4: Learning Registry */}
        {activeTab === 'learning' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-400" />
                  <span>
                    {currentUser?.role === 'user' || currentUser?.role === 'member'
                      ? 'My Learning & Certifications'
                      : currentUser?.role === 'viewer'
                      ? 'Enterprise Systems Learning & Certifications (Viewer)'
                      : 'Enterprise Systems Learning & Certifications'}
                  </span>
                  {(currentUser?.role === 'user' || currentUser?.role === 'member') && (
                    <span className="text-xs font-normal text-slate-400">
                      (Personal Records for ID: {currentUser.id})
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400">
                  {currentUser?.role === 'user' || currentUser?.role === 'member'
                    ? 'Only your personal courses, certifications, and workplace applications are displayed'
                    : 'Technical upskilling, certifications, and direct workplace implementations across 19 members'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={tabSearchQuery}
                    onChange={(e) => setTabSearchQuery(e.target.value)}
                    placeholder="Search learning topics..."
                    className="bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                </div>
                {currentUser?.role !== 'viewer' ? (
                  <button
                    onClick={() => {
                      setEditLearningItem(null);
                      setIsLearningOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Learning</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download All Data</span>
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {learningRecords
                .filter((l) => {
                  // User role: only see their own inputted data
                  if ((currentUser?.role === 'user' || currentUser?.role === 'member') && l.officialId !== currentUser?.id) {
                    return false;
                  }
                  if (!tabSearchQuery.trim()) return true;
                  const q = tabSearchQuery.toLowerCase();
                  return (
                    l.memberName.toLowerCase().includes(q) ||
                    l.officialId.toLowerCase().includes(q) ||
                    l.topic.toLowerCase().includes(q) ||
                    l.skillArea.toLowerCase().includes(q) ||
                    l.institute.toLowerCase().includes(q)
                  );
                })
                .map((lrn) => (
                  <div
                    key={lrn.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-md flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-indigo-400">
                          {lrn.month} {lrn.year}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-medium text-[11px]">
                          {lrn.skillArea}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-100">{lrn.memberName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({lrn.officialId})</span>
                      </div>

                      <h4 className="text-sm font-semibold text-slate-100">{lrn.topic}</h4>

                      {lrn.applicationOutcome && (
                        <p className="text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-400 font-medium">Outcome at work: </span>
                          {lrn.applicationOutcome}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px] block">
                          Provider: <strong className="text-slate-300">{lrn.institute}</strong>
                        </span>
                        <span className="text-indigo-400 font-mono font-bold text-[11px]">
                          {lrn.hoursSpent} hours logged
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {lrn.certification === 'Yes' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Cert ✓
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            lrn.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {lrn.status}
                        </span>
                        {currentUser?.role === 'admin' || (currentUser?.role !== 'viewer' && currentUser?.id === lrn.officialId) ? (
                          <button
                            onClick={() => {
                              setEditLearningItem(lrn);
                              setIsLearningOpen(true);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                            title="Edit"
                          >
                            Edit
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          {/* Bottom Left: Enterprise Systems */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200 tracking-wide text-sm">
              Enterprise Systems
            </span>
          </div>

          {/* Middle: Developed by Enterprise Systems | RMG Division */}
          <div className="text-xs text-slate-300 font-medium">
            Developed by <span className="text-slate-100 font-semibold">Enterprise Systems</span> | <span className="text-sky-400 font-semibold">RMG Division</span>
          </div>

          {/* Right: version with Publish Date */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              v1.2.0
            </span>
            <span>Published: 28-Sep-2026</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
      />

      <AccomplishmentForm
        isOpen={isAccomplishmentOpen}
        onClose={() => {
          setIsAccomplishmentOpen(false);
          setEditAccomplishmentItem(null);
        }}
        currentUser={currentUser}
        editItem={editAccomplishmentItem}
        onSuccess={() => {
          showToast(editAccomplishmentItem ? 'Accomplishment updated!' : 'Accomplishment logged!');
        }}
      />

      <LearningForm
        isOpen={isLearningOpen}
        onClose={() => {
          setIsLearningOpen(false);
          setEditLearningItem(null);
        }}
        currentUser={currentUser}
        editItem={editLearningItem}
        onSuccess={() => {
          showToast(editLearningItem ? 'Learning record updated!' : 'Learning logged!');
        }}
      />

      <GoogleSheetSyncModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        sheetsConfig={sheetsConfig}
        onConfigUpdated={(cfg) => {
          setSheetsConfig(cfg);
          showToast('Google Sheet updated!');
        }}
        currentUser={currentUser}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        teamMembers={teamMembers}
        accomplishments={accomplishments}
        learningRecords={learningRecords}
        currentUser={currentUser}
      />

      <RosterModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        onRosterUpdated={() => {
          setTeamMembers(getTeamMembers());
          showToast('Roster updated.');
        }}
      />

      <LovManagerModal
        isOpen={isLovModalOpen}
        onClose={() => setIsLovModalOpen(false)}
        onLovUpdated={() => {
          showToast('List of Values updated.');
        }}
      />
    </div>
  );
}
