import React, { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, FileText, Link as LinkIcon, Trash2, Plus, Calendar, AlertCircle, X, ChevronRight, Speaker } from 'lucide-react';
import { AppUser } from '../types';
import { institutionService } from '../services/institutionService';

interface Highlight {
  id: string;
  title: string;
  content: string;
  type: 'image' | 'pdf' | 'text' | 'hyperlink';
  mediaUrl?: string;
  hyperlink?: string;
  createdAt: string;
}

interface HighlightBoardProps {
  currentUser: AppUser | null;
  currentRole: string;
}

export default function HighlightBoard({ currentUser, currentRole }: HighlightBoardProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'image' | 'pdf' | 'text' | 'hyperlink'>('text');
  const [mediaUrl, setMediaUrl] = useState('');
  const [hyperlink, setHyperlink] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canEdit = currentRole === 'admin' || currentRole === 'principal';

  const fetchHighlights = async () => {
    try {
      const data = await institutionService.getHighlights();
      setHighlights(data as any);
    } catch (e) {
      console.error("Failed to fetch highlights:", e);
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, []);

  const handleAddHighlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError("Please provide a title");
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await institutionService.createHighlight({ title, content, type, mediaUrl, hyperlink } as any);
      await fetchHighlights();
      setShowAddModal(false);
      setTitle('');
      setContent('');
      setType('text');
      setMediaUrl('');
      setHyperlink('');
    } catch (e: any) {
      setError(e.message || "Failed to create highlight");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHighlight = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this highlight?")) return;
    try {
      await institutionService.deleteHighlight(id);
      setHighlights(prev => prev.filter(h => h.id !== id));
    } catch (e) {
      console.error("Failed to delete highlight:", e);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-indigo-500/20 relative overflow-hidden" id="highlight-board-root">
      {/* Background ambient glows */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/15 rounded-xl border border-indigo-400/25">
            <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
          </div>
          <div className="text-left">
            <h3 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              <span>Institution Highlights & Board</span>
              <span className="text-[9px] bg-indigo-500/35 border border-indigo-400/30 text-indigo-300 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Live</span>
            </h3>
            <p className="text-[10px] text-indigo-200/70 font-semibold">Promotions, Announcements & Daily Spotlights</p>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-xs font-black rounded-xl transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Post Bulletin</span>
          </button>
        )}
      </div>

      {highlights.length === 0 ? (
        <div className="py-8 text-center text-indigo-200/50 flex flex-col items-center justify-center gap-2 border border-dashed border-indigo-500/15 rounded-2xl bg-white/5 backdrop-blur-xs">
          <Speaker className="h-8 w-8 text-indigo-400/40" />
          <p className="text-xs font-bold">No announcements posted on the board yet</p>
          {canEdit && <p className="text-[10px] text-indigo-200/40">Click 'Post Bulletin' to share notices, photos or external links</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {highlights.map((h) => (
            <div
              key={h.id}
              className="group relative bg-white/5 border border-white/10 hover:border-indigo-500/30 rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.08] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <span className="text-[9px] font-black tracking-wider uppercase bg-white/10 text-indigo-200 border border-white/10 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                    {h.type === 'image' && <ImageIcon className="h-3 w-3" />}
                    {h.type === 'pdf' && <FileText className="h-3 w-3" />}
                    {h.type === 'hyperlink' && <LinkIcon className="h-3 w-3" />}
                    {h.type === 'text' && <FileText className="h-3 w-3" />}
                    <span>{h.type}</span>
                  </span>

                  {canEdit && (
                    <button
                      onClick={() => handleDeleteHighlight(h.id)}
                      className="text-white/40 hover:text-rose-400 p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                      title="Delete notice"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <h4 className="font-extrabold text-xs text-white leading-snug mb-1 group-hover:text-indigo-300 transition-colors text-left">{h.title}</h4>
                <p className="text-[11px] text-indigo-200/80 leading-relaxed text-left mb-3.5">{h.content}</p>
              </div>

              <div>
                {/* Media preview/action block */}
                {h.type === 'image' && h.mediaUrl && (
                  <div className="mb-3 rounded-xl overflow-hidden border border-white/10 max-h-24">
                    <img referrerPolicy="no-referrer" src={h.mediaUrl} alt={h.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}

                {h.type === 'pdf' && h.mediaUrl && (
                  <a
                    href={h.mediaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-indigo-300 transition-colors mb-3"
                  >
                    <span className="truncate">Download Attachment (PDF)</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </a>
                )}

                {h.type === 'hyperlink' && h.hyperlink && (
                  <a
                    href={h.hyperlink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/25 text-[10px] font-bold text-indigo-300 transition-colors mb-3"
                  >
                    <span className="truncate">Visit Official Link</span>
                    <LinkIcon className="h-3 w-3 shrink-0" />
                  </a>
                )}

                <div className="flex items-center gap-1.5 text-[9px] text-white/40 font-bold mt-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(h.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Highlight Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <h4 className="font-extrabold text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span>Post Bulletin Highlight</span>
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddHighlight} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 font-bold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Bulletin Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Sports Day 2026 Scheduled!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Description/Content</label>
                <textarea
                  placeholder="Provide important details of the highlight..."
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white placeholder-slate-500 outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Notice Type</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['text', 'image', 'pdf', 'hyperlink'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`py-1.5 rounded-xl border text-[10px] font-bold capitalize transition-all ${
                        type === t
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {type === 'image' && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or Base64"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {type === 'pdf' && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">PDF Attachment URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/syllabus.pdf"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {type === 'hyperlink' && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Target Hyperlink</label>
                  <input
                    type="url"
                    placeholder="https://admission.institute.edu"
                    value={hyperlink}
                    onChange={(e) => setHyperlink(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-black text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-98 disabled:opacity-50 rounded-xl text-xs font-black text-white transition-all cursor-pointer"
                >
                  {isLoading ? 'Posting...' : 'Post Bulletin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
