import React, { useState, useRef } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  BookOpen, 
  KeyRound, 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  LockKeyhole
} from 'lucide-react';
import { UserRole } from '../types';

interface LoginProps {
  batches: Array<{ id: string; name: string }>;
  onLoginSuccess: (userData: any) => void;
}

export default function Login({ batches, onLoginSuccess }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  
  // Extra fields for Registration
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [parentName, setParentName] = useState('');
  const [batchId, setBatchId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // OTP Verification for Logins
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']); // 6-digit OTP
  const [pendingUserData, setPendingUserData] = useState<any>(null);

  // CAPTCHA States
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaChallengeId, setCaptchaChallengeId] = useState('');

  // Forgot Password Screen State machine
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [forgotPasswordTempToken, setForgotPasswordTempToken] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');

  // Sign up verification step
  const [signupOtpRequired, setSignupOtpRequired] = useState(false);
  const [signupPayload, setSignupPayload] = useState<any>(null);
  const [signupOtpDigits, setSignupOtpDigits] = useState<string[]>(['', '', '', '', '', '']);

  // Refs for OTP Input elements
  const loginOtpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const forgotOtpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const signupOtpRefs = [
    useRef<HTMLInputElement>(null),
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
      console.warn("localStorage not accessible, using fallback ID:", e);
      return 'device-temp-' + Math.random().toString(36).substring(2, 15);
    }
  };

  const handleOtpChange = (
    idx: number, 
    val: string, 
    digits: string[], 
    setDigits: React.Dispatch<React.SetStateAction<string[]>>, 
    refs: React.RefObject<HTMLInputElement | null>[]
  ) => {
    if (/^[0-9]?$/.test(val)) {
      const newDigits = [...digits];
      newDigits[idx] = val;
      setDigits(newDigits);

      if (val && idx < 5) {
        refs[idx + 1].current?.focus();
      }
    }
  };

  const handleOtpKeyDown = (
    idx: number, 
    e: React.KeyboardEvent<HTMLInputElement>, 
    digits: string[], 
    refs: React.RefObject<HTMLInputElement | null>[]
  ) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      refs[idx - 1].current?.focus();
    }
  };

  const handleQuickLogin = (roleEmail: string, rolePass: string) => {
    setError('');
    setSuccess('');
    setLoading(true);
    setCaptchaRequired(false);
    const deviceId = getDeviceId();

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: roleEmail, password: rolePass, deviceId })
    })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        if (data.requiresCaptcha) {
          setCaptchaRequired(true);
          setCaptchaQuestion(data.captchaQuestion || 'What is 5 + 3?');
          setCaptchaChallengeId(data.challengeId || '');
        }
        throw new Error(data.error || 'Quick login failed');
      }

      if (data.requiresOtp) {
        setOtpRequired(true);
        setPendingUserData({ ...data, email: roleEmail });
        setSuccess('Security Verification Required: A 6-digit secure authorization code was generated.');
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

  // Central submission handler for standard Login & Sign Up
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Client-side input validation
        if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          throw new Error('Please enter a valid email address (e.g. name@domain.com).');
        }
        if (!password || password.length < 8) {
          throw new Error('For security, passwords must be at least 8 characters long.');
        }
        if (!/(?=.*[0-9])(?=.*[a-zA-Z])/.test(password)) {
          throw new Error('Password must contain both letters and numbers for higher complexity.');
        }
        if (phone && !/^\+?[0-9\s\-]{8,15}$/.test(phone)) {
          throw new Error('Please enter a valid phone number (8-15 digits).');
        }
        if (!name || name.trim().length < 2) {
          throw new Error('Please enter a valid full name (at least 2 characters).');
        }
        if (role === 'student' && (!parentName || parentName.trim().length < 2)) {
          throw new Error('Parent or guardian full name is required for student registration.');
        }

        // Sign Up Initiate Flow
        const payload: any = { email, password, name, role };
        if (role === 'teacher') {
          payload.phone = phone;
          payload.subject = subject || 'General';
        } else if (role === 'student') {
          payload.phone = phone;
          payload.parentName = parentName;
          payload.batchId = batchId;
        } else {
          payload.phone = phone || '';
        }

        const response = await fetch('/api/auth/signup/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Account registration initiation failed');
        }

        setSignupPayload(payload);
        setSignupOtpRequired(true);
        setSuccess('Verification OTP sent to your registered mobile number! Please check your messages.');
        if (data.debugOtp) {
          // Keep a reference to show in the simulated delivery popup
          setPendingUserData({ debugOtp: data.debugOtp, email });
        }
      } else {
        // Normal Login Flow
        const deviceId = getDeviceId();
        const reqBody: any = { email, password, deviceId };
        
        if (captchaRequired) {
          reqBody.captchaAnswer = captchaAnswer;
          reqBody.captchaChallengeId = captchaChallengeId;
        }

        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reqBody)
        });
        const data = await response.json();
        
        if (!response.ok) {
          if (data.requiresCaptcha) {
            setCaptchaRequired(true);
            setCaptchaQuestion(data.captchaQuestion || 'What is 4 + 7?');
            setCaptchaChallengeId(data.challengeId || '');
            setCaptchaAnswer('');
          }
          throw new Error(data.error || 'Invalid credentials or validation issue');
        }

        // Successfully authenticated!
        if (data.requiresOtp) {
          setOtpRequired(true);
          setPendingUserData({ ...data, email });
          setSuccess('Security Verification Required: Enter the 6-digit authorization code.');
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

  // Verify Login OTP
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
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

      setSuccess('Device authorized successfully! Redirecting...');
      setTimeout(() => {
        onLoginSuccess(data);
      }, 800);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify Signup OTP and finalize account creation
  const handleVerifySignupOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const otpCode = signupOtpDigits.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits of the signup OTP.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...signupPayload,
          otp: otpCode
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed for signup. Please request a new one.');
      }

      setSuccess('Account created and verified successfully! Authenticating device...');
      setTimeout(() => {
        // Automatically sign in
        handleQuickLogin(email, password);
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password flow 
  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!forgotPasswordEmail) {
      setError('Please enter your registered email address.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Forgot password request failed.');
      }

      setForgotPasswordStep('verify');
      setSuccess('A 6-digit recovery OTP has been sent to your registered mobile/email.');
      if (data.debugOtp) {
        setPendingUserData({ debugOtp: data.debugOtp, email: forgotPasswordEmail });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const otpCode = forgotPasswordOtp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit recovery OTP.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail, otp: otpCode })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Invalid or expired recovery OTP.');
      }

      setForgotPasswordTempToken(data.tempToken);
      setForgotPasswordStep('reset');
      setSuccess('OTP validated! Please enter your new password.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (newResetPassword !== confirmResetPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (newResetPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: forgotPasswordEmail, 
          tempToken: forgotPasswordTempToken, 
          newPassword: newResetPassword 
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      setSuccess('Password reset successfully! You can now log in with your new password.');
      setTimeout(() => {
        setIsForgotPassword(false);
        setForgotPasswordStep('request');
        setForgotPasswordEmail('');
        setForgotPasswordOtp(['', '', '', '', '', '']);
        setNewResetPassword('');
        setConfirmResetPassword('');
        setEmail(forgotPasswordEmail);
        setPassword('');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setOtpRequired(false);
    setSignupOtpRequired(false);
    setIsForgotPassword(false);
    setOtpDigits(['', '', '', '', '', '']);
    setSignupOtpDigits(['', '', '', '', '', '']);
    setPendingUserData(null);
    setSignupPayload(null);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative">
      
      {/* Real-time simulated OTP delivery sandbox popup */}
      {pendingUserData?.debugOtp && (
        <div id="otp-sandbox-popup" className="fixed top-4 right-4 z-50 max-w-sm w-[90%] bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl p-4 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-4 w-4 text-indigo-400 animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300">SMTP & SMS Gateway Sandbox</span>
          </div>
          <p className="text-[11px] font-semibold text-slate-300">
            Recipient: <span className="text-slate-100 font-bold">{pendingUserData.email}</span>
          </p>
          <div className="bg-slate-800 mt-2 p-2.5 rounded-xl border border-slate-700 text-center">
            <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-extrabold mb-1">Generated 6-Digit OTP</span>
            <span className="text-2xl font-mono font-black tracking-widest text-emerald-400 select-all">{pendingUserData.debugOtp}</span>
          </div>
          <p className="text-[9px] text-slate-500 mt-1.5 text-center leading-normal">
            This secure OTP expires in 5 minutes. Real deployments integrate direct SMS alerts.
          </p>
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img src="/favicon.svg" alt="Learner's Den Logo" className="h-16 w-16 object-contain select-none filter drop-shadow-md" referrerPolicy="no-referrer" />
        </div>
        <h2 className="mt-6 text-center text-2xl font-black text-slate-800 tracking-tight">
          {otpRequired 
            ? 'Verify Your Device' 
            : signupOtpRequired 
            ? 'Verify Registration OTP' 
            : isForgotPassword 
            ? 'Account Recovery' 
            : isSignUp 
            ? 'Create ERP + LMS Account' 
            : "Sign in to Learner's Den"
          }
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-400 font-semibold">
          {otpRequired || signupOtpRequired 
            ? 'Multi-Factor Verification Checks' 
            : isForgotPassword 
            ? 'SMS OTP Password Reset' 
            : 'Professional Education Management & AI Study Workspace'
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-200/80 shadow-md sm:rounded-2xl sm:px-10">
          
          {/* LOGIN OTP VERIFICATION SCREEN */}
          {otpRequired && (
            <div className="space-y-6">
              <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl text-center space-y-2">
                <KeyRound className="h-8 w-8 text-indigo-600 mx-auto animate-pulse" />
                <h3 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider">Device Verification Required</h3>
                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                  First-time logins from a new device require authorization. Enter the 6-digit verification code sent to <b className="text-slate-700">{pendingUserData?.email}</b> below.
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
                <div className="flex justify-between gap-1.5">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={loginOtpRefs[i]}
                      type="text"
                      maxLength={1}
                      required
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value, otpDigits, setOtpDigits, loginOtpRefs)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e, otpDigits, loginOtpRefs)}
                      className="w-10 h-12 text-center text-lg font-black font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-xs text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all focus:outline-none disabled:opacity-50 cursor-pointer"
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
          )}

          {/* SIGNUP OTP VERIFICATION SCREEN */}
          {!otpRequired && signupOtpRequired && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-50/40 border border-amber-100 rounded-2xl text-center space-y-2">
                <ShieldCheck className="h-8 w-8 text-amber-600 mx-auto animate-pulse" />
                <h3 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">SMS OTP Verification</h3>
                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                  Enter the 6-digit OTP sent to your phone number <b className="text-slate-700">{signupPayload?.phone}</b> to complete your registration.
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

              <form onSubmit={handleVerifySignupOtpSubmit} className="space-y-5">
                <div className="flex justify-between gap-1.5">
                  {signupOtpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={signupOtpRefs[i]}
                      type="text"
                      maxLength={1}
                      required
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value, signupOtpDigits, setSignupOtpDigits, signupOtpRefs)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e, signupOtpDigits, signupOtpRefs)}
                      className="w-10 h-12 text-center text-lg font-black font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-xs text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all focus:outline-none disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>Verify OTP & Complete Signup</span>
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
                  <span>Back to registration forms</span>
                </button>
              </form>
            </div>
          )}

          {/* FORGOT PASSWORD SCREEN */}
          {!otpRequired && !signupOtpRequired && isForgotPassword && (
            <div className="space-y-6">
              <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl text-center space-y-2">
                <LockKeyhole className="h-8 w-8 text-indigo-600 mx-auto" />
                <h3 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider">Account Password Recovery</h3>
                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                  {forgotPasswordStep === 'request' && 'Enter your registered email below. We will send a secure 6-digit OTP to verify identity.'}
                  {forgotPasswordStep === 'verify' && `Enter the 6-digit verification code sent to ${forgotPasswordEmail}.`}
                  {forgotPasswordStep === 'reset' && 'Define a new secure password for your account.'}
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

              {forgotPasswordStep === 'request' && (
                <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
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
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        placeholder="yourname@learnersden.edu"
                        className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-xs text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all focus:outline-none disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span>Send Recovery Code</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {forgotPasswordStep === 'verify' && (
                <form onSubmit={handleForgotPasswordVerify} className="space-y-5">
                  <div className="flex justify-between gap-1.5">
                    {forgotPasswordOtp.map((digit, i) => (
                      <input
                        key={i}
                        ref={forgotOtpRefs[i]}
                        type="text"
                        maxLength={1}
                        required
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value, forgotPasswordOtp, setForgotPasswordOtp, forgotOtpRefs)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e, forgotPasswordOtp, forgotOtpRefs)}
                        className="w-10 h-12 text-center text-lg font-black font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-xs text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all focus:outline-none disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span>Verify OTP</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {forgotPasswordStep === 'reset' && (
                <form onSubmit={handleForgotPasswordReset} className="space-y-4">
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      New Password
                    </label>
                    <div className="relative rounded-md shadow-xxs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="password"
                        required
                        value={newResetPassword}
                        onChange={(e) => setNewResetPassword(e.target.value)}
                        placeholder="••••••••"
                        className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative rounded-md shadow-xxs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="password"
                        required
                        value={confirmResetPassword}
                        onChange={(e) => setConfirmResetPassword(e.target.value)}
                        placeholder="••••••••"
                        className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-xs text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all focus:outline-none disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span>Update Password</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full flex justify-center items-center gap-1.5 py-1.5 text-xxs font-extrabold text-slate-500 hover:text-slate-800 transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to login screen</span>
              </button>
            </div>
          )}

          {/* STANDARD SIGN-IN AND SIGN-UP SCREENS */}
          {!otpRequired && !signupOtpRequired && !isForgotPassword && (
            <>
              {/* Login / Signup Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError('');
                    setSuccess('');
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
                    setSuccess('');
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
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 animate-bounce" />
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
                          placeholder="John Doe"
                          className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Select Role
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

                    {/* Phone Number (Required for MFA & SMS verification) */}
                    <div>
                      <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Mobile Number (for SMS OTP)
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

                    {/* Subject for Teachers */}
                    {role === 'teacher' && (
                      <div className="space-y-4 animate-fadeIn">
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

                    {/* Student inputs */}
                    {role === 'student' && (
                      <div className="space-y-4 animate-fadeIn">
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
                              ⚠️ No academic batches scheduled yet. Administrators must build the course catalog first.
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
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">
                      Password
                    </label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setForgotPasswordStep('request');
                          setError('');
                          setSuccess('');
                        }}
                        className="text-xxs font-extrabold text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
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

                {/* Secure CAPTCHA challenge section if enforced */}
                {captchaRequired && (
                  <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2 animate-fade-in">
                    <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xxs uppercase tracking-wider">
                      <ShieldCheck className="h-4 w-4 text-indigo-600" />
                      <span>Security Validation Challenge</span>
                    </div>
                    <p className="text-xxs text-slate-500 font-semibold">
                      Too many failed attempts. Solve this to authenticate:
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black tracking-widest bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                        {captchaQuestion}
                      </span>
                      <input
                        type="text"
                        required
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        placeholder="Answer"
                        className="w-24 px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}

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

              {/* DEMO / QUICK ACCESS SANDBOX CREDENTIALS PANELS */}
              {!isSignUp && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-[10px] text-center font-extrabold uppercase tracking-widest text-slate-400 mb-3.5">
                    Quick Sandbox Access Switches
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('admin@learnersden.edu', 'admin123')}
                      className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg text-[10px] font-bold text-slate-700 transition-all text-left flex items-center justify-between"
                    >
                      <span>Admin ERP</span>
                      <span className="text-[9px] text-indigo-500 font-extrabold">Auto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('principal@learnersden.edu', 'principal123')}
                      className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg text-[10px] font-bold text-slate-700 transition-all text-left flex items-center justify-between"
                    >
                      <span>Principal</span>
                      <span className="text-[9px] text-indigo-500 font-extrabold">Auto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('teacher@learnersden.edu', 'teacher123')}
                      className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg text-[10px] font-bold text-slate-700 transition-all text-left flex items-center justify-between"
                    >
                      <span>Instructor</span>
                      <span className="text-[9px] text-indigo-500 font-extrabold">Auto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('student@learnersden.edu', 'student123')}
                      className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg text-[10px] font-bold text-slate-700 transition-all text-left flex items-center justify-between"
                    >
                      <span>Student</span>
                      <span className="text-[9px] text-indigo-500 font-extrabold">Auto</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
