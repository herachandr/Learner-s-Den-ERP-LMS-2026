import React, { useState, useRef, useEffect } from 'react';
import { 
  GraduationCap, Lock, Mail, User, UserCheck, ShieldCheck, 
  ArrowRight, Sparkles, Loader2, Phone, BookOpen, KeyRound, 
  ArrowLeft, Smartphone, Check, Power, Users, Briefcase,
  Building, Coins, Library, Calendar, HelpCircle
} from 'lucide-react';
import { AppUser, Batch, UserRole } from '../types';

interface LoginProps {
  batches: Batch[];
  onLoginSuccess: (user: AppUser) => void;
}

export default function Login({ batches, onLoginSuccess }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  
  // Extra fields for Teacher/Student
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [parentName, setParentName] = useState('');
  const [batchId, setBatchId] = useState('');
  const [sandboxCategory, setSandboxCategory] = useState<'core' | 'support'>('core');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // OTP Verification States
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '']);
  const [pendingUserData, setPendingUserData] = useState<any>(null);

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const getDeviceId = () => {
    try {
      let id = localStorage.getItem('den_device_id');
      if (!id) {
        id = 'device-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('den_device_id', id);
      }
      return id;
    } catch (e) {
      console.warn("localStorage not accessible, using fallback memory-based ID:", e);
      return 'device-temp-' + Math.random().toString(36).substring(2, 15);
    }
  };

  const handleQuickLogin = (roleEmail: string, rolePass: string) => {
    setError('');
    setSuccess('');
    setLoading(true);
    const deviceId = getDeviceId();

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: roleEmail, password: rolePass, deviceId })
    })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Quick login failed');
      }

      if (data.requiresOtp) {
        setOtpRequired(true);
        setPendingUserData({ ...data, email: roleEmail });
        setSuccess('Security Verification Required: A 5-digit verification code has been generated.');
      } else {
        onLoginSuccess(data);
      }
    })
    .catch((err) => {
      setError(err.message || 'Failed to log in with quick credentials.');
    })
    .finally(() => {
      setLoading(false);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up Flow
        const payload: any = { email, password, name, role };
        if (role === 'teacher') {
          payload.phone = phone;
          payload.subject = subject || 'General';
        } else if (role === 'student') {
          payload.phone = phone;
          payload.parentName = parentName;
          payload.batchId = batchId;
        } else if (role === 'parent' || role === 'job_seeker') {
          payload.phone = phone;
        }

        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Signup failed');
        }
        setSuccess('Account created successfully! Let\'s sign you in...');
        
        // After signup, automatically initiate login flow to support device verification
        setTimeout(() => {
          handleQuickLogin(email, password);
        }, 1200);
      } else {
        // Login Flow
        const deviceId = getDeviceId();
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, deviceId })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Invalid email or password');
        }

        if (data.requiresOtp) {
          setOtpRequired(true);
          setPendingUserData({ ...data, email });
          setSuccess('Security Verification Required: A 5-digit verification code has been generated.');
        } else {
          onLoginSuccess(data);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (/^[0-9]?$/.test(val)) {
      const newDigits = [...otpDigits];
      newDigits[idx] = val;
      setOtpDigits(newDigits);

      if (val && idx < 4) {
        otpRefs[idx + 1].current?.focus();
      }
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      otpRefs[idx - 1].current?.focus();
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const otpCode = otpDigits.join('');
    if (otpCode.length !== 5) {
      setError('Please enter all 5 digits of your verification code.');
      setLoading(false);
      return;
    }

    try {
      const deviceId = getDeviceId();
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingUserData.email, otp: otpCode, deviceId })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Verification failed. Please check the code and try again.');
      }

      setSuccess('Device authorized successfully! Logging in...');
      setTimeout(() => {
        onLoginSuccess(data);
      }, 800);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setOtpRequired(false);
    setOtpDigits(['', '', '', '', '']);
    setPendingUserData(null);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative">
      
      {/* Real-time simulated email popup */}
      {otpRequired && pendingUserData?.debugOtp && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-[90%] bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl p-4 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-4 w-4 text-indigo-400 animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300">SMTP Sandbox Delivery</span>
          </div>
          <p className="text-[11px] font-semibold text-slate-300">
            From: <span className="text-slate-100 font-bold">security@learnersden.edu</span>
          </p>
          <p className="text-[11px] font-semibold text-slate-300 mb-2">
            To: <span className="text-slate-100 font-bold">{pendingUserData.email}</span>
          </p>
          <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-center">
            <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-extrabold mb-1">Device Auth Code</span>
            <span className="text-xl font-mono font-black tracking-widest text-indigo-400">{pendingUserData.debugOtp}</span>
          </div>
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img src="/favicon.svg" alt="Learner's Den Logo" className="h-16 w-16 object-contain select-none filter drop-shadow-md" referrerPolicy="no-referrer" />
        </div>
        <h2 className="mt-6 text-center text-2xl font-black text-slate-800 tracking-tight">
          {otpRequired ? 'Verify Your Device' : isSignUp ? 'Create your ERP + LMS Account' : "Sign in to Learner's Den"}
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-400 font-semibold">
          {otpRequired ? 'Multi-Factor Device Authorization' : 'Professional Education Management & AI Study Workspace'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-200/80 shadow-md sm:rounded-2xl sm:px-10">
          
          {/* OTP Verification Screen */}
          {otpRequired ? (
            <div className="space-y-6">
              <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl text-center space-y-2">
                <KeyRound className="h-8 w-8 text-indigo-600 mx-auto animate-pulse" />
                <h3 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider">Device Verification Required</h3>
                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                  First-time logins from a new device require authorization. Enter the 5-digit verification code sent to <b className="text-slate-700">{pendingUserData?.email}</b> below.
                </p>
              </div>

              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-600 shrink-0"></span>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-700 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0 animate-pulse"></span>
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtpSubmit} className="space-y-5">
                <div className="flex justify-between gap-2.5">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={otpRefs[i]}
                      type="text"
                      maxLength={1}
                      required
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 text-center text-lg font-black font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-xs text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all focus:outline-none disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>Authorize & Enter Workspace</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full flex justify-center items-center gap-1.5 py-1.5 text-xxs font-extrabold text-slate-500 hover:text-slate-800 transition-all"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to login screen</span>
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError('');
                  }}
                  className={`w-1/2 py-2 text-xs font-bold rounded-lg transition-all ${
                    !isSignUp ? 'bg-white text-indigo-600 shadow-xxs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setError('');
                  }}
                  className={`w-1/2 py-2 text-xs font-bold rounded-lg transition-all ${
                    isSignUp ? 'bg-white text-indigo-600 shadow-xxs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse shrink-0"></span>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-700 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0"></span>
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <>
                    {/* Name */}
                    <div>
                      <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <div className="relative rounded-md shadow-xxs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Jane Doe"
                          className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        I am a...
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="block w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="admin">Administrator (ERP)</option>
                        <option value="principal">Principal / Director</option>
                        <option value="teacher">Instructor (LMS)</option>
                        <option value="student">Student Portal</option>
                        <option value="parent">Parent Account</option>
                        <option value="office_staff">Office Staff</option>
                        <option value="accountant">Accountant</option>
                        <option value="librarian">Librarian</option>
                        <option value="receptionist">Receptionist</option>
                        <option value="alumni">Alumni</option>
                        <option value="guest">Guest / Visitor</option>
                        <option value="job_seeker">Job Seeker Account</option>
                      </select>
                    </div>

                    {/* Role specific inputs */}
                    {(role === 'parent' || role === 'job_seeker' || role === 'principal' || role === 'office_staff' || role === 'accountant' || role === 'librarian' || role === 'receptionist' || role === 'alumni' || role === 'guest') && (
                      <div className="space-y-4 animate-fadeIn">
                        <div>
                          <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Phone Number
                          </label>
                          <div className="relative rounded-md shadow-xxs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Phone className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                              type="tel"
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+91 98765 43210"
                              className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {role === 'teacher' && (
                      <div className="space-y-4 animate-fadeIn">
                        <div>
                          <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Phone Number
                          </label>
                          <div className="relative rounded-md shadow-xxs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Phone className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                              type="tel"
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+91 98765 43210"
                              className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Subject / Specialty
                          </label>
                          <div className="relative rounded-md shadow-xxs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <BookOpen className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                              type="text"
                              required
                              value={subject}
                              onChange={(e) => setSubject(e.target.value)}
                              placeholder="Physics / Calculus"
                              className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {role === 'student' && (
                      <div className="space-y-4 animate-fadeIn">
                        <div>
                          <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Phone Number
                          </label>
                          <div className="relative rounded-md shadow-xxs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Phone className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                              type="tel"
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+91 98765 43210"
                              className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Parent / Guardian Name
                          </label>
                          <div className="relative rounded-md shadow-xxs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                              type="text"
                              required
                              value={parentName}
                              onChange={(e) => setParentName(e.target.value)}
                              placeholder="Parent Name"
                              className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Enroll in Batch
                          </label>
                          {batches.length === 0 ? (
                            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800 font-semibold leading-normal">
                              ⚠️ No academic batches scheduled yet. If you are starting fresh, please sign up as an <b>Administrator</b> first to build the course catalog.
                            </div>
                          ) : (
                            <select
                              required
                              value={batchId}
                              onChange={(e) => setBatchId(e.target.value)}
                              className="block w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="">-- Select Batch --</option>
                              {batches.map((b) => (
                                <option key={b.id} value={b.id}>
                                  {b.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Email Address */}
                <div>
                  <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative rounded-md shadow-xxs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative rounded-md shadow-xxs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-xs text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>{isSignUp ? 'Create ERP Account' : 'Authenticate Credentials'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
