import React, { useRef, useState } from 'react';
import { GraduationCap, ShieldCheck, UserCheck, BookOpen, Sparkles, LogOut, Wifi, WifiOff, Briefcase, Users, Building, Coins, Library, Calendar, HelpCircle, Camera, Menu } from 'lucide-react';
import { UserRole, AppUser } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  currentUser: AppUser | null;
  onLogout: () => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  onUpdateUser?: (updatedUser: AppUser) => void;
  showToast?: (title: string, desc: string) => void;
  onMenuToggle?: () => void;
}

export default function Header({ currentRole, onChangeRole, currentUser, onLogout, isOffline, onToggleOffline, onUpdateUser, showToast, onMenuToggle }: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarClick = () => {
    if (isOffline) {
      if (showToast) showToast("Offline block", "Cannot replace profile photo while running offline.");
      else alert("Cannot replace profile photo while offline.");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (!file.type.startsWith("image/")) {
      if (showToast) showToast("Invalid File", "Please select a valid image file.");
      else alert("Please select a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      if (showToast) showToast("File Too Large", "Image must be under 2MB.");
      else alert("Image must be under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setIsUploading(true);
      try {
        const response = await fetch(`/api/users/${currentUser.id}/photo`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarUrl: base64 }),
        });

        if (response.ok) {
          const data = await response.json();
          if (onUpdateUser) {
            onUpdateUser(data.user);
          }
          if (showToast) {
            showToast("DP Updated", "Your official profile photo has been updated successfully.");
          } else {
            alert("Profile photo updated successfully!");
          }
        } else {
          if (showToast) showToast("Error", "Failed to update profile picture.");
          else alert("Failed to update profile picture.");
        }
      } catch (err) {
        console.error(err);
        if (showToast) showToast("Error", "Error saving profile picture.");
        else alert("Error saving profile picture.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const roles: { value: UserRole; label: string; icon: any; color: string; bg: string }[] = [
    {
      value: 'admin',
      label: 'Admin',
      icon: ShieldCheck,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    },
    {
      value: 'principal',
      label: 'Principal',
      icon: Building,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-200 text-blue-700',
    },
    {
      value: 'teacher',
      label: 'Teacher',
      icon: UserCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    },
    {
      value: 'student',
      label: 'Student',
      icon: GraduationCap,
      color: 'text-violet-600',
      bg: 'bg-violet-50 border-violet-200 text-violet-700',
    },
    {
      value: 'parent',
      label: 'Parent',
      icon: Users,
      color: 'text-pink-600',
      bg: 'bg-pink-50 border-pink-200 text-pink-700',
    },
    {
      value: 'office_staff',
      label: 'Staff',
      icon: Briefcase,
      color: 'text-slate-600',
      bg: 'bg-slate-50 border-slate-200 text-slate-700',
    },
    {
      value: 'accountant',
      label: 'Accountant',
      icon: Coins,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    },
    {
      value: 'librarian',
      label: 'Librarian',
      icon: Library,
      color: 'text-teal-600',
      bg: 'bg-teal-50 border-teal-200 text-teal-700',
    },
    {
      value: 'receptionist',
      label: 'Reception',
      icon: Calendar,
      color: 'text-orange-600',
      bg: 'bg-orange-50 border-orange-200 text-orange-700',
    },
    {
      value: 'alumni',
      label: 'Alumni',
      icon: Users,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    },
    {
      value: 'guest',
      label: 'Guest',
      icon: HelpCircle,
      color: 'text-purple-600',
      bg: 'bg-purple-50 border-purple-200 text-purple-700',
    },
    {
      value: 'job_seeker',
      label: 'Career',
      icon: Briefcase,
      color: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-200 text-rose-700',
    },
  ];

  return (
    <div className="sticky top-0 z-40 w-full flex flex-col">
      {isOffline && (
        <div className="bg-rose-500 text-white text-center py-1.5 px-4 text-[10px] font-black tracking-wide flex items-center justify-center gap-2 select-none border-b border-rose-600 animate-fadeIn shrink-0">
          <WifiOff className="h-3.5 w-3.5 animate-pulse text-white" />
          <span>RUNNING IN OFFLINE SANDBOX MODE — NEW TRANSACTIONS ARE TEMPORARILY BLOCKED TO PREVENT DATA LOSS</span>
          <button 
            onClick={onToggleOffline}
            className="ml-3 px-2.5 py-0.5 bg-rose-700 hover:bg-rose-800 text-white text-[9px] font-black rounded-md border border-rose-400/30 transition-all cursor-pointer"
          >
            Go Online
          </button>
        </div>
      )}
      <header className="bg-white border-b border-slate-200/80 shadow-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center gap-2.5">
              {onMenuToggle && (
                <button
                  onClick={onMenuToggle}
                  className="p-1.5 -ml-1 mr-0.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex md:hidden items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors shrink-0"
                  id="hamburger-menu-btn"
                  aria-label="Toggle navigation menu"
                >
                  <Menu className="h-6 w-6" />
                </button>
              )}
              <img src="/favicon.svg" alt="Learner's Den Logo" className="h-11 w-11 object-contain select-none filter drop-shadow-sm" referrerPolicy="no-referrer" />
              <div>
                <h1 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                  Learner's Den <span className="text-xxxxs sm:text-xxs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">ERP + LMS</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Learner's Den Intelligence</p>
              </div>
            </div>

            {/* Persona Switcher - Only visible if current logged-in user is an Admin */}
            {currentUser?.role === 'admin' && (
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-[150px] xs:max-w-[200px] sm:max-w-[320px] md:max-w-[480px] lg:max-w-[650px] xl:max-w-none scrollbar-none shrink mx-2">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isActive = currentRole === role.value;
                  return (
                    <button
                      key={role.value}
                      onClick={() => onChangeRole(role.value)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all duration-200 shrink-0 ${
                        isActive
                          ? `${role.bg} shadow-xxs scale-102`
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      id={`role-btn-${role.value}`}
                    >
                      <Icon className="h-3 w-3" />
                      <span className="hidden sm:inline">{role.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Right Status / Logout badge */}
            <div className="flex items-center gap-3">
              {/* Connection Status Indicator Toggle */}
              <button
                onClick={onToggleOffline}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black tracking-tight border transition-all duration-200 cursor-pointer ${
                  isOffline
                    ? 'bg-rose-50 border-rose-150 text-rose-700 animate-pulse'
                    : 'bg-emerald-50/50 border-emerald-100 text-emerald-700 hover:bg-emerald-100/50'
                }`}
                title={isOffline ? "Currently Offline. Click to reconnect." : "Currently Online. Click to simulate Offline Mode."}
              >
                {isOffline ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                    <WifiOff className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden md:inline">Offline Mode</span>
                  </>
                ) : (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <Wifi className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden md:inline">Online</span>
                  </>
                )}
              </button>

              {currentUser && (
                <div className="flex items-center gap-2.5">
                  <div className="relative group cursor-pointer select-none" onClick={handleAvatarClick} title="Tap to Upload/Replace Profile Picture">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept="image/*" 
                    />
                    {currentUser.avatarUrl ? (
                      <img 
                        src={currentUser.avatarUrl} 
                        alt={currentUser.name} 
                        className={`w-8 h-8 rounded-full object-cover border border-slate-250 shrink-0 shadow-xxs transition-opacity ${isUploading ? 'opacity-40' : 'group-hover:opacity-80'}`}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className={`w-8 h-8 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-600 flex items-center justify-center border border-indigo-200 shrink-0 shadow-xxs transition-opacity ${isUploading ? 'opacity-40' : ''}`}>
                        <span className="text-xs font-black">{currentUser.name[0].toUpperCase()}</span>
                      </div>
                    )}
                    
                    {/* Camera icon hover indicator */}
                    <div className="absolute inset-0 bg-indigo-950/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <Camera className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-xs font-black text-slate-700 leading-tight">{currentUser.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 capitalize">{currentUser.role} Account</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 text-rose-700 rounded-xl text-xs font-bold transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

