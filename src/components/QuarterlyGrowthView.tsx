import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  Clock,
  Sparkles,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  Target,
  BarChart2,
  Users,
  CheckCircle2,
} from 'lucide-react';
import {
  QuarterName,
  Accomplishment,
  LearningRecord,
  TeamMember,
} from '../types';

interface QuarterlyGrowthViewProps {
  accomplishments: Accomplishment[];
  learningRecords: LearningRecord[];
  teamMembers: TeamMember[];
  currentUser: TeamMember | null;
  onOpenExportModal: () => void;
}

export const QuarterlyGrowthView: React.FC<QuarterlyGrowthViewProps> = ({
  accomplishments,
  learningRecords,
  teamMembers,
  currentUser,
  onOpenExportModal,
}) => {
  const [selectedQuarter, setSelectedQuarter] = useState<QuarterName | 'All'>('Q3');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [viewScope, setViewScope] = useState<'team' | 'personal'>(
    currentUser?.role === 'admin' ? 'team' : 'personal'
  );

  const quarters: { id: QuarterName; name: string; months: string[] }[] = [
    { id: 'Q1', name: 'Q1 (Jan - Mar)', months: ['January', 'February', 'March'] },
    { id: 'Q2', name: 'Q2 (Apr - Jun)', months: ['April', 'May', 'June'] },
    { id: 'Q3', name: 'Q3 (Jul - Sep)', months: ['July', 'August', 'September'] },
    { id: 'Q4', name: 'Q4 (Oct - Dec)', months: ['October', 'November', 'December'] },
  ];

  // Filter items based on scope
  const scopedAccomplishments =
    viewScope === 'personal' && currentUser
      ? accomplishments.filter((a) => a.officialId === currentUser.id)
      : accomplishments;

  const scopedLearning =
    viewScope === 'personal' && currentUser
      ? learningRecords.filter((l) => l.officialId === currentUser.id)
      : learningRecords;

  // Compute metrics per quarter
  const quarterStats = quarters.map((q) => {
    const accList = scopedAccomplishments.filter(
      (a) => a.year === selectedYear && q.months.includes(a.month)
    );
    const lrnList = scopedLearning.filter(
      (l) => l.year === selectedYear && q.months.includes(l.month)
    );

    const completedAcc = accList.filter((a) => a.status === 'Completed').length;
    const timeSavedMin = accList.reduce((sum, a) => sum + (a.timeSavedMin || 0), 0);
    const learningHours = lrnList.reduce((sum, l) => sum + (l.hoursSpent || 0), 0);
    const certs = lrnList.filter((l) => l.certification === 'Yes' && l.status === 'Completed').length;
    const activeContributors = new Set([
      ...accList.map((a) => a.officialId),
      ...lrnList.map((l) => l.officialId),
    ]).size;

    return {
      quarter: q.id,
      label: q.name,
      months: q.months,
      totalAcc: accList.length,
      completedAcc,
      timeSavedMin,
      timeSavedHrs: Number((timeSavedMin / 60).toFixed(1)),
      learningHours,
      certs,
      activeContributors,
    };
  });

  // Current active quarter stats
  const activeMonths =
    selectedQuarter === 'All'
      ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      : quarters.find((q) => q.id === selectedQuarter)?.months || [];

  const activeAcc = scopedAccomplishments.filter(
    (a) => a.year === selectedYear && activeMonths.includes(a.month)
  );
  const activeLrn = scopedLearning.filter(
    (l) => l.year === selectedYear && activeMonths.includes(l.month)
  );

  const activeTimeSavedMin = activeAcc.reduce((sum, a) => sum + (a.timeSavedMin || 0), 0);
  const activeTimeSavedHrs = (activeTimeSavedMin / 60).toFixed(1);
  const activeLearningHrs = activeLrn.reduce((sum, l) => sum + (l.hoursSpent || 0), 0);
  const activeCerts = activeLrn.filter((l) => l.certification === 'Yes' && l.status === 'Completed').length;
  const activeAutomationAcc = activeAcc.filter(
    (a) => a.workType.includes('Automation') || a.system.includes('AI')
  ).length;

  // Max for relative chart scaling
  const maxTimeSaved = Math.max(...quarterStats.map((q) => q.timeSavedMin), 120);
  const maxLearningHrs = Math.max(...quarterStats.map((q) => q.learningHours), 30);
  const maxAcc = Math.max(...quarterStats.map((q) => q.totalAcc), 10);

  // Department Breakdown
  const deptMap: Record<string, { count: number; savedMin: number }> = {};
  activeAcc.forEach((a) => {
    const d = a.forDepartment || 'Other';
    if (!deptMap[d]) deptMap[d] = { count: 0, savedMin: 0 };
    deptMap[d].count += 1;
    deptMap[d].savedMin += a.timeSavedMin || 0;
  });
  const deptList = Object.entries(deptMap).sort((a, b) => b[1].count - a[1].count);

  // Skill Area Breakdown
  const skillMap: Record<string, { hours: number; count: number }> = {};
  activeLrn.forEach((l) => {
    const s = l.skillArea || 'Other';
    if (!skillMap[s]) skillMap[s] = { hours: 0, count: 0 };
    skillMap[s].hours += l.hoursSpent || 0;
    skillMap[s].count += 1;
  });
  const skillList = Object.entries(skillMap).sort((a, b) => b[1].hours - a[1].hours);

  return (
    <div className="space-y-6">
      {/* Top Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-100">
              Quarterly Growth & Performance Metrics
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Compare Q1, Q2, Q3, and Q4 automation impacts, learning hours, and capability development
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scope Toggle (Team vs My Growth) */}
          {currentUser && (
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-0.5 flex text-xs">
              <button
                onClick={() => setViewScope('team')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  viewScope === 'team'
                    ? 'bg-sky-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Team (19)
              </button>
              <button
                onClick={() => setViewScope('personal')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  viewScope === 'personal'
                    ? 'bg-sky-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                My Growth
              </button>
            </div>
          )}

          {/* Year selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>

          {/* Quarter Pills */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-0.5 flex text-xs">
            <button
              onClick={() => setSelectedQuarter('All')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-all ${
                selectedQuarter === 'All'
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Full Year
            </button>
            {(['Q1', 'Q2', 'Q3', 'Q4'] as QuarterName[]).map((q) => (
              <button
                key={q}
                onClick={() => setSelectedQuarter(q)}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-all ${
                  selectedQuarter === q
                    ? 'bg-sky-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Export CTA */}
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Download Review</span>
          </button>
        </div>
      </div>

      {/* Hero KPI Cards for Selected Quarter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Time Saved */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Process Time Saved</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100 tracking-tight">
              {activeTimeSavedHrs}
            </span>
            <span className="text-sm font-semibold text-emerald-400">hours saved</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {activeTimeSavedMin.toLocaleString()} minutes saved across internal workflows
          </p>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Period: {selectedQuarter === 'All' ? 'Full Year' : selectedQuarter} {selectedYear}</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> Impact High
            </span>
          </div>
        </div>

        {/* KPI 2: Accomplishments */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Accomplishments</span>
            <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100 tracking-tight">
              {activeAcc.length}
            </span>
            <span className="text-sm font-semibold text-sky-400">
              ({activeAcc.filter((a) => a.status === 'Completed').length} Completed)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {activeAutomationAcc} automation & AI solutions deployed
          </p>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Completion Rate</span>
            <span className="text-sky-400 font-semibold">
              {activeAcc.length > 0
                ? `${Math.round((activeAcc.filter((a) => a.status === 'Completed').length / activeAcc.length) * 100)}%`
                : '0%'}
            </span>
          </div>
        </div>

        {/* KPI 3: Learning Hours */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Learning Hours</span>
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100 tracking-tight">
              {activeLearningHrs}
            </span>
            <span className="text-sm font-semibold text-indigo-400">hours invested</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {activeLrn.length} technical courses & skill topics covered
          </p>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Workplace Applied</span>
            <span className="text-indigo-400 font-semibold">
              {activeLrn.filter((l) => l.appliedAtWork === 'Yes').length} practical topics
            </span>
          </div>
        </div>

        {/* KPI 4: Certifications */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Certifications</span>
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100 tracking-tight">
              {activeCerts}
            </span>
            <span className="text-sm font-semibold text-amber-400">earned & verified</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {activeLrn.filter((l) => l.certification === 'Yes' && l.status === 'In Progress').length} certifications currently in progress
          </p>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Team Roster Active</span>
            <span className="text-amber-400 font-semibold">
              {viewScope === 'team' ? `${new Set(activeAcc.map((a) => a.officialId)).size} / 19 Members` : 'Self Review'}
            </span>
          </div>
        </div>
      </div>

      {/* Quarterly Trajectory Comparisons: Q1 vs Q2 vs Q3 vs Q4 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-sky-400" />
              <span>Quarter-by-Quarter Growth Trajectory ({selectedYear})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Visual progression across Q1, Q2, Q3, and Q4 for time saved and learning hours
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-slate-300">Time Saved (hrs)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-indigo-500" />
              <span className="text-slate-300">Learning Hours</span>
            </div>
          </div>
        </div>

        {/* 4 Quarter Cards with Progress Visuals */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {quarterStats.map((qs) => {
            const isSelected = selectedQuarter === qs.quarter || selectedQuarter === 'All';
            const timePercent = Math.min(100, Math.round((qs.timeSavedMin / maxTimeSaved) * 100));
            const lrnPercent = Math.min(100, Math.round((qs.learningHours / maxLearningHrs) * 100));

            return (
              <div
                key={qs.quarter}
                onClick={() => setSelectedQuarter(qs.quarter)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/80 border-sky-500/60 shadow-lg ring-1 ring-sky-500/30'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-200">{qs.quarter}</span>
                  <span className="text-[11px] text-slate-400">{qs.months[0].slice(0, 3)} - {qs.months[2].slice(0, 3)}</span>
                </div>

                {/* Accomplishments & Time Saved Bar */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Time Saved</span>
                      <strong className="text-emerald-400 font-mono">{qs.timeSavedHrs}h ({qs.timeSavedMin}m)</strong>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, timePercent)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Learning Effort</span>
                      <strong className="text-indigo-400 font-mono">{qs.learningHours} hrs</strong>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, lrnPercent)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-1 text-[11px]">
                    <div className="text-slate-400">
                      Deliverables: <span className="text-slate-200 font-semibold">{qs.totalAcc}</span>
                    </div>
                    <div className="text-slate-400 text-right">
                      Certs: <span className="text-amber-300 font-semibold">{qs.certs}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Department Impact & Skill Areas Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Impact Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Departmental Coverage & Time Saved</span>
              </h3>
              <p className="text-xs text-slate-400">
                Where automation and system upgrades delivered direct business savings
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {deptList.length} Departments Impacted
            </span>
          </div>

          <div className="space-y-3">
            {deptList.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No accomplishments recorded for this period.</p>
            ) : (
              deptList.map(([deptName, info]) => {
                const percent = Math.min(100, Math.round((info.savedMin / (activeTimeSavedMin || 1)) * 100));
                return (
                  <div key={deptName} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-200">{deptName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{info.count} projects</span>
                        {info.savedMin > 0 && (
                          <span className="font-bold text-emerald-400 font-mono">
                            {info.savedMin} min saved
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.max(8, percent)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Skill Area Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Skill Focus & Capability Growth</span>
              </h3>
              <p className="text-xs text-slate-400">
                Breakdown of training and technology areas mastered this period
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {skillList.length} Skill Clusters
            </span>
          </div>

          <div className="space-y-3">
            {skillList.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No learning records found for this period.</p>
            ) : (
              skillList.map(([skillName, info]) => {
                const percent = Math.min(100, Math.round((info.hours / (activeLearningHrs || 1)) * 100));
                return (
                  <div key={skillName} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-200">{skillName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{info.count} topics</span>
                        <span className="font-bold text-indigo-400 font-mono">
                          {info.hours} hours
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.max(8, percent)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
