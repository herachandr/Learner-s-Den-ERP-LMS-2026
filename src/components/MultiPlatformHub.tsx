import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Laptop,
  Tv,
  Tablet,
  Download,
  Wifi,
  WifiOff,
  Bell,
  Fingerprint,
  MapPin,
  QrCode,
  CheckCircle,
  HelpCircle,
  Shield,
  Chrome,
  Compass,
  Monitor,
  Activity,
  UserCheck,
  Zap,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';

interface MultiPlatformHubProps {
  onSimulateNotification: (message: string, title: string) => void;
  simulatedPlatform: 'pc' | 'ios' | 'android';
  onChangePlatform: (platform: 'pc' | 'ios' | 'android') => void;
}

export default function MultiPlatformHub({
  onSimulateNotification,
  simulatedPlatform,
  onChangePlatform
}: MultiPlatformHubProps) {
  const [activeTab, setActiveTab] = useState<'install' | 'bridge' | 'about'>('install');
  const [detectedOS, setDetectedOS] = useState<string>('Detecting...');
  
  // Simulated hardware state
  const [isGpsInside, setIsGpsInside] = useState<boolean>(true);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [biometricScanning, setBiometricScanning] = useState<boolean>(false);
  const [biometricStatus, setBiometricStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [qrScanning, setQrScanning] = useState<boolean>(false);
  const [qrStatus, setQrStatus] = useState<string>('');

  useEffect(() => {
    const userAgent = navigator.userAgent;
    if (/android/i.test(userAgent)) {
      setDetectedOS('Android Device');
    } else if (/iPad|iPhone|iPod/.test(userAgent)) {
      setDetectedOS('Apple iOS Device');
    } else if (/Macintosh/i.test(userAgent)) {
      setDetectedOS('macOS (PC/Desktop)');
    } else if (/Windows/i.test(userAgent)) {
      setDetectedOS('Windows (PC/Desktop)');
    } else if (/Linux/i.test(userAgent)) {
      setDetectedOS('Linux (PC/Desktop)');
    } else {
      setDetectedOS('PC / Web Browser');
    }
  }, []);

  // Trigger simulated push alerts
  const handleTriggerAlert = (type: 'fees' | 'test' | 'payroll' | 'checkin') => {
    if (type === 'fees') {
      onSimulateNotification(
        '₹ Fee Invoice: Dear Ananya, monthly coaching fees of ₹1,500 are outstanding for Batch JEE-2026 Elite A.',
        'Outstanding Fee Alert'
      );
    } else if (type === 'test') {
      onSimulateNotification(
        '📚 Mock Test Live: New Physics Chemistry MCQ quiz has been published by Dr. Rajesh Patel.',
        'LMS Mock Exam Online'
      );
    } else if (type === 'payroll') {
      onSimulateNotification(
        '✅ Payroll Credited: Rajesh Patel\'s monthly lecture hours verification has been approved. ₹42,400 disbursed.',
        'Instructor Salary Approved'
      );
    } else {
      onSimulateNotification(
        '📍 GeoCheckin: Student attendance register for JEE-2026 Elite A is open. Please check-in.',
        'Batch Class Starting'
      );
    }
  };

  // Simulate Biometric
  const handleBiometricTest = () => {
    setBiometricScanning(true);
    setBiometricStatus('idle');
    setTimeout(() => {
      setBiometricScanning(false);
      setBiometricStatus('success');
      onSimulateNotification('FaceID / Fingerprint successfully authenticated for secure shift logs.', 'Biometrics Verified');
    }, 1500);
  };

  // Simulate QR Code scanning
  const handleQrScan = () => {
    setQrScanning(true);
    setQrStatus('');
    setTimeout(() => {
      setQrScanning(false);
      setQrStatus('Scanned: LEARNERS_DEN_ROOM_104_QR_TOKEN');
      onSimulateNotification('Successfully scanned Class Wall QR Code. Shift logged at Room 104.', 'QR Verified');
    }, 1200);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm transition-all duration-300">
      {/* Top Banner / Hero section */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 shrink-0 pointer-events-none">
          <Monitor className="h-44 w-44 transform rotate-12" />
        </div>
        <div className="relative z-10">
          <span className="text-xxs font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-200 border border-indigo-400/20">
            Multi-Platform Integration Hub
          </span>
          <h2 className="text-xl font-extrabold mt-2.5 tracking-tight">Responsive, Installable & Native</h2>
          <p className="text-xs text-indigo-200/90 mt-1 max-w-xl">
            Learner's Den operates natively as a Progressive Web App (PWA) across Android, iOS, and PC. Switch platforms and mock native hardware sensors.
          </p>

          {/* Quick Platform Switcher in the Header */}
          <div className="mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-white/10">
            <span className="text-xxs font-bold text-slate-300 uppercase tracking-wider mr-2">Simulate platform layout:</span>
            <button
              onClick={() => onChangePlatform('pc')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xxs font-bold transition-all ${
                simulatedPlatform === 'pc'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Laptop className="h-3.5 w-3.5" />
              <span>PC Desktop</span>
            </button>
            <button
              onClick={() => onChangePlatform('ios')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xxs font-bold transition-all ${
                simulatedPlatform === 'ios'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5 text-rose-400" />
              <span>iPhone iOS</span>
            </button>
            <button
              onClick={() => onChangePlatform('android')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xxs font-bold transition-all ${
                simulatedPlatform === 'android'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
              <span>Android Pixel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Internal Tabs */}
      <div className="flex border-b border-slate-200 px-4">
        <button
          onClick={() => setActiveTab('install')}
          className={`px-4 py-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'install'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Download className="h-4 w-4" />
          <span>PWA Installation Assistants</span>
        </button>
        <button
          onClick={() => setActiveTab('bridge')}
          className={`px-4 py-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'bridge'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Hardware Simulation Bridge</span>
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`px-4 py-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'about'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>Security & Standards</span>
        </button>
      </div>

      <div className="p-6">
        {/* TAB 1: INSTALLATION GUIDES */}
        {activeTab === 'install' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  <Activity className="h-4.5 w-4.5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Smart OS Detection</h4>
                  <p className="text-xxs text-slate-500 mt-0.5">Your browser client OS is identified as: <span className="font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md">{detectedOS}</span></p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xxs font-extrabold uppercase tracking-wide">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>PWA Manifest Registered</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* iOS Guide */}
              <div className="border border-slate-150 rounded-2xl p-5 hover:border-slate-300 transition-all">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
                    <Smartphone className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">iOS App installation</h4>
                    <p className="text-xxs text-slate-400">Apple iPhone & iPad</p>
                  </div>
                </div>

                <ol className="space-y-3 text-xxs font-semibold text-slate-600">
                  <li className="flex gap-2">
                    <span className="h-4.5 w-4.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                    <span>Launch <b>Safari Browser</b> and open this application URL.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="h-4.5 w-4.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                    <span className="flex items-center gap-1.5 flex-wrap">Tap the <Compass className="h-3.5 w-3.5 text-indigo-600" /> Share icon in the browser navigation toolbar.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="h-4.5 w-4.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                    <span>Scroll down and tap <b>"Add to Home Screen"</b>.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="h-4.5 w-4.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                    <span>Confirm name and launch directly from your home screen as a standalone iOS app!</span>
                  </li>
                </ol>
              </div>

              {/* Android Guide */}
              <div className="border border-slate-150 rounded-2xl p-5 hover:border-slate-300 transition-all">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Smartphone className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Android App installation</h4>
                    <p className="text-xxs text-slate-400">Google Pixel, Samsung & Mi</p>
                  </div>
                </div>

                <ol className="space-y-3 text-xxs font-semibold text-slate-600">
                  <li className="flex gap-2">
                    <span className="h-4.5 w-4.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                    <span>Launch <b>Google Chrome</b> on your Android phone.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="h-4.5 w-4.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                    <span className="flex items-center gap-1.5 flex-wrap">Tap the <Chrome className="h-3.5 w-3.5 text-emerald-600" /> three-dots menu on the top-right corner.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="h-4.5 w-4.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                    <span>Select <b>"Install App"</b> or <b>"Add to Home Screen"</b>.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="h-4.5 w-4.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                    <span>Chrome downloads the manifest and installs Learner's Den with deep system launching integrations!</span>
                  </li>
                </ol>
              </div>

              {/* PC Desktop Guide */}
              <div className="border border-slate-150 rounded-2xl p-5 hover:border-slate-300 transition-all">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Laptop className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">PC / Mac Desktop App</h4>
                    <p className="text-xxs text-slate-400">Windows, macOS & Linux</p>
                  </div>
                </div>

                <ol className="space-y-3 text-xxs font-semibold text-slate-600">
                  <li className="flex gap-2">
                    <span className="h-4.5 w-4.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                    <span>Open in <b>Chrome</b>, <b>Edge</b>, or any chromium desktop browser.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="h-4.5 w-4.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                    <span>Look at the browser <b>address bar</b> (top right) for the Install button.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="h-4.5 w-4.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                    <span>Click the <b>"Install App"</b> monitor icon.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="h-4.5 w-4.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                    <span>Saves as a lightweight standalone PC application with system dock launch!</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HARDWARE SIMULATION BRIDGE */}
        {activeTab === 'bridge' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Mock Native Mobile Hardware Bridges</h3>
              <p className="text-xxs text-slate-500 mt-0.5">Test how the application responds to real-time physical device sensors and native hardware configurations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Geofence GPS Simulation */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <MapPin className="h-4.5 w-4.5 text-rose-500" />
                      <span>GPS Satellite Geofencing</span>
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isGpsInside
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {isGpsInside ? 'Inside Geofence' : 'Outside Geofence'}
                    </span>
                  </div>
                  <p className="text-xxs text-slate-500 mb-4 leading-relaxed">
                    Instructors check-in relies on a 200m radius GPS geofence. Toggle coordinates to see if punch-in registers.
                  </p>
                  <div className="p-3 bg-white border border-slate-150 rounded-xl space-y-1 text-[10px] font-mono text-slate-500 mb-4">
                    <p>Latitude: <b className="text-slate-800">{isGpsInside ? '28.6139 (Del_Delhi)' : '12.9716 (Out_Bng)'}</b></p>
                    <p>Longitude: <b className="text-slate-800">{isGpsInside ? '77.2090' : '77.5946'}</b></p>
                    <p>Geofenced Status: <b className={isGpsInside ? 'text-emerald-600' : 'text-amber-600'}>{isGpsInside ? 'Verified inside Learner\'s Den Campus' : 'Outside Campus - Geofenced Checkin blocked'}</b></p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsGpsInside(true);
                      onSimulateNotification('GPS coordinate set inside Learner\'s Den Campus geofence (28.6139, 77.2090)', 'GPS Simulated Inside');
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xxs font-bold border transition-all ${
                      isGpsInside
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Set Inside Den Campus
                  </button>
                  <button
                    onClick={() => {
                      setIsGpsInside(false);
                      onSimulateNotification('GPS coordinate set to Bangalore outer city (12.9716, 77.5946)', 'GPS Simulated Outside');
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xxs font-bold border transition-all ${
                      !isGpsInside
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Set Outside Campus
                  </button>
                </div>
              </div>

              {/* Push Notifications Queue Simulator */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-3">
                    <Bell className="h-4.5 w-4.5 text-violet-500" />
                    <span>Cross-Platform Push Notifications</span>
                  </span>
                  <p className="text-xxs text-slate-500 mb-4 leading-relaxed">
                    Test the instant Firebase Messaging bridge. Click to push mock notifications from the server directly to the active system tray.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleTriggerAlert('fees')}
                    className="py-1.5 px-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xxs font-bold text-slate-700 flex items-center justify-center gap-1"
                  >
                    <Bell className="h-3 w-3 text-rose-500" />
                    <span>Fee Outstanding Alert</span>
                  </button>
                  <button
                    onClick={() => handleTriggerAlert('test')}
                    className="py-1.5 px-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xxs font-bold text-slate-700 flex items-center justify-center gap-1"
                  >
                    <Bell className="h-3 w-3 text-amber-500" />
                    <span>New Test Alert</span>
                  </button>
                  <button
                    onClick={() => handleTriggerAlert('payroll')}
                    className="py-1.5 px-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xxs font-bold text-slate-700 flex items-center justify-center gap-1"
                  >
                    <Bell className="h-3 w-3 text-emerald-500" />
                    <span>Payroll Disbursed Alert</span>
                  </button>
                  <button
                    onClick={() => handleTriggerAlert('checkin')}
                    className="py-1.5 px-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xxs font-bold text-slate-700 flex items-center justify-center gap-1"
                  >
                    <Bell className="h-3 w-3 text-indigo-500" />
                    <span>Class Attendance Alert</span>
                  </button>
                </div>
              </div>

              {/* FaceID / Biometrics Scanner simulation */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-3">
                    <Fingerprint className="h-4.5 w-4.5 text-indigo-500" />
                    <span>Secure Biometric Keychain (FaceID/Fingerprint)</span>
                  </span>
                  <p className="text-xxs text-slate-500 mb-4 leading-relaxed">
                    Uses WebAuthn API framework. In standalone app mode, users log-in safely using native device fingerprint or facial scanners.
                  </p>

                  <div className="h-28 rounded-xl border border-slate-150 bg-white flex flex-col items-center justify-center p-3 relative overflow-hidden mb-4">
                    {biometricScanning ? (
                      <div className="flex flex-col items-center animate-pulse">
                        <Fingerprint className="h-10 w-10 text-indigo-500 animate-bounce" />
                        <span className="text-[10px] font-bold text-indigo-600 mt-2">Scanning Biometrics...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Fingerprint className={`h-10 w-10 ${
                          biometricStatus === 'success' ? 'text-emerald-500' : 'text-slate-400'
                        }`} />
                        <span className="text-[10px] font-bold text-slate-600 mt-2">
                          {biometricStatus === 'success' ? 'Authentication Approved' : 'Keyring Locked'}
                        </span>
                        {biometricStatus === 'success' && (
                          <span className="text-[9px] text-slate-400 font-medium">Session token injected securely</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleBiometricTest}
                  disabled={biometricScanning}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xxs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Fingerprint className="h-3.5 w-3.5" />
                  <span>{biometricScanning ? 'Verifying...' : 'Simulate Bio Scan'}</span>
                </button>
              </div>

              {/* QR Code / Camera viewfinder Simulation */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-3">
                    <QrCode className="h-4.5 w-4.5 text-emerald-500" />
                    <span>Native Camera Barcode & QR Scanner</span>
                  </span>
                  <p className="text-xxs text-slate-500 mb-4 leading-relaxed">
                    Triggers the camera media pipeline. Scans physical QR posters pinned to coaching classroom doors to punch-in shifts.
                  </p>

                  <div className="h-28 rounded-xl border border-slate-150 bg-white flex flex-col items-center justify-center p-3 relative overflow-hidden mb-4">
                    {qrScanning ? (
                      <div className="w-full h-full bg-slate-900 rounded-lg relative overflow-hidden flex items-center justify-center">
                        {/* Mock Scanning Green Line */}
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-sm animate-bounce"></div>
                        <span className="text-[9px] font-mono font-bold text-white tracking-widest uppercase">CAMERA ON: VIEWPORT</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <QrCode className="h-10 w-10 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-600 mt-2">
                          {qrStatus || 'Idle: Viewfinder closed'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleQrScan}
                  disabled={qrScanning}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xxs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>{qrScanning ? 'Initializing Camera...' : 'Simulate Camera scan'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STANDARDS */}
        {activeTab === 'about' && (
          <div className="space-y-4 text-xs font-medium text-slate-600 leading-relaxed">
            <h4 className="font-bold text-slate-800">HTML5, WebAuthn & PWA Standard Alignment</h4>
            <p>
              Learner's Den ERP & LMS adheres to cross-platform web standards to support **Android, iOS, iPadOS, macOS, Windows, and Linux** using a single responsive codebase.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="p-4 rounded-xl border border-slate-150 space-y-1 bg-slate-50/50">
                <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-600">Local Cache Resilience</span>
                <p className="text-xxs text-slate-500 leading-normal">
                  Our Service Worker cache intercepts and stores core script bundles, styles, and syllabus materials, guaranteeing offline startup and fast recovery on unstable mobile carrier networks.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-150 space-y-1 bg-slate-50/50">
                <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-600">Secure WebAuthn Bridge</span>
                <p className="text-xxs text-slate-500 leading-normal">
                  Uses secure cryptography, bypassing insecure passwords and relying on local mobile secure-enclaves (Apple Secure Enclave, Android StrongBox) to verify attendance logs.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50 flex gap-3 text-xxs text-amber-800 font-semibold mt-4">
              <Shield className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Zero-Dependency Installation</p>
                <p className="text-amber-700 mt-0.5 leading-normal">
                  Unlike traditional native apps which require Google Play Store or Apple App Store distribution approval and 100MB downloads, Learner's Den installs instantly (under 2MB) directly from Safari or Chrome via browser caching mechanisms.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
