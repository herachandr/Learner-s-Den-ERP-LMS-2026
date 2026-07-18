import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, ShieldAlert, X, HelpCircle, Sparkles, Edit3, RotateCcw, History, AlertTriangle } from 'lucide-react';
import { AppUser } from '../types';
import { institutionService, DailyRemark } from '../services/institutionService';

interface DailyRemarksStripProps {
  currentUser: AppUser | null;
  currentRole: string;
}

export default function DailyRemarksStrip({ currentUser, currentRole }: DailyRemarksStripProps) {
  const [remarks, setRemarks] = useState<DailyRemark[]>([]);
  const [allRemarks, setAllRemarks] = useState<DailyRemark[]>([]);
  const [newRemarkText, setNewRemarkText] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // History view state
  const [historyRemark, setHistoryRemark] = useState<DailyRemark | null>(null);

  // Delete Confirmation Modal State
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    remarkId: string;
    remarkText: string;
    permanent: boolean;
    reason: string;
  } | null>(null);

  const canEdit = currentRole === 'admin' || currentRole === 'principal';

  // Fetch only active remarks for ticker
  const fetchActiveRemarks = async () => {
    try {
      const data = await institutionService.getRemarks(false);
      setRemarks(data);
    } catch (e) {
      console.error("Failed to fetch active daily remarks:", e);
    }
  };

  // Fetch all remarks (including soft deleted and expired) for manager
  const fetchAllRemarks = async () => {
    try {
      const data = await institutionService.getRemarks(true);
      setAllRemarks(data);
    } catch (e) {
      console.error("Failed to fetch all daily remarks:", e);
    }
  };

  useEffect(() => {
    fetchActiveRemarks();
    // Poll every minute to auto-expire remarks in real-time
    const interval = setInterval(fetchActiveRemarks, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showEditor && canEdit) {
      fetchAllRemarks();
    }
  }, [showEditor, canEdit]);

  const handlePostRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemarkText.trim()) return;
    setIsPosting(true);
    try {
      const authorName = currentUser?.name || currentUser?.email || "Academic Desk";
      await institutionService.createRemark({ 
        text: newRemarkText,
        author: authorName
      });
      setNewRemarkText('');
      await fetchActiveRemarks();
      await fetchAllRemarks();
    } catch (e) {
      console.error("Failed to post remark:", e);
    } finally {
      setIsPosting(false);
    }
  };

  const handleStartEdit = (r: DailyRemark) => {
    setEditingId(r.id);
    setEditingText(r.text);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingText.trim()) return;
    try {
      await institutionService.updateRemark(id, editingText);
      setEditingId(null);
      await fetchActiveRemarks();
      await fetchAllRemarks();
    } catch (e) {
      console.error("Failed to save remark edit:", e);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await institutionService.restoreRemark(id);
      await fetchActiveRemarks();
      await fetchAllRemarks();
    } catch (e) {
      console.error("Failed to restore remark:", e);
    }
  };

  const triggerDeleteConfirm = (r: DailyRemark, permanent: boolean) => {
    setConfirmDelete({
      isOpen: true,
      remarkId: r.id,
      remarkText: r.text,
      permanent,
      reason: 'Outdated Announcement'
    });
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    try {
      await institutionService.deleteRemark(confirmDelete.remarkId, confirmDelete.permanent);
      setConfirmDelete(null);
      await fetchActiveRemarks();
      await fetchAllRemarks();
    } catch (e) {
      console.error("Failed to delete remark:", e);
    }
  };

  return (
    <div className="bg-slate-900 border-y border-slate-800 text-white select-none overflow-hidden animate-fadeIn" id="daily-remarks-strip-root">
      <div className="max-w-7xl mx-auto flex items-center relative h-10">
        {/* Left fixed banner tag */}
        <div className="flex items-center gap-1.5 px-4 bg-indigo-600 h-full font-black text-[10px] uppercase tracking-wider shrink-0 z-20 shadow-lg select-none">
          <Megaphone className="h-3.5 w-3.5 animate-bounce" />
          <span>Daily Remarks</span>
        </div>

        {/* Scrolling text container */}
        <div className="flex-1 overflow-hidden relative h-full flex items-center bg-slate-950">
          {remarks.length === 0 ? (
            <div className="pl-4 text-xxs font-bold text-slate-500 italic select-none">
              No active announcements for today. Normal academic operations are underway.
            </div>
          ) : (
            <div className="whitespace-nowrap flex gap-12 animate-marquee py-2 hover:[animation-play-state:paused] cursor-pointer">
              {/* Output twice for infinite scrolling loop */}
              <div className="flex gap-12 text-xxs font-semibold text-slate-200">
                {remarks.map((r, i) => (
                  <span key={`group1-${r.id}-${i}`} className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></span>
                    <span>{r.text}</span>
                    <span className="text-[9px] text-slate-550 font-medium">
                      ({r.author || "Admin"} • {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  </span>
                ))}
              </div>
              <div className="flex gap-12 text-xxs font-semibold text-slate-200">
                {remarks.map((r, i) => (
                  <span key={`group2-${r.id}-${i}`} className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></span>
                    <span>{r.text}</span>
                    <span className="text-[9px] text-slate-550 font-medium">
                      ({r.author || "Admin"} • {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Admin Controls */}
        {canEdit && (
          <div className="h-full flex items-center bg-slate-900 border-l border-slate-800 z-20 px-2 shrink-0">
            <button
              onClick={() => setShowEditor(!showEditor)}
              className="px-2.5 py-1 text-[10px] font-black uppercase text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
            >
              {showEditor ? "Hide Manager" : "Manage Remarks"}
            </button>
          </div>
        )}
      </div>

      {/* Slide down management panel */}
      {showEditor && canEdit && (
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-left animate-slideDown max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-[10px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Modify Scrolling Daily Remarks (24-Hour Expiration & Full CRUD)</span>
            </h5>
            <button
              onClick={() => setShowEditor(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <form onSubmit={handlePostRemark} className="flex gap-2 mb-4">
            <input
              type="text"
              required
              maxLength={150}
              placeholder="Post a scrolling remark (Max 150 chars). Will automatically expire in 24 hours..."
              value={newRemarkText}
              onChange={(e) => setNewRemarkText(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white placeholder-slate-500 outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isPosting}
              className="px-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black text-white transition-all cursor-pointer shrink-0"
            >
              {isPosting ? 'Posting...' : 'Add Remark'}
            </button>
          </form>

          {allRemarks.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                Historical & Active Remarks Administration Database
              </span>
              {allRemarks.map((r) => {
                const isExpired = Date.now() - new Date(r.createdAt).getTime() >= 24 * 60 * 60 * 1000;
                return (
                  <div 
                    key={`edit-${r.id}`} 
                    className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                      r.deleted 
                        ? 'bg-rose-950/20 border-rose-900/30 text-rose-300/80' 
                        : isExpired 
                        ? 'bg-slate-900/50 border-slate-800/40 text-slate-400' 
                        : 'bg-slate-900 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex-1 space-y-1">
                      {editingId === r.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="flex-1 bg-slate-950 border border-indigo-500 rounded-lg px-2 py-1 text-xs font-semibold text-white"
                          />
                          <button
                            onClick={() => handleSaveEdit(r.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xxs font-bold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-lg text-xxs font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-xs font-bold leading-relaxed">{r.text}</span>
                          <span className="text-[9px] text-slate-500 font-bold mt-1 flex items-center gap-2">
                            <span>Author: {r.author || "Admin"}</span>
                            <span>•</span>
                            <span>Created: {new Date(r.createdAt).toLocaleString()}</span>
                            {r.updatedAt && (
                              <>
                                <span>•</span>
                                <span className="text-indigo-400">Edited: {new Date(r.updatedAt).toLocaleTimeString()}</span>
                              </>
                            )}
                            {r.deleted && (
                              <>
                                <span>•</span>
                                <span className="text-rose-500 uppercase tracking-widest font-black">[Soft Deleted]</span>
                              </>
                            )}
                            {isExpired && !r.deleted && (
                              <>
                                <span>•</span>
                                <span className="text-amber-500 uppercase tracking-widest font-black">[Expired]</span>
                              </>
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                      {/* History button if remark has modifications */}
                      {r.history && r.history.length > 0 && (
                        <button
                          onClick={() => setHistoryRemark(r)}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded-lg transition-all"
                          title="View modifications log"
                        >
                          <History className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Edit option */}
                      {!r.deleted && editingId !== r.id && (
                        <button
                          onClick={() => handleStartEdit(r)}
                          className="p-1.5 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg transition-all"
                          title="Edit remark text"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Restore option if deleted */}
                      {r.deleted ? (
                        <button
                          onClick={() => handleRestore(r.id)}
                          className="px-2.5 py-1 bg-emerald-650/35 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-black uppercase flex items-center gap-1"
                          title="Restore active scroll status"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Restore</span>
                        </button>
                      ) : (
                        /* Soft delete option */
                        <button
                          onClick={() => triggerDeleteConfirm(r, false)}
                          className="p-1.5 hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 rounded-lg transition-all"
                          title="Soft delete (hide from ticker, keep in history)"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Hard permanent delete option */}
                      <button
                        onClick={() => triggerDeleteConfirm(r, true)}
                        className="p-1.5 hover:bg-rose-900 text-slate-600 hover:text-rose-500 rounded-lg transition-all"
                        title="Permanently purge from system records"
                      >
                        <ShieldAlert className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xxs text-slate-500 font-bold italic py-4">No daily remarks found in server history.</p>
          )}
        </div>
      )}

      {/* History Viewer Modal */}
      {historyRemark && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-200 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 text-left shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <History className="h-4 w-4" />
                <span>Modification Audit Log</span>
              </h4>
              <button onClick={() => setHistoryRemark(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <p className="text-xxs font-black uppercase text-slate-500">Current version:</p>
              <p className="text-xs font-bold bg-slate-950 p-2.5 rounded-xl border border-slate-850">{historyRemark.text}</p>
              
              <p className="text-xxs font-black uppercase text-slate-500 pt-2">Historic modifications:</p>
              {historyRemark.history?.map((h, i) => (
                <div key={i} className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850/55 text-xxs space-y-1">
                  <p className="text-slate-300 font-medium leading-relaxed">"{h.text}"</p>
                  <p className="text-[9px] text-slate-500 font-bold">Modified at: {new Date(h.modifiedAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Component */}
      {confirmDelete && confirmDelete.isOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs z-350 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertTriangle className="h-6 w-6" />
              <h4 className="text-xs font-black uppercase tracking-wider">
                Confirm {confirmDelete.permanent ? "Permanent Purge" : "Soft Delete"} Operation
              </h4>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="font-black text-slate-400 uppercase tracking-wider text-[9px] block">Record Category</span>
                <span className="font-bold text-slate-200">Daily Announcement Remark</span>
              </div>
              <div>
                <span className="font-black text-slate-400 uppercase tracking-wider text-[9px] block">Record ID / Name</span>
                <span className="font-mono text-[10px] text-indigo-400">{confirmDelete.remarkId}</span>
              </div>
              <div>
                <span className="font-black text-slate-400 uppercase tracking-wider text-[9px] block">Remark Text</span>
                <span className="font-medium text-slate-300 italic block border-l-2 border-indigo-500 pl-2 mt-1 py-0.5">
                  "{confirmDelete.remarkText}"
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Reason for Deletion</label>
              <select
                value={confirmDelete.reason}
                onChange={(e) => setConfirmDelete(prev => prev ? { ...prev, reason: e.target.value } : null)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:border-indigo-500 outline-none"
              >
                <option value="Outdated Announcement">Outdated Announcement / Expired</option>
                <option value="Typo Correction">Typo Correction / Formatting mismatch</option>
                <option value="Inappropriate Content">Inappropriate Content / Violation of policy</option>
                <option value="System Reset">System-wide Reset / Admin Request</option>
              </select>
            </div>

            <div className="bg-rose-950/15 border border-rose-900/30 p-3 rounded-xl space-y-1">
              <span className="text-[9px] font-black uppercase text-rose-400 tracking-wider flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                <span>Critical System Warning</span>
              </span>
              <p className="text-[10px] text-rose-300/90 font-medium leading-relaxed">
                {confirmDelete.permanent 
                  ? "This action is completely IRREVERSIBLE. This remark will be permanently purged from the cloud servers. This cannot be undone."
                  : "Soft deleting will immediately hide this announcement from the public scrolling ticker, but will preserve its modification history and author logs in the administrator's dashboard database."}
              </p>
            </div>

            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xxs font-black uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xxs font-black uppercase tracking-wider cursor-pointer"
              >
                {confirmDelete.permanent ? "Delete Permanently" : "Soft Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
