import React, { useState, useRef } from 'react';
import { 
  Image as ImageIcon, Grid, Layers, Sparkles, Filter, 
  Clock, Heart, Eye, ArrowUpRight, Trophy, Award, Calendar,
  Plus, Trash2, X, UploadCloud, Check, ShieldAlert
} from 'lucide-react';
import { AppUser, GalleryItem, UserRole } from '../types';
import { institutionService } from '../services/institutionService';

interface InstitutionGalleryProps {
  currentUser: AppUser | null;
  currentRole?: UserRole;
  galleryItems: GalleryItem[];
  onAddGalleryItem: (item: GalleryItem) => void;
  onDeleteGalleryItem: (itemId: string) => void;
  showToast: (title: string, desc: string) => void;
  isOffline: boolean;
}

const PRESET_IMAGES = [
  { label: 'Outdoor Camp & Trekking', url: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=600' },
  { label: 'Science Fair Lab', url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=600' },
  { label: 'Graduation Ceremony', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600' },
  { label: 'Classroom Sandbox Study', url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=600' },
  { label: 'Nature Excursion waterfalls', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=600' },
  { label: 'Sports & Athletics Cup', url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600' },
];

export default function InstitutionGallery({
  currentUser,
  currentRole,
  galleryItems,
  onAddGalleryItem,
  onDeleteGalleryItem,
  showToast,
  isOffline
}: InstitutionGalleryProps) {
  const activeRole = currentRole || currentUser?.role || 'guest';
  const isAdmin = activeRole === 'admin';

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'activities' | 'winners'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'activities' | 'winners'>('activities');
  const [date, setDate] = useState('');
  const [desc, setDesc] = useState('');
  const [imgUrl, setImgUrl] = useState(PRESET_IMAGES[0].url);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'all', label: 'All Showcase' },
    { id: 'activities', label: 'Co-curricular & Outings' },
    { id: 'winners', label: 'Awards & Felicitations' }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Invalid File Type", "Please choose a professional event image (.jpg, .png, .jpeg).");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showToast("File Too Large", "Image size must be under 3MB to optimize storage load speeds.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImgUrl(base64);
      showToast("Photo Loaded", "Your custom campus snapshot has been converted successfully!");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !date.trim() || !desc.trim() || !imgUrl.trim()) {
      showToast("Fields Missing", "Please complete all fields and attach a photo before posting.");
      return;
    }

    if (isOffline) {
      showToast("Offline Protected", "Cannot submit new gallery items while in simulated offline sandbox mode.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newItem = await institutionService.createGalleryItem({
        title,
        category,
        date,
        description: desc,
        url: imgUrl
      } as any);

      onAddGalleryItem(newItem as any);
      showToast("Gallery Asset Saved", `"${title}" has been successfully appended to the academic milestones board.`);
      // Reset form
      setTitle('');
      setCategory('activities');
      setDate('');
      setDesc('');
      setImgUrl(PRESET_IMAGES[0].url);
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      showToast("Sync Error", "Failed to upload the gallery asset to the server database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId: string, itemTitle: string) => {
    if (isOffline) {
      showToast("Offline Protected", "Cannot remove items while running in offline simulation mode.");
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete "${itemTitle}" from the public gallery showcase?`)) {
      return;
    }

    try {
      await institutionService.deleteGalleryItem(itemId);
      onDeleteGalleryItem(itemId);
      showToast("Item Deleted", `"${itemTitle}" was permanently removed from the archive.`);
    } catch (err) {
      console.error(err);
      showToast("Deletion Failed", "Failed to delete this item from the cloud.");
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedCategory);

  return (
    <div id="institution-gallery-panel" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xxs text-slate-800 space-y-6 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 border border-indigo-150 rounded-full text-indigo-700 text-[10px] font-bold tracking-wider uppercase">
            <Sparkles className="h-3 w-3 text-indigo-500" />
            <span>Interactive Archive ({galleryItems.length} items)</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1.5 tracking-tight flex items-center gap-2">
            <span>Life & Milestones at Learner's Den</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Capturing co-curricular excursions, winter camps, and official academic excellence achievements.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Admin action to post item */}
          {isAdmin && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5 select-none uppercase cursor-pointer"
            >
              {showAddForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              <span>{showAddForm ? 'Close Editor' : 'Add Media'}</span>
            </button>
          )}

          {/* Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl shrink-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Add Form Panel */}
      {showAddForm && isAdmin && (
        <div className="bg-slate-50/50 border border-indigo-100 rounded-2xl p-5 sm:p-6 animate-slideIn text-left space-y-5">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-indigo-600" />
              <span>Broadcast New Milestones Photo</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Post co-curricular snapshots and merit boards immediately visible to all students, parents, and colleagues.</p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xxs font-black text-slate-500 uppercase tracking-wider mb-1">Activity Title / Honour Heading</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Picnic at Leimaram Water Fall"
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xxs font-black text-slate-500 uppercase tracking-wider mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-bold"
                    >
                      <option value="activities">⛺ Excursion / Activity</option>
                      <option value="winners">🏆 Topper Reward</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xxs font-black text-slate-500 uppercase tracking-wider mb-1">Date Display</label>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="e.g. 5th July 2026"
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xxs font-black text-slate-500 uppercase tracking-wider mb-1">Description / Event Narrative</label>
                  <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Enter short, captivating details about the excursion or details about students rewarded..."
                    rows={3}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              {/* Image selection / Upload sector */}
              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <label className="block text-xxs font-black text-slate-500 uppercase tracking-wider mb-1">Visual Preview & Selection</label>
                  
                  {/* Aspect Ratio Preview box */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                    {imgUrl ? (
                      <img src={imgUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold">No Image Attached</span>
                    )}
                  </div>
                </div>

                {/* Preset motifs */}
                <div>
                  <span className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Or choose a preset school motif:</span>
                  <div className="flex flex-wrap gap-1">
                    {PRESET_IMAGES.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setImgUrl(preset.url)}
                        className={`text-xxxxs font-bold px-2 py-1 rounded bg-slate-100 border transition-all cursor-pointer ${
                          imgUrl === preset.url ? 'bg-indigo-50 text-indigo-700 border-indigo-300' : 'text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                        title={preset.label}
                      >
                        {preset.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drag and Drop Upload */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-3 text-center transition-all cursor-pointer ${
                    dragActive
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-250 hover:border-indigo-400 hover:bg-white'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <UploadCloud className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-[10px] font-black text-slate-700">Drag & Drop photo, or browse file</p>
                  <p className="text-xxxxs text-slate-400 font-bold mt-0.5">JPEG, PNG, WebP format. Max 3MB.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-250 text-slate-600 text-xxs font-black rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xxs font-black rounded-lg cursor-pointer uppercase shadow-xxs"
              >
                {isSubmitting ? 'Syncing...' : 'Add Milestone'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of gallery assets */}
      {filteredItems.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30 flex flex-col items-center justify-center">
          <ImageIcon className="h-10 w-10 text-slate-300 mb-2" />
          <p className="text-xs text-slate-500 font-black">No gallery media logged in this category yet.</p>
          <p className="text-[10px] text-slate-400 mt-0.5 mb-4">When administrators upload new excursions, they will appear here dynamically.</p>
          {isAdmin && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xxs font-black rounded-xl transition-all cursor-pointer shadow-3xs uppercase tracking-wider"
            >
              + Create First Album Milestone
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-sm hover:border-indigo-200 transition-all duration-300 relative"
            >
              {/* Visual Frame */}
              <div 
                className="relative aspect-video w-full overflow-hidden bg-slate-50 border-b border-slate-100 cursor-zoom-in"
                onClick={() => setLightboxItem(item)}
              >
                <img 
                  src={item.img} 
                  alt={item.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <span className="absolute left-3 top-3 px-2 py-0.5 bg-slate-900/80 border border-white/10 text-white font-extrabold text-[8px] uppercase tracking-wider rounded-md backdrop-blur-xs">
                  {item.category === 'activities' ? 'Excursion Trip' : 'Felicitation Reward'}
                </span>

                {/* Hover zoom cue */}
                <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="p-1.5 rounded-full bg-white/90 shadow-xxs text-indigo-600 text-xxxxs font-black tracking-widest uppercase">
                    Zoom Image
                  </span>
                </div>
              </div>

              {/* Admin delete trigger overlay */}
              {isAdmin && (
                <button
                  onClick={() => handleDeleteItem(item.id, item.title)}
                  className="absolute right-3 top-3 p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-xxs cursor-pointer"
                  title="Remove photo milestone"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Detailed Metadata Card */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-indigo-600 uppercase">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>{item.date}</span>
                  </div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center justify-between gap-1 mt-0.5">
                    <span>{item.title}</span>
                    <ArrowUpRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1 text-left">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-bold">
                  <span className="flex items-center gap-1 uppercase tracking-wider">
                    {item.category === 'activities' ? (
                      <>
                        <Clock className="h-3.5 w-3.5 text-slate-300" />
                        <span>Co-Curricular</span>
                      </>
                    ) : (
                      <>
                        <Trophy className="h-3.5 w-3.5 text-indigo-500" />
                        <span className="text-indigo-600 font-black">Merit Topper</span>
                      </>
                    )}
                  </span>
                  <span className="text-slate-400">Learner's Den, Manipur</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIGHTBOX / ZOOM DISPLAY */}
      {lightboxItem && (
        <div 
          className="fixed inset-0 z-100 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setLightboxItem(null)}
        >
          <div 
            className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full border border-slate-800 shadow-2xl relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close handle */}
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute right-4 top-4 p-2 bg-slate-900/60 text-white rounded-full hover:bg-slate-900 transition-all cursor-pointer z-10"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative aspect-video bg-slate-900">
              <img 
                src={lightboxItem.img} 
                alt={lightboxItem.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute left-4 bottom-4 px-2.5 py-1 bg-indigo-600 border border-indigo-500 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-md">
                {lightboxItem.category === 'activities' ? 'Excursion activity' : 'Academic Topper'}
              </span>
            </div>

            <div className="p-6 space-y-3">
              <div className="flex items-center gap-1.5 text-xxs font-black text-indigo-600 uppercase">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>{lightboxItem.date}</span>
              </div>
              <h3 className="text-base font-black text-slate-900 leading-tight">{lightboxItem.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">{lightboxItem.desc}</p>
              
              <div className="pt-4 border-t border-slate-100 text-xxxxs text-slate-400 font-bold uppercase tracking-widest text-right">
                Learner's Den Archive • Manipur
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
