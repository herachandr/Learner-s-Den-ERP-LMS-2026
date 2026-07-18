import React, { useState } from 'react';
import { Heart, Star, Sparkles, MessageSquare, Send, Quote, AlertCircle, Calendar, Trash2, Check, X, Users, Eye } from 'lucide-react';
import { AppUser, Testimonial } from '../types';
import { institutionService } from '../services/institutionService';

interface UserTestimonialsProps {
  currentUser: AppUser | null;
  testimonials: Testimonial[];
  onAddTestimonial: (testimonial: Testimonial) => void;
  onUpdateTestimonial?: (testimonial: Testimonial) => void;
  onDeleteTestimonial?: (id: string) => void;
  showToast: (title: string, desc: string) => void;
  isOffline: boolean;
}

export default function UserTestimonials({
  currentUser,
  testimonials,
  onAddTestimonial,
  onUpdateTestimonial,
  onDeleteTestimonial,
  showToast,
  isOffline
}: UserTestimonialsProps) {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [testiRating, setTestiRating] = useState(5);
  const [testiContent, setTestiContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to generate initials avatar for users without a custom DP
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(p => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testiContent.trim()) {
      showToast("Message Required", "Please describe your positive experience at our coaching institute.");
      return;
    }

    if (!currentUser) {
      showToast("Access Restricted", "You must be logged into a registered account to submit a testimonial.");
      return;
    }

    if (isOffline) {
      showToast("Offline Block", "Cannot submit testimonials while running in offline simulation.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await institutionService.createTestimonial({
        authorName: currentUser.name,
        authorRole: currentUser.role === 'student' ? 'Student' : currentUser.role === 'teacher' ? 'Faculty Instructor' : currentUser.role === 'parent' ? 'Parent Monitor' : 'Admissions Officer',
        content: testiContent,
        rating: testiRating,
        avatarUrl: currentUser.avatarUrl || '',
        authorId: currentUser.id
      } as any);

      onAddTestimonial(data as any);
      showToast("Testimonial Published", "Thank you! Your testimonial has been posted and highlighted with your official DP.");
      setTestiContent('');
      setShowSubmitModal(false);
    } catch (e) {
      console.error(e);
      showToast("Sync Error", "Could not synchronize testimonial to secure database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTestimonialSetting = async (id: string, updatedFields: Partial<Testimonial>) => {
    if (isOffline) {
      showToast("Offline Block", "Cannot moderate testimonials while running in offline simulation.");
      return;
    }
    try {
      const data = await institutionService.updateTestimonial(id, updatedFields as any);
      if (onUpdateTestimonial && (data as any).testimonial) {
        onUpdateTestimonial((data as any).testimonial);
        showToast("Settings Updated", "Testimonial settings and display target audience synchronized successfully.");
      }
    } catch (err) {
      console.error(err);
      showToast("Sync Error", "Could not sync testimonial updates to secure database.");
    }
  };

  const handleDeleteTestimonialItem = async (id: string) => {
    if (isOffline) {
      showToast("Offline Block", "Cannot delete testimonials while running in offline simulation.");
      return;
    }
    if (!window.confirm("Are you sure you want to permanently delete this testimonial?")) {
      return;
    }
    try {
      await institutionService.deleteTestimonial(id);
      if (onDeleteTestimonial) {
        onDeleteTestimonial(id);
        showToast("Deleted Permanently", "The testimonial has been deleted from the registry.");
      }
    } catch (err) {
      console.error(err);
      showToast("Sync Error", "Could not delete testimonial from secure database.");
    }
  };

  const filteredTestimonials = (currentUser?.role === 'admin' || currentUser?.role === 'principal')
    ? testimonials
    : testimonials.filter(t => {
        const status = t.status || 'approved';
        if (status !== 'approved') return false;
        
        const audience = t.targetAudience || 'all';
        if (audience === 'all') return true;
        if (audience === 'none') return false;
        
        if (audience === 'students' && currentUser?.role === 'student') return true;
        if (audience === 'teachers' && currentUser?.role === 'teacher') return true;
        if (audience === 'parents' && currentUser?.role === 'parent') return true;
        return false;
      });

  return (
    <div id="user-testimonials-page" className="space-y-8 animate-fadeIn text-left">
      {/* Hero Banner Section */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-800 border border-rose-600 shadow-md shadow-rose-100/10 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="h-3 w-3 animate-pulse text-amber-300" />
              <span>Learner's Den Spotlight</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              <span>Verified Testimonials Board</span>
            </h2>
            <p className="text-xs text-white/90 font-medium leading-relaxed">
              Read real positive feedback from our registered parents, scholars, and elite teachers. These highlight stories of academic breakthroughs, safety biometric tracking satisfaction, and successful college prep!
            </p>
          </div>

          {currentUser && (
            <button
              onClick={() => setShowSubmitModal(!showSubmitModal)}
              className="px-4 py-2 bg-white text-rose-600 hover:bg-slate-50 text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 select-none uppercase cursor-pointer"
            >
              <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
              <span>Share My Testimony</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Form Drawer/Modal Panel if active */}
      {showSubmitModal && currentUser && (
        <div className="bg-slate-50 border border-rose-200/80 rounded-2xl p-5 sm:p-6 animate-slideIn">
          <h3 className="text-sm font-black text-slate-800 mb-1 flex items-center gap-2">
            <Quote className="h-4 w-4 text-rose-500" />
            <span>Share your positive story with the community</span>
          </h3>
          <p className="text-[10px] text-slate-400 mb-4">Your story will be held in moderation and shown to target audiences upon administration review.</p>

          <form onSubmit={handleSubmitTestimonial} className="space-y-4">
            <div className="flex gap-4 items-center">
              <div>
                <span className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Your Rating</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setTestiRating(star)}
                      className="p-1 cursor-pointer hover:scale-110 transition-transform"
                    >
                      <Star className={`h-5.5 w-5.5 ${star <= testiRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* DP Indicator */}
              <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                <div className="w-10 h-10 rounded-full border border-slate-300 overflow-hidden bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    getInitials(currentUser.name)
                  )}
                </div>
                <div>
                  <p className="text-xxs font-black text-slate-700">{currentUser.name}</p>
                  <p className="text-[9px] text-slate-400 font-bold capitalize">Linked Portrait</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">My Positive Feedback Story</label>
              <textarea
                value={testiContent}
                onChange={(e) => setTestiContent(e.target.value)}
                placeholder="What did you love about Learner's Den? Share details about courses, teachers, results, support or administrative tools!"
                rows={3}
                className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:ring-rose-500 focus:border-rose-500 font-medium text-slate-700"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-250 text-slate-600 text-xxs font-black rounded-lg transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xxs font-black rounded-lg transition-all shadow-xxs flex items-center gap-1.5 cursor-pointer uppercase"
              >
                {isSubmitting ? 'Posting...' : 'Submit Testimony'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Testimonial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTestimonials.map((testi) => {
          const currentStatus = testi.status || 'approved';
          const currentAudience = testi.targetAudience || 'all';
          
          return (
            <div
              key={testi.id}
              className={`bg-white border hover:shadow-xs p-6 rounded-3xl flex flex-col justify-between gap-6 transition-all relative overflow-hidden ${
                (currentUser?.role === 'admin' || currentUser?.role === 'principal') 
                  ? currentStatus === 'pending' ? 'border-amber-300 ring-1 ring-amber-250 bg-amber-50/5' :
                    currentStatus === 'rejected' ? 'border-rose-200 bg-rose-50/5' : 'border-slate-200'
                  : 'border-slate-200'
              }`}
            >
              {/* Top decorative elements */}
              <Quote className="absolute top-4 right-4 h-8 w-8 text-slate-100 fill-slate-50/50" />

              <div className="space-y-4">
                {/* Admin/Principal Status Tags */}
                {(currentUser?.role === 'admin' || currentUser?.role === 'principal') && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border ${
                      currentStatus === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      currentStatus === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                    }`}>
                      {currentStatus}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border bg-indigo-50 text-indigo-700 border-indigo-150 flex items-center gap-1">
                      <Users className="h-2 w-2" />
                      <span>Audience: {currentAudience}</span>
                    </span>
                  </div>
                )}

                {/* Star Ratings */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < testi.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Quote Content */}
                <p className="text-xs text-slate-600 leading-relaxed font-semibold italic text-left relative z-10">
                  "{testi.content}"
                </p>
              </div>

              <div className="space-y-3.5 pt-4 border-t border-slate-100 shrink-0">
                {/* Author Profile Block */}
                <div className="flex items-center gap-3">
                  {/* Portrait DP */}
                  <div className="w-10 h-10 rounded-full border border-slate-250 bg-indigo-50 flex items-center justify-center overflow-hidden font-black text-indigo-700 text-xs shrink-0 shadow-xxs">
                    {testi.avatarUrl ? (
                      <img
                        src={testi.avatarUrl}
                        alt={testi.authorName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      getInitials(testi.authorName)
                    )}
                  </div>
                  <div className="text-left truncate">
                    <h4 className="text-xs font-black text-slate-800 truncate">{testi.authorName}</h4>
                    <p className="text-[10px] font-bold text-slate-400 truncate capitalize">{testi.authorRole}</p>
                  </div>
                </div>

                {/* Admin/Principal moderation controls block */}
                {(currentUser?.role === 'admin' || currentUser?.role === 'principal') ? (
                  <div className="p-2.5 bg-slate-50 rounded-xl space-y-2 border border-slate-150 text-[10px]">
                    <div className="flex items-center justify-between gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Moderation Controls</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 shrink-0">Target:</span>
                      <select
                        value={currentAudience}
                        onChange={(e) => handleUpdateTestimonialSetting(testi.id, { targetAudience: e.target.value as any })}
                        className="flex-1 bg-white border border-slate-200 rounded-lg py-1 px-1.5 text-slate-700 font-bold focus:outline-hidden"
                      >
                        <option value="all">Everyone</option>
                        <option value="student">Students</option>
                        <option value="teacher">Teachers</option>
                        <option value="parent">Parents</option>
                        <option value="none">Hide completely</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => handleUpdateTestimonialSetting(testi.id, { status: 'approved' })}
                        disabled={currentStatus === 'approved'}
                        className={`py-1 px-1.5 rounded-lg font-bold flex items-center justify-center gap-1 border cursor-pointer transition-all ${
                          currentStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 opacity-60 cursor-default'
                            : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200 hover:text-emerald-700 hover:border-emerald-300'
                        }`}
                      >
                        <Check className="h-3 w-3" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => handleUpdateTestimonialSetting(testi.id, { status: 'rejected' })}
                        disabled={currentStatus === 'rejected'}
                        className={`py-1 px-1.5 rounded-lg font-bold flex items-center justify-center gap-1 border cursor-pointer transition-all ${
                          currentStatus === 'rejected'
                            ? 'bg-rose-100 text-rose-800 border-rose-200 opacity-60 cursor-default'
                            : 'bg-white hover:bg-rose-50 text-slate-700 border-slate-200 hover:text-rose-700 hover:border-rose-300'
                        }`}
                      >
                        <X className="h-3 w-3" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleDeleteTestimonialItem(testi.id)}
                        className="py-1 px-1.5 bg-white hover:bg-slate-100 text-rose-600 hover:text-rose-700 border border-slate-200 hover:border-rose-300 rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer"
                        title="Delete permanently"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  currentUser && (testi.authorId === currentUser.id || testi.authorName === currentUser.name) && (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-150 text-[10px] flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-500">My Testimony</span>
                      <button
                        onClick={() => handleDeleteTestimonialItem(testi.id)}
                        className="py-1 px-2.5 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 hover:border-rose-300 rounded-lg font-black flex items-center justify-center gap-1 cursor-pointer transition-all"
                        title="Delete permanently"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
