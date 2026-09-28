import React, { useState } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Calendar,
  Users,
  User,
} from 'lucide-react';
import {
  TeamMember,
  Accomplishment,
  LearningRecord,
  MonthName,
  QuarterName,
} from '../types';
import { MONTHS, YEARS } from '../data/initialData';
import { exportToExcel, exportToPdf } from '../services/exportService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: TeamMember[];
  accomplishments: Accomplishment[];
  learningRecords: LearningRecord[];
  currentUser: TeamMember | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  teamMembers,
  accomplishments,
  learningRecords,
  currentUser,
}) => {
  const [scope, setScope] = useState<'team' | 'member'>(
    currentUser?.role === 'admin' ? 'team' : 'member'
  );
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    currentUser?.id || teamMembers[0]?.id || '15103001'
  );
  const [periodType, setPeriodType] = useState<'all' | 'quarter' | 'month'>('quarter');
  const [selectedQuarter, setSelectedQuarter] = useState<QuarterName>('Q3');
  const [selectedMonth, setSelectedMonth] = useState<MonthName>('August');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [isExporting, setIsExporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetMember =
    scope === 'member'
      ? teamMembers.find((m) => m.id === selectedMemberId) || currentUser
      : null;

  const quarterMonths: Record<QuarterName, string[]> = {
    Q1: ['January', 'February', 'March'],
    Q2: ['April', 'May', 'June'],
    Q3: ['July', 'August', 'September'],
    Q4: ['October', 'November', 'December'],
  };

  // Filter datasets according to selections
  const filteredAcc = accomplishments.filter((a) => {
    if (scope === 'member' && targetMember && a.officialId !== targetMember.id) return false;
    if (a.year !== selectedYear) return false;
    if (periodType === 'month' && a.month !== selectedMonth) return false;
    if (periodType === 'quarter' && !quarterMonths[selectedQuarter].includes(a.month)) return false;
    return true;
  });

  const filteredLrn = learningRecords.filter((l) => {
    if (scope === 'member' && targetMember && l.officialId !== targetMember.id) return false;
    if (l.year !== selectedYear) return false;
    if (periodType === 'month' && l.month !== selectedMonth) return false;
    if (periodType === 'quarter' && !quarterMonths[selectedQuarter].includes(l.month)) return false;
    return true;
  });

  const handleExportExcel = () => {
    try {
      setIsExporting(true);
      exportToExcel({
        member: targetMember,
        quarter: periodType === 'quarter' ? selectedQuarter : undefined,
        month: periodType === 'month' ? selectedMonth : undefined,
        year: selectedYear,
        accomplishments: filteredAcc,
        learningRecords: filteredLrn,
        teamMembers: scope === 'team' ? teamMembers : [],
      });
      setSuccessMsg('Excel (.xlsx) file downloaded successfully!');
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err: any) {
      alert('Export failed: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = () => {
    try {
      setIsExporting(true);
      exportToPdf({
        member: targetMember,
        quarter: periodType === 'quarter' ? selectedQuarter : undefined,
        month: periodType === 'month' ? selectedMonth : undefined,
        year: selectedYear,
        accomplishments: filteredAcc,
        learningRecords: filteredLrn,
      });
      setSuccessMsg('PDF report generated and downloaded!');
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err: any) {
      alert('Export failed: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Download Performance & Growth Review
              </h3>
              <p className="text-xs text-slate-400">
                Export official reports in Excel (.xlsx) and PDF formats
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {successMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-200 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Scope Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Report Scope
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setScope('team')}
                className={`p-3 rounded-xl border flex items-center gap-2 font-medium transition-all ${
                  scope === 'team'
                    ? 'bg-sky-950/60 border-sky-500 text-sky-200 shadow'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Users className="w-4 h-4 text-sky-400" />
                <span>Entire Team (19 Members)</span>
              </button>
              <button
                type="button"
                onClick={() => setScope('member')}
                className={`p-3 rounded-xl border flex items-center gap-2 font-medium transition-all ${
                  scope === 'member'
                    ? 'bg-sky-950/60 border-sky-500 text-sky-200 shadow'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <User className="w-4 h-4 text-indigo-400" />
                <span>Individual Appraisal</span>
              </button>
            </div>
          </div>

          {/* Member Picker if scope === 'member' */}
          {scope === 'member' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Team Member
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} - {m.name} ({m.designation})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Period Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Time Period
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPeriodType('quarter')}
                className={`py-2 px-3 rounded-lg border font-medium text-center transition-all ${
                  periodType === 'quarter'
                    ? 'bg-slate-800 border-sky-500 text-sky-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Quarterly
              </button>
              <button
                type="button"
                onClick={() => setPeriodType('month')}
                className={`py-2 px-3 rounded-lg border font-medium text-center transition-all ${
                  periodType === 'month'
                    ? 'bg-slate-800 border-sky-500 text-sky-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setPeriodType('all')}
                className={`py-2 px-3 rounded-lg border font-medium text-center transition-all ${
                  periodType === 'all'
                    ? 'bg-slate-800 border-sky-500 text-sky-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Full Year
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {periodType === 'quarter' && (
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Quarter</label>
                  <select
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(e.target.value as QuarterName)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <option value="Q1">Q1 (Jan - Mar)</option>
                    <option value="Q2">Q2 (Apr - Jun)</option>
                    <option value="Q3">Q3 (Jul - Sep)</option>
                    <option value="Q4">Q4 (Oct - Dec)</option>
                  </select>
                </div>
              )}

              {periodType === 'month' && (
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value as MonthName)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Data Summary Preview */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Records to Export:
            </span>
            <div className="flex items-center justify-between text-slate-200">
              <span>Accomplishments found:</span>
              <strong className="text-emerald-400 font-mono">{filteredAcc.length}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-200">
              <span>Learning & cert records:</span>
              <strong className="text-indigo-400 font-mono">{filteredLrn.length}</strong>
            </div>
          </div>

          {/* Download Action Buttons */}
          <div className="pt-2 grid grid-cols-2 gap-3">
            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-sky-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span>Download PDF (.pdf)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
