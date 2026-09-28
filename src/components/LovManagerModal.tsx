import React, { useState } from 'react';
import {
  X,
  ListFilter,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Layers,
  Building2,
  Cpu,
  GraduationCap,
  Briefcase,
  HelpCircle,
} from 'lucide-react';
import {
  AppLovs,
  getLovs,
  addLovItem,
  deleteLovItem,
} from '../services/storageService';

interface LovManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLovUpdated: () => void;
}

export const LovManagerModal: React.FC<LovManagerModalProps> = ({
  isOpen,
  onClose,
  onLovUpdated,
}) => {
  const [activeCategory, setActiveCategory] = useState<keyof AppLovs>('departments');
  const [newItemValue, setNewItemValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentLovs = getLovs();

  const categories: {
    id: keyof AppLovs;
    label: string;
    description: string;
    icon: any;
    placeholder: string;
  }[] = [
    {
      id: 'departments',
      label: 'Departments',
      description: 'Business units impacted by accomplishments (e.g. Accessories Store, Fabric Store, Sourcing)',
      icon: Building2,
      placeholder: 'e.g. Spinning Division, Dyeing Lab, Commercial LC...',
    },
    {
      id: 'systems',
      label: 'Systems & Platforms',
      description: 'Core software platforms used (e.g. Oracle APEX, AI & HTML, In-house ERP)',
      icon: Cpu,
      placeholder: 'e.g. Oracle EBS, FastAPI, Next.js, SAP, Flutter...',
    },
    {
      id: 'workTypes',
      label: 'Work Types',
      description: 'Types of project deliverables (e.g. Automation, New Development, Modification)',
      icon: Briefcase,
      placeholder: 'e.g. Cloud Migration, Security Audit, BI Dashboards...',
    },
    {
      id: 'skillAreas',
      label: 'Skill Areas',
      description: 'Technical knowledge domains (e.g. Oracle / APEX / SQL, AI & Automation / RPA)',
      icon: Layers,
      placeholder: 'e.g. Generative AI & LLMs, Kafka & Microservices...',
    },
    {
      id: 'institutes',
      label: 'Institutes & Platforms',
      description: 'Learning providers & platforms (e.g. Simplilearn, Coursera, Udemy, Oracle University)',
      icon: GraduationCap,
      placeholder: 'e.g. Harvard Online, Pluralsight, AWS Skill Builder...',
    },
    {
      id: 'learningModes',
      label: 'Learning Modes',
      description: 'Format of learning (e.g. Online Course, Self-Study, Workshop)',
      icon: ListFilter,
      placeholder: 'e.g. Executive Bootcamp, Peer Mentorship...',
    },
  ];

  const currentCategoryInfo = categories.find((c) => c.id === activeCategory)!;
  const items = currentLovs[activeCategory] || [];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const val = newItemValue.trim();
    if (!val) {
      setError('Please type a value to add');
      return;
    }

    if (items.some((i) => i.toLowerCase() === val.toLowerCase())) {
      setError(`"${val}" already exists in ${currentCategoryInfo.label}`);
      return;
    }

    try {
      addLovItem(activeCategory, val);
      setNewItemValue('');
      setSuccessMsg(`Added "${val}" to ${currentCategoryInfo.label}`);
      onLovUpdated();
      setTimeout(() => setSuccessMsg(null), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteItem = (itemToDelete: string) => {
    if (items.length <= 1) {
      setError('Cannot delete the last remaining option.');
      return;
    }
    deleteLovItem(activeCategory, itemToDelete);
    onLovUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <ListFilter className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Manage LOV (List of Values & Dropdown Options)
              </h3>
              <p className="text-xs text-slate-400">
                Add, customize, and manage dropdown choices for all 19 team members
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

        {/* Categories Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-6 border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1 text-xs">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 px-2.5 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
                  isSelected
                    ? 'bg-sky-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>{currentCategoryInfo.label}</span>
                <span className="text-xs font-normal text-slate-400">
                  ({items.length} options available)
                </span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentCategoryInfo.description}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-200 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-200 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Add New Item Input */}
          <form onSubmit={handleAddItem} className="flex gap-2">
            <input
              type="text"
              value={newItemValue}
              onChange={(e) => setNewItemValue(e.target.value)}
              placeholder={currentCategoryInfo.placeholder}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add to {currentCategoryInfo.label}</span>
            </button>
          </form>

          {/* List of current values */}
          <div className="border border-slate-800 rounded-xl bg-slate-950/50 divide-y divide-slate-800/80 overflow-hidden max-h-72 overflow-y-auto">
            {items.map((item, idx) => (
              <div
                key={item}
                className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-mono text-[10px] w-5">
                    {idx + 1}.
                  </span>
                  <span className="font-semibold text-slate-200">{item}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item)}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Remove this option"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              Values added here immediately appear in all dropdowns across the application for Accomplishments, Learning, and Admin filters.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
