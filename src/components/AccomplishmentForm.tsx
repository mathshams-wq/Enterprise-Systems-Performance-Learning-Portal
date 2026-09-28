import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Save,
} from 'lucide-react';
import {
  TeamMember,
  Accomplishment,
  MonthName,
  AccomplishmentStatus,
} from '../types';
import {
  MONTHS,
  YEARS,
  WORK_TYPES,
  DEPARTMENTS,
  SYSTEMS,
} from '../data/initialData';
import {
  getTeamMembers,
  getMemberById,
  addAccomplishment,
  updateAccomplishment,
  getLovs,
  addLovItem,
} from '../services/storageService';
import { appendAccomplishmentToSheet } from '../services/googleSheetsService';

interface AccomplishmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: TeamMember | null;
  editItem?: Accomplishment | null;
  onSuccess: (acc: Accomplishment) => void;
}

export const AccomplishmentForm: React.FC<AccomplishmentFormProps> = ({
  isOpen,
  onClose,
  currentUser,
  editItem,
  onSuccess,
}) => {
  const members = getTeamMembers();
  const lovs = getLovs();

  // Form State
  const [selectedOfficialId, setSelectedOfficialId] = useState<string>(
    editItem ? editItem.officialId : currentUser?.id || '15103328'
  );
  const [month, setMonth] = useState<MonthName>(editItem ? editItem.month : 'August');
  const [year, setYear] = useState<number>(editItem ? editItem.year : 2026);
  const [workType, setWorkType] = useState<string>(editItem ? editItem.workType : 'Automation (AI / RPA)');
  const [customWorkType, setCustomWorkType] = useState('');
  const [accomplishment, setAccomplishment] = useState<string>(editItem ? editItem.accomplishment : '');
  const [forDepartment, setForDepartment] = useState<string>(editItem ? editItem.forDepartment : 'Accessories Store');
  const [customDepartment, setCustomDepartment] = useState('');
  const [system, setSystem] = useState<string>(editItem ? editItem.system : 'AI & HTML');
  const [customSystem, setCustomSystem] = useState('');
  const [timeBeforeMin, setTimeBeforeMin] = useState<string>(
    editItem?.timeBeforeMin !== undefined ? String(editItem.timeBeforeMin) : '60'
  );
  const [timeAfterMin, setTimeAfterMin] = useState<string>(
    editItem?.timeAfterMin !== undefined ? String(editItem.timeAfterMin) : '1'
  );
  const [status, setStatus] = useState<AccomplishmentStatus>(editItem ? editItem.status : 'Completed');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize when editItem changes or modal opens
  useEffect(() => {
    if (editItem) {
      setSelectedOfficialId(editItem.officialId);
      setMonth(editItem.month);
      setYear(editItem.year);
      setWorkType(editItem.workType);
      setAccomplishment(editItem.accomplishment);
      setForDepartment(editItem.forDepartment);
      setSystem(editItem.system);
      setTimeBeforeMin(editItem.timeBeforeMin !== undefined ? String(editItem.timeBeforeMin) : '');
      setTimeAfterMin(editItem.timeAfterMin !== undefined ? String(editItem.timeAfterMin) : '');
      setStatus(editItem.status);
    } else if (currentUser) {
      setSelectedOfficialId(currentUser.id);
    }
  }, [editItem, currentUser, isOpen]);

  if (!isOpen) return null;

  // Resolve member details from roster
  const resolvedMember = getMemberById(selectedOfficialId) || currentUser || members[0];

  // Auto calculate time saved
  const beforeNum = timeBeforeMin.trim() !== '' ? Number(timeBeforeMin) : undefined;
  const afterNum = timeAfterMin.trim() !== '' ? Number(timeAfterMin) : undefined;
  let calculatedTimeSaved: number | undefined = undefined;
  if (beforeNum !== undefined && afterNum !== undefined && !isNaN(beforeNum) && !isNaN(afterNum)) {
    calculatedTimeSaved = Math.max(0, beforeNum - afterNum);
  }

  // Column P Validation Check
  const isComplete =
    Boolean(workType.trim()) &&
    Boolean(accomplishment.trim()) &&
    Boolean(forDepartment.trim()) &&
    Boolean(system.trim()) &&
    Boolean(status);

  const validationStatus: 'OK' | 'Incomplete' = isComplete ? 'OK' : 'Incomplete';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!accomplishment.trim()) {
      setError('Please describe your accomplishment in one clear sentence.');
      return;
    }

    try {
      setIsSubmitting(true);

      const finalWorkType = workType === '__NEW__' ? customWorkType.trim() : workType;
      const finalDepartment = forDepartment === '__NEW__' ? customDepartment.trim() : forDepartment;
      const finalSystem = system === '__NEW__' ? customSystem.trim() : system;

      if (!finalWorkType) {
        setError('Please specify a Work Type.');
        setIsSubmitting(false);
        return;
      }
      if (!finalDepartment) {
        setError('Please specify a Department.');
        setIsSubmitting(false);
        return;
      }
      if (!finalSystem) {
        setError('Please specify a System.');
        setIsSubmitting(false);
        return;
      }

      // Automatically add new values to LOVs for future re-use
      if (workType === '__NEW__' && customWorkType.trim()) {
        addLovItem('workTypes', customWorkType.trim());
      }
      if (forDepartment === '__NEW__' && customDepartment.trim()) {
        addLovItem('departments', customDepartment.trim());
      }
      if (system === '__NEW__' && customSystem.trim()) {
        addLovItem('systems', customSystem.trim());
      }

      const accPayload = {
        officialId: resolvedMember.id,
        memberName: resolvedMember.name,
        memberDesignation: resolvedMember.designation,
        memberLocation: resolvedMember.location,
        month,
        year,
        workType: finalWorkType,
        accomplishment: accomplishment.trim(),
        forDepartment: finalDepartment,
        system: finalSystem,
        timeBeforeMin: beforeNum !== undefined && !isNaN(beforeNum) ? beforeNum : undefined,
        timeAfterMin: afterNum !== undefined && !isNaN(afterNum) ? afterNum : undefined,
        timeSavedMin: calculatedTimeSaved ?? 0,
        status,
        validationStatus,
      };

      let resultAcc: Accomplishment;

      if (editItem) {
        resultAcc = {
          ...editItem,
          ...accPayload,
        };
        updateAccomplishment(resultAcc);
      } else {
        resultAcc = addAccomplishment(accPayload);
        // Attempt silent sync to Google Sheet if connected
        appendAccomplishmentToSheet(resultAcc).catch(() => {});
      }

      onSuccess(resultAcc);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save accomplishment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {editItem ? 'Edit Accomplishment' : 'Log Monthly Accomplishment'}
              </h3>
              <p className="text-xs text-slate-400">
                Template Rule: One clear sentence starting with what you did
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

        {/* Validation Status Indicator Banner */}
        <div className="px-6 py-2 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Column P Validation:</span>
            {validationStatus === 'OK' ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> OK
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Incomplete
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400">
            {validationStatus === 'Incomplete' ? 'Fill required fields to pass' : 'Ready to record in Google Sheet'}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-200 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Month, Year, and Official ID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Month <span className="text-rose-400">*</span>
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value as MonthName)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Year <span className="text-rose-400">*</span>
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official ID <span className="text-rose-400">*</span>
              </label>
              <select
                value={selectedOfficialId}
                onChange={(e) => setSelectedOfficialId(e.target.value)}
                disabled={currentUser?.role !== 'admin' && Boolean(currentUser)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-sky-500 disabled:opacity-75 font-mono"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} - {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Auto-filled details from Roster tab */}
          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">MEMBER NAME</span>
              <span className="font-semibold text-slate-200">{resolvedMember.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">DESIGNATION</span>
              <span className="text-slate-300 truncate block">{resolvedMember.designation}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">LOCATION</span>
              <span className="text-slate-300">{resolvedMember.location}</span>
            </div>
          </div>

          {/* Section 2: Work Type and System */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Work Type <span className="text-rose-400">*</span>
              </label>
              <select
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              >
                {lovs.workTypes.map((wt) => (
                  <option key={wt} value={wt}>
                    {wt}
                  </option>
                ))}
                <option value="__NEW__">+ Add Custom Work Type...</option>
              </select>
              {workType === '__NEW__' && (
                <input
                  type="text"
                  autoFocus
                  placeholder="Type new work type name..."
                  value={customWorkType}
                  onChange={(e) => setCustomWorkType(e.target.value)}
                  className="mt-1.5 w-full bg-slate-900 border border-sky-500 rounded-lg px-3 py-1.5 text-xs text-sky-200 placeholder-slate-500 focus:outline-none"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                System / Platform <span className="text-rose-400">*</span>
              </label>
              <select
                value={system}
                onChange={(e) => setSystem(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              >
                {lovs.systems.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
                <option value="__NEW__">+ Add Custom System...</option>
              </select>
              {system === '__NEW__' && (
                <input
                  type="text"
                  autoFocus
                  placeholder="Type new system/platform name..."
                  value={customSystem}
                  onChange={(e) => setCustomSystem(e.target.value)}
                  className="mt-1.5 w-full bg-slate-900 border border-sky-500 rounded-lg px-3 py-1.5 text-xs text-sky-200 placeholder-slate-500 focus:outline-none"
                />
              )}
            </div>
          </div>

          {/* Section 3: Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              For Which Department <span className="text-rose-400">*</span>
            </label>
            <div className="space-y-1.5">
              <select
                value={forDepartment}
                onChange={(e) => setForDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              >
                {lovs.departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
                <option value="__NEW__">+ Add Custom Department...</option>
              </select>
              {forDepartment === '__NEW__' && (
                <input
                  type="text"
                  autoFocus
                  placeholder="Type new department name..."
                  value={customDepartment}
                  onChange={(e) => setCustomDepartment(e.target.value)}
                  className="w-full bg-slate-900 border border-sky-500 rounded-lg px-3 py-1.5 text-xs text-sky-200 placeholder-slate-500 focus:outline-none"
                />
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              For multi-department, choose closest or select &quot;+ Add Custom Department...&quot; or &quot;All Departments&quot;.
            </p>
          </div>

          {/* Section 4: Accomplishment Sentence */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Accomplishment Description <span className="text-rose-400">*</span>
              </label>
              <span className="text-[10px] text-slate-400">
                Rule: Include report/module name in quotes &quot;...&quot;
              </span>
            </div>
            <textarea
              rows={2}
              value={accomplishment}
              onChange={(e) => setAccomplishment(e.target.value)}
              placeholder='e.g. Build an HTML-based, AI-powered tool to extract data from supplier Packing List PDFs into a fixed Excel format for "Accessories Store"'
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Section 5: Impact / Time Saved (Minutes) */}
          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-slate-200">
                Time-Saving & Automation Impact (Optional but recommended)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Time Before (min per run)
                </label>
                <input
                  type="number"
                  min="0"
                  value={timeBeforeMin}
                  onChange={(e) => setTimeBeforeMin(e.target.value)}
                  placeholder="e.g. 60"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Time After (min per run)
                </label>
                <input
                  type="number"
                  min="0"
                  value={timeAfterMin}
                  onChange={(e) => setTimeAfterMin(e.target.value)}
                  placeholder="e.g. 1"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Time Saved (Calculated)
                </label>
                <div className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs sm:text-sm text-emerald-400 font-bold flex items-center justify-between">
                  <span>{calculatedTimeSaved !== undefined ? `${calculatedTimeSaved} min` : '0 min'}</span>
                  {calculatedTimeSaved && calculatedTimeSaved > 0 ? (
                    <span className="text-[10px] text-emerald-300 font-normal">
                      ({(calculatedTimeSaved / 60).toFixed(1)} hrs)
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Status <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Completed', 'In Progress', 'On Hold', 'Not Started'] as AccomplishmentStatus[]).map(
                (st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                      status === st
                        ? st === 'Completed'
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200'
                          : st === 'In Progress'
                          ? 'bg-sky-600/30 border-sky-500 text-sky-200'
                          : st === 'On Hold'
                          ? 'bg-amber-600/30 border-amber-500 text-amber-200'
                          : 'bg-slate-700 border-slate-600 text-slate-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : editItem ? 'Update Accomplishment' : 'Save Accomplishment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
