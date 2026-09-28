import React, { useState } from 'react';
import {
  X,
  Users,
  UserPlus,
  Edit2,
  Check,
  KeyRound,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { TeamMember } from '../types';
import {
  getTeamMembers,
  saveTeamMembers,
  addMember,
  updateMember,
} from '../services/storageService';

interface RosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRosterUpdated: () => void;
}

export const RosterModal: React.FC<RosterModalProps> = ({
  isOpen,
  onClose,
  onRosterUpdated,
}) => {
  const [members, setMembers] = useState<TeamMember[]>(getTeamMembers());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<TeamMember>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    id: '',
    name: '',
    designation: '',
    location: 'Corporate Office',
    department: 'Enterprise Systems',
    email: '',
    role: 'member',
    password: 'pass',
  });
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartEdit = (m: TeamMember) => {
    setEditingId(m.id);
    setEditFormData({
      name: m.name,
      designation: m.designation,
      location: m.location,
      department: m.department,
      email: m.email,
      role: m.role,
      password: m.password || 'pass',
    });
  };

  const handleSaveEdit = (id: string) => {
    try {
      const existing = members.find((m) => m.id === id);
      if (!existing) return;

      const updated: TeamMember = {
        ...existing,
        ...editFormData,
      } as TeamMember;

      updateMember(updated);
      setMembers(getTeamMembers());
      setEditingId(null);
      setSuccessMsg(`Updated ${updated.name} successfully.`);
      onRosterUpdated();
      setTimeout(() => setSuccessMsg(null), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (!newMember.id?.trim() || !newMember.name?.trim()) {
        setError('Official ID and Name are required.');
        return;
      }

      const fullMember: TeamMember = {
        id: newMember.id.trim(),
        name: newMember.name.trim(),
        designation: newMember.designation?.trim() || 'Software Engineer',
        location: newMember.location?.trim() || 'Corporate Office',
        department: newMember.department?.trim() || 'Enterprise Systems',
        email: newMember.email?.trim() || `${newMember.id}@dbl-digital.com`,
        role: (newMember.role as 'admin' | 'member') || 'member',
        password: newMember.password || 'pass',
      };

      addMember(fullMember);
      setMembers(getTeamMembers());
      setIsAddingNew(false);
      setNewMember({
        id: '',
        name: '',
        designation: '',
        location: 'Corporate Office',
        department: 'Enterprise Systems',
        email: '',
        role: 'member',
        password: 'pass',
      });
      setSuccessMsg(`Added ${fullMember.name} to Roster.`);
      onRosterUpdated();
      setTimeout(() => setSuccessMsg(null), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Enterprise Systems Team Roster ({members.length} Members)
              </h3>
              <p className="text-xs text-slate-400">
                Official IDs, designations, work locations, roles, and credentials
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Alerts */}
        <div className="px-6 pt-3">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-200 rounded-lg text-xs flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-200 rounded-lg text-xs flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Add New Member Form */}
        {isAddingNew && (
          <form
            onSubmit={handleCreateMember}
            className="m-6 p-4 rounded-xl bg-slate-950/80 border border-slate-700/80 space-y-3"
          >
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-sky-400" />
              <span>Add New Team Member to Roster</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Official ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15103450"
                  value={newMember.id}
                  onChange={(e) => setNewMember({ ...newMember, id: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Employee Full Name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Role *</label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 text-xs"
                >
                  <option value="user">User (Only entry and can see his inputed data)</option>
                  <option value="admin">Admin (Full control)</option>
                  <option value="viewer">Viewer (Can see all data, dashboard and download)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer"
                  value={newMember.designation}
                  onChange={(e) => setNewMember({ ...newMember, designation: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Corporate Office, Factory, etc."
                  value={newMember.location}
                  onChange={(e) => setNewMember({ ...newMember, location: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Initial Password</label>
                <input
                  type="text"
                  placeholder="Default: pass"
                  value={newMember.password}
                  onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow"
              >
                Save Member
              </button>
            </div>
          </form>
        )}

        {/* Member Table */}
        <div className="p-6 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Official ID</th>
                <th className="py-2.5 px-3">Full Name</th>
                <th className="py-2.5 px-3">Designation</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3 text-center">Role</th>
                <th className="py-2.5 px-3 text-center">Password</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {members.map((m) => {
                const isEditing = editingId === m.id;
                return (
                  <tr key={m.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-300">
                      {m.id}
                    </td>

                    <td className="py-2.5 px-3 font-semibold text-slate-100">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editFormData.name || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs w-full text-slate-100"
                        />
                      ) : (
                        m.name
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-slate-300">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editFormData.designation || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                          className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs w-full text-slate-100"
                        />
                      ) : (
                        m.designation
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-slate-400">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editFormData.location || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                          className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs w-full text-slate-100"
                        />
                      ) : (
                        m.location
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {isEditing ? (
                        <select
                          value={editFormData.role || 'user'}
                          onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as any })}
                          className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
                        >
                          <option value="user">User (Entry Only)</option>
                          <option value="admin">Admin (Full Control)</option>
                          <option value="viewer">Viewer (View & Download)</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            m.role === 'admin'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : m.role === 'viewer'
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {m.role === 'admin' ? 'Admin' : m.role === 'viewer' ? 'Viewer' : 'User'}
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editFormData.password || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                          className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 font-mono w-20 text-center"
                        />
                      ) : (
                        <span className="text-slate-500 text-[11px]">{m.password || 'pass'}</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleSaveEdit(m.id)}
                            className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-slate-200"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(m)}
                          className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-slate-800"
                          title="Edit Member"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
