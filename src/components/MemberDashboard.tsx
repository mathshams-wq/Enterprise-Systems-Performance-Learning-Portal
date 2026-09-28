import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  Clock,
  CheckCircle2,
  Calendar,
  Download,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Briefcase,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { TeamMember, Accomplishment, LearningRecord, MonthName } from '../types';
import { MONTHS, YEARS } from '../data/initialData';

interface MemberDashboardProps {
  currentUser: TeamMember;
  accomplishments: Accomplishment[];
  learningRecords: LearningRecord[];
  onOpenAccomplishmentModal: () => void;
  onOpenLearningModal: () => void;
  onEditAccomplishment: (acc: Accomplishment) => void;
  onDeleteAccomplishment: (id: string) => void;
  onEditLearning: (lrn: LearningRecord) => void;
  onDeleteLearning: (id: string) => void;
  onOpenExportModal: () => void;
  onViewQuarterlyGrowth: () => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  currentUser,
  accomplishments,
  learningRecords,
  onOpenAccomplishmentModal,
  onOpenLearningModal,
  onEditAccomplishment,
  onDeleteAccomplishment,
  onEditLearning,
  onDeleteLearning,
  onOpenExportModal,
  onViewQuarterlyGrowth,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<MonthName | 'All'>('August');
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Filter to current member
  const myAccomplishments = accomplishments.filter(
    (a) =>
      a.officialId === currentUser.id &&
      a.year === selectedYear &&
      (selectedMonth === 'All' ? true : a.month === selectedMonth)
  );

  const myLearning = learningRecords.filter(
    (l) =>
      l.officialId === currentUser.id &&
      l.year === selectedYear &&
      (selectedMonth === 'All' ? true : l.month === selectedMonth)
  );

  const totalTimeSaved = myAccomplishments.reduce((sum, a) => sum + (a.timeSavedMin || 0), 0);
  const totalLearningHours = myLearning.reduce((sum, l) => sum + (l.hoursSpent || 0), 0);
  const myCerts = myLearning.filter((l) => l.certification === 'Yes' && l.status === 'Completed').length;

  const hasSubmittedThisMonth = myAccomplishments.length > 0 || myLearning.length > 0;

  return (
    <div className="space-y-6">
      {/* Profile & Current Month Status Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-sky-600/30">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
                  {currentUser.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-800 border border-slate-700 text-sky-400">
                  ID: {currentUser.id}
                </span>
                {currentUser.role === 'admin' && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Lead / Manager
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  {currentUser.designation}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {currentUser.location}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAccomplishmentModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Accomplishment</span>
            </button>
            <button
              onClick={onOpenLearningModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Learning</span>
            </button>
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm"
              title="Download personal review document in Excel & PDF"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Download Review</span>
            </button>
          </div>
        </div>

        {/* Filter bar & Month Tracker */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Reporting Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value as MonthName | 'All')}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-medium"
            >
              <option value="All">All Months (Year-to-Date)</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {hasSubmittedThisMonth ? (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Submitted for {selectedMonth}
              </span>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                <Clock className="w-3.5 h-3.5" />
                Pending submission for {selectedMonth}
              </span>
            )}
            <button
              onClick={onViewQuarterlyGrowth}
              className="text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 ml-2"
            >
              <span>View Quarterly Growth</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Blocks for Selected Month */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <span className="text-xs text-slate-400 block mb-1">Time Saved</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {(totalTimeSaved / 60).toFixed(1)} hrs
          </div>
          <span className="text-[11px] text-slate-500">{totalTimeSaved} minutes recorded</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <span className="text-xs text-slate-400 block mb-1">Accomplishments</span>
          <div className="text-2xl font-extrabold text-sky-400">
            {myAccomplishments.length}
          </div>
          <span className="text-[11px] text-slate-500">
            {myAccomplishments.filter((a) => a.status === 'Completed').length} Completed
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <span className="text-xs text-slate-400 block mb-1">Learning Invested</span>
          <div className="text-2xl font-extrabold text-indigo-400 font-mono">
            {totalLearningHours} hrs
          </div>
          <span className="text-[11px] text-slate-500">{myLearning.length} topics logged</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <span className="text-xs text-slate-400 block mb-1">Certifications Earned</span>
          <div className="text-2xl font-extrabold text-amber-300">
            {myCerts}
          </div>
          <span className="text-[11px] text-slate-500">Completed & verified</span>
        </div>
      </div>

      {/* Accomplishments Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">
              My Monthly Accomplishments ({myAccomplishments.length})
            </h3>
          </div>
          <button
            onClick={onOpenAccomplishmentModal}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Row</span>
          </button>
        </div>

        {myAccomplishments.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
            <p className="text-xs text-slate-400 mb-3">
              No accomplishments logged yet for {selectedMonth} {selectedYear}.
            </p>
            <button
              onClick={onOpenAccomplishmentModal}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Log Your First Accomplishment</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myAccomplishments.map((acc) => (
              <div
                key={acc.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-sky-400">
                      {acc.month} {acc.year}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      {acc.workType}
                    </span>
                    <span className="text-slate-400">
                      Dept: <strong className="text-slate-200">{acc.forDepartment}</strong>
                    </span>
                    <span className="text-slate-400">
                      System: <strong className="text-slate-300 font-mono">{acc.system}</strong>
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 font-sans">
                    {acc.accomplishment}
                  </p>
                  {acc.timeSavedMin ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        Time Saved: <strong>{acc.timeSavedMin} min per run</strong> (Before: {acc.timeBeforeMin}m → After: {acc.timeAfterMin}m)
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      acc.status === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    }`}
                  >
                    {acc.status}
                  </span>
                  <button
                    onClick={() => onEditAccomplishment(acc)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this accomplishment?')) {
                        onDeleteAccomplishment(acc.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Learning & Certifications Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">
              My Learning & Certifications ({myLearning.length})
            </h3>
          </div>
          <button
            onClick={onOpenLearningModal}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Row</span>
          </button>
        </div>

        {myLearning.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
            <p className="text-xs text-slate-400 mb-3">
              No learning records logged yet for {selectedMonth} {selectedYear}.
            </p>
            <button
              onClick={onOpenLearningModal}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Log Your First Course or Skill</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myLearning.map((lrn) => (
              <div
                key={lrn.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-indigo-400">
                      {lrn.month} {lrn.year}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-medium">
                      {lrn.skillArea}
                    </span>
                    <span className="text-slate-400">
                      Provider: <strong className="text-slate-200">{lrn.institute}</strong>
                    </span>
                    <span className="text-slate-400">
                      Mode: <strong className="text-slate-300">{lrn.learningMode}</strong>
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-100">{lrn.topic}</h4>

                  {lrn.applicationOutcome && (
                    <p className="text-xs text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800">
                      <span className="text-slate-400 font-medium">Application at work: </span>
                      {lrn.applicationOutcome}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-indigo-400">
                      {lrn.hoursSpent}h spent
                    </div>
                    {lrn.certification === 'Yes' && (
                      <span className="text-[10px] text-amber-300 font-semibold block">
                        Cert Targeted ✓
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      lrn.status === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}
                  >
                    {lrn.status}
                  </span>
                  <button
                    onClick={() => onEditLearning(lrn)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
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
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
