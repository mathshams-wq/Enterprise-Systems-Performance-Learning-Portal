import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Copy,
  Link,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { GoogleSheetsConfig, TeamMember } from '../types';
import {
  googleSignIn,
  googleSignOut,
  initializeOrCreateSpreadsheet,
  syncAllDataToGoogleSheet,
} from '../services/googleSheetsService';

interface GoogleSheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheetsConfig: GoogleSheetsConfig;
  onConfigUpdated: (config: GoogleSheetsConfig) => void;
  currentUser: TeamMember | null;
}

export const GoogleSheetSyncModal: React.FC<GoogleSheetSyncModalProps> = ({
  isOpen,
  onClose,
  sheetsConfig,
  onConfigUpdated,
  currentUser,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);

      // Sign in with Google
      await googleSignIn();

      // Initialize or create spreadsheet
      const newConfig = await initializeOrCreateSpreadsheet();
      onConfigUpdated(newConfig);
      setSuccessMsg('Successfully connected and synchronized Google Sheet database!');
    } catch (err: any) {
      setError(err.message || 'Failed to connect Google Sheets.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);

      const res = await syncAllDataToGoogleSheet();
      setSuccessMsg(res.message);
    } catch (err: any) {
      setError(err.message || 'Sync failed. Reconnecting may be required.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (sheetsConfig.spreadsheetUrl) {
      navigator.clipboard.writeText(sheetsConfig.spreadsheetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Google Sheets Backend Database
              </h3>
              <p className="text-xs text-slate-400">
                Official Central Storage & Live Sync for 19 Team Members
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

          {/* Connection Status Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">Database Status</span>
              </div>
              {sheetsConfig.isConnected ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active & Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <AlertCircle className="w-3.5 h-3.5" /> Not Connected Yet
                </span>
              )}
            </div>

            {sheetsConfig.isConnected && sheetsConfig.spreadsheetId ? (
              <div className="space-y-2 pt-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">SPREADSHEET TITLE</span>
                  <span className="font-semibold text-slate-100">{sheetsConfig.title}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">GOOGLE ACCOUNT</span>
                  <span className="text-slate-200 font-mono text-[11px]">
                    {sheetsConfig.connectedAccountEmail || 'shams.uddin@dbl-digital.com'}
                  </span>
                </div>

                {sheetsConfig.lastSyncedAt && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">LAST SYNCHRONIZED</span>
                    <span className="text-slate-300">
                      {new Date(sheetsConfig.lastSyncedAt).toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap gap-2">
                  <a
                    href={sheetsConfig.spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Google Sheets</span>
                  </a>

                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5 text-sky-400" />
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Connect your official Google account (e.g. <strong className="text-sky-300">shams.uddin@dbl-digital.com</strong>). The app will automatically initialize a structured Google Sheet with 4 synchronized tabs:
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-200 font-medium block">1. Accomplishments</span>
                    Impact, Time Before/After, Saved min
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-200 font-medium block">2. Learning_Certifications</span>
                    Topics, Skill Area, Hours, Certs
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-200 font-medium block">3. Team_Roster</span>
                    19 Team Members, Designation, Location
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-200 font-medium block">4. Quarterly_Summary</span>
                    Q1 - Q4 Aggregated Progress & KPIs
                  </div>
                </div>

                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{loading ? 'Connecting Google Sheets...' : 'Connect Official Google Account'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Sync & Share Guidance */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>How Team Access Works</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              When you share this web app link, all <strong>19 team members</strong> can open the app on mobile or desktop and log in using their <strong>Official ID and password</strong>. Submissions write to local storage and sync to your Google Sheet database.
            </p>
          </div>

          {/* Action buttons if connected */}
          {sheetsConfig.isConnected && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleManualSync}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Synchronizing...' : 'Re-sync All Records Now'}</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
