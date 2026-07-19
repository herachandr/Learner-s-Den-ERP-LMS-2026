import React, { useState, useRef } from 'react';
import { Camera, UploadCloud, Trash2, Check, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { AppUser } from '../types';
import { authService } from '../services/authService';

interface PassportPhotoUploadProps {
  currentUser: AppUser;
  onUpdateUser: (updatedUser: AppUser) => void;
  showToast: (title: string, desc: string) => void;
  isOffline: boolean;
}

export default function PassportPhotoUpload({
  currentUser,
  onUpdateUser,
  showToast,
  isOffline
}: PassportPhotoUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUser.avatarUrl || null);
  const [uploading, setUploading] = useState(false);
  const [cropGuide, setCropGuide] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const compressAndResizeImage = (base64Str: string, maxWidth = 150, maxHeight = 200): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.7); // 70% quality JPEG compression
          resolve(compressed);
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => resolve(base64Str);
      img.src = base64Str;
    });
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Invalid File Type", "Please select a professional passport image file (.jpg, .png, .jpeg).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast("File Too Large", "Passport photos must be under 2MB for ERP storage optimization.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setUploading(true);
      try {
        const compressedBase64 = await compressAndResizeImage(base64);
        setPreviewUrl(compressedBase64);
        await uploadPhoto(compressedBase64);
      } catch (err) {
        console.error("Client-side compression failed, uploading raw:", err);
        setPreviewUrl(base64);
        await uploadPhoto(base64);
      } finally {
        setUploading(false);
      }
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const uploadPhoto = async (base64String: string) => {
    if (isOffline) {
      showToast("Offline Block", "Cannot save profile photo changes while running offline.");
      return;
    }

    setUploading(true);
    try {
      const data = await authService.uploadPassportPhoto(currentUser.id, base64String);
      onUpdateUser({ ...currentUser, avatarUrl: data.photoUrl });
      showToast("DP Updated", "Your official passport-sized DP has been synchronized with the academic roster.");
    } catch (e) {
      console.error(e);
      showToast("Sync Error", "Could not synchronize passport photo to secure server.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (isOffline) {
      showToast("Offline Block", "Cannot remove photo while running in offline sandbox.");
      return;
    }

    if (!confirm("Are you sure you want to remove your official passport portrait? This will return it to default placeholder initials.")) {
      return;
    }

    setUploading(true);
    try {
      await authService.uploadPassportPhoto(currentUser.id, ""); // Empty string removes it
      onUpdateUser({ ...currentUser, avatarUrl: "" });
      setPreviewUrl(null);
      showToast("DP Removed", "Official identity photo removed. Initials restored.");
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div id="passport-photo-uploader-card" className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xxs text-left">
      <div className="flex justify-between items-start gap-4 mb-3 border-b border-slate-100 pb-2">
        <div>
          <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
            <Camera className="h-4 w-4 text-indigo-600" />
            <span>Official Identity Portrait</span>
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Maintain a high-quality, professional passport-sized photo for student lists & attendance cards.</p>
        </div>
        {previewUrl && (
          <button
            onClick={handleRemovePhoto}
            disabled={uploading}
            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-all disabled:opacity-50"
            title="Remove portrait"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {currentUser.photoStatus === 'rejected' && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-150 rounded-xl flex items-start gap-2.5 text-rose-700 text-xxs font-semibold leading-relaxed animate-fadeIn">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-black text-rose-800 text-[10px] uppercase tracking-wider">⚠️ Passport Portrait Rejected</p>
            <p className="mt-0.5 font-bold">Reason: <span className="underline italic">{currentUser.photoRejectionReason || "Inappropriate / Obscene / Blur photo"}</span></p>
            <p className="mt-1 text-[9px] text-rose-500">Please re-upload a decent, clear passport-size portrait showing your face clearly with a neutral background.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-5 items-center justify-between">
        {/* Aspect Ratio Box (Passport Booth mockup) */}
        <div className="relative w-28 h-36 border border-slate-300 bg-slate-50 rounded-xl overflow-hidden shadow-inner flex items-center justify-center shrink-0">
          {previewUrl ? (
            <div className="w-full h-full relative group">
              <img
                src={previewUrl}
                alt="Passport preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {cropGuide && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center border-2 border-indigo-500/30">
                  {/* Oval Guideline */}
                  <div className="w-[80%] h-[80%] border border-dashed border-white/60 rounded-full flex flex-col justify-center items-center">
                    <div className="w-[110%] h-0 border-t border-dashed border-white/40 mt-[30%]" /> {/* Eye Line */}
                  </div>
                </div>
              )}
              {/* Overlay hover tag */}
              <div className="absolute inset-x-0 bottom-0 bg-slate-900/60 backdrop-blur-xs text-white text-[8px] font-black tracking-widest text-center py-1 select-none">
                {currentUser.photoStatus === 'pending' ? 'PENDING MODERATION' : 'OFFICIAL DP'}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-slate-300 select-none">
              <div className="w-16 h-16 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center bg-white shadow-xxs">
                <Camera className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-[8px] font-black tracking-wider text-slate-400 mt-2 uppercase">Passport 35x45mm</p>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center">
              <span className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Drag & Drop Area */}
        <div className="flex-1 w-full">
          <form
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onSubmit={(e) => e.preventDefault()}
            className={`border-2 border-dashed rounded-xl p-4 transition-all flex flex-col items-center justify-center text-center ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50/50 scale-102'
                : 'border-slate-250 bg-slate-50/30 hover:border-indigo-400 hover:bg-slate-50/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleChange}
              id="passport-file-input"
            />
            <UploadCloud className={`h-8 w-8 ${dragActive ? 'text-indigo-600 animate-bounce' : 'text-slate-400'} mb-2`} />
            <p className="text-[11px] font-bold text-slate-700">
              Drag & drop your passport photo here, or{" "}
              <button
                type="button"
                onClick={onButtonClick}
                className="text-indigo-600 hover:underline font-black cursor-pointer"
              >
                browse files
              </button>
            </p>
            <p className="text-[9px] text-slate-400 font-medium mt-1">Aspect ratio approx. 3:4 or 4:5. Max 2MB (JPEG, PNG).</p>

            <div className="mt-3.5 flex items-center gap-4 justify-center">
              <label className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={cropGuide}
                  onChange={(e) => setCropGuide(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Show Alignment Face Guide
              </label>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-4 p-2.5 bg-indigo-50/40 border border-indigo-100 rounded-xl flex items-center gap-2 text-[9px] text-indigo-700 font-bold">
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
        <span>Your Display Picture (DP) automatically populates across your ID badges, LMS leaderboards, and center rosters!</span>
      </div>
    </div>
  );
}
