import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  FileSpreadsheet,
  AlertCircle,
  TrendingUp,
  Award,
  Calendar,
  ListFilter,
  UserPlus,
} from 'lucide-react';
import {
  TeamMember,
  Accomplishment,
  LearningRecord,
  MonthName,
  MonthlySubmissionStatus,
} from '../types';
import { MONTHS, YEARS } from '../data/initialData';
import { getLovs } from '../services/storageService';

interface AdminDashboardProps {
  currentUser?: TeamMember | null;
  teamMembers: TeamMember[];
  accomplishments: Accomplishment[];
  learningRecords: LearningRecord[];
  onEditAccomplishment: (acc: Accomplishment) => void;
  onDeleteAccomplishment: (id: string) => void;
  onEditLearning: (lrn: LearningRecord) => void;
  onDeleteLearning: (id: string) => void;
  onOpenExportModal: () => void;
  onOpenSheetsModal: () => void;
  onOpenAccomplishmentModal: () => void;
  onOpenLearningModal: () => void;
  onOpenRosterModal: () => void;
  onOpenLovModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  teamMembers,
  accomplishments,
  learningRecords,
  onEditAccomplishment,
  onDeleteAccomplishment,
  onEditLearning,
  onDeleteLearning,
  onOpenExportModal,
  onOpenSheetsModal,
  onOpenAccomplishmentModal,
  onOpenLearningModal,
  onOpenRosterModal,
  onOpenLovModal,
}) => {
  const lovs = getLovs();
  const isViewer = currentUser?.role === 'viewer';
  const [selectedMonth, setSelectedMonth] = useState<MonthName | 'All'>('August');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'submissions' | 'accomplishments' | 'learning'>('submissions');

  // Filter Accomplishments
  const filteredAccomplishments = accomplishments.filter((a) => {
    if (selectedYear && a.year !== selectedYear) return false;
    if (selectedMonth !== 'All' && a.month !== selectedMonth) return false;
    if (selectedDepartment !== 'All' && a.forDepartment !== selectedDepartment) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.memberName.toLowerCase().includes(q) ||
        a.officialId.toLowerCase().includes(q) ||
        a.accomplishment.toLowerCase().includes(q) ||
        a.workType.toLowerCase().includes(q) ||
        a.system.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filter Learning
  const filteredLearning = learningRecords.filter((l) => {
    if (selectedYear && l.year !== selectedYear) return false;
    if (selectedMonth !== 'All' && l.month !== selectedMonth) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.memberName.toLowerCase().includes(q) ||
        l.officialId.toLowerCase().includes(q) ||
        l.topic.toLowerCase().includes(q) ||
        l.skillArea.toLowerCase().includes(q) ||
        l.institute.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate 19 Member Submission Tracker for selected Month & Year
  const submissionStatusList: MonthlySubmissionStatus[] = teamMembers.map((member) => {
    const memberAcc = accomplishments.filter(
      (a) =>
        a.officialId === member.id &&
        a.year === selectedYear &&
        (selectedMonth === 'All' ? true : a.month === selectedMonth)
    );
    const memberLrn = learningRecords.filter(
      (l) =>
        l.officialId === member.id &&
        l.year === selectedYear &&
        (selectedMonth === 'All' ? true : l.month === selectedMonth)
    );

    const timeSaved = memberAcc.reduce((sum, a) => sum + (a.timeSavedMin || 0), 0);
    const hoursSpent = memberLrn.reduce((sum, l) => sum + (l.hoursSpent || 0), 0);
    const submitted = memberAcc.length > 0 || memberLrn.length > 0;

    return {
      member,
      accomplishmentsCount: memberAcc.length,
      learningCount: memberLrn.length,
      timeSavedMin: timeSaved,
      hoursSpent,
      submitted,
    };
  });

  const submittedCount = submissionStatusList.filter((s) => s.submitted).length;
  const totalTimeSavedPeriod = filteredAccomplishments.reduce((sum, a) => sum + (a.timeSavedMin || 0), 0);
  const totalLearningHoursPeriod = filteredLearning.reduce((sum, l) => sum + (l.hoursSpent || 0), 0);
  const totalCertsPeriod = filteredLearning.filter((l) => l.certification === 'Yes' && l.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Users className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <span>
                  {isViewer
                    ? 'Enterprise Systems Overview (Viewer Mode)'
                    : 'Enterprise Systems Manager Dashboard'}
                </span>
                {isViewer && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    Read-Only & Download
                  </span>
                )}
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Monitoring 19 Team Members, Monthly Submissions, Automation Value & Skill Progress
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2">
            {!isViewer && (
              <>
                <button
                  onClick={onOpenRosterModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow"
                  title="Add new users or manage team roster"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Roster / Add User</span>
                </button>
                <button
                  onClick={onOpenLovModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-all shadow"
                  title="Add more options to Departments, Systems, Work Types, Skill Areas, Institutes"
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>Manage LOVs</span>
                </button>
                <button
                  onClick={onOpenAccomplishmentModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Add Accomplishment</span>
                </button>
                <button
                  onClick={onOpenLearningModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-all shadow"
                >
                  <Award className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Add Learning</span>
                </button>
              </>
            )}
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-sm"
              title="Download Excel spreadsheet and PDF report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (Excel/PDF)</span>
            </button>
            {!isViewer && (
              <button
                onClick={onOpenSheetsModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/70 border border-emerald-700 text-emerald-300 hover:bg-emerald-900 transition-all shadow-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google Sheet</span>
              </button>
            )}
          </div>
        </div>

        {/* Informational banner for Viewer */}
        {isViewer && (
          <div className="mt-3 p-3 bg-sky-950/40 border border-sky-800/60 rounded-xl text-xs text-sky-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
              <span>
                <strong>Viewer Access:</strong> You can review all 19 members' submissions, time savings, learning logs, and download complete Excel or PDF reports. Entry modifications are restricted to Admins and Members.
              </span>
            </div>
            <button
              onClick={onOpenExportModal}
              className="text-xs text-sky-300 hover:text-white underline font-semibold shrink-0"
            >
              Export All Data →
            </button>
          </div>
        )}

        {/* Global Filter Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Month Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Select Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value as MonthName | 'All')}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="All">All Months (Year-to-Date)</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Select Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Filter by Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="All">All Departments</option>
              {lovs.departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Search by Keyword or ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, ID, topic, system..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Roster Submissions</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {submittedCount} / {teamMembers.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {Math.round((submittedCount / teamMembers.length) * 100)}% active this period
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Time Saved</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {(totalTimeSavedPeriod / 60).toFixed(1)} hrs
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalTimeSavedPeriod} total minutes saved
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Learning Invested</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400 font-mono">
            {totalLearningHoursPeriod} hrs
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {filteredLearning.length} course & self-study records
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Earned Certifications</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300">
            {totalCertsPeriod}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Completed & verified credentials
          </p>
        </div>
      </div>

      {/* Sub Tabs: Submission Tracker vs Accomplishments Table vs Learning Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="flex border-b border-slate-800 px-4 pt-3 bg-slate-900/60 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveSubTab('submissions')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeSubTab === 'submissions'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Team Roster Tracker (19 Members)
          </button>
          <button
            onClick={() => setActiveSubTab('accomplishments')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeSubTab === 'accomplishments'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Accomplishments Registry ({filteredAccomplishments.length})
          </button>
          <button
            onClick={() => setActiveSubTab('learning')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeSubTab === 'learning'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Learning & Certifications ({filteredLearning.length})
          </button>
        </div>

        {/* Tab 1: 19 Member Submission Tracker */}
        {activeSubTab === 'submissions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Official ID</th>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-center">Status ({selectedMonth})</th>
                  <th className="py-3 px-4 text-center">Accomplishments</th>
                  <th className="py-3 px-4 text-center">Time Saved</th>
                  <th className="py-3 px-4 text-center">Learning Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {submissionStatusList.map((st) => (
                  <tr
                    key={st.member.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-slate-300">
                      {st.member.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-100">
                      <div className="flex items-center gap-2">
                        <span>{st.member.name}</span>
                        {st.member.role === 'admin' && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded border border-amber-500/30">
                            Manager
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 truncate max-w-[220px]">
                      {st.member.designation}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {st.member.location}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {st.submitted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Submitted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-200">
                      {st.accomplishmentsCount}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                      {st.timeSavedMin > 0 ? `${st.timeSavedMin}m` : '-'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-indigo-400">
                      {st.hoursSpent > 0 ? `${st.hoursSpent}h` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Accomplishments Table */}
        {activeSubTab === 'accomplishments' && (
          <div className="overflow-x-auto">
            {filteredAccomplishments.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No accomplishments match the selected filters.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Official ID & Member</th>
                    <th className="py-3 px-4">Work Type</th>
                    <th className="py-3 px-4 max-w-sm">Accomplishment Description</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">System</th>
                    <th className="py-3 px-4 text-center">Time Saved</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Validation</th>
                    {!isViewer && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAccomplishments.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-300">
                        {acc.month.slice(0, 3)} {acc.year}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-100">{acc.memberName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {acc.officialId}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                          {acc.workType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-200 max-w-md font-sans">
                        {acc.accomplishment}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                        {acc.forDepartment}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {acc.system}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-center font-mono font-bold text-emerald-400">
                        {acc.timeSavedMin ? `${acc.timeSavedMin}m` : '-'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            acc.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          }`}
                        >
                          {acc.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            acc.validationStatus === 'OK'
                              ? 'text-emerald-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {acc.validationStatus}
                        </span>
                      </td>
                      {!isViewer && (
                        <td className="py-3 px-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onEditAccomplishment(acc)}
                              className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-slate-800"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Delete this accomplishment record?')) {
                                  onDeleteAccomplishment(acc.id);
                                }
                              }}
                              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 3: Learning & Certifications Table */}
        {activeSubTab === 'learning' && (
          <div className="overflow-x-auto">
            {filteredLearning.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No learning records match the selected filters.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Official ID & Member</th>
                    <th className="py-3 px-4 max-w-sm">Topic / Course Name</th>
                    <th className="py-3 px-4">Skill Area</th>
                    <th className="py-3 px-4">Institute</th>
                    <th className="py-3 px-4 text-center">Cert?</th>
                    <th className="py-3 px-4 text-center">Hours</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Applied at Work & Outcome</th>
                    {!isViewer && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLearning.map((lrn) => (
                    <tr key={lrn.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-300">
                        {lrn.month.slice(0, 3)} {lrn.year}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-100">{lrn.memberName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {lrn.officialId}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-200 max-w-xs font-medium">
                        {lrn.topic}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 text-[11px]">
                          {lrn.skillArea}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                        {lrn.institute}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        {lrn.certification === 'Yes' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Cert ✓
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">No</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-center font-mono font-bold text-indigo-400">
                        {lrn.hoursSpent}h
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            lrn.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {lrn.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs text-[11px]">
                        {lrn.applicationOutcome || (lrn.appliedAtWork === 'Yes' ? 'Applied at work' : 'Pending')}
                      </td>
                      {!isViewer && (
                        <td className="py-3 px-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onEditLearning(lrn)}
                              className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-slate-800"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Delete this learning record?')) {
                                  onDeleteLearning(lrn.id);
                                }
                              }}
                              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
