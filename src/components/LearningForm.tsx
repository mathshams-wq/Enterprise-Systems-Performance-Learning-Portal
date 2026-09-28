import React, { useState, useEffect } from 'react';
import {
  X,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Award,
  Save,
  Clock,
  Briefcase,
} from 'lucide-react';
import {
  TeamMember,
  LearningRecord,
  MonthName,
  LearningStatus,
} from '../types';
import {
  MONTHS,
  YEARS,
  SKILL_AREAS,
  LEARNING_MODES,
  INSTITUTES,
} from '../data/initialData';
import {
  getTeamMembers,
  getMemberById,
  addLearningRecord,
  updateLearningRecord,
  getLovs,
  addLovItem,
} from '../services/storageService';
import { appendLearningToSheet } from '../services/googleSheetsService';

interface LearningFormProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: TeamMember | null;
  editItem?: LearningRecord | null;
  onSuccess: (rec: LearningRecord) => void;
}

export const LearningForm: React.FC<LearningFormProps> = ({
  isOpen,
  onClose,
  currentUser,
  editItem,
  onSuccess,
}) => {
  const members = getTeamMembers();
  const lovs = getLovs();

  const [selectedOfficialId, setSelectedOfficialId] = useState<string>(
    editItem ? editItem.officialId : currentUser?.id || '15103681'
  );
  const [month, setMonth] = useState<MonthName>(editItem ? editItem.month : 'August');
  const [year, setYear] = useState<number>(editItem ? editItem.year : 2026);
  const [topic, setTopic] = useState<string>(editItem ? editItem.topic : '');
  const [skillArea, setSkillArea] = useState<string>(editItem ? editItem.skillArea : 'Oracle / APEX / SQL');
  const [customSkillArea, setCustomSkillArea] = useState<string>('');
  const [learningMode, setLearningMode] = useState<string>(editItem ? editItem.learningMode : 'Online Course');
  const [customLearningMode, setCustomLearningMode] = useState<string>('');
  const [institute, setInstitute] = useState<string>(editItem ? editItem.institute : 'Simplilearn');
  const [customInstitute, setCustomInstitute] = useState<string>('');
  const [certification, setCertification] = useState<'Yes' | 'No'>(editItem ? editItem.certification : 'Yes');
  const [hoursSpent, setHoursSpent] = useState<string>(
    editItem?.hoursSpent !== undefined ? String(editItem.hoursSpent) : '20'
  );
  const [status, setStatus] = useState<LearningStatus>(editItem ? editItem.status : 'Completed');
  const [appliedAtWork, setAppliedAtWork] = useState<'Yes' | 'Not yet'>(
    editItem ? editItem.appliedAtWork : 'Yes'
  );
  const [applicationOutcome, setApplicationOutcome] = useState<string>(
    editItem ? editItem.applicationOutcome : ''
  );

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editItem) {
      setSelectedOfficialId(editItem.officialId);
      setMonth(editItem.month);
      setYear(editItem.year);
      setTopic(editItem.topic);
      setSkillArea(editItem.skillArea);
      setLearningMode(editItem.learningMode);
      setInstitute(editItem.institute);
      setCertification(editItem.certification);
      setHoursSpent(String(editItem.hoursSpent));
      setStatus(editItem.status);
      setAppliedAtWork(editItem.appliedAtWork);
      setApplicationOutcome(editItem.applicationOutcome);
    } else if (currentUser) {
      setSelectedOfficialId(currentUser.id);
    }
  }, [editItem, currentUser, isOpen]);

  if (!isOpen) return null;

  const resolvedMember = getMemberById(selectedOfficialId) || currentUser || members[0];

  const finalInstitute =
    institute === 'Other' || institute === '__NEW__'
      ? customInstitute.trim() || 'Other'
      : institute;

  const finalSkillArea =
    skillArea === '__NEW__'
      ? customSkillArea.trim() || 'Other'
      : skillArea;

  const finalLearningMode =
    learningMode === '__NEW__'
      ? customLearningMode.trim() || 'Online Course'
      : learningMode;

  // Validation
  const isComplete =
    Boolean(topic.trim()) &&
    Boolean(finalSkillArea.trim()) &&
    Boolean(finalLearningMode.trim()) &&
    Boolean(finalInstitute.trim()) &&
    Boolean(status);

  const validationStatus: 'OK' | 'Incomplete' = isComplete ? 'OK' : 'Incomplete';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!topic.trim()) {
      setError('Please enter the Topic or Course Name.');
      return;
    }

    try {
      setIsSubmitting(true);
      const parsedHours = Number(hoursSpent) || 0;

      // Automatically register new options into LOVs
      if ((institute === 'Other' || institute === '__NEW__') && customInstitute.trim()) {
        addLovItem('institutes', customInstitute.trim());
      }
      if (skillArea === '__NEW__' && customSkillArea.trim()) {
        addLovItem('skillAreas', customSkillArea.trim());
      }
      if (learningMode === '__NEW__' && customLearningMode.trim()) {
        addLovItem('learningModes', customLearningMode.trim());
      }

      const payload = {
        officialId: resolvedMember.id,
        memberName: resolvedMember.name,
        memberDesignation: resolvedMember.designation,
        memberLocation: resolvedMember.location,
        month,
        year,
        topic: topic.trim(),
        skillArea: finalSkillArea,
        learningMode: finalLearningMode,
        institute: finalInstitute,
        certification,
        hoursSpent: parsedHours,
        status,
        appliedAtWork,
        applicationOutcome: applicationOutcome.trim(),
        validationStatus,
      };

      let resultRecord: LearningRecord;

      if (editItem) {
        resultRecord = {
          ...editItem,
          ...payload,
        };
        updateLearningRecord(resultRecord);
      } else {
        resultRecord = addLearningRecord(payload);
        appendLearningToSheet(resultRecord).catch(() => {});
      }

      onSuccess(resultRecord);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save learning record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {editItem ? 'Edit Learning & Certification' : 'Log Monthly Learning & Certification'}
              </h3>
              <p className="text-xs text-slate-400">
                Track self-learning, courses, certifications, and workplace application
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
            {certification === 'Yes' && status === 'Completed'
              ? '✓ Counts as verified earned certificate'
              : 'Targeting completion/progress'}
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

          {/* Month, Year, and Official ID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Month <span className="text-rose-400">*</span>
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value as MonthName)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
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
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
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
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500 disabled:opacity-75 font-mono"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} - {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Roster Auto-filled info */}
          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">LEARNER</span>
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

          {/* Topic / Course Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Topic / Course Name <span className="text-rose-400">*</span>
              </label>
              <span className="text-[10px] text-slate-400">
                Rule: Use real course title, e.g. &quot;SQL Analytics&quot;
              </span>
            </div>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. SQL Analytics & Window Functions or Oracle APEX Advanced Architecture"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Skill Area & Learning Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Skill Area <span className="text-rose-400">*</span>
              </label>
              <select
                value={skillArea}
                onChange={(e) => setSkillArea(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {lovs.skillAreas.map((sa) => (
                  <option key={sa} value={sa}>
                    {sa}
                  </option>
                ))}
                <option value="__NEW__">+ Add Custom Skill Area...</option>
              </select>
              {skillArea === '__NEW__' && (
                <input
                  type="text"
                  autoFocus
                  placeholder="Type new skill area..."
                  value={customSkillArea}
                  onChange={(e) => setCustomSkillArea(e.target.value)}
                  className="mt-1.5 w-full bg-slate-900 border border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-indigo-200 placeholder-slate-500 focus:outline-none"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Learning Mode <span className="text-rose-400">*</span>
              </label>
              <select
                value={learningMode}
                onChange={(e) => setLearningMode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {lovs.learningModes.map((lm) => (
                  <option key={lm} value={lm}>
                    {lm}
                  </option>
                ))}
                <option value="__NEW__">+ Add Custom Mode...</option>
              </select>
              {learningMode === '__NEW__' && (
                <input
                  type="text"
                  autoFocus
                  placeholder="Type new learning mode..."
                  value={customLearningMode}
                  onChange={(e) => setCustomLearningMode(e.target.value)}
                  className="mt-1.5 w-full bg-slate-900 border border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-indigo-200 placeholder-slate-500 focus:outline-none"
                />
              )}
            </div>
          </div>

          {/* Institute / Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Institute / Platform <span className="text-rose-400">*</span>
              </label>
              <select
                value={institute}
                onChange={(e) => setInstitute(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {lovs.institutes.map((inst) => (
                  <option key={inst} value={inst}>
                    {inst}
                  </option>
                ))}
                <option value="__NEW__">+ Add Custom Institute...</option>
              </select>
            </div>

            {institute === 'Other' || institute === '__NEW__' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Specify Institute / Platform
                </label>
                <input
                  type="text"
                  autoFocus
                  value={customInstitute}
                  onChange={(e) => setCustomInstitute(e.target.value)}
                  placeholder="Enter provider or university name"
                  className="w-full bg-slate-900 border border-indigo-500 rounded-lg px-3 py-2 text-xs sm:text-sm text-indigo-200 focus:outline-none"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Certification?
                  </label>
                  <select
                    value={certification}
                    onChange={(e) => setCertification(e.target.value as 'Yes' | 'No')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Yes">Yes (Targeted/Issued)</option>
                    <option value="No">No (Course / Self-Study)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Hours Spent
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={hoursSpent}
                    onChange={(e) => setHoursSpent(e.target.value)}
                    placeholder="e.g. 20"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Learning Status <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Completed', 'In Progress', 'On Hold', 'Planned'] as LearningStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                    status === st
                      ? st === 'Completed'
                        ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200'
                        : st === 'In Progress'
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                        : st === 'On Hold'
                        ? 'bg-amber-600/30 border-amber-500 text-amber-200'
                        : 'bg-slate-700 border-slate-600 text-slate-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Applied at Work & Application Outcome */}
          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-200">
                  Practical Workplace Application & Outcome
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Applied at work?</span>
                <button
                  type="button"
                  onClick={() => setAppliedAtWork(appliedAtWork === 'Yes' ? 'Not yet' : 'Yes')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                    appliedAtWork === 'Yes'
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {appliedAtWork}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Describe Application / Outcome (e.g. tool, report, project)
              </label>
              <textarea
                rows={2}
                value={applicationOutcome}
                onChange={(e) => setApplicationOutcome(e.target.value)}
                placeholder="e.g. Used for data accuracy checks on Fabric Store inventory variance reports"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
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
              className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : editItem ? 'Update Record' : 'Save Learning Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
