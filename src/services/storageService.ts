import {
  TeamMember,
  Accomplishment,
  LearningRecord,
  GoogleSheetsConfig,
} from '../types';
import {
  INITIAL_TEAM_MEMBERS,
  INITIAL_ACCOMPLISHMENTS,
  INITIAL_LEARNING,
} from '../data/initialData';

const STORAGE_KEYS = {
  TEAM_MEMBERS: 'es_team_members_v1',
  ACCOMPLISHMENTS: 'es_accomplishments_v1',
  LEARNING: 'es_learning_v1',
  CURRENT_USER: 'es_current_user_v1',
  SHEETS_CONFIG: 'es_sheets_config_v1',
  LOVS: 'es_lovs_v1',
  THEME: 'es_theme_v1',
};

export type AppTheme = 'dark' | 'ocean-blue' | 'olive';

export interface AppLovs {
  workTypes: string[];
  departments: string[];
  systems: string[];
  skillAreas: string[];
  learningModes: string[];
  institutes: string[];
}

import {
  WORK_TYPES,
  DEPARTMENTS,
  SYSTEMS,
  SKILL_AREAS,
  LEARNING_MODES,
  INSTITUTES,
} from '../data/initialData';

const DEFAULT_LOVS: AppLovs = {
  workTypes: WORK_TYPES,
  departments: DEPARTMENTS,
  systems: SYSTEMS,
  skillAreas: SKILL_AREAS,
  learningModes: LEARNING_MODES,
  institutes: INSTITUTES,
};

// Initialize if empty
function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.TEAM_MEMBERS)) {
    localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(INITIAL_TEAM_MEMBERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACCOMPLISHMENTS)) {
    localStorage.setItem(STORAGE_KEYS.ACCOMPLISHMENTS, JSON.stringify(INITIAL_ACCOMPLISHMENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LEARNING)) {
    localStorage.setItem(STORAGE_KEYS.LEARNING, JSON.stringify(INITIAL_LEARNING));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOVS)) {
    localStorage.setItem(STORAGE_KEYS.LOVS, JSON.stringify(DEFAULT_LOVS));
  }
}

initializeStorage();

type Listener = () => void;
const listeners: Set<Listener> = new Set();

export const subscribeToStorageChanges = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach((l) => l());
};

// Team Members
export const getTeamMembers = (): TeamMember[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEAM_MEMBERS);
    if (!raw) return INITIAL_TEAM_MEMBERS;
    const list: TeamMember[] = JSON.parse(raw);
    if (!list.some((m) => m.id === '15103999')) {
      const viewer = INITIAL_TEAM_MEMBERS.find((m) => m.id === '15103999');
      if (viewer) {
        list.push(viewer);
        localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(list));
      }
    }
    return list;
  } catch {
    return INITIAL_TEAM_MEMBERS;
  }
};

export const saveTeamMembers = (members: TeamMember[]) => {
  localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(members));
  notifyListeners();
};

export const getMemberById = (id: string): TeamMember | undefined => {
  return getTeamMembers().find((m) => m.id.trim() === id.trim());
};

export const updateMember = (updated: TeamMember) => {
  const members = getTeamMembers().map((m) => (m.id === updated.id ? updated : m));
  saveTeamMembers(members);
};

export const addMember = (newMember: TeamMember) => {
  const members = getTeamMembers();
  if (members.some((m) => m.id === newMember.id)) {
    throw new Error(`Team member with ID ${newMember.id} already exists`);
  }
  members.push(newMember);
  saveTeamMembers(members);
};

// Accomplishments
export const getAccomplishments = (): Accomplishment[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOMPLISHMENTS);
    return raw ? JSON.parse(raw) : INITIAL_ACCOMPLISHMENTS;
  } catch {
    return INITIAL_ACCOMPLISHMENTS;
  }
};

export const saveAccomplishments = (items: Accomplishment[]) => {
  localStorage.setItem(STORAGE_KEYS.ACCOMPLISHMENTS, JSON.stringify(items));
  notifyListeners();
};

export const addAccomplishment = (item: Omit<Accomplishment, 'id' | 'createdAt'>): Accomplishment => {
  const all = getAccomplishments();
  const newItem: Accomplishment = {
    ...item,
    id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  all.unshift(newItem);
  saveAccomplishments(all);
  return newItem;
};

export const updateAccomplishment = (updated: Accomplishment) => {
  const all = getAccomplishments().map((item) => (item.id === updated.id ? updated : item));
  saveAccomplishments(all);
};

export const deleteAccomplishment = (id: string) => {
  const all = getAccomplishments().filter((item) => item.id !== id);
  saveAccomplishments(all);
};

// Learning
export const getLearningRecords = (): LearningRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEARNING);
    return raw ? JSON.parse(raw) : INITIAL_LEARNING;
  } catch {
    return INITIAL_LEARNING;
  }
};

export const saveLearningRecords = (items: LearningRecord[]) => {
  localStorage.setItem(STORAGE_KEYS.LEARNING, JSON.stringify(items));
  notifyListeners();
};

export const addLearningRecord = (item: Omit<LearningRecord, 'id' | 'createdAt'>): LearningRecord => {
  const all = getLearningRecords();
  const newItem: LearningRecord = {
    ...item,
    id: `lrn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  all.unshift(newItem);
  saveLearningRecords(all);
  return newItem;
};

export const updateLearningRecord = (updated: LearningRecord) => {
  const all = getLearningRecords().map((item) => (item.id === updated.id ? updated : item));
  saveLearningRecords(all);
};

export const deleteLearningRecord = (id: string) => {
  const all = getLearningRecords().filter((item) => item.id !== id);
  saveLearningRecords(all);
};

// Auth
export const getCurrentUser = (): TeamMember | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    const user = JSON.parse(raw);
    // ensure refreshed from team members roster
    const fresh = getMemberById(user.id);
    return fresh || user;
  } catch {
    return null;
  }
};

export const setCurrentUser = (user: TeamMember | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
  notifyListeners();
};

export const loginWithOfficialId = (officialId: string, password: string): TeamMember => {
  const member = getMemberById(officialId.trim());
  if (!member) {
    throw new Error('Official ID not found in team roster. Contact administrator.');
  }

  // Check password (default is 'pass' or 'admin')
  const validPassword = member.password || (member.role === 'admin' ? 'admin' : 'pass');
  if (password.trim() !== validPassword.trim()) {
    throw new Error('Invalid password. Default password for members is "pass", for admin is "admin".');
  }

  setCurrentUser(member);
  return member;
};

export const updateMemberPassword = (officialId: string, newPassword: string) => {
  const members = getTeamMembers();
  const target = members.find((m) => m.id === officialId);
  if (!target) throw new Error('Member not found');
  target.password = newPassword;
  saveTeamMembers(members);

  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === officialId) {
    currentUser.password = newPassword;
    setCurrentUser(currentUser);
  }
};

// Google Sheet Config
export const getGoogleSheetConfig = (): GoogleSheetsConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHEETS_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {
    spreadsheetId: '',
    spreadsheetUrl: '',
    title: 'Enterprise Systems - Performance & Learning Database',
    isConnected: false,
  };
};

export const saveGoogleSheetConfig = (config: GoogleSheetsConfig) => {
  localStorage.setItem(STORAGE_KEYS.SHEETS_CONFIG, JSON.stringify(config));
  notifyListeners();
};

// LOV (List of Values) Management
export const getLovs = (): AppLovs => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOVS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_LOVS;
};

export const saveLovs = (lovs: AppLovs) => {
  localStorage.setItem(STORAGE_KEYS.LOVS, JSON.stringify(lovs));
  notifyListeners();
};

export const addLovItem = (category: keyof AppLovs, item: string) => {
  const trimmed = item.trim();
  if (!trimmed) return;
  const lovs = getLovs();
  if (!lovs[category].some((existing) => existing.toLowerCase() === trimmed.toLowerCase())) {
    lovs[category].push(trimmed);
    saveLovs(lovs);
  }
};

export const deleteLovItem = (category: keyof AppLovs, item: string) => {
  const lovs = getLovs();
  lovs[category] = lovs[category].filter((existing) => existing !== item);
  saveLovs(lovs);
};

// Theme Management
export const getAppTheme = (): AppTheme => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME);
    if (raw === 'ocean-blue' || raw === 'olive' || raw === 'dark') {
      return raw;
    }
  } catch {
    // fallback
  }
  return 'dark';
};

export const setAppTheme = (theme: AppTheme) => {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
  document.documentElement.setAttribute('data-theme', theme);
  notifyListeners();
};


