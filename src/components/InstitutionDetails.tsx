import React, { useState, useEffect, useRef } from 'react';
import { 
  Building, BookOpen, Users, Award, MapPin, Phone, Mail, Clock, 
  Compass, ChevronRight, ShieldCheck, Star, Trophy, GraduationCap,
  Calendar, CreditCard, ClipboardCheck, Sparkles, Percent, Info,
  Edit2, Save, X, Globe, HelpCircle, UploadCloud, Link2, Heart, 
  Trash2, Check, RefreshCw, Eye, Undo, Play, Video, Plus, 
  Image as ImageIcon, Send, MessageSquare, Quote, ArrowUp, ArrowDown,
  Facebook, Instagram, Youtube, Linkedin, Twitter, Send as TelegramIcon,
  Shield, CheckSquare, AlertTriangle, MessageCircle, Pin
} from 'lucide-react';
import { AppUser, InstitutionProfile, GalleryItem, Testimonial, UserRole } from '../types';

interface InstitutionDetailsProps {
  currentUser: AppUser | null;
  currentRole?: UserRole;
  profile: InstitutionProfile | null;
  onUpdateProfile: (updatedFields: Partial<InstitutionProfile>) => Promise<void>;
  isOffline: boolean;
  
  // Gallery props
  galleryItems: GalleryItem[];
  onAddGalleryItem: (item: GalleryItem) => void;
  onDeleteGalleryItem: (itemId: string) => void;

  // Testimonial props
  testimonials: Testimonial[];
  onAddTestimonial: (item: Testimonial) => void;
  onUpdateTestimonial: (item: Testimonial) => void;
  onDeleteTestimonial: (id: string) => void;
}

export default function InstitutionDetails({
  currentUser,
  currentRole,
  profile,
  onUpdateProfile,
  isOffline,
  galleryItems,
  onAddGalleryItem,
  onDeleteGalleryItem,
  testimonials,
  onAddTestimonial,
  onUpdateTestimonial,
  onDeleteTestimonial
}: InstitutionDetailsProps) {
  const activeRole = currentRole || currentUser?.role || 'guest';
  const isAdmin = activeRole === 'admin';
  const isTeacher = activeRole === 'teacher';
  const isStudent = activeRole === 'student';
  const isParent = activeRole === 'parent';

  // Notification Toast Helper
  const [toast, setToast] = useState<{ title: string; desc: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const showToastMsg = (title: string, desc: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ title, desc, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Local Form / Draft State (Only used when Admin is managing)
  const [draft, setDraft] = useState<InstitutionProfile>({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    coachingCentreName: '',
    motto: '',
    tagline: '',
    aboutUs: '',
    vision: '',
    mission: '',
    directorMessage: '',
    chairmanMessage: '',
    history: '',
    logoUrl: '',
    faviconUrl: '',
    bannerUrl: '',
    additionalBanners: [],
    backgroundImages: [],
    city: '',
    state: '',
    country: '',
    pinCode: '',
    mobileNumbers: '',
    whatsAppNumber: '',
    website: '',
    googleMapsLocation: '',
    officeTimings: '',
    workingDays: '',
    admissionOfficeTimings: '',
    holidayTimings: '',
    academicSession: '',
    admissionStartDate: '',
    admissionEndDate: '',
    classTimings: '',
    batchTimings: '',
    examinationSchedule: '',
    vacationDetails: '',
    facebook: '',
    instagram: '',
    youtube: '',
    linkedin: '',
    twitter: '',
    telegram: '',
    registrationNumber: '',
    affiliationDetails: '',
    recognitionDetails: '',
    accreditationInfo: '',
    gstNumber: '',
    welcomeMessage: '',
    homepageBannerText: '',
    announcementTitle: '',
    announcementText: '',
    announcementActive: false,
    announcementDate: '',
    featuredCourses: [],
    highlights: [],
    successStats: [],
    achievements: [],
    partnerLogos: [],
    upcomingEvents: []
  });

  // Active Management Tab (Admin view) vs Active Details Tab (Non-admin view)
  const [managementTab, setManagementTab] = useState<
    'basic' | 'branding' | 'contact' | 'office' | 'academic' | 'social' | 'legal' | 'gallery' | 'testimonials' | 'homepage'
  >('basic');
  
  const [detailsTab, setDetailsTab] = useState<'about' | 'contact' | 'academic' | 'legal' | 'gallery' | 'testimonials' | 'showcase'>('about');
  
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize draft with current profile values
  useEffect(() => {
    if (profile) {
      setDraft({
        name: profile.name || '',
        description: profile.description || '',
        address: profile.address || '',
        phone: profile.phone || '',
        email: profile.email || '',
        coachingCentreName: profile.coachingCentreName || '',
        motto: profile.motto || '',
        tagline: profile.tagline || '',
        aboutUs: profile.aboutUs || '',
        vision: profile.vision || '',
        mission: profile.mission || '',
        directorMessage: profile.directorMessage || '',
        chairmanMessage: profile.chairmanMessage || '',
        history: profile.history || '',
        logoUrl: profile.logoUrl || '',
        faviconUrl: profile.faviconUrl || '',
        bannerUrl: profile.bannerUrl || '',
        additionalBanners: profile.additionalBanners || [],
        backgroundImages: profile.backgroundImages || [],
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || '',
        pinCode: profile.pinCode || '',
        mobileNumbers: profile.mobileNumbers || '',
        whatsAppNumber: profile.whatsAppNumber || '',
        website: profile.website || '',
        googleMapsLocation: profile.googleMapsLocation || '',
        officeTimings: profile.officeTimings || '',
        workingDays: profile.workingDays || '',
        admissionOfficeTimings: profile.admissionOfficeTimings || '',
        holidayTimings: profile.holidayTimings || '',
        academicSession: profile.academicSession || '',
        admissionStartDate: profile.admissionStartDate || '',
        admissionEndDate: profile.admissionEndDate || '',
        classTimings: profile.classTimings || '',
        batchTimings: profile.batchTimings || '',
        examinationSchedule: profile.examinationSchedule || '',
        vacationDetails: profile.vacationDetails || '',
        facebook: profile.facebook || '',
        instagram: profile.instagram || '',
        youtube: profile.youtube || '',
        linkedin: profile.linkedin || '',
        twitter: profile.twitter || '',
        telegram: profile.telegram || '',
        registrationNumber: profile.registrationNumber || '',
        affiliationDetails: profile.affiliationDetails || '',
        recognitionDetails: profile.recognitionDetails || '',
        accreditationInfo: profile.accreditationInfo || '',
        gstNumber: profile.gstNumber || '',
        welcomeMessage: profile.welcomeMessage || '',
        homepageBannerText: profile.homepageBannerText || '',
        announcementTitle: profile.announcementTitle || '',
        announcementText: profile.announcementText || '',
        announcementActive: profile.announcementActive || false,
        announcementDate: profile.announcementDate || '',
        featuredCourses: profile.featuredCourses || [],
        highlights: profile.highlights || [],
        successStats: profile.successStats || [],
        achievements: profile.achievements || [],
        partnerLogos: profile.partnerLogos || [],
        upcomingEvents: profile.upcomingEvents || []
      });
    }
  }, [profile]);

  // Handle Input Changes & flag modified
  const handleChange = (field: keyof InstitutionProfile, value: any) => {
    setDraft(prev => ({ ...prev, [field]: value }));
    setIsModified(true);
  };

  // Add item to generic array fields (e.g. highlights, featuredCourses, achievements)
  const handleAddToArray = (field: 'highlights' | 'featuredCourses' | 'achievements', value: string) => {
    if (!value.trim()) return;
    const currentArray = draft[field] || [];
    handleChange(field, [...currentArray, value.trim()]);
  };

  // Remove item from generic array fields
  const handleRemoveFromArray = (field: 'highlights' | 'featuredCourses' | 'achievements', index: number) => {
    const currentArray = draft[field] || [];
    handleChange(field, currentArray.filter((_, i) => i !== index));
  };

  // Save changes to database (Publish)
  const handlePublish = async () => {
    if (isOffline) {
      showToastMsg("Simulation Restriction", "Cannot write changes to the cloud database while running in Offline Sandbox Mode.", "warning");
      return;
    }

    // Form Validation Checks
    if (!draft.name.trim()) {
      showToastMsg("Validation Failure", "Institution Name is a mandatory field.", "warning");
      return;
    }
    if (!draft.address.trim()) {
      showToastMsg("Validation Failure", "Office Address is required.", "warning");
      return;
    }
    if (!draft.email.trim() || !draft.email.includes('@')) {
      showToastMsg("Validation Failure", "Please supply a valid administrative email address.", "warning");
      return;
    }

    setIsSaving(true);
    try {
      await onUpdateProfile(draft);
      setIsModified(false);
      showToastMsg("Settings Synchronized", "All updates have been successfully written to the system database and published globally.", "success");
    } catch (err) {
      console.error(err);
      showToastMsg("Database Error", "Failed to update institution profile information on the server.", "warning");
    } finally {
      setIsSaving(false);
    }
  };

  // Save changes locally (Save Draft)
  const handleSaveDraft = () => {
    // We can persist draft state in localStorage to mock "Save Draft" or let it live in the React state.
    try {
      window.localStorage.setItem('institution_profile_draft', JSON.stringify(draft));
      setIsModified(true);
      showToastMsg("Draft Stashed", "Your institutional updates have been saved to local draft storage. Remember to Publish to make them public.", "success");
    } catch (err) {
      showToastMsg("Stash Failure", "Could not save local draft state.", "warning");
    }
  };

  // Reset Draft changes back to Published state
  const handleReset = () => {
    if (!window.confirm("Are you sure you want to discard your unsaved draft edits and reset to the live published profile?")) {
      return;
    }
    if (profile) {
      setDraft({ ...profile });
      setIsModified(false);
      showToastMsg("Draft Reset", "Reverted all input fields to the current live database standards.", "info");
    }
  };

  // Cancel Changes
  const handleCancel = () => {
    if (isModified && !window.confirm("You have unsaved modifications. Discard changes and close?")) {
      return;
    }
    setIsModified(false);
    showToastMsg("Action Cancelled", "Exited management context.", "info");
  };

  // Drag-and-drop simulated file upload for Branding Assets
  const [dragActiveField, setDragActiveField] = useState<string | null>(null);
  const fileInputRefs = {
    logoUrl: useRef<HTMLInputElement>(null),
    faviconUrl: useRef<HTMLInputElement>(null),
    bannerUrl: useRef<HTMLInputElement>(null)
  };

  // Robust upload state manager
  const [uploadStates, setUploadStates] = useState<Record<string, {
    progress: number;
    status: 'idle' | 'validating' | 'uploading' | 'retrying' | 'success' | 'failed' | 'cancelled';
    error?: string;
    attempt: number;
    cancelFn?: () => void;
  }>>({});

  const handleDrag = (e: React.DragEvent, field: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveField(field);
    } else if (e.type === "dragleave") {
      setDragActiveField(null);
    }
  };

  const processUploadedFile = (file: File, field: keyof InstitutionProfile) => {
    // 1. Pre-flight Validation checks
    if (!file.type.startsWith("image/")) {
      showToastMsg("Invalid Format", "Only image files (.png, .jpg, .svg, .webp) are supported.", "warning");
      return;
    }

    if (field === 'faviconUrl') {
      if (file.size > 100 * 1024) {
        showToastMsg("Validation Failure", "Favicon mark must remain under 100KB for rapid client loading.", "warning");
        return;
      }
      // Read aspect ratio before uploading
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        if (img.width !== img.height) {
          showToastMsg("Validation Failure", "Favicon must be exactly 1:1 aspect ratio square.", "warning");
          setUploadStates(prev => ({
            ...prev,
            [field]: { progress: 0, status: 'failed', error: 'Favicon must be exactly 1:1 aspect ratio square.', attempt: 1 }
          }));
        } else {
          startManagedUpload(file, field);
        }
      };
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToastMsg("Asset Too Massive", "Branding file must remain under 2MB to ensure light client-side bundle weight.", "warning");
      return;
    }

    startManagedUpload(file, field);
  };

  const startManagedUpload = (file: File, field: keyof InstitutionProfile) => {
    let currentAttempt = 1;
    let timerId: any = null;

    const performUploadWithRetry = (attemptNum: number) => {
      // Setup clean cancel trigger
      const handleCancelUpload = () => {
        if (timerId) clearInterval(timerId);
        setUploadStates(prev => ({
          ...prev,
          [field]: { progress: 0, status: 'cancelled', attempt: attemptNum }
        }));
        showToastMsg("Upload Cancelled", `Branding asset upload for ${String(field)} aborted.`, "info");
      };

      setUploadStates(prev => ({
        ...prev,
        [field]: {
          progress: 0,
          status: attemptNum > 1 ? 'retrying' : 'uploading',
          attempt: attemptNum,
          cancelFn: handleCancelUpload
        }
      }));

      let currentProgress = 0;
      const reader = new FileReader();

      reader.onload = (e) => {
        const base64 = e.target?.result as string;

        timerId = setInterval(() => {
          // Increment progress by fractional amounts
          currentProgress += Math.random() * 8 + 4;
          
          // Simulate transient network errors at 60% on first attempt to demonstrate auto-retry resilience
          if (currentProgress >= 60 && attemptNum === 1) {
            clearInterval(timerId);
            setUploadStates(prev => ({
              ...prev,
              [field]: { ...prev[field], status: 'failed', error: 'Simulated transient connection reset error.' }
            }));
            
            if (currentAttempt < 3) {
              const backoffMs = 1000 * Math.pow(2, currentAttempt);
              currentAttempt++;
              showToastMsg("Transient Disruption", `Connection error. Retrying upload in ${(backoffMs/1000).toFixed(1)}s (Attempt ${currentAttempt}/3)...`, "warning");
              setTimeout(() => {
                performUploadWithRetry(currentAttempt);
              }, backoffMs);
            } else {
              showToastMsg("Upload Failure", `All 3 upload attempts failed for ${String(field)}.`, "warning");
            }
            return;
          }

          if (currentProgress >= 100) {
            clearInterval(timerId);
            setUploadStates(prev => ({
              ...prev,
              [field]: { progress: 100, status: 'success', attempt: attemptNum }
            }));
            handleChange(field, base64);
            setIsModified(true);
            showToastMsg("Asset Uploaded", `Successfully parsed and loaded ${String(field)} preview.`, "success");
          } else {
            setUploadStates(prev => ({
              ...prev,
              [field]: { ...prev[field], progress: Number(currentProgress.toFixed(1)) }
            }));
          }
        }, 100);
      };

      reader.readAsDataURL(file);
    };

    performUploadWithRetry(currentAttempt);
  };

  const renderUploadProgressOverlay = (field: string) => {
    const state = uploadStates[field];
    if (!state || ['idle', 'success', 'cancelled'].includes(state.status)) return null;

    return (
      <div 
        className="absolute inset-0 bg-slate-950/90 text-white rounded-xl p-4 flex flex-col justify-center items-center z-10 space-y-2.5 animate-fadeIn"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <div className="flex justify-between items-center w-full max-w-[180px]">
          <span className="text-[8px] font-bold text-indigo-300 uppercase tracking-widest">
            {state.status === 'retrying' ? `Retrying (${state.attempt}/3)` : 'Uploading'}
          </span>
          <button 
            type="button"
            onClick={() => state.cancelFn?.()}
            className="text-slate-400 hover:text-white p-1 text-[8px] bg-white/10 rounded-full hover:bg-white/20 transition-all cursor-pointer h-4 w-4 flex items-center justify-center font-bold"
            title="Cancel upload"
          >
            ✕
          </button>
        </div>
        
        <div className="text-sm font-black tracking-tight text-white">{state.progress}%</div>
        
        <div className="w-full max-w-[180px] h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-100" 
            style={{ width: `${state.progress}%` }}
          />
        </div>

        {state.error && (
          <span className="text-[7px] text-red-400 text-center px-1 line-clamp-1 font-semibold">{state.error}</span>
        )}
      </div>
    );
  };

  const handleDrop = (e: React.DragEvent, field: keyof InstitutionProfile) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveField(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0], field);
    }
  };

  // Custom visual markdown rich text assistant
  const [richTextFocus, setRichTextFocus] = useState<string | null>(null);
  const richTextRefs = {
    aboutUs: useRef<HTMLTextAreaElement>(null),
    history: useRef<HTMLTextAreaElement>(null),
    directorMessage: useRef<HTMLTextAreaElement>(null)
  };

  const insertMarkdownHelper = (field: keyof InstitutionProfile, wrapper: string, placeholder = 'text') => {
    const ref = richTextRefs[field as keyof typeof richTextRefs];
    if (!ref || !ref.current) return;
    const el = ref.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const oldText = String(draft[field] || '');
    const selected = oldText.substring(start, end) || placeholder;
    const replacement = wrapper.replace('$', selected);
    const newText = oldText.substring(0, start) + replacement + oldText.substring(end);
    
    handleChange(field, newText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  };

  // ----------------- Integrated Gallery Management -----------------
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryCategory, setGalleryCategory] = useState<'activities' | 'winners'>('activities');
  const [galleryDate, setGalleryDate] = useState('');
  const [galleryDesc, setGalleryDesc] = useState('');
  const [galleryImg, setGalleryImg] = useState('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600');
  const [galleryUploadActive, setGalleryUploadActive] = useState(false);

  const handleCreateGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryTitle.trim() || !galleryDate.trim() || !galleryDesc.trim()) {
      showToastMsg("Validation Failure", "Title, Date, and Description are required gallery fields.", "warning");
      return;
    }
    if (isOffline) {
      showToastMsg("Simulation Protected", "New media assets cannot be added while running in simulated offline mode.", "warning");
      return;
    }

    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || '',
          'x-user-id': currentUser?.id || ''
        },
        body: JSON.stringify({
          title: galleryTitle,
          category: galleryCategory,
          date: galleryDate,
          desc: galleryDesc,
          img: galleryImg
        })
      });

      if (response.ok) {
        const newItem = await response.json();
        onAddGalleryItem(newItem);
        showToastMsg("Gallery Asset Loaded", `"${galleryTitle}" was saved and published onto the public milestones board.`, "success");
        setGalleryTitle('');
        setGalleryDate('');
        setGalleryDesc('');
        setGalleryUploadActive(false);
      } else {
        throw new Error("Server rejected gallery payload");
      }
    } catch (err) {
      console.error(err);
      showToastMsg("Sync Failure", "Could not commit the gallery item to the server database.", "warning");
    }
  };

  const handleDeleteGallery = async (id: string, title: string) => {
    if (isOffline) {
      showToastMsg("Offline Blocked", "Cannot modify resources in offline simulation.", "warning");
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete "${title}" from the campus milestone gallery?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': currentUser?.role || '',
          'x-user-id': currentUser?.id || ''
        }
      });

      if (response.ok) {
        onDeleteGalleryItem(id);
        showToastMsg("Media Removed", `"${title}" has been permanently purged.`, "success");
      } else {
        throw new Error();
      }
    } catch (err) {
      showToastMsg("Purge Failure", "Failed to remove item from the cloud.", "warning");
    }
  };

  // ----------------- Integrated Testimonial Management -----------------
  const handleModerateTestimonial = async (id: string, status: 'pending' | 'approved' | 'rejected', pinned = false) => {
    if (isOffline) {
      showToastMsg("Offline Blocked", "Testimonial modifications are restricted during offline sandbox mode.", "warning");
      return;
    }

    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || '',
          'x-user-id': currentUser?.id || ''
        },
        body: JSON.stringify({ status, pinned })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.testimonial) {
          onUpdateTestimonial(data.testimonial);
          showToastMsg("Testimonial Updated", `Story is now flagged as ${status.toUpperCase()}${pinned ? ' & Pinned' : ''}.`, "success");
        }
      } else {
        throw new Error();
      }
    } catch (err) {
      showToastMsg("Sync Error", "Could not write testimonial modifications to database.", "warning");
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (isOffline) {
      showToastMsg("Offline Blocked", "purging elements is restricted in simulated offline mode.", "warning");
      return;
    }
    if (!window.confirm("Are you sure you want to permanently delete this testimony item? This action is irreversible.")) {
      return;
    }

    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': currentUser?.role || '',
          'x-user-id': currentUser?.id || ''
        }
      });

      if (response.ok) {
        onDeleteTestimonial(id);
        showToastMsg("Testimonial Purged", "The testimony record has been wiped from the database.", "success");
      } else {
        throw new Error();
      }
    } catch (err) {
      showToastMsg("Sync Error", "Could not execute testimonial database deletion.", "warning");
    }
  };

  // ----------------- Homepage Content Arrays Helpers -----------------
  const [newCourseInput, setNewCourseInput] = useState('');
  const [newHighlightInput, setNewHighlightInput] = useState('');
  const [newAchievementInput, setNewAchievementInput] = useState('');
  const [statLabel, setStatLabel] = useState('');
  const [statValue, setStatValue] = useState('');
  
  const handleAddStat = () => {
    if (!statLabel.trim() || !statValue.trim()) return;
    const current = draft.successStats || [];
    handleChange('successStats', [...current, { label: statLabel.trim(), value: statValue.trim() }]);
    setStatLabel('');
    setStatValue('');
  };

  const handleRemoveStat = (index: number) => {
    const current = draft.successStats || [];
    handleChange('successStats', current.filter((_, i) => i !== index));
  };

  // Parse custom styled text simulation (converts basic markdown wrapper tags to styled JSX)
  const renderRichText = (txt: string) => {
    if (!txt) return null;
    return txt.split('\n').map((line, idx) => {
      // Bold pattern **text**
      let formatted = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      const italicRegex = /\*(.*?)\*/g;
      
      // Simple parse
      const elements: React.ReactNode[] = [];
      let lastIndex = 0;
      
      formatted = formatted.replace(boldRegex, '<b>$1</b>');
      formatted = formatted.replace(italicRegex, '<i>$1</i>');
      
      return (
        <p key={idx} className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold mb-2.5" dangerouslySetInnerHTML={{ __html: formatted }} />
      );
    });
  };

  // Fetch verified list of approved testimonials
  const verifiedTestimonials = testimonials.filter(t => t.status === 'approved');
  // Sort testimonials so pinned ones are first
  const sortedApprovedTestimonials = [...verifiedTestimonials].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  return (
    <div id="institution-management-root" className="relative space-y-6">
      
      {/* Dynamic Floating Toast Alerts */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-100 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border border-slate-200/60 animate-bounceIn ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800' :
          toast.type === 'warning' ? 'bg-rose-50 text-rose-800' : 'bg-indigo-50 text-indigo-800'
        }`}>
          {toast.type === 'success' ? <CheckSquare className="h-5 w-5 text-emerald-600 shrink-0" /> :
           toast.type === 'warning' ? <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" /> :
           <Info className="h-5 w-5 text-indigo-600 shrink-0" />}
          <div>
            <p className="text-xs font-black leading-tight">{toast.title}</p>
            <p className="text-[10px] font-bold opacity-90 mt-0.5">{toast.desc}</p>
          </div>
        </div>
      )}

      {/* Admin Panel Floating Master Action Bar */}
      {isAdmin && (
        <div className="sticky top-16 z-30 w-full bg-white/95 border border-slate-200/80 shadow-md backdrop-blur-md rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 animate-slideDown">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-center text-indigo-600">
              <Shield className="h-5 w-5" />
            </div>
            <div className="text-left">
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>Institution Management Hub</span>
                <span className={`h-2 w-2 rounded-full ${isModified ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              </h2>
              <p className="text-[10px] text-slate-400 font-bold">
                {isModified ? "You have unsaved changes in your active draft" : "All fields synchronized with live database"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* Live Preview Toggle Button */}
            <button
              onClick={() => setIsPreviewActive(!isPreviewActive)}
              className={`px-3.5 py-1.5 rounded-xl text-xxs font-black transition-all flex items-center gap-1.5 cursor-pointer border select-none ${
                isPreviewActive 
                  ? 'bg-rose-600 text-white border-rose-500 hover:bg-rose-700' 
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="Review live appearance before publishing terms"
            >
              {isPreviewActive ? <Undo className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              <span>{isPreviewActive ? "Exit Live Preview" : "Preview Live"}</span>
            </button>

            <span className="text-slate-200 hidden sm:inline">|</span>

            {/* Cancel Action */}
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200 text-xxs font-black rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>

            {/* Reset Action */}
            <button
              onClick={handleReset}
              disabled={!isModified}
              className={`px-3 py-1.5 border text-xxs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                isModified 
                  ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' 
                  : 'bg-slate-50/50 border-slate-150 text-slate-400 cursor-default'
              }`}
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset Draft</span>
            </button>

            {/* Save Draft Action */}
            <button
              onClick={handleSaveDraft}
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xxs font-black rounded-xl transition-all cursor-pointer"
            >
              Save Draft
            </button>

            {/* Publish Action */}
            <button
              onClick={handlePublish}
              disabled={isSaving}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xxs font-black rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer uppercase"
            >
              {isSaving ? "Publishing..." : "Publish Changes"}
            </button>
          </div>
        </div>
      )}

      {/* RENDER LIVE PREVIEW OVERLAY IF ACTIVE */}
      {isPreviewActive && isAdmin ? (
        <div className="bg-slate-50 border border-indigo-200 rounded-3xl p-6 sm:p-8 space-y-8 animate-fadeIn text-left">
          <div className="border-b border-indigo-100 pb-4 flex items-center justify-between">
            <div>
              <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 border border-rose-150 rounded-full text-[9px] font-black tracking-widest uppercase animate-pulse">
                Interactive live preview mode
              </span>
              <h3 className="text-sm font-black text-slate-800 mt-1">Reviewing: {draft.name || "UNNAMED INSTITUTE"}</h3>
            </div>
            <button
              onClick={() => setIsPreviewActive(false)}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-250 text-slate-700 text-xxs font-black rounded-xl cursor-pointer"
            >
              Close Preview
            </button>
          </div>

          {/* Banner */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-950 to-slate-900 p-6 sm:p-10 text-white space-y-4 shadow-sm">
            {draft.bannerUrl && (
              <img 
                src={draft.bannerUrl} 
                alt="Banner" 
                className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none" 
                referrerPolicy="no-referrer"
              />
            )}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                {draft.logoUrl && (
                  <img src={draft.logoUrl} alt="Logo" className="h-10 w-10 object-contain rounded-md" referrerPolicy="no-referrer" />
                )}
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase leading-none">{draft.name || "Learner's Den"}</h2>
                  <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider mt-1">{draft.tagline || "Empowering Scholars"}</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 font-medium max-w-2xl leading-relaxed">{draft.description || "No description loaded."}</p>
              {draft.motto && (
                <p className="text-xxxxs font-bold text-amber-400 uppercase tracking-widest italic">Motto: "{draft.motto}"</p>
              )}
            </div>
          </div>

          {/* Grid details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2 space-y-6">
              {/* About */}
              <div className="bg-white border border-slate-200/85 p-5 rounded-2xl space-y-2">
                <h4 className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                  <span>About our Institution</span>
                </h4>
                {renderRichText(draft.aboutUs || "No information updated yet.")}
              </div>

              {/* Mission / Vision */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200/85 p-5 rounded-2xl space-y-2">
                  <h4 className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                    <Trophy className="h-4 w-4 text-indigo-600" />
                    <span>Our Strategic Vision</span>
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">{draft.vision || "Vision not updated."}</p>
                </div>
                <div className="bg-white border border-slate-200/85 p-5 rounded-2xl space-y-2">
                  <h4 className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                    <Award className="h-4 w-4 text-indigo-600" />
                    <span>Our Core Mission</span>
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">{draft.mission || "Mission not updated."}</p>
                </div>
              </div>

              {/* Messages */}
              {draft.directorMessage && (
                <div className="bg-white border border-slate-200/85 p-5 rounded-2xl space-y-2">
                  <h4 className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                    <Users className="h-4 w-4 text-indigo-600" />
                    <span>Principal / Director's Desk Message</span>
                  </h4>
                  {renderRichText(draft.directorMessage)}
                </div>
              )}
            </div>

            {/* Contact sidebar preview */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200/85 p-5 rounded-2xl space-y-4">
                <h4 className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <Phone className="h-4 w-4 text-indigo-600" />
                  <span>Contact Card</span>
                </h4>
                
                <div className="space-y-3.5 text-xs text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <div>
                      <p className="font-black text-slate-700">Campus Address</p>
                      <p className="text-slate-500 leading-normal mt-0.5 font-medium">{draft.address}, {draft.city}, {draft.state} - {draft.pinCode}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Phone className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <div>
                      <p className="font-black text-slate-700">Landline / Phones</p>
                      <p className="text-slate-500 mt-0.5 font-medium">{draft.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Mail className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <div>
                      <p className="font-black text-slate-700">Admissions Email</p>
                      <p className="text-slate-500 mt-0.5 font-medium">{draft.email}</p>
                    </div>
                  </div>
                  {draft.whatsAppNumber && (
                    <div className="flex items-start gap-2.5">
                      <MessageCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                      <div>
                        <p className="font-black text-slate-700">WhatsApp Help</p>
                        <p className="text-slate-500 mt-0.5 font-medium">{draft.whatsAppNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Office hours preview */}
              <div className="bg-white border border-slate-200/85 p-5 rounded-2xl space-y-3">
                <h4 className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  <span>Office Office timings</span>
                </h4>
                <div className="text-xs text-slate-600 space-y-1.5 font-semibold">
                  <p className="flex justify-between"><span>Office hours:</span> <span className="text-slate-950">{draft.officeTimings || "6:00 AM - 6:00 PM"}</span></p>
                  <p className="flex justify-between"><span>Working Days:</span> <span className="text-slate-950">{draft.workingDays || "Monday - Saturday"}</span></p>
                  <p className="flex justify-between"><span>Admissions:</span> <span className="text-slate-950">{draft.admissionOfficeTimings || "8:00 AM - 4:00 PM"}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : isAdmin ? (
        
        // =========================================================================
        // ADMINISTRATOR SYSTEM - INSTITUTION CONFIGURATION CONTROL PANEL
        // =========================================================================
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xxs text-slate-800 space-y-6 text-left animate-fadeIn">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 border border-indigo-150 rounded-full text-indigo-700 text-[10px] font-bold tracking-wider uppercase">
              <Shield className="h-3 w-3 text-indigo-500" />
              <span>Full ERP Admin Powers</span>
            </span>
            <h1 className="text-xl font-black text-slate-900 mt-1.5 tracking-tight">Institution Configuration Terminal</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Control all branding parameters, academic schedules, admissions guidelines, homepage metrics, and galleries.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Tab selection menu rail */}
            <div className="col-span-1 flex flex-row lg:flex-col flex-wrap gap-1 bg-slate-50 border border-slate-200 p-2 rounded-2xl shrink-0">
              {[
                { id: 'basic', label: '1. Basic Info', icon: Building },
                { id: 'branding', label: '2. Branding Visuals', icon: ImageIcon },
                { id: 'contact', label: '3. Contacts & Location', icon: MapPin },
                { id: 'office', label: '4. Office Schedules', icon: Clock },
                { id: 'academic', label: '5. Academic Terms', icon: Calendar },
                { id: 'social', label: '6. Social Platforms', icon: Globe },
                { id: 'legal', label: '7. Legal Registry', icon: ShieldCheck },
                { id: 'gallery', label: '8. Gallery Assets', icon: Trophy },
                { id: 'testimonials', label: '9. Testimonials Mod', icon: Heart },
                { id: 'homepage', label: '10. Homepage Content', icon: Sparkles }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = managementTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setManagementTab(tab.id as any)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xxs font-black transition-all w-full text-left cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Settings Panel */}
            <div className="col-span-1 lg:col-span-3 border border-slate-200 bg-slate-50/20 p-5 sm:p-6 rounded-2xl space-y-5">
              
              {/* TAB 1: BASIC INFO */}
              {managementTab === 'basic' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b pb-2.5">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Institution Identity & Profile Texts</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Edit core texts representing the coaching center on certificates, portals, and brochures.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Corporate Institution Name (Caps)</label>
                      <input
                        type="text"
                        value={draft.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-indigo-500 font-bold"
                        placeholder="e.g. LEARNER'S DEN COACHING CENTER"
                      />
                    </div>

                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Coaching Center Alternate Name</label>
                      <input
                        type="text"
                        value={draft.coachingCentreName}
                        onChange={(e) => handleChange('coachingCentreName', e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-indigo-500 font-bold"
                        placeholder="e.g. Learner's Den"
                      />
                    </div>

                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Motto Slogan</label>
                      <input
                        type="text"
                        value={draft.motto}
                        onChange={(e) => handleChange('motto', e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-indigo-500 font-bold"
                        placeholder="e.g. Strive for academic excellence"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Tagline Pitch</label>
                      <input
                        type="text"
                        value={draft.tagline}
                        onChange={(e) => handleChange('tagline', e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-indigo-500 font-bold"
                        placeholder="e.g. Empowering next-generation scholars"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Institution Summary Description</label>
                      <textarea
                        value={draft.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        rows={2}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-indigo-500 font-medium"
                        placeholder="Brief corporate summary shown on default cards..."
                      />
                    </div>

                    {/* Rich text descriptions with visual helper buttons */}
                    <div className="col-span-1 sm:col-span-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider">About Us / Detailed Background (Rich Text)</label>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => insertMarkdownHelper('aboutUs', '**$**')} className="text-[9px] font-black px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded hover:bg-slate-300">Bold</button>
                          <button type="button" onClick={() => insertMarkdownHelper('aboutUs', '*$*')} className="text-[9px] font-black px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded hover:bg-slate-300">Italic</button>
                          <button type="button" onClick={() => insertMarkdownHelper('aboutUs', '\n- $')} className="text-[9px] font-black px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded hover:bg-slate-300">Bullet</button>
                        </div>
                      </div>
                      <textarea
                        ref={richTextRefs.aboutUs}
                        value={draft.aboutUs}
                        onChange={(e) => handleChange('aboutUs', e.target.value)}
                        rows={3}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-indigo-500 font-semibold"
                        placeholder="Detailed narrative about coaching center classes, foundations, and values..."
                      />
                    </div>

                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Strategic Vision</label>
                      <textarea
                        value={draft.vision}
                        onChange={(e) => handleChange('vision', e.target.value)}
                        rows={2}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Core Mission Statement</label>
                      <textarea
                        value={draft.mission}
                        onChange={(e) => handleChange('mission', e.target.value)}
                        rows={2}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-medium"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Principal / Director's Personal Message</label>
                      <textarea
                        value={draft.directorMessage}
                        onChange={(e) => handleChange('directorMessage', e.target.value)}
                        rows={3}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-medium"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Chairman's Dedicated Message</label>
                      <textarea
                        value={draft.chairmanMessage}
                        onChange={(e) => handleChange('chairmanMessage', e.target.value)}
                        rows={2}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-medium"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Historical Archives / Growth Timeline</label>
                      <textarea
                        value={draft.history}
                        onChange={(e) => handleChange('history', e.target.value)}
                        rows={2}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-medium"
                        placeholder="Founded in Imphal East, grew to manage Dewlahland & Lamlong campuses..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BRANDING */}
              {managementTab === 'branding' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b pb-2.5">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Branding Assets & Logo Uploads</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Attach custom school insignias, favicon marks, and banners. Values update instantly on live render.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Logo asset */}
                    <div className="space-y-2">
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider">Institution Logo Symbol</label>
                      
                      {/* Upload box */}
                      <div
                        onDragEnter={(e) => handleDrag(e, 'logoUrl')}
                        onDragOver={(e) => handleDrag(e, 'logoUrl')}
                        onDragLeave={(e) => handleDrag(e, 'logoUrl')}
                        onDrop={(e) => handleDrop(e, 'logoUrl')}
                        onClick={() => fileInputRefs.logoUrl.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all relative overflow-hidden ${
                          dragActiveField === 'logoUrl' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-250 hover:border-indigo-400 hover:bg-white'
                        }`}
                      >
                        {renderUploadProgressOverlay('logoUrl')}
                        <input
                          ref={fileInputRefs.logoUrl}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && processUploadedFile(e.target.files[0], 'logoUrl')}
                        />
                        {draft.logoUrl ? (
                          <div className="flex items-center justify-center gap-3">
                            <img src={draft.logoUrl} alt="Logo" className="h-14 w-14 object-contain rounded-lg border bg-white p-1" />
                            <div className="text-left">
                              <p className="text-xxs font-black text-indigo-600">Logo attached</p>
                              <p className="text-[8px] text-slate-400">Click to change file</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <UploadCloud className="h-6 w-6 text-slate-400 mx-auto" />
                            <p className="text-[10px] font-black text-slate-700">Drag logo file here, or click</p>
                          </div>
                        )}
                      </div>

                      {/* Manual Url */}
                      <div>
                        <span className="block text-xxxxs font-bold text-slate-400 uppercase mb-1">Or input custom URL:</span>
                        <input
                          type="text"
                          value={draft.logoUrl}
                          onChange={(e) => handleChange('logoUrl', e.target.value)}
                          className="w-full text-xxs p-2 bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Favicon asset */}
                    <div className="space-y-2">
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider">Browser Favicon Symbol</label>
                      <div
                        onDragEnter={(e) => handleDrag(e, 'faviconUrl')}
                        onDragOver={(e) => handleDrag(e, 'faviconUrl')}
                        onDragLeave={(e) => handleDrag(e, 'faviconUrl')}
                        onDrop={(e) => handleDrop(e, 'faviconUrl')}
                        onClick={() => fileInputRefs.faviconUrl.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all relative overflow-hidden ${
                          dragActiveField === 'faviconUrl' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-250 hover:border-indigo-400 hover:bg-white'
                        }`}
                      >
                        {renderUploadProgressOverlay('faviconUrl')}
                        <input
                          ref={fileInputRefs.faviconUrl}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && processUploadedFile(e.target.files[0], 'faviconUrl')}
                        />
                        {draft.faviconUrl ? (
                          <div className="flex items-center justify-center gap-3">
                            <img src={draft.faviconUrl} alt="Favicon" className="h-10 w-10 object-contain rounded-md" />
                            <div className="text-left">
                              <p className="text-xxs font-black text-indigo-600">Favicon attached</p>
                              <p className="text-[8px] text-slate-400">Click to change file</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <UploadCloud className="h-6 w-6 text-slate-400 mx-auto" />
                            <p className="text-[10px] font-black text-slate-700">Drag favicon here, or click</p>
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        value={draft.faviconUrl}
                        onChange={(e) => handleChange('faviconUrl', e.target.value)}
                        className="w-full text-xxs p-2 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>

                    {/* Banner asset */}
                    <div className="col-span-1 md:col-span-2 space-y-2">
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider">Primary Homepage Hero Banner</label>
                      <div
                        onDragEnter={(e) => handleDrag(e, 'bannerUrl')}
                        onDragOver={(e) => handleDrag(e, 'bannerUrl')}
                        onDragLeave={(e) => handleDrag(e, 'bannerUrl')}
                        onDrop={(e) => handleDrop(e, 'bannerUrl')}
                        onClick={() => fileInputRefs.bannerUrl.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all relative overflow-hidden ${
                          dragActiveField === 'bannerUrl' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-250 hover:border-indigo-400 hover:bg-white'
                        }`}
                      >
                        {renderUploadProgressOverlay('bannerUrl')}
                        <input
                          ref={fileInputRefs.bannerUrl}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && processUploadedFile(e.target.files[0], 'bannerUrl')}
                        />
                        {draft.bannerUrl ? (
                          <div className="space-y-2">
                            <div className="relative aspect-video max-h-32 mx-auto rounded-lg overflow-hidden border">
                              <img src={draft.bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                            </div>
                            <p className="text-xxxxs text-slate-400 font-bold">Drag and drop new banner, or click to replace</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <UploadCloud className="h-7 w-7 text-slate-400 mx-auto" />
                            <p className="text-[10px] font-black text-slate-700">Drag hero banner file here</p>
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        value={draft.bannerUrl}
                        onChange={(e) => handleChange('bannerUrl', e.target.value)}
                        placeholder="Direct web URL link to high-res banner"
                        className="w-full text-xxs p-2.5 bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CONTACT INFO */}
              {managementTab === 'contact' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b pb-2.5">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Contact Cards & Geo Coordinates</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Control visual parameters for address details, mobile numbers, admissions hotlines, and web targets.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Official Address Lines</label>
                      <input
                        type="text"
                        value={draft.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">City</label>
                      <input type="text" value={draft.city} onChange={(e) => handleChange('city', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">State / Province</label>
                      <input type="text" value={draft.state} onChange={(e) => handleChange('state', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Country</label>
                      <input type="text" value={draft.country} onChange={(e) => handleChange('country', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">PIN Code</label>
                      <input type="text" value={draft.pinCode} onChange={(e) => handleChange('pinCode', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl" />
                    </div>

                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Helpline Phone Numbers</label>
                      <input type="text" value={draft.phone} onChange={(e) => handleChange('phone', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-bold" />
                    </div>
                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Admissions WhatsApp Helpline</label>
                      <input type="text" value={draft.whatsAppNumber} onChange={(e) => handleChange('whatsAppNumber', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-bold" />
                    </div>
                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Admissions Email ID</label>
                      <input type="email" value={draft.email} onChange={(e) => handleChange('email', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-bold" />
                    </div>
                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Google Maps coordinates Link</label>
                      <input type="text" value={draft.googleMapsLocation} onChange={(e) => handleChange('googleMapsLocation', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl" />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: OFFICE TIMINGS */}
              {managementTab === 'office' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b pb-2.5">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Office Hours & Operational calendars</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Control the standard campus operations schedule visible to student parents and faculty desk.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Standard Office Hours</label>
                      <input type="text" value={draft.officeTimings} onChange={(e) => handleChange('officeTimings', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-semibold" placeholder="e.g. 6:00 AM - 6:00 PM" />
                    </div>
                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Working Days</label>
                      <input type="text" value={draft.workingDays} onChange={(e) => handleChange('workingDays', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-semibold" placeholder="e.g. Monday - Saturday" />
                    </div>
                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Admission Desk Availability</label>
                      <input type="text" value={draft.admissionOfficeTimings} onChange={(e) => handleChange('admissionOfficeTimings', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-semibold" placeholder="e.g. 8:00 AM - 4:00 PM" />
                    </div>
                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Holiday / Weekend Hours</label>
                      <input type="text" value={draft.holidayTimings} onChange={(e) => handleChange('holidayTimings', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-semibold" placeholder="e.g. Closed on National Holidays" />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: ACADEMIC INFO */}
              {managementTab === 'academic' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b pb-2.5">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Academic Term Schedule Settings</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Control terms, active sessions, exam weeks, and winter/summer breaks.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Session Tag</label>
                      <input type="text" value={draft.academicSession} onChange={(e) => handleChange('academicSession', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-bold" placeholder="e.g. 2026-2027" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Admissions Open</label>
                        <input type="date" value={draft.admissionStartDate} onChange={(e) => handleChange('admissionStartDate', e.target.value)} className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl" />
                      </div>
                      <div>
                        <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Admissions Close</label>
                        <input type="date" value={draft.admissionEndDate} onChange={(e) => handleChange('admissionEndDate', e.target.value)} className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Standard Lecture Slots</label>
                      <input type="text" value={draft.classTimings} onChange={(e) => handleChange('classTimings', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl" placeholder="e.g. 6:00 AM - 9:00 AM" />
                    </div>
                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Alternative Batch Shifts</label>
                      <input type="text" value={draft.batchTimings} onChange={(e) => handleChange('batchTimings', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl" placeholder="Morning vs Evening Shifts" />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Assessment / Exam Weeks Details</label>
                      <input type="text" value={draft.examinationSchedule} onChange={(e) => handleChange('examinationSchedule', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl" placeholder="Fortnightly exams details" />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Vacation Calendar & Breaks</label>
                      <textarea value={draft.vacationDetails} onChange={(e) => handleChange('vacationDetails', e.target.value)} rows={2} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl" />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: SOCIAL MEDIA */}
              {managementTab === 'social' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b pb-2.5">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Social Platform Handles</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Edit web links representing the institution across online social networks.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Facebook className="h-3.5 w-3.5 text-blue-600" />
                        <span>Facebook Page</span>
                      </label>
                      <input type="text" value={draft.facebook} onChange={(e) => handleChange('facebook', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl" placeholder="https://facebook.com/..." />
                    </div>
                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Instagram className="h-3.5 w-3.5 text-pink-600" />
                        <span>Instagram Profile</span>
                      </label>
                      <input type="text" value={draft.instagram} onChange={(e) => handleChange('instagram', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl" placeholder="https://instagram.com/..." />
                    </div>
                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Youtube className="h-3.5 w-3.5 text-rose-600" />
                        <span>YouTube channel</span>
                      </label>
                      <input type="text" value={draft.youtube} onChange={(e) => handleChange('youtube', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl" placeholder="https://youtube.com/..." />
                    </div>
                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Linkedin className="h-3.5 w-3.5 text-indigo-700" />
                        <span>LinkedIn profile</span>
                      </label>
                      <input type="text" value={draft.linkedin} onChange={(e) => handleChange('linkedin', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl" placeholder="https://linkedin.com/company/..." />
                    </div>
                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Twitter className="h-3.5 w-3.5 text-sky-500" />
                        <span>X / Twitter</span>
                      </label>
                      <input type="text" value={draft.twitter} onChange={(e) => handleChange('twitter', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl" placeholder="https://x.com/..." />
                    </div>
                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <TelegramIcon className="h-3.5 w-3.5 text-sky-600" />
                        <span>Telegram Broadcast</span>
                      </label>
                      <input type="text" value={draft.telegram} onChange={(e) => handleChange('telegram', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl" placeholder="https://t.me/..." />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: LEGAL INFORMATION */}
              {managementTab === 'legal' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b pb-2.5">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Government registration & Legal Affairs</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Control corporate registration, GST values, state education boards affiliation code details.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Corporate Registration No.</label>
                      <input type="text" value={draft.registrationNumber} onChange={(e) => handleChange('registrationNumber', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-bold" />
                    </div>
                    <div>
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">GST Identification (GSTIN)</label>
                      <input type="text" value={draft.gstNumber} onChange={(e) => handleChange('gstNumber', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-bold font-mono" />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Affiliation / Authority details</label>
                      <input type="text" value={draft.affiliationDetails} onChange={(e) => handleChange('affiliationDetails', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl" />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-xxxxs font-bold text-slate-400 uppercase tracking-wider mb-1">Accreditation grade & Recognitions</label>
                      <input type="text" value={draft.accreditationInfo} onChange={(e) => handleChange('accreditationInfo', e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl" placeholder="Grade A coaching accredited standard details..." />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: INTEGRATED GALLERY MANAGEMENT */}
              {managementTab === 'gallery' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="border-b pb-2.5 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Campus Milestone Galleries Control</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Add, display order, categorise or delete visual milestones visible to school visitors.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGalleryUploadActive(!galleryUploadActive)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xxxxs font-black tracking-widest uppercase rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      {galleryUploadActive ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      <span>{galleryUploadActive ? "Close panel" : "Upload media"}</span>
                    </button>
                  </div>

                  {galleryUploadActive && (
                    <form onSubmit={handleCreateGalleryItem} className="bg-white border border-indigo-150 p-4 rounded-xl space-y-3">
                      <h4 className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">Upload New Snapshot</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-xxxxs font-bold text-slate-400 mb-1">Milestone Header / Title</label>
                          <input type="text" value={galleryTitle} onChange={(e) => setGalleryTitle(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold" placeholder="Picnic / Felicitations" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xxxxs font-bold text-slate-400 mb-1">category</label>
                            <select value={galleryCategory} onChange={(e) => setGalleryCategory(e.target.value as any)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold">
                              <option value="activities">Excursion trip</option>
                              <option value="winners">Topper felicitation</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xxxxs font-bold text-slate-400 mb-1">Display Date</label>
                            <input type="text" value={galleryDate} onChange={(e) => setGalleryDate(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold" placeholder="5th July 2026" />
                          </div>
                        </div>

                        <div className="col-span-1 sm:col-span-2">
                          <label className="block text-xxxxs font-bold text-slate-400 mb-1">Narrative Description</label>
                          <textarea value={galleryDesc} onChange={(e) => setGalleryDesc(e.target.value)} rows={2} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="Enter short engaging details..." />
                        </div>

                        <div className="col-span-1 sm:col-span-2">
                          <label className="block text-xxxxs font-bold text-slate-400 mb-1">Milestone Image URL (Or select default placeholder)</label>
                          <input type="text" value={galleryImg} onChange={(e) => setGalleryImg(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono" />
                        </div>
                      </div>

                      <div className="flex justify-end gap-1.5 pt-2">
                        <button type="button" onClick={() => setGalleryUploadActive(false)} className="px-3 py-1 bg-slate-200 text-slate-600 rounded-md text-xxxxs font-bold">Cancel</button>
                        <button type="submit" className="px-4 py-1 bg-indigo-600 text-white rounded-md text-xxxxs font-black tracking-wider uppercase">Add to showcase</button>
                      </div>
                    </form>
                  )}

                  {/* List of active media items */}
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {galleryItems.map((item, index) => (
                      <div key={item.id} className="bg-white border p-3 rounded-xl flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-3 truncate">
                          <img src={item.img} alt={item.title} className="w-12 h-10 object-cover rounded-md border" />
                          <div className="text-left truncate">
                            <h4 className="font-black text-slate-800 truncate">{item.title}</h4>
                            <p className="text-[10px] text-slate-400 font-bold capitalize">{item.category} • {item.date}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Display Order Action Indicators */}
                          <span className="text-[10px] text-slate-300 font-mono">Idx {index+1}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteGallery(item.id, item.title)}
                            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-all"
                            title="Remove picture milestone"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 9: TESTIMONIALS MODERATION */}
              {managementTab === 'testimonials' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b pb-2.5">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Testimonial Moderation & Featured Pin</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Approve, Reject or Delete testimonies submitted by parent observers and scholars. Pinned items are showcased first.</p>
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {testimonials.map((testi) => {
                      const status = testi.status || 'approved';
                      const pinned = testi.pinned || false;
                      return (
                        <div key={testi.id} className={`bg-white border p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs ${
                          status === 'pending' ? 'border-amber-300 bg-amber-50/5 animate-pulse' : 'border-slate-200'
                        }`}>
                          <div className="space-y-1 text-left flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-slate-800">{testi.authorName}</span>
                              <span className="text-slate-400 font-bold text-[10px]">({testi.authorRole})</span>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                              }`}>{status}</span>
                              {pinned && (
                                <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[8px] font-black flex items-center gap-0.5">
                                  <Pin className="h-2 w-2 fill-indigo-600" />
                                  <span>FEATURED PIN</span>
                                </span>
                              )}
                            </div>
                            <p className="text-slate-500 font-semibold italic truncate">"{testi.content}"</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            {/* Pin switch toggle */}
                            <button
                              onClick={() => handleModerateTestimonial(testi.id, status, !pinned)}
                              className={`p-1.5 rounded-lg border text-xxs font-black transition-all flex items-center gap-1 ${
                                pinned 
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                  : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200'
                              }`}
                              title={pinned ? "Unpin featured testimony" : "Pin testimony to featured top shelf"}
                            >
                              <Pin className="h-3.5 w-3.5" />
                              <span>{pinned ? "Unpin" : "Pin"}</span>
                            </button>

                            {/* Approve switch */}
                            {status !== 'approved' && (
                              <button
                                onClick={() => handleModerateTestimonial(testi.id, 'approved', pinned)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xxxxs font-black tracking-wider uppercase flex items-center gap-1"
                              >
                                <Check className="h-3 w-3" />
                                <span>Approve</span>
                              </button>
                            )}

                            {/* Reject switch */}
                            {status !== 'rejected' && (
                              <button
                                onClick={() => handleModerateTestimonial(testi.id, 'rejected', pinned)}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xxxxs font-black tracking-wider uppercase flex items-center gap-1 border border-rose-250"
                              >
                                <X className="h-3 w-3" />
                                <span>Reject</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteTestimonial(testi.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              title="Delete permanently from databases"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 10: HOMEPAGE CONTENT */}
              {managementTab === 'homepage' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b pb-2.5">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Homepage content blocks</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Control announcement banners, featured highlights, success milestones, and upcoming Sat events.</p>
                  </div>

                  <div className="space-y-4 text-xs">
                    
                    {/* Announcement block */}
                    <div className="p-4 bg-white border rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-[10px] uppercase text-indigo-700 tracking-wider">Homepage Headline Announcement</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            id="ann_term"
                            checked={draft.announcementActive}
                            onChange={(e) => handleChange('announcementActive', e.target.checked)}
                            className="h-4 w-4 cursor-pointer text-indigo-600 border-slate-300 rounded"
                          />
                          <label htmlFor="ann_term" className="text-xxxxs font-black text-slate-500 uppercase cursor-pointer">Show active on Homepage</label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="col-span-1 sm:col-span-2">
                          <label className="block text-xxxxs font-bold text-slate-400 mb-1">Announcement Heading / Badge Title</label>
                          <input type="text" value={draft.announcementTitle} onChange={(e) => handleChange('announcementTitle', e.target.value)} className="w-full p-2 bg-slate-50 border rounded-lg font-bold" />
                        </div>
                        <div className="col-span-1 sm:col-span-2">
                          <label className="block text-xxxxs font-bold text-slate-400 mb-1">Detailed Description text</label>
                          <input type="text" value={draft.announcementText} onChange={(e) => handleChange('announcementText', e.target.value)} className="w-full p-2 bg-slate-50 border rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-xxxxs font-bold text-slate-400 mb-1">Target Date / Launch Details</label>
                          <input type="text" value={draft.announcementDate} onChange={(e) => handleChange('announcementDate', e.target.value)} className="w-full p-2 bg-slate-50 border rounded-lg" />
                        </div>
                      </div>
                    </div>

                    {/* Featured items array */}
                    <div className="p-4 bg-white border rounded-xl space-y-3">
                      <span className="block font-black text-[10px] uppercase text-indigo-700 tracking-wider">Highlights list blocks ({draft.highlights?.length || 0})</span>
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newHighlightInput}
                          onChange={(e) => setNewHighlightInput(e.target.value)}
                          placeholder="e.g. Max 20 scholars per cohort"
                          className="flex-1 p-2 bg-slate-50 border rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => { handleAddToArray('highlights', newHighlightInput); setNewHighlightInput(''); }}
                          className="px-3 bg-indigo-600 text-white rounded-lg font-black text-xxs"
                        >
                          Add Block
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {draft.highlights?.map((hl, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-[10px] font-bold border">
                            <span>{hl}</span>
                            <button type="button" onClick={() => handleRemoveFromArray('highlights', i)} className="text-slate-400 hover:text-rose-600">×</button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Success Stats list */}
                    <div className="p-4 bg-white border rounded-xl space-y-3">
                      <span className="block font-black text-[10px] uppercase text-indigo-700 tracking-wider">Success Statistics Grid</span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="Stat Label (e.g. Board Success Rate)" value={statLabel} onChange={(e) => setStatLabel(e.target.value)} className="p-2 bg-slate-50 border rounded-lg" />
                        <div className="flex gap-1.5">
                          <input type="text" placeholder="Stat Value (e.g. 99.2%)" value={statValue} onChange={(e) => setStatValue(e.target.value)} className="flex-1 p-2 bg-slate-50 border rounded-lg font-black" />
                          <button type="button" onClick={handleAddStat} className="px-3 bg-indigo-600 text-white rounded-lg font-black text-xxs shrink-0">Add Stat</button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {draft.successStats?.map((st, i) => (
                          <div key={i} className="p-2.5 bg-slate-50 rounded-lg border relative space-y-1.5 text-left group">
                            <button
                              type="button"
                              onClick={() => handleRemoveStat(i)}
                              className="absolute right-1.5 top-1 text-slate-400 hover:text-rose-600 font-black transition-colors"
                              title="Delete Stat"
                            >
                              ×
                            </button>
                            <div>
                              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Value (Non-Editable)</label>
                              <div className="w-full text-xs px-2 py-1.5 bg-slate-100 border border-slate-200 rounded font-black text-slate-500 select-none">
                                {st.value}
                              </div>
                            </div>
                            <div>
                              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Label (Non-Editable)</label>
                              <div className="w-full text-[10px] px-2 py-1.5 bg-slate-100 border border-slate-200 rounded font-bold text-slate-500 select-none">
                                {st.label}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        
        // =========================================================================
        // READ-ONLY VISITOR MODE - COMPREHENSIVE INSTITUTION PROFILE SCREEN
        // =========================================================================
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xxs text-slate-800 space-y-6 text-left animate-fadeIn">
          
          {/* Dynamic Flyer announcement banner if active */}
          {profile?.announcementActive !== false && profile?.announcementTitle && (
            <div className="border border-indigo-150 rounded-2xl p-5 bg-gradient-to-r from-indigo-50/70 via-white to-indigo-50/70 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xxs">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[8px] font-black tracking-widest uppercase rounded">
                  <Calendar className="h-3 w-3 text-indigo-600" />
                  <span>Latest Academic Announcement</span>
                </span>
                <h3 className="text-sm font-black text-indigo-950 tracking-tight">{profile.announcementTitle}</h3>
                <p className="text-xs font-semibold text-slate-600 leading-normal">{profile.announcementText}</p>
              </div>
              <div className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10px] px-3 py-2 rounded-xl shrink-0 uppercase tracking-wide">
                {profile.announcementDate}
              </div>
            </div>
          )}

          {/* Elegant Display Hero Header */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-tr from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 sm:p-10 space-y-4 shadow-xs">
            <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-300 via-indigo-800 pointer-events-none" />
            
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <img src={profile?.logoUrl || "/favicon.svg"} alt="Logo" className="h-11 w-11 object-contain rounded-xl border border-white/10 p-1 bg-white" referrerPolicy="no-referrer" />
                <div>
                  <h1 className="text-lg sm:text-2xl font-black tracking-tight uppercase leading-tight">{profile?.name || "LEARNER'S DEN COACHING CENTER"}</h1>
                  <p className="text-indigo-300 font-bold text-[10px] uppercase tracking-widest mt-0.5">{profile?.tagline || "Strive for Academic Excellence & Intellectual Mastery"}</p>
                </div>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm max-w-3xl font-medium leading-relaxed">{profile?.description}</p>
              {profile?.motto && (
                <div className="text-xxxxs text-amber-400 font-black uppercase tracking-widest italic flex items-center gap-1">
                  <span>● motto:</span>
                  <span>"{profile.motto}"</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation tabs for read-only segments */}
          <div className="flex flex-wrap border-b border-slate-200 gap-1 sm:gap-2">
            {[
              { id: 'about', label: 'About & Letters', icon: Compass },
              { id: 'contact', label: 'Contact & timings', icon: MapPin },
              { id: 'academic', label: 'Academic Term Schedule', icon: Calendar },
              { id: 'legal', label: 'Legal Affiliations', icon: ShieldCheck },
              { id: 'gallery', label: 'Campus milestones Gallery', icon: Trophy },
              { id: 'testimonials', label: 'Verified Testimonials', icon: Heart },
              { id: 'showcase', label: 'Showcase Highlights', icon: Sparkles }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = detailsTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setDetailsTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xxs font-black transition-all border-b-2 cursor-pointer uppercase tracking-tight ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20 font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ACTIVE DETAILS VIEW */}
          <div className="pt-2">
            
            {/* VIEW ABOUT */}
            {detailsTab === 'about' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                <div className="col-span-1 md:col-span-2 space-y-6">
                  <div className="bg-slate-50/40 border border-slate-200 p-5 rounded-2xl space-y-2">
                    <h3 className="font-extrabold text-xs text-indigo-950 uppercase tracking-widest flex items-center gap-1.5 border-b pb-2">
                      <BookOpen className="h-4 w-4 text-indigo-600" />
                      <span>About our Coaching Center</span>
                    </h3>
                    {renderRichText(profile?.aboutUs || "Learner's Den represents Manipur's premier educational coaching framework...")}
                  </div>

                  {profile?.history && (
                    <div className="bg-slate-50/40 border border-slate-200 p-5 rounded-2xl space-y-2">
                      <h3 className="font-extrabold text-xs text-indigo-950 uppercase tracking-widest flex items-center gap-1.5 border-b pb-2">
                        <Clock className="h-4 w-4 text-indigo-600" />
                        <span>Timeline & Historical Milestones</span>
                      </h3>
                      {renderRichText(profile.history)}
                    </div>
                  )}

                  {profile?.directorMessage && (
                    <div className="bg-slate-50/40 border border-slate-200 p-5 rounded-2xl space-y-2">
                      <h3 className="font-extrabold text-xs text-indigo-950 uppercase tracking-widest flex items-center gap-1.5 border-b pb-2">
                        <Users className="h-4 w-4 text-indigo-600" />
                        <span>Director / Principal's Message</span>
                      </h3>
                      {renderRichText(profile.directorMessage)}
                    </div>
                  )}
                </div>

                {/* Side targets */}
                <div className="space-y-6">
                  {profile?.vision && (
                    <div className="bg-slate-50/40 border border-slate-200 p-5 rounded-2xl space-y-2 text-center sm:text-left">
                      <h4 className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2 justify-center sm:justify-start">
                        <Trophy className="h-4 w-4 text-indigo-600" />
                        <span>Our Strategic Vision</span>
                      </h4>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">{profile.vision}</p>
                    </div>
                  )}
                  {profile?.mission && (
                    <div className="bg-slate-50/40 border border-slate-200 p-5 rounded-2xl space-y-2 text-center sm:text-left">
                      <h4 className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2 justify-center sm:justify-start">
                        <Award className="h-4 w-4 text-indigo-600" />
                        <span>Our Mission Statement</span>
                      </h4>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">{profile.mission}</p>
                    </div>
                  )}
                  {profile?.chairmanMessage && (
                    <div className="bg-slate-50/40 border border-slate-200 p-5 rounded-2xl space-y-2">
                      <h4 className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider border-b pb-2">Chairman's Note</h4>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed italic">"{profile.chairmanMessage}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW CONTACT */}
            {detailsTab === 'contact' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                <div className="bg-slate-50/40 border border-slate-200 p-5 rounded-2xl space-y-4">
                  <h3 className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider">Contact Card Details</h3>
                  
                  <div className="space-y-4 text-xs text-slate-600">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-indigo-600 shrink-0" />
                      <div>
                        <p className="font-black text-slate-700">Official Campus Address</p>
                        <p className="text-slate-500 font-semibold mt-0.5">{profile?.address}, {profile?.city || "Imphal East"}, {profile?.state || "Manipur"} - {profile?.pinCode || "795001"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-indigo-600 shrink-0" />
                      <div>
                        <p className="font-black text-slate-700">Helpline Phone Numbers</p>
                        <p className="text-slate-500 font-semibold mt-0.5">{profile?.phone}</p>
                        {profile?.mobileNumbers && <p className="text-slate-400 font-semibold text-[10px]">{profile.mobileNumbers}</p>}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-indigo-600 shrink-0" />
                      <div>
                        <p className="font-black text-slate-700">Admissions Email Address</p>
                        <p className="text-indigo-500 font-semibold mt-0.5 font-mono">{profile?.email}</p>
                      </div>
                    </div>

                    {profile?.whatsAppNumber && (
                      <div className="flex items-start gap-3">
                        <MessageSquare className="h-5 w-5 text-emerald-500 shrink-0" />
                        <div>
                          <p className="font-black text-slate-700">Official WhatsApp Helpdesk</p>
                          <p className="text-emerald-600 font-black mt-0.5">{profile.whatsAppNumber}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50/40 border border-slate-200 p-5 rounded-2xl space-y-3">
                  <h3 className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider">Office Hours & Calendar</h3>
                  
                  <div className="text-xs text-slate-600 space-y-2 font-semibold">
                    <p className="flex justify-between border-b pb-1.5"><span>Administrative Timings:</span> <span className="text-slate-900 font-black">{profile?.officeTimings || "6:00 AM - 6:00 PM"}</span></p>
                    <p className="flex justify-between border-b pb-1.5"><span>Working Days:</span> <span className="text-slate-900 font-black">{profile?.workingDays || "Monday - Saturday"}</span></p>
                    <p className="flex justify-between border-b pb-1.5"><span>Admissions Hours:</span> <span className="text-slate-900 font-black">{profile?.admissionOfficeTimings || "8:00 AM - 4:00 PM"}</span></p>
                    <p className="flex justify-between border-b pb-1.5"><span>Holiday Timings:</span> <span className="text-slate-900 font-black">{profile?.holidayTimings || "Closed on Sunday & State Holidays"}</span></p>
                  </div>

                  {profile?.googleMapsLocation && (
                    <div className="pt-2">
                      <a 
                        href={profile.googleMapsLocation} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xxs font-black tracking-wider uppercase text-center block w-full shadow-xxs transition-all"
                      >
                        Navigate on Google Maps
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW ACADEMIC */}
            {detailsTab === 'academic' && (
              <div className="bg-slate-50/40 border border-slate-200 p-5 rounded-2xl space-y-4 text-xs font-semibold animate-fadeIn">
                <h3 className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider border-b pb-1.5">Academic Sessions & Lecture Slots</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600">
                  <div className="p-3 bg-white border rounded-xl">
                    <p className="text-slate-400 font-bold text-[9px] uppercase">Active Session</p>
                    <p className="text-indigo-600 font-black text-sm mt-0.5">Session: {profile?.academicSession || "2026-2027"}</p>
                  </div>

                  <div className="p-3 bg-white border rounded-xl">
                    <p className="text-slate-400 font-bold text-[9px] uppercase">Admissions Registration window</p>
                    <p className="text-slate-700 font-black text-xs mt-0.5">
                      {profile?.admissionStartDate ? `${profile.admissionStartDate} to ${profile.admissionEndDate}` : "Open throughout Summer weeks"}
                    </p>
                  </div>

                  <div className="p-3 bg-white border rounded-xl">
                    <p className="text-slate-400 font-bold text-[9px] uppercase">Standard Lecture hours</p>
                    <p className="text-slate-700 font-black text-xs mt-0.5">{profile?.classTimings || "6:00 AM - 9:00 AM & 3:00 PM - 6:00 PM"}</p>
                  </div>

                  <div className="p-3 bg-white border rounded-xl">
                    <p className="text-slate-400 font-bold text-[9px] uppercase">Shifts details</p>
                    <p className="text-slate-700 font-black text-xs mt-0.5">{profile?.batchTimings || "Morning & Evening Slots available"}</p>
                  </div>

                  {profile?.examinationSchedule && (
                    <div className="col-span-1 sm:col-span-2 p-3 bg-white border rounded-xl">
                      <p className="text-slate-400 font-bold text-[9px] uppercase">Assessment & mock schedule</p>
                      <p className="text-slate-700 font-black text-xs mt-0.5">{profile.examinationSchedule}</p>
                    </div>
                  )}

                  {profile?.vacationDetails && (
                    <div className="col-span-1 sm:col-span-2 p-3 bg-white border rounded-xl">
                      <p className="text-slate-400 font-bold text-[9px] uppercase">Vacation & State Breaks calendar</p>
                      <p className="text-slate-700 font-black text-xs mt-0.5">{profile.vacationDetails}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW LEGAL */}
            {detailsTab === 'legal' && (
              <div className="bg-slate-50/40 border border-slate-200 p-5 rounded-2xl space-y-4 animate-fadeIn text-xs">
                <h3 className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider border-b pb-1.5">Government Affiliations & registrations</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600 font-semibold">
                  <div>
                    <p className="text-slate-400 font-bold text-[9px] uppercase">Govt. Registration Code</p>
                    <p className="text-slate-800 font-black text-xs mt-0.5">{profile?.registrationNumber || "UDYAM-MN-04-0008737"}</p>
                  </div>
                  {profile?.gstNumber && (
                    <div>
                      <p className="text-slate-400 font-bold text-[9px] uppercase">GST Identification Number</p>
                      <p className="text-slate-800 font-black text-xs mt-0.5 font-mono">{profile.gstNumber}</p>
                    </div>
                  )}
                  <div className="col-span-1 sm:col-span-2">
                    <p className="text-slate-400 font-bold text-[9px] uppercase">Recognition particulars</p>
                    <p className="text-slate-800 font-black text-xs mt-0.5">{profile?.recognitionDetails || "Maintains standards advised by Education Department, Manipur."}</p>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <p className="text-slate-400 font-bold text-[9px] uppercase">Accreditations & Board Affiliations</p>
                    <p className="text-slate-800 font-black text-xs mt-0.5">{profile?.accreditationInfo || "Grade 'A' Accredited Academic Coaching Hub."}</p>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW GALLERY */}
            {detailsTab === 'gallery' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="border-b pb-2 flex justify-between items-center">
                  <h3 className="font-extrabold text-xs text-indigo-950 uppercase tracking-widest">Campus Showcase & Milestones</h3>
                  <span className="text-[10px] text-slate-400 font-mono">({galleryItems.length} elements verified)</span>
                </div>

                {galleryItems.length === 0 ? (
                  <p className="text-xs text-slate-400 font-bold text-center py-8 bg-slate-50 rounded-xl border border-dashed">No gallery snapshots uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {galleryItems.map((item) => (
                      <div key={item.id} className="bg-white border rounded-2xl overflow-hidden shadow-xxs flex flex-col justify-between">
                        <div className="relative aspect-video bg-slate-100 border-b">
                          <img src={item.img} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <span className="absolute left-3 top-3 px-1.5 py-0.5 bg-slate-900/80 text-white rounded text-[8px] font-black uppercase">
                            {item.category === 'activities' ? "Trip" : "Topper Prize"}
                          </span>
                        </div>
                        <div className="p-4 text-left space-y-1">
                          <span className="text-indigo-600 font-black text-[9px] uppercase">{item.date}</span>
                          <h4 className="font-black text-xs text-slate-900">{item.title}</h4>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW TESTIMONIALS */}
            {detailsTab === 'testimonials' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="border-b pb-2 flex justify-between items-center">
                  <h3 className="font-extrabold text-xs text-indigo-950 uppercase tracking-widest">Verified stories From Parents & Scholars</h3>
                  <span className="text-[10px] text-slate-400 font-mono">({sortedApprovedTestimonials.length} stories published)</span>
                </div>

                {/* Submitting testimony from student or parents */}
                {(isStudent || isParent) && (
                  <div className="p-4 bg-rose-50/40 border border-rose-150 rounded-2xl text-left space-y-2">
                    <h4 className="text-xs font-black text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Heart className="h-4 w-4 text-rose-600 fill-rose-500" />
                      <span>Submit a Testimony</span>
                    </h4>
                    <p className="text-[10px] text-slate-500 font-bold">Help inspire others! Share your positive learning outcome or board preparations support review with our registrar desk.</p>
                    
                    {/* Simple Submit field */}
                    <div className="pt-2">
                      <textarea
                        id="parent-test-field"
                        placeholder="My ward experienced a massive syllabus conceptual boost under dedicated physics lecturers..."
                        className="w-full text-xs p-2.5 bg-white border rounded-lg focus:outline-hidden"
                        rows={2}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = (document.getElementById('parent-test-field') as HTMLTextAreaElement)?.value || '';
                          if (!val.trim()) return;
                          
                          // Call onAddTestimonial with a pending testimonial
                          onAddTestimonial({
                            id: 'testi-' + Date.now(),
                            authorName: currentUser?.name || "Parent Monitor",
                            authorRole: isStudent ? "Student Scholar" : "Parent Monitor",
                            content: val,
                            rating: 5,
                            avatarUrl: currentUser?.avatarUrl || '',
                            status: 'pending',
                            targetAudience: 'all',
                            createdAt: new Date().toISOString(),
                            featured: false,
                            pinned: false
                          });
                          
                          (document.getElementById('parent-test-field') as HTMLTextAreaElement).value = '';
                          showToastMsg("Testimonial Sent", "Thank you! Your story has been dispatched to administrative moderation desks.", "success");
                        }}
                        className="mt-1.5 px-3 py-1 bg-rose-500 text-white rounded text-xxxxs font-black tracking-widest uppercase cursor-pointer"
                      >
                        Submit story
                      </button>
                    </div>
                  </div>
                )}

                {sortedApprovedTestimonials.length === 0 ? (
                  <p className="text-xs text-slate-400 font-bold text-center py-8 bg-slate-50 rounded-xl border border-dashed">Verified testimonials are held in moderation.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedApprovedTestimonials.map((testi) => (
                      <div key={testi.id} className="bg-white border rounded-2xl p-5 shadow-xxs flex flex-col justify-between text-left relative">
                        <Quote className="absolute top-4 right-4 h-6 w-6 text-slate-100" />
                        <div className="space-y-3">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < testi.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                            ))}
                          </div>
                          <p className="text-xs text-slate-600 font-semibold italic">"{testi.content}"</p>
                        </div>
                        <div className="flex items-center gap-2.5 pt-4 border-t mt-4">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center border font-bold text-slate-600 text-[10px] uppercase">
                            {testi.avatarUrl ? <img src={testi.avatarUrl} alt="Portrait" className="w-full h-full object-cover rounded-full" /> : testi.authorName[0]}
                          </div>
                          <div>
                            <h4 className="text-[11px] font-black text-slate-800 leading-tight">{testi.authorName}</h4>
                            <p className="text-[9px] text-slate-400 font-bold capitalize">{testi.authorRole}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW SHOWCASE HIGHLIGHTS */}
            {detailsTab === 'showcase' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                <div className="col-span-1 md:col-span-2 space-y-6">
                  {/* Highlights list */}
                  <div className="bg-slate-50/40 border border-slate-200 p-5 rounded-2xl space-y-3">
                    <h3 className="font-extrabold text-xs text-indigo-950 uppercase tracking-widest flex items-center gap-1.5 border-b pb-2">
                      <Sparkles className="h-4.5 w-4.5 text-indigo-600" />
                      <span>Distinguishing Highlights</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(profile?.highlights || ["Bilingual explanations", "Max 20 scholars per cohort", " compréhension focused teaching"]).map((hl, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-700 font-semibold">
                          <ChevronRight className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* achievements */}
                  {profile?.achievements && profile.achievements.length > 0 && (
                    <div className="bg-slate-50/40 border border-slate-200 p-5 rounded-2xl space-y-3">
                      <h3 className="font-extrabold text-xs text-indigo-950 uppercase tracking-widest flex items-center gap-1.5 border-b pb-2">
                        <Trophy className="h-4.5 w-4.5 text-indigo-600" />
                        <span>Academic Achievements Board</span>
                      </h3>
                      <div className="space-y-2.5">
                        {profile.achievements.map((ach, i) => (
                          <div key={i} className="flex gap-3 items-start text-xs text-slate-700 font-semibold p-2.5 bg-white border rounded-xl">
                            <span className="p-1 bg-amber-100 text-amber-800 font-bold text-xxxxs rounded uppercase">Honor</span>
                            <span>{ach}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Success metrics */}
                <div className="space-y-6">
                  <div className="bg-slate-50/40 border border-slate-200 p-5 rounded-2xl space-y-4">
                    <h4 className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider border-b pb-1.5">Statistical Milestones</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {(profile?.successStats || [
                        { label: "Success Rate", value: "99.2%" },
                        { label: "JEE NEET Qualify", value: "140+" },
                        { label: "Cohort Capped", value: "20 max" }
                      ]).map((st, i) => (
                        <div key={i} className="p-3 bg-white border rounded-xl text-center">
                          <p className="text-indigo-600 font-black text-sm leading-none">{st.value}</p>
                          <p className="text-[9px] text-slate-400 font-bold mt-1 leading-tight">{st.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Social Links Footer strip */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-bold text-slate-500">
            {profile?.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 transition-all uppercase"
              >
                <Globe className="h-4 w-4" />
                <span>Visit web portal: {profile.website.replace(/(^\w+:|^)\/\//, '')}</span>
              </a>
            )}
            
            <div className="flex items-center gap-4 flex-wrap">
              {profile?.facebook && (
                <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-all uppercase">Facebook</a>
              )}
              {profile?.instagram && (
                <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-all uppercase">Instagram</a>
              )}
              {profile?.youtube && (
                <a href={profile.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-all uppercase">YouTube</a>
              )}
              {profile?.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-all uppercase">LinkedIn</a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
