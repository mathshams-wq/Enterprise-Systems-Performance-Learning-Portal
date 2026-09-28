import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Accomplishment,
  LearningRecord,
  TeamMember,
  GoogleSheetsConfig,
} from '../types';
import {
  getGoogleSheetConfig,
  saveGoogleSheetConfig,
  getAccomplishments,
  getLearningRecords,
  getTeamMembers,
  saveAccomplishments,
  saveLearningRecords,
} from './storageService';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.setCustomParameters({
  prompt: 'select_account',
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;
let googleUser: User | null = null;

// Auth state listener
export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    googleUser = user;
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn && onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google access token. Please grant the requested permissions.');
    }
    cachedAccessToken = credential.accessToken;
    googleUser = result.user;

    const currentConfig = getGoogleSheetConfig();
    saveGoogleSheetConfig({
      ...currentConfig,
      connectedAccountEmail: result.user.email || 'shams.uddin@dbl-digital.com',
      isConnected: true,
    });

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getGoogleUser = (): User | null => {
  return googleUser;
};

export const googleSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  googleUser = null;
  const currentConfig = getGoogleSheetConfig();
  saveGoogleSheetConfig({
    ...currentConfig,
    isConnected: false,
  });
};

/**
 * Creates the official Google Spreadsheet with matching templates if it does not exist,
 * or updates the existing one.
 */
export const initializeOrCreateSpreadsheet = async (customTitle?: string): Promise<GoogleSheetsConfig> => {
  let token = await getAccessToken();
  if (!token) {
    const res = await googleSignIn();
    token = res.accessToken;
  }

  const existingConfig = getGoogleSheetConfig();
  if (existingConfig.spreadsheetId) {
    // Verify it still exists and is accessible
    try {
      const checkRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${existingConfig.spreadsheetId}?fields=spreadsheetId,properties.title`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (checkRes.ok) {
        return existingConfig;
      }
    } catch {
      // Create new if invalid
    }
  }

  const title = customTitle || 'Enterprise Systems - Performance & Learning Database';
  const createPayload = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: 'Accomplishments',
          gridProperties: { rowCount: 1000, columnCount: 16, frozenRowCount: 1 },
        },
      },
      {
        properties: {
          title: 'Learning_Certifications',
          gridProperties: { rowCount: 1000, columnCount: 16, frozenRowCount: 1 },
        },
      },
      {
        properties: {
          title: 'Team_Roster',
          gridProperties: { rowCount: 50, columnCount: 7, frozenRowCount: 1 },
        },
      },
      {
        properties: {
          title: 'Quarterly_Summary',
          gridProperties: { rowCount: 50, columnCount: 8, frozenRowCount: 1 },
        },
      },
    ],
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createPayload),
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Failed to create Google Spreadsheet');
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  const newConfig: GoogleSheetsConfig = {
    spreadsheetId,
    spreadsheetUrl,
    title,
    lastSyncedAt: new Date().toISOString(),
    connectedAccountEmail: googleUser?.email || 'shams.uddin@dbl-digital.com',
    isConnected: true,
  };

  saveGoogleSheetConfig(newConfig);

  // Seed Headers and existing local records
  await syncAllDataToGoogleSheet(spreadsheetId, token);

  return newConfig;
};

/**
 * Push all local Accomplishments, Learning, and Roster to Google Sheet
 */
export const syncAllDataToGoogleSheet = async (
  targetSpreadsheetId?: string,
  providedToken?: string
): Promise<{ success: boolean; message: string }> => {
  let token = providedToken || (await getAccessToken());
  if (!token) {
    const res = await googleSignIn();
    token = res.accessToken;
  }

  const config = getGoogleSheetConfig();
  const spreadsheetId = targetSpreadsheetId || config.spreadsheetId;
  if (!spreadsheetId) {
    throw new Error('No Google Spreadsheet linked. Please create or connect one first.');
  }

  const accomplishments = getAccomplishments();
  const learningRecords = getLearningRecords();
  const teamMembers = getTeamMembers();

  // 1. Accomplishments Sheet Data
  const accHeaders = [
    'Month',
    'Year',
    'Official ID',
    'Name',
    'Designation',
    'Location',
    'Work Type',
    'Accomplishment',
    'For Which Department',
    'System',
    'Time Before (min)',
    'Time After (min)',
    'Time Saved (min)',
    'Status',
    'Validation (P)',
    'Logged Date',
  ];

  const accRows = accomplishments.map((a) => [
    a.month,
    a.year,
    a.officialId,
    a.memberName,
    a.memberDesignation,
    a.memberLocation,
    a.workType,
    a.accomplishment,
    a.forDepartment,
    a.system,
    a.timeBeforeMin ?? '',
    a.timeAfterMin ?? '',
    a.timeSavedMin ?? 0,
    a.status,
    a.validationStatus,
    a.createdAt,
  ]);

  // 2. Learning Sheet Data
  const lrnHeaders = [
    'Month',
    'Year',
    'Official ID',
    'Name',
    'Designation',
    'Location',
    'Topic / Course Name',
    'Skill Area',
    'Learning Mode',
    'Institute / Platform',
    'Certification (Yes/No)',
    'Hours Spent',
    'Status',
    'Applied at Work',
    'Application / Outcome',
    'Validation (P)',
  ];

  const lrnRows = learningRecords.map((l) => [
    l.month,
    l.year,
    l.officialId,
    l.memberName,
    l.memberDesignation,
    l.memberLocation,
    l.topic,
    l.skillArea,
    l.learningMode,
    l.institute,
    l.certification,
    l.hoursSpent,
    l.status,
    l.appliedAtWork,
    l.applicationOutcome,
    l.validationStatus,
  ]);

  // 3. Team Roster Sheet Data
  const rosterHeaders = [
    'Official ID',
    'Name',
    'Designation',
    'Location',
    'Department',
    'Email',
    'Role',
  ];

  const rosterRows = teamMembers.map((m) => [
    m.id,
    m.name,
    m.designation,
    m.location,
    m.department,
    m.email,
    m.role,
  ]);

  // 4. Quarterly Summary Data
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'] as const;
  const qSummaryHeaders = [
    'Quarter',
    'Year',
    'Total Accomplishments',
    'Total Time Saved (min)',
    'Total Time Saved (hrs)',
    'Total Learning Hours',
    'Certifications Earned',
    'Active Members',
  ];

  const quarterMonths: Record<string, string[]> = {
    Q1: ['January', 'February', 'March'],
    Q2: ['April', 'May', 'June'],
    Q3: ['July', 'August', 'September'],
    Q4: ['October', 'November', 'December'],
  };

  const qSummaryRows = quarters.map((q) => {
    const qMonths = quarterMonths[q];
    const qAcc = accomplishments.filter((a) => a.year === 2026 && qMonths.includes(a.month));
    const qLrn = learningRecords.filter((l) => l.year === 2026 && qMonths.includes(l.month));

    const totalTimeSaved = qAcc.reduce((sum, a) => sum + (a.timeSavedMin || 0), 0);
    const totalLearningHours = qLrn.reduce((sum, l) => sum + (l.hoursSpent || 0), 0);
    const certs = qLrn.filter((l) => l.certification === 'Yes' && l.status === 'Completed').length;
    const activeMembers = new Set([
      ...qAcc.map((a) => a.officialId),
      ...qLrn.map((l) => l.officialId),
    ]).size;

    return [
      q,
      2026,
      qAcc.length,
      totalTimeSaved,
      (totalTimeSaved / 60).toFixed(1),
      totalLearningHours,
      certs,
      activeMembers,
    ];
  });

  // Batch update values
  const batchData = {
    valueInputOption: 'USER_ENTERED',
    data: [
      {
        range: 'Accomplishments!A1:P' + (accRows.length + 1),
        values: [accHeaders, ...accRows],
      },
      {
        range: 'Learning_Certifications!A1:P' + (lrnRows.length + 1),
        values: [lrnHeaders, ...lrnRows],
      },
      {
        range: 'Team_Roster!A1:G' + (rosterRows.length + 1),
        values: [rosterHeaders, ...rosterRows],
      },
      {
        range: 'Quarterly_Summary!A1:H' + (qSummaryRows.length + 1),
        values: [qSummaryHeaders, ...qSummaryRows],
      },
    ],
  };

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batchData),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Failed to sync data to Google Sheet');
  }

  // Update last synced timestamp
  const now = new Date().toISOString();
  saveGoogleSheetConfig({
    ...config,
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    lastSyncedAt: now,
    isConnected: true,
  });

  return {
    success: true,
    message: `Successfully synchronized ${accomplishments.length} accomplishments and ${learningRecords.length} learning records to Google Sheets!`,
  };
};

/**
 * Append single accomplishment row to Google Sheet
 */
export const appendAccomplishmentToSheet = async (acc: Accomplishment) => {
  const token = await getAccessToken();
  const config = getGoogleSheetConfig();
  if (!token || !config.spreadsheetId) return;

  try {
    const row = [
      acc.month,
      acc.year,
      acc.officialId,
      acc.memberName,
      acc.memberDesignation,
      acc.memberLocation,
      acc.workType,
      acc.accomplishment,
      acc.forDepartment,
      acc.system,
      acc.timeBeforeMin ?? '',
      acc.timeAfterMin ?? '',
      acc.timeSavedMin ?? 0,
      acc.status,
      acc.validationStatus,
      acc.createdAt,
    ];

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/Accomplishments!A1:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [row] }),
      }
    );
  } catch (err) {
    console.warn('Silent append to Google Sheet skipped or failed:', err);
  }
};

/**
 * Append single learning record row to Google Sheet
 */
export const appendLearningToSheet = async (lrn: LearningRecord) => {
  const token = await getAccessToken();
  const config = getGoogleSheetConfig();
  if (!token || !config.spreadsheetId) return;

  try {
    const row = [
      lrn.month,
      lrn.year,
      lrn.officialId,
      lrn.memberName,
      lrn.memberDesignation,
      lrn.memberLocation,
      lrn.topic,
      lrn.skillArea,
      lrn.learningMode,
      lrn.institute,
      lrn.certification,
      lrn.hoursSpent,
      lrn.status,
      lrn.appliedAtWork,
      lrn.applicationOutcome,
      lrn.validationStatus,
    ];

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/Learning_Certifications!A1:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [row] }),
      }
    );
  } catch (err) {
    console.warn('Silent append to Google Sheet skipped or failed:', err);
  }
};
