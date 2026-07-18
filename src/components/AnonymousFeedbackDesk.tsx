import React, { useState, useEffect } from 'react';
import { MessageSquare, Check, ShieldAlert, Trash2, Send, HelpCircle, Shield, FileText, Camera, AlertTriangle, X, Users, Eye } from 'lucide-react';
import { AppUser, AnonymousFeedback } from '../types';
import { institutionService } from '../services/institutionService';
import { authService } from '../services/authService';

interface AnonymousFeedbackDeskProps {
  currentUser: AppUser | null;
  feedbackList: AnonymousFeedback[];
  onAddFeedback: (feedback: AnonymousFeedback) => void;
  onUpdateFeedback?: (updated: AnonymousFeedback) => void;
  onDeleteFeedback?: (id: string) => void;
  usersList: AppUser[];
  onRefreshUsers: () => void;
  showToast: (title: string, desc: string) => void;
  isOffline: boolean;
}

export default function AnonymousFeedbackDesk({
  currentUser,
  feedbackList,
  onAddFeedback,
  onUpdateFeedback,
  onDeleteFeedback,
  usersList,
  onRefreshUsers,
  showToast,
  isOffline
}: AnonymousFeedbackDeskProps) {
  const [activeSubTab, setActiveSubTab] = useState<'submit' | 'public-board' | 'admin-box' | 'admin-moderation'>(
    currentUser?.role === 'admin' ? 'admin-box' : 'submit'
  );

  // Submission Form State
  const [fbType, setFbType] = useState<'feedback' | 'suggestion' | 'complaint'>('feedback');
  const [fbCategory, setFbCategory] = useState('Academics');
  const [fbTitle, setFbTitle] = useState('');
  const [fbContent, setFbContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Admin moderation state
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Obscene or inappropriate passport photo.');

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbTitle.trim() || !fbContent.trim()) {
      showToast("Fields Required", "Please enter a summary title and complete details for your anonymous submission.");
      return;
    }

    if (isOffline) {
      showToast("Offline Block", "Cannot submit anonymous messages while running in offline simulation mode.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await institutionService.createAnonymousFeedback({
        type: fbType,
        category: fbCategory,
        title: fbTitle,
        content: fbContent
      } as any);

      onAddFeedback(data as any);
      showToast("Anonymous Submission Received", "Your message was encrypted and logged anonymously. Thank you for your feedback.");
      setFbTitle('');
      setFbContent('');
    } catch (err) {
      console.error(err);
      showToast("Submission Failed", "Could not synchronize with anonymous server repository.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectPhoto = async (userId: string) => {
    if (isOffline) {
      showToast("Offline Block", "Cannot moderate user profile photos while running offline.");
      return;
    }

    try {
      await authService.rejectPassportPhoto(userId, rejectionReason);
      showToast("Photo Rejected & Removed", "Obscene photo removed. User account flagged and photo status set to rejected.");
      setRejectingUserId(null);
      setRejectionReason('Obscene or inappropriate passport photo.');
      onRefreshUsers(); // Refresh parent user array
    } catch (e) {
      console.error(e);
      showToast("Action Failed", "Could not sync moderation details to cloud.");
    }
  };

  const handleUpdateFeedbackSetting = async (id: string, updatedFields: Partial<AnonymousFeedback>) => {
    if (isOffline) {
      showToast("Offline Block", "Cannot moderate feedback while running offline.");
      return;
    }
    try {
      const data = await institutionService.updateAnonymousFeedback(id, updatedFields as any);
      if (onUpdateFeedback && (data as any).feedback) {
        onUpdateFeedback((data as any).feedback);
        showToast("Feedback Moderated", "Display status and target audience saved successfully.");
      } else if (onUpdateFeedback && data) {
        // Handle direct object response if there's no nested feedback key
        onUpdateFeedback(data as any);
        showToast("Feedback Moderated", "Display status and target audience saved successfully.");
      }
    } catch (err) {
      console.error(err);
      showToast("Sync Error", "Could not send moderation settings to server.");
    }
  };

  const handleDeleteFeedbackItem = async (id: string) => {
    if (isOffline) {
      showToast("Offline Block", "Cannot delete feedback while running offline.");
      return;
    }
    if (!window.confirm("Are you sure you want to permanently delete this feedback?")) {
      return;
    }
    try {
      await institutionService.deleteAnonymousFeedback(id);
      if (onDeleteFeedback) {
        onDeleteFeedback(id);
        showToast("Feedback Deleted", "The anonymous feedback was permanently deleted.");
      }
    } catch (err) {
      console.error(err);
      showToast("Sync Error", "Could not delete feedback from server.");
    }
  };

  // Filter users who have uploaded portraits
  const usersWithPhotos = usersList.filter(u => u.avatarUrl && u.avatarUrl.trim().length > 0);

  return (
    <div id="anonymous-feedback-and-moderation-desk" className="space-y-6 animate-fadeIn">
      {/* Tab Navigation header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 border border-slate-200/80 p-1.5 rounded-2xl">
        <div className="flex flex-wrap gap-1">
          {currentUser?.role !== 'admin' && (
            <>
              <button
                onClick={() => setActiveSubTab('submit')}
                className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  activeSubTab === 'submit'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Send className="h-3.5 w-3.5 inline mr-1.5" />
                <span>Submit Anonymous Concern</span>
              </button>
              <button
                onClick={() => setActiveSubTab('public-board')}
                className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  activeSubTab === 'public-board'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Eye className="h-3.5 w-3.5 inline mr-1.5" />
                <span>Public Concerns Board</span>
              </button>
            </>
          )}
          {currentUser?.role === 'admin' && (
            <>
              <button
                onClick={() => setActiveSubTab('admin-box')}
                className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  activeSubTab === 'admin-box'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5 inline mr-1.5" />
                <span>Anonymous Feedback Box ({feedbackList.length})</span>
              </button>
              <button
                onClick={() => setActiveSubTab('admin-moderation')}
                className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  activeSubTab === 'admin-moderation'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Camera className="h-3.5 w-3.5 inline mr-1.5" />
                <span>Passport DP Moderation ({usersWithPhotos.length})</span>
              </button>
            </>
          )}
        </div>
        <div className="text-[10px] text-slate-400 font-mono font-bold px-3 py-1 bg-white border border-slate-200 rounded-xl">
          🔒 Encrypted SSL Tunnel
        </div>
      </div>

      {/* SUBMISSION FORM VIEW */}
      {activeSubTab === 'submit' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-left space-y-6">
          <div className="space-y-1.5 border-b border-slate-100 pb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-[10px] font-black uppercase tracking-wider">
              <Shield className="h-3 w-3" />
              <span>Absolute Privacy Guarantee</span>
            </span>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Anonymous Feedback, Suggestions & Complaints</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We care about your experience and safety at Learner's Den. This desk uses cryptographic tokenization to route your message to administration without linking your username, email, ID, or IP address. Submit freely!
            </p>
          </div>

          <form onSubmit={handleFeedbackSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xxs font-black text-slate-500 uppercase tracking-wider mb-1.5">Type of Submission</label>
                <select
                  value={fbType}
                  onChange={(e) => setFbType(e.target.value as any)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-bold"
                >
                  <option value="feedback">✨ Positive Feedback / Kudos</option>
                  <option value="suggestion">💡 Construction Suggestion</option>
                  <option value="complaint">⚠️ Grievance / Complaint / Incident</option>
                </select>
              </div>

              <div>
                <label className="block text-xxs font-black text-slate-500 uppercase tracking-wider mb-1.5">Relevant Department / Category</label>
                <select
                  value={fbCategory}
                  onChange={(e) => setFbCategory(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-bold"
                >
                  <option value="Academics">Academics & Faculty Instruction</option>
                  <option value="Infrastructure">Infrastructure, Lab & Campus Facilities</option>
                  <option value="ERP System">ERP software, LMS Study Desk or Portal bugs</option>
                  <option value="Staff Behavior">Coaching staff & Administration demeanor</option>
                  <option value="Hostel & Food">Hostel Accommodation & Canteen hygiene</option>
                  <option value="Other">Other Miscellaneous Items</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xxs font-black text-slate-500 uppercase tracking-wider mb-1.5">Subject Summary</label>
              <input
                type="text"
                value={fbTitle}
                onChange={(e) => setFbTitle(e.target.value)}
                placeholder="e.g. Broken microscope in biology lab #2 or suggestions on physics timetable spacing..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-bold text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xxs font-black text-slate-500 uppercase tracking-wider mb-1.5">Detailed Content</label>
              <textarea
                value={fbContent}
                onChange={(e) => setFbContent(e.target.value)}
                placeholder="Describe your suggestion, kudo, or complaint in thorough detail. Please avoid names of users if you prefer absolute safety, though the system is cryptographically anonymized regardless."
                rows={5}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-medium text-slate-700 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full p-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black tracking-widest rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer uppercase"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Encrypting Message...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Anonymously</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ADMIN INBOX VIEW */}
      {activeSubTab === 'admin-box' && currentUser?.role === 'admin' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 text-left space-y-6">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <MessageSquare className="h-4.5 w-4.5 text-indigo-600" />
              <span>Cryptographically Encrypted Anonymous Inbox</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">These incoming student & staff messages have been decoupled from user profiles to secure their privacy and encourage genuine reporting.</p>
          </div>

          {feedbackList.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
              <HelpCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-black">No feedback logged in the anonymous desk yet.</p>
              <p className="text-[10px] text-slate-400 mt-0.5">When users log suggestions or complaints, they will show up securely here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbackList.map((feedback) => (
                <div key={feedback.id} className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-3 relative overflow-hidden">
                  {/* Decorative Left Border based on Type */}
                  <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                    feedback.type === 'complaint' ? 'bg-rose-500' : feedback.type === 'suggestion' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />

                  <div className="flex items-center justify-between gap-3 pl-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        feedback.type === 'complaint' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        feedback.type === 'suggestion' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {feedback.type}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{feedback.category}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono font-bold">
                      {new Date(feedback.createdAt).toLocaleDateString()} at {new Date(feedback.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="pl-2.5 space-y-1">
                    <h4 className="text-xs font-black text-slate-800">{feedback.title}</h4>
                    <p className="text-xxs text-slate-600 leading-relaxed font-semibold">{feedback.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADMIN PHOTO MODERATION VIEW */}
      {activeSubTab === 'admin-moderation' && currentUser?.role === 'admin' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 text-left space-y-6">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <Camera className="h-4.5 w-4.5 text-indigo-600" />
              <span>Official Passport DP Moderation Desk</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Audit student, teacher, and employee identity cards. Reject and immediately remove any obscene, inappropriate, or blurred photos.</p>
          </div>

          {usersWithPhotos.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
              <Camera className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-black">No official portraits uploaded for review.</p>
              <p className="text-[10px] text-slate-400 mt-0.5">When registered users upload photos in their passport booths, they appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {usersWithPhotos.map((user) => (
                <div key={user.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col items-center justify-between gap-4 text-center relative group">
                  <span className="absolute top-3 left-3 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-150 text-indigo-700">
                    {user.role}
                  </span>

                  {/* Passport Preview */}
                  <div className="w-24 h-30 bg-slate-200 border border-slate-350 rounded-xl overflow-hidden shadow-xxs">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="space-y-0.5 w-full">
                    <p className="text-xs font-black text-slate-800 truncate">{user.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 truncate">{user.email}</p>
                  </div>

                  {rejectingUserId === user.id ? (
                    <div className="w-full space-y-2 pt-2 border-t border-slate-200 animate-fadeIn">
                      <p className="text-[9px] font-black uppercase text-rose-700 text-left">Specify Rejection Reason</p>
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Inappropriate/Obscene portrait"
                        className="w-full text-xxxxs font-bold p-1.5 border border-slate-250 bg-white rounded-lg text-slate-700"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleRejectPhoto(user.id)}
                          className="flex-1 py-1 px-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[8px] font-black rounded-md cursor-pointer"
                        >
                          Confirm Removal
                        </button>
                        <button
                          onClick={() => setRejectingUserId(null)}
                          className="py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-500 text-[8px] font-black rounded-md cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full pt-2 border-t border-slate-200 flex gap-2">
                      <button
                        onClick={() => setRejectingUserId(user.id)}
                        className="flex-1 py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-black rounded-xl border border-rose-200 flex items-center justify-center gap-1 cursor-pointer transition-all uppercase tracking-wide"
                        title="Flag photo as obscene/inappropriate and delete immediately."
                      >
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        <span>Reject & Remove if obscene</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
