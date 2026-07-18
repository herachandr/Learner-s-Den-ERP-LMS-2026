import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Search, MessageSquare, ShieldAlert, Edit, MapPin, Briefcase, 
  Linkedin, Award, Star, Send, Image, Paperclip, Trash2, Shield, AlertTriangle, 
  FileText, Globe, GraduationCap, Clock, CheckCircle2, Megaphone, Calendar, 
  BookOpen, Heart, UserPlus, Info
} from 'lucide-react';
import { Student, AlumniMessage, ModerationLog, AppUser } from '../types';
import { communicationService } from '../services/communicationService';

interface AlumniPortalProps {
  students: Student[];
  currentUser: AppUser | null;
  currentRole: string;
  onUpdateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  batches: { id: string; name: string }[];
}

interface ChatRoom {
  id: string;
  name: string;
  type: AlumniMessage['roomType'];
  description: string;
  icon: any;
}

export default function AlumniPortal({
  students,
  currentUser,
  currentRole,
  onUpdateStudent,
  batches
}: AlumniPortalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'directory' | 'profile' | 'moderation'>('chat');
  const [alumniList, setAlumniList] = useState<Student[]>([]);
  const [chatMessages, setChatMessages] = useState<AlumniMessage[]>([]);
  const [moderationLogs, setModerationLogs] = useState<ModerationLog[]>([]);
  
  // Search & filter directory state
  const [dirSearch, setDirSearch] = useState('');
  const [dirYear, setDirYear] = useState('all');
  const [dirBatch, setDirBatch] = useState('all');
  const [dirOccupation, setDirOccupation] = useState('all');

  // Active chat room state
  const [activeRoom, setActiveRoom] = useState<ChatRoom>({
    id: 'general',
    name: 'General Discussion',
    type: 'public',
    description: 'Central hub for alumni, teachers, and students to converse, catch up, and network.',
    icon: MessageSquare
  });

  const rooms: ChatRoom[] = [
    { id: 'general', name: 'General Discussion', type: 'public', description: 'Central hub for all alumni, educators, and candidates.', icon: MessageSquare },
    { id: 'announcements', name: 'Alumni Announcements', type: 'announcements', description: 'Official newsletters, institution updates, and milestones.', icon: Megaphone },
    { id: 'events', name: 'Reunion & Events', type: 'events', description: 'Annual reunions, webinars, sports events, and local meetups.', icon: Calendar },
    { id: 'career', name: 'Career & Mentorship', type: 'mentorship', description: 'Discuss higher education prep (JEE/NEET/CUET/Boards) and career advice.', icon: GraduationCap },
    { id: 'jobs', name: 'Job Board & Placement', type: 'jobs', description: 'Share current hiring opportunities, internships, and referral slots.', icon: Briefcase },
    { id: 'photos', name: 'Campus Memory Photos', type: 'photos', description: 'Post old snapshots, school memories, and nostalgic corridors.', icon: Image }
  ];

  // Post message states
  const [messageText, setMessageText] = useState('');
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [messageWarning, setMessageWarning] = useState<string | null>(null);
  
  // Simulated attachment states
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentType, setAttachmentType] = useState<'image' | 'document' | null>(null);

  // Profile Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profOccupation, setProfOccupation] = useState('');
  const [profHigherEdu, setProfHigherEdu] = useState('');
  const [profEmployer, setProfEmployer] = useState('');
  const [profCity, setProfCity] = useState('');
  const [profCountry, setProfCountry] = useState('');
  const [profLinkedIn, setProfLinkedIn] = useState('');
  const [profAchievements, setProfAchievements] = useState('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Find corresponding student record if user is a student or can be matched
  const currentAlumnus = students.find(s => s.id === currentUser?.id || s.email === currentUser?.email);

  // Initialize form when profile tab is active
  useEffect(() => {
    if (currentAlumnus) {
      setProfOccupation(currentAlumnus.currentOccupation || '');
      setProfHigherEdu(currentAlumnus.higherEducationDetails || '');
      setProfEmployer(currentAlumnus.currentEmployer || '');
      setProfCity(currentAlumnus.city || 'Imphal');
      setProfCountry(currentAlumnus.country || 'India');
      setProfLinkedIn(currentAlumnus.linkedIn || '');
      setProfAchievements(currentAlumnus.achievements || '');
    }
  }, [currentAlumnus, activeSubTab]);

  // Fetch messages and logs
  const fetchMessages = async () => {
    try {
      const data = await communicationService.getAlumniMessages(activeRoom.type, activeRoom.id);
      setChatMessages(data);
    } catch (err) {
      console.error("Error fetching alumni chat:", err);
    }
  };

  const fetchModerationLogs = async () => {
    if (currentRole !== 'admin') return;
    try {
      const data = await communicationService.getModerationLogs();
      setModerationLogs([...data].reverse()); // Show newest first
    } catch (err) {
      console.error("Error fetching moderation logs:", err);
    }
  };

  useEffect(() => {
    // Filter alumni students
    const alumni = students.filter(s => s.isAlumni);
    setAlumniList(alumni);
  }, [students]);

  useEffect(() => {
    fetchMessages();
  }, [activeRoom]);

  useEffect(() => {
    if (activeSubTab === 'moderation') {
      fetchModerationLogs();
    }
  }, [activeSubTab]);

  // Handle message send
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && !attachmentUrl) return;

    setIsSubmittingMessage(true);
    setMessageError(null);
    setMessageWarning(null);

    const senderName = currentUser?.name || 'Guest Alumnus';
    const senderAvatar = currentAlumnus?.photoUrl || '';

    try {
      const result = await communicationService.sendAlumniMessage({
        content: messageText,
        roomType: activeRoom.type,
        roomId: activeRoom.id,
        senderName,
        senderAvatar,
        attachmentUrl: attachmentUrl || undefined,
        attachmentName: attachmentName || undefined,
        attachmentType: (attachmentType as any) || undefined
      });

      // Success
      setMessageText('');
      setAttachmentName('');
      setAttachmentUrl('');
      setAttachmentType(null);
      setIsAttachmentOpen(false);
      fetchMessages();
    } catch (err: any) {
      console.error("Error sending message:", err);
      setMessageError(err.message || "Message blocked or failed to send.");
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  // Admin delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to remove this message from the forum?")) return;
    try {
      await communicationService.deleteAlumniMessage(messageId);
      fetchMessages();
    } catch (e: any) {
      console.error("Delete message error:", e);
      alert(e.message || "Unable to delete message");
    }
  };

  // Profile submit
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAlumnus) return;

    try {
      await onUpdateStudent(currentAlumnus.id, {
        currentOccupation: profOccupation,
        higherEducationDetails: profHigherEdu,
        currentEmployer: profEmployer,
        city: profCity,
        country: profCountry,
        linkedIn: profLinkedIn,
        achievements: profAchievements
      });
      setProfileSuccessMsg("Professional alumni profile card updated successfully!");
      setIsEditingProfile(false);
      setTimeout(() => setProfileSuccessMsg(''), 5000);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile cards.");
    }
  };

  // Helper lists for directory filtering
  const distinctPassingYears = Array.from(new Set(alumniList.map(a => a.alumniYear || '2026'))).sort((a, b) => b.localeCompare(a));
  const distinctOccupations = Array.from(new Set(alumniList.map(a => a.currentOccupation).filter(Boolean))) as string[];

  const filteredDirectory = alumniList.filter(a => {
    const matchesSearch = !dirSearch ? true : (
      a.name.toLowerCase().includes(dirSearch.toLowerCase()) ||
      (a.currentOccupation || '').toLowerCase().includes(dirSearch.toLowerCase()) ||
      (a.currentEmployer || '').toLowerCase().includes(dirSearch.toLowerCase()) ||
      (a.city || '').toLowerCase().includes(dirSearch.toLowerCase())
    );

    const matchesYear = dirYear === 'all' ? true : (a.alumniYear === dirYear);
    const matchesBatch = dirBatch === 'all' ? true : (a.alumniBatchName === dirBatch);
    const matchesOcc = dirOccupation === 'all' ? true : (a.currentOccupation === dirOccupation);

    return matchesSearch && matchesYear && matchesBatch && matchesOcc;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6" id="alumni_portal_container">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0,transparent_70%)]"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-indigo-500/30 text-indigo-300 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-400/20">
              Alumni Relations
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight font-sans">
              Learner's Den Alumni Community Portal
            </h1>
            <p className="text-xs text-indigo-200/90 max-w-2xl font-semibold leading-relaxed">
              Connect with past scholars of COHSEM/CBSE boards, JEE/NEET qualifiers, and explore professional referral boards. Safe educational spaces guided by real-time AI Content Moderation.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveSubTab('chat')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'chat' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                  : 'bg-white/10 hover:bg-white/15 text-indigo-100'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Community Chat
            </button>
            <button
              onClick={() => setActiveSubTab('directory')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'directory' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                  : 'bg-white/10 hover:bg-white/15 text-indigo-100'
              }`}
            >
              <Users className="h-4 w-4" />
              Scholars Directory
            </button>
            <button
              onClick={() => setActiveSubTab('profile')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'profile' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                  : 'bg-white/10 hover:bg-white/15 text-indigo-100'
              }`}
            >
              <Edit className="h-4 w-4" />
              Alumni Card
            </button>
            {currentRole === 'admin' && (
              <button
                onClick={() => setActiveSubTab('moderation')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeSubTab === 'moderation' 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                    : 'bg-red-950/40 hover:bg-red-900/40 text-red-200 border border-red-500/20'
                }`}
              >
                <Shield className="h-4 w-4" />
                Moderation Logs
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary Workspace */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* TAB 1: COMMUNITY CHAT */}
        {activeSubTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Rooms Navigation */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 px-1">
                  Community channels
                </h2>
                <div className="space-y-1">
                  {rooms.map(r => {
                    const RoomIcon = r.icon;
                    const isSelected = activeRoom.id === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setActiveRoom(r)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-50 text-indigo-700' 
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <RoomIcon className={`h-4.5 w-4.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span className="truncate">{r.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Moderation Shield Badge */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-slate-500 text-[11px] leading-relaxed font-semibold">
                <div className="flex items-center gap-2 text-indigo-700 font-bold mb-1.5 text-xs">
                  <ShieldAlert className="h-4 w-4" />
                  <span>AI Content Moderation Active</span>
                </div>
                Educational guidelines enforced. Message contents are validated using deep semantic analysis to block cyberbullying, profanity, and suspicious phishing links.
              </div>
            </div>

            {/* Chat Board */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-xs border border-slate-100 flex flex-col h-[600px] overflow-hidden">
              {/* Room Info Bar */}
              <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <activeRoom.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800">{activeRoom.name}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">{activeRoom.description}</p>
                  </div>
                </div>
                <div className="text-[11px] text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-full">
                  {chatMessages.length} messages
                </div>
              </div>

              {/* Chat Messages Scrolling */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/20">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <MessageSquare className="h-10 w-10 stroke-1" />
                    <p className="text-xs font-black">No messages in this channel yet</p>
                    <p className="text-[10px] text-slate-400 max-w-xs text-center">Be the first to share an update, alumni reference, or welcome note!</p>
                  </div>
                ) : (
                  chatMessages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`flex gap-3 group items-start ${msg.senderId === currentUser?.id ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 overflow-hidden font-black text-xs text-indigo-600">
                        {msg.senderAvatar ? (
                          <img src={msg.senderAvatar} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          msg.senderName.charAt(0)
                        )}
                      </div>

                      {/* Content Bubble */}
                      <div className="max-w-[70%] space-y-1">
                        <div className={`flex items-center gap-2 ${msg.senderId === currentUser?.id ? 'flex-row-reverse' : ''}`}>
                          <span className="text-xs font-black text-slate-700">{msg.senderName}</span>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-500">
                            {msg.senderRole}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className={`p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-xs ${
                          msg.senderId === currentUser?.id 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                        }`}>
                          {msg.content}

                          {/* Attachment Display */}
                          {msg.attachmentUrl && (
                            <div className="mt-2 pt-2 border-t border-white/20">
                              {msg.attachmentType === 'image' ? (
                                <div className="rounded-lg overflow-hidden border border-slate-200 bg-black/5">
                                  <img src={msg.attachmentUrl} alt="Attached Preview" className="max-h-48 w-full object-contain" referrerPolicy="no-referrer" />
                                </div>
                              ) : (
                                <a 
                                  href={msg.attachmentUrl} 
                                  download 
                                  className="flex items-center gap-2 bg-black/10 hover:bg-black/20 text-current p-2 rounded-lg transition-all"
                                >
                                  <FileText className="h-4 w-4" />
                                  <div className="text-left">
                                    <p className="font-bold truncate max-w-[160px]">{msg.attachmentName}</p>
                                    <p className="text-[9px] opacity-75">Click to Download File</p>
                                  </div>
                                </a>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Admin Action Menu */}
                        {currentRole === 'admin' && (
                          <div className={`flex items-center mt-1 ${msg.senderId === currentUser?.id ? 'justify-end' : ''}`}>
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="text-[10px] text-red-500 hover:text-red-700 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                              Remove Message
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Warning Alert Banners */}
              {messageError && (
                <div className="px-4 py-2 bg-red-50 border-t border-red-100 text-red-700 text-xs font-semibold flex items-center gap-2 shrink-0 animate-fadeIn">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                  <div>
                    <span className="font-bold">{messageError}</span>
                    {messageWarning && <p className="text-[10px] text-red-500 mt-0.5">{messageWarning}</p>}
                  </div>
                </div>
              )}

              {/* Input Form Box */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
                <form onSubmit={handleSendMessage} className="space-y-3">
                  
                  {/* Attachment Previews */}
                  {isAttachmentOpen && (
                    <div className="bg-white border border-indigo-100 p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2.5 text-indigo-700">
                        {attachmentType === 'image' ? <Image className="h-4.5 w-4.5" /> : <FileText className="h-4.5 w-4.5" />}
                        <div>
                          <p className="font-bold text-slate-700">{attachmentName || "Unspecified Attachment"}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Attachment Ready to Broadcast</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAttachmentName('');
                          setAttachmentUrl('');
                          setAttachmentType(null);
                          setIsAttachmentOpen(false);
                        }}
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2 items-center">
                    {/* Attachment Toggle */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          if (isAttachmentOpen) {
                            setIsAttachmentOpen(false);
                          } else {
                            // Simulate quick attachment templates
                            const templates = [
                              { name: 'graduation_day_memories.jpg', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600', type: 'image' },
                              { name: 'resume_reference_learners.pdf', url: 'https://learnersden.in/docs/reference.pdf', type: 'document' },
                              { name: 'alumni_group_campus.jpg', url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600', type: 'image' },
                            ];
                            const select = templates[Math.floor(Math.random() * templates.length)];
                            setAttachmentName(select.name);
                            setAttachmentUrl(select.url);
                            setAttachmentType(select.type as any);
                            setIsAttachmentOpen(true);
                          }
                        }}
                        className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                          isAttachmentOpen 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                            : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300'
                        }`}
                        title="Simulate Photo/File Attachment"
                      >
                        <Paperclip className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    {/* Chat Text Input */}
                    <input
                      type="text"
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      placeholder={`Send a secure moderated message to #${activeRoom.id}...`}
                      disabled={isSubmittingMessage}
                      className="flex-1 h-11 bg-white border border-slate-200 rounded-xl px-4 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 transition-all"
                    />

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={isSubmittingMessage || (!messageText.trim() && !attachmentUrl)}
                      className="h-11 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Broadcast</span>
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALUMNI SCHOLARS DIRECTORY */}
        {activeSubTab === 'directory' && (
          <div className="space-y-6">
            {/* Filters Bar */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-slate-800">Browse Graduated Scholars</h3>
                  <p className="text-[11px] text-slate-500 font-semibold">Search, sort and filter our board of passed scholars by passing year or career domain.</p>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, employer, city..."
                    value={dirSearch}
                    onChange={e => setDirSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-50">
                {/* Passing Year Filter */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Passing Class Year</label>
                  <select
                    value={dirYear}
                    onChange={e => setDirYear(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-600 focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="all">All Passing Years</option>
                    {distinctPassingYears.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* Batch Name Filter */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Passing Batch</label>
                  <select
                    value={dirBatch}
                    onChange={e => setDirBatch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-600 focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="all">All Batches</option>
                    {batches.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {/* Domain Filter */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Current Sector/Job</label>
                  <select
                    value={dirOccupation}
                    onChange={e => setDirOccupation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-600 focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="all">All Sectors</option>
                    {distinctOccupations.map(occ => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>

                {/* Clear Button */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setDirSearch('');
                      setDirYear('all');
                      setDirBatch('all');
                      setDirOccupation('all');
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Scholars List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDirectory.length === 0 ? (
                <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-100 space-y-2">
                  <Users className="h-10 w-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-black text-slate-700">No Alumni matched your criteria</h4>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto font-medium">Try broadening your search term or selecting "All Passing Years" to find scholars.</p>
                </div>
              ) : (
                filteredDirectory.map(alumnus => (
                  <div 
                    key={alumnus.id} 
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 relative overflow-hidden"
                  >
                    {/* Visual Stamp for board success */}
                    {alumnus.previousClassPercentage && Number(alumnus.previousClassPercentage) >= 90 && (
                      <div className="absolute right-0 top-0 bg-yellow-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-bl-xl uppercase tracking-widest flex items-center gap-1">
                        <Star className="h-3 w-3 fill-white" />
                        <span>Den Star</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      {/* Top Header Card */}
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 font-black text-slate-500 text-sm">
                          {alumnus.photoUrl ? (
                            <img src={alumnus.photoUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            alumnus.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800 tracking-tight">{alumnus.name}</h4>
                          <p className="text-[10px] font-black text-indigo-600 uppercase">
                            Class of {alumnus.alumniYear || '2026'} | {alumnus.alumniBatchName || 'JEE-2026 Focus'}
                          </p>
                        </div>
                      </div>

                      {/* Professional Bio */}
                      <div className="bg-slate-50 rounded-xl p-3 space-y-2 text-[11px] font-semibold text-slate-600">
                        {/* Occupation */}
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                          <span className="truncate">
                            {alumnus.currentOccupation 
                              ? `${alumnus.currentOccupation} ${alumnus.currentEmployer ? `at ${alumnus.currentEmployer}` : ''}`
                              : 'Preparing for higher studies / exams'}
                          </span>
                        </div>

                        {/* Education */}
                        {alumnus.higherEducationDetails && (
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                            <span className="truncate">{alumnus.higherEducationDetails}</span>
                          </div>
                        )}

                        {/* Location */}
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                          <span className="truncate">{alumnus.city || 'Imphal'}, {alumnus.country || 'India'}</span>
                        </div>
                      </div>

                      {/* Achievements quote box */}
                      {alumnus.achievements && (
                        <div className="text-[10px] text-slate-500 font-bold bg-amber-50/40 p-2.5 rounded-lg border border-amber-500/10 italic">
                          " {alumnus.achievements} "
                        </div>
                      )}
                    </div>

                    {/* Footer Contact Details */}
                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                      <div className="text-[10px] text-slate-400 font-bold">
                        Den Roll: {alumnus.rollNumber || 'AL-1092'}
                      </div>
                      
                      {/* Social/Mail Connections */}
                      <div className="flex gap-2">
                        {alumnus.linkedIn && (
                          <a 
                            href={alumnus.linkedIn.startsWith('http') ? alumnus.linkedIn : `https://${alumnus.linkedIn}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="h-7 w-7 rounded-lg bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center text-indigo-600 transition-all cursor-pointer"
                            title="Connect on LinkedIn"
                          >
                            <Linkedin className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <a 
                          href={`mailto:${alumnus.email}`}
                          className="h-7 w-7 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-all cursor-pointer"
                          title="Send Email"
                        >
                          <Globe className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MY ALUMNI PROFESSIONAL CARD EDITING */}
        {activeSubTab === 'profile' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-100 space-y-6">
            
            {profileSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {!currentAlumnus ? (
              <div className="text-center py-10 space-y-3">
                <ShieldAlert className="h-12 w-12 text-slate-300 mx-auto" />
                <h3 className="text-sm font-black text-slate-700">No matching student profile located</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm mx-auto font-medium">
                  We could not locate a matching student record matching your current login credentials in the directory. Only verified passed candidates can maintain an active Alumni card. Contact administrators to register.
                </p>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-[10px] text-slate-500 font-bold max-w-sm mx-auto">
                  Logged in user: {currentUser?.name || 'Anonymous'} ({currentUser?.email || 'No email'})
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-800">My Scholar Card Details</h3>
                    <p className="text-xs text-slate-500 font-semibold">Maintain your current higher education credentials and job profiles to network with candidates.</p>
                  </div>
                  {!isEditingProfile ? (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Edit Card Details
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {/* Preview Card */}
                {!isEditingProfile ? (
                  <div className="bg-gradient-to-br from-indigo-50 to-slate-50 rounded-2xl p-6 border border-indigo-100 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-white border border-indigo-200 flex items-center justify-center overflow-hidden font-black text-indigo-700 text-lg">
                          {currentAlumnus.photoUrl ? (
                            <img src={currentAlumnus.photoUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            currentAlumnus.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <h4 className="text-base font-black text-slate-800 tracking-tight">{currentAlumnus.name}</h4>
                          <p className="text-xs font-bold text-indigo-600 uppercase">
                            Class of {currentAlumnus.alumniYear || '2026'} | {currentAlumnus.alumniBatchName || 'JEE-2026 Focus'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-100/60 px-2.5 py-1 rounded-full">
                        Verified Alumni
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-600 pt-2 border-t border-indigo-100/50">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Sector/Occupation</span>
                        <p className="text-slate-700 font-bold">{currentAlumnus.currentOccupation || 'Not Specified'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Employer/Institution</span>
                        <p className="text-slate-700 font-bold">{currentAlumnus.currentEmployer || 'Not Specified'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Higher Education Prep</span>
                        <p className="text-slate-700 font-bold">{currentAlumnus.higherEducationDetails || 'Not Specified'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Location</span>
                        <p className="text-slate-700 font-bold">{currentAlumnus.city || 'Imphal'}, {currentAlumnus.country || 'India'}</p>
                      </div>
                    </div>

                    {currentAlumnus.achievements && (
                      <div className="bg-white/60 p-3 rounded-xl border border-indigo-50 text-xs text-slate-500 font-medium">
                        <span className="text-[10px] font-bold text-amber-600 block mb-1">Key Achievements</span>
                        {currentAlumnus.achievements}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Form Fields */
                  <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-black text-slate-500 mb-1">Current Sector/Job Role</label>
                        <input
                          type="text"
                          placeholder="e.g. Software Engineer / NEET Prep"
                          value={profOccupation}
                          onChange={e => setProfOccupation(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-slate-500 mb-1">Employer/Company/College</label>
                        <input
                          type="text"
                          placeholder="e.g. Google / IIT Bombay / DEN Corp"
                          value={profEmployer}
                          onChange={e => setProfEmployer(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 mb-1">Higher Education Details</label>
                      <input
                        type="text"
                        placeholder="e.g. Pursuing B.Tech Computer Science / Preparing JEE Adv"
                        value={profHigherEdu}
                        onChange={e => setProfHigherEdu(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-black text-slate-500 mb-1">City</label>
                        <input
                          type="text"
                          value={profCity}
                          onChange={e => setProfCity(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-slate-500 mb-1">Country</label>
                        <input
                          type="text"
                          value={profCountry}
                          onChange={e => setProfCountry(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 mb-1">LinkedIn Profile Link</label>
                      <input
                        type="text"
                        placeholder="e.g. linkedin.com/in/username"
                        value={profLinkedIn}
                        onChange={e => setProfLinkedIn(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-500 mb-1">Key Achievements & Scholar Memories</label>
                      <textarea
                        placeholder="e.g. Scored 98.4% in CBSE Class XII Board Prep under Learner's Den coaching, Cleared JEE Main."
                        value={profAchievements}
                        onChange={e => setProfAchievements(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Save Professional Card
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ADMIN CONTENT MODERATION LOGS */}
        {activeSubTab === 'moderation' && currentRole === 'admin' && (
          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-100 space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                <span>AI Moderation Audit & Compliance Log</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold">Review messages flagged, rejected or blocked automatically by our local policy rules and Gemini LLM classifiers.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-slate-600">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="p-3">Sender Details</th>
                    <th className="p-3">Message Content Evaluated</th>
                    <th className="p-3">AI Flag Reason</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Action Enforced</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {moderationLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 font-bold">
                        No flagged messages or moderation violations logged yet! Your forum is pristine and safe.
                      </td>
                    </tr>
                  ) : (
                    moderationLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <p className="font-bold text-slate-800">{log.senderName}</p>
                          <p className="text-[9px] text-slate-400 font-black">ID: {log.senderId}</p>
                        </td>
                        <td className="p-3">
                          <p className="max-w-xs truncate text-slate-700 font-medium" title={log.content}>{log.content}</p>
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] text-red-600 font-black block leading-snug">{log.flagReason}</span>
                          {log.language && <span className="text-[9px] text-slate-400">Language: {log.language}</span>}
                        </td>
                        <td className="p-3 text-slate-500 font-semibold text-[10px]">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-100 text-red-700">
                            {log.actionTaken}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
