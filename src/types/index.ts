export type UserRole = 'admin' | 'user' | 'viewer' | 'member';

export interface TeamMember {
  id: string; // Official ID e.g. "15103001"
  name: string;
  designation: string;
  location: string;
  department: string;
  email: string;
  role: UserRole;
  password?: string;
  avatarUrl?: string;
}

export type MonthName =
  | 'January'
  | 'February'
  | 'March'
  | 'April'
  | 'May'
  | 'June'
  | 'July'
  | 'August'
  | 'September'
  | 'October'
  | 'November'
  | 'December';

export type QuarterName = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export type AccomplishmentStatus = 'Completed' | 'In Progress' | 'On Hold' | 'Not Started';

export type LearningStatus = 'Completed' | 'In Progress' | 'On Hold' | 'Planned';

export interface Accomplishment {
  id: string;
  officialId: string;
  memberName: string;
  memberDesignation: string;
  memberLocation: string;
  month: MonthName;
  year: number;
  workType: string;
  accomplishment: string; // One clear sentence
  forDepartment: string;
  system: string;
  timeBeforeMin?: number;
  timeAfterMin?: number;
  timeSavedMin?: number;
  status: AccomplishmentStatus;
  validationStatus: 'OK' | 'Incomplete';
  createdAt: string;
  syncedToGoogleSheet?: boolean;
}

export interface LearningRecord {
  id: string;
  officialId: string;
  memberName: string;
  memberDesignation: string;
  memberLocation: string;
  month: MonthName;
  year: number;
  topic: string;
  skillArea: string;
  learningMode: string;
  institute: string;
  certification: 'Yes' | 'No';
  hoursSpent: number;
  status: LearningStatus;
  appliedAtWork: 'Yes' | 'Not yet';
  applicationOutcome: string;
  validationStatus: 'OK' | 'Incomplete';
  createdAt: string;
  syncedToGoogleSheet?: boolean;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  lastSyncedAt?: string;
  connectedAccountEmail?: string;
  isConnected: boolean;
}

export interface MonthlySubmissionStatus {
  member: TeamMember;
  accomplishmentsCount: number;
  learningCount: number;
  hoursSpent: number;
  timeSavedMin: number;
  submitted: boolean;
  lastUpdated?: string;
}
