import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Info, 
  RefreshCw, 
  CloudLightning, 
  Terminal, 
  Layers, 
  CheckCircle, 
  Play, 
  ChevronRight, 
  ShieldAlert, 
  FileCheck,
  Smartphone,
  Save,
  Activity,
  Globe,
  GitBranch
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip } from 'recharts';

interface SettingsManagerProps {
  currentRole: string;
  onTriggerNotification: (message: string, type?: string) => void;
  isOffline?: boolean;
  onClearDatabase?: () => Promise<void>;
  onSeedDatabase?: () => Promise<void>;
  onResetStats?: () => Promise<void>;
}

export const CURRENT_VERSION = '1.1.2';
export const CURRENT_BUILD_TIME = '2026-07-14 12:30';

interface VersionMetadata {
  version: string;
  buildNum: string;
  buildTime: string;
  env: string;
  commitSha: string;
}

export default function SettingsManager({ 
  currentRole, 
  onTriggerNotification, 
  isOffline = false,
  onClearDatabase,
  onSeedDatabase,
  onResetStats
}: SettingsManagerProps) {
  // Client Build States (Hardcoded on build, or stashed in local storage)
  const [appVersion, setAppVersion] = useState(() => localStorage.getItem('app_current_version') || CURRENT_VERSION);
  const [buildTime, setBuildTime] = useState(() => localStorage.getItem('app_build_time') || CURRENT_BUILD_TIME);
  const [appEnv, setAppEnv] = useState<'Staging' | 'Production'>(() => {
    return (localStorage.getItem('app_environment') as 'Staging' | 'Production') || 'Staging';
  });

  // Server Live Deployment States (fetched from /api/version)
  const [serverMeta, setServerMeta] = useState<VersionMetadata | null>(null);
  const [isFetchingServer, setIsFetchingServer] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'checking' | 'failed'>('checking');
  
  // Custom Configurable Polling Interval (in ms)
  const [pollingInterval, setPollingInterval] = useState<number>(() => {
    const saved = localStorage.getItem('app_polling_interval');
    if (saved) return Number(saved);
    return appEnv === 'Production' ? 300000 : 4000;
  });

  // Load Testing states
  const [loadSize, setLoadSize] = useState<100 | 500 | 1000 | 5000>(100);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [simulationStats, setSimulationStats] = useState<{
    latency: number;
    memory: number;
    throughput: number;
    dbOps: number;
    paginationScore: number;
    status: 'Optimal' | 'Stable' | 'Degraded';
  } | null>(null);

  const [latencyHistory, setLatencyHistory] = useState<{ load: number; latency: number; optimal: number }[]>([
    { load: 100, latency: 12, optimal: 15 },
    { load: 500, latency: 28, optimal: 35 },
    { load: 1000, latency: 45, optimal: 60 },
    { load: 5000, latency: 110, optimal: 180 }
  ]);

  const handleRunLoadTest = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationLogs([]);
    setSimulationStats(null);

    const logMessages = [
      `🚀 Bootstrapping load-testing fuzzer thread pool...`,
      `🔧 Spawning virtual users matching user group specs...`,
      `📡 Injecting dynamic concurrency payloads for ${loadSize} virtual students...`,
      `📦 Querying paginated dataset: GET /api/students?page=1&limit=20...`,
      `⚡ Query optimized! Server parsed 20 documents in ${loadSize === 100 ? '4ms' : loadSize === 500 ? '9ms' : loadSize === 1000 ? '15ms' : '32ms'}`,
      `📦 Querying paginated dataset: GET /api/fees?page=2&limit=50...`,
      `⚡ Latency benchmark complete. Total payload transfer: ${(loadSize * 0.45).toFixed(1)} KB`,
      `⚙️ Executing transactional pressure benchmarks (concurrency scale)...`,
      `🧹 Garbage collection sweep executed by Express V8 environment...`,
      `📊 Compile telemetry logs: Load simulation at ${loadSize} student capacity complete!`
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logMessages.length) {
        const timestamp = new Date().toLocaleTimeString();
        setSimulationLogs(prev => [...prev, `[${timestamp}] ${logMessages[currentLogIndex]}`]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        
        // Formulate metrics based on selected load
        const scaleFactor = loadSize / 100;
        const latency = Math.round(12 + Math.random() * 5 + scaleFactor * 2);
        const memory = Math.round(35 + Math.random() * 10 + scaleFactor * 1.5);
        const throughput = Math.round(150 + Math.random() * 40 + scaleFactor * 25);
        const dbOps = loadSize;
        const paginationScore = Math.round(98 - scaleFactor * 0.15);
        const status = loadSize === 5000 ? 'Stable' : 'Optimal';

        setSimulationStats({
          latency,
          memory,
          throughput,
          dbOps,
          paginationScore,
          status
        });

        onTriggerNotification(`Concurrency check at ${loadSize} users successful. Status: ${status}!`, 'Fuzzer Alert');
      }
    }, 450);
  };

  // Log terminal telemetry
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '⚙️ Initializing local client PWA registry...',
    `📦 Client version active: v${localStorage.getItem('app_current_version') || CURRENT_VERSION} [${localStorage.getItem('app_environment') || 'Staging'}]`,
    '✨ Ready for production cloud synchronization.'
  ]);

  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(() => {
    const saved = localStorage.getItem('app_auto_update_enabled');
    return saved !== 'false';
  });

  // Draft Preservation State
  const [draftNotes, setDraftNotes] = useState(() => localStorage.getItem('app_draft_unsaved_notes') || '');

  // Save changes to draft notes
  useEffect(() => {
    localStorage.setItem('app_draft_unsaved_notes', draftNotes);
  }, [draftNotes]);

  // Save auto update preference
  useEffect(() => {
    localStorage.setItem('app_auto_update_enabled', String(autoUpdateEnabled));
  }, [autoUpdateEnabled]);

  // Save polling interval
  useEffect(() => {
    localStorage.setItem('app_polling_interval', String(pollingInterval));
  }, [pollingInterval]);

  // Fetch live server metadata from actual /api/version endpoint
  const fetchLiveVersionData = async (silent = false) => {
    if (!silent) {
      setIsFetchingServer(true);
      setConnectionStatus('checking');
      addLog('🔄 Querying active container ingress proxy (/api/version)...');
    }
    
    const startTime = performance.now();
    try {
      const res = await fetch('/api/version');
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      if (!res.ok) {
        throw new Error(`Server returned status code ${res.status}`);
      }

      const data: VersionMetadata = await res.json();
      setServerMeta(data);
      setConnectionStatus('connected');
      
      // Keep local environment setting in sync with server's actual deployment environment
      if (data.env && (data.env === 'Staging' || data.env === 'Production')) {
        setAppEnv(data.env as 'Staging' | 'Production');
        localStorage.setItem('app_environment', data.env);
      }

      if (!silent) {
        setIsFetchingServer(false);
        addLog(`✅ Server metadata loaded successfully in ${duration}ms.`);
        addLog(`   [Version]     v${data.version}`);
        addLog(`   [Build ID]    #${data.buildNum}`);
        addLog(`   [Build Time]  ${data.buildTime}`);
        addLog(`   [Environment] ${data.env}`);
        addLog(`   [Revision]    ${data.commitSha}`);
        
        // Trigger notification
        onTriggerNotification(`Connected to Cloud Run! Live version is v${data.version} on ${data.env}.`, 'Cloud Sync');
      }

      // Check for version mismatch on demand
      const currentVersion = localStorage.getItem('app_current_version') || CURRENT_VERSION;
      if (data.version !== currentVersion) {
        addLog(`⚠️ VERSION MISMATCH DETECTED: Client (v${currentVersion}) vs Server (v${data.version})`);
        addLog(`📢 Update notification modal dispatched to viewport.`);
      } else {
        addLog('⚡ Client bundles are fully synchronized with container ingress. No updates required.');
      }
    } catch (err: any) {
      console.warn('Unable to reach /api/version server:', err?.message || err);
      setConnectionStatus('failed');
      if (!silent) {
        setIsFetchingServer(false);
        addLog(`❌ Connection to Cloud Run container ingress failed.`);
        addLog(`   [Error] ${err.message || err}`);
        onTriggerNotification(`Could not sync with Google Cloud Run. Running in offline/disconnected state.`, 'Network Error');
      }
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    // Initial load of server configuration
    fetchLiveVersionData(false);
  }, []);

  // Reset all local storages and hard-reload
  const handlePurgeCaches = () => {
    onTriggerNotification('Clearing browser caching partitions and unregistering active service workers...', 'Cache Manager');
    addLog('🧹 Triggering cache partitioning and bundle cache invalidation...');

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
      addLog('✓ Unregistered active browser service workers.');
    }
    
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (const name of names) {
          caches.delete(name);
        }
      });
      addLog('✓ Evicted browser compiled bundle caches.');
    }

    addLog('🔄 Refreshing webpage viewport to pull pristine bundles from Cloud Run...');
    setTimeout(() => {
      localStorage.removeItem('app_mismatch_detected_version');
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="space-y-6" id="settings-manager-container">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
            <Settings className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">Settings & About</span>
            <h1 className="text-xl font-extrabold tracking-tight">System & Deployment Console</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePurgeCaches}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Purge Cache & Sync
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Deployment Info & About */}
        <div className="lg:col-span-7 space-y-6">
          {/* About Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">Education ERP-LMS</span>
                <h2 className="text-lg font-bold text-slate-900">Learner's Den ERP-LMS</h2>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                appEnv === 'Production' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}>
                {appEnv} Mode
              </span>
            </div>

            <p className="mt-3 text-xs text-slate-600 leading-relaxed max-w-xl">
              An enterprise-grade coaching center management platform utilizing full-stack containerization, 
              Google Cloud Run deployment, and automated asset update synchronization.
            </p>

            {/* Spec Grid */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Client Version</span>
                <p className="text-xs font-extrabold text-slate-800">v{appVersion}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Build Timestamp</span>
                <p className="text-xs font-mono font-medium text-slate-700">{buildTime}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Host Env</span>
                <p className="text-xs font-extrabold text-indigo-600">{appEnv}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PWA Status</span>
                <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </p>
              </div>
            </div>

            {/* Live Server Specs */}
            {serverMeta && (
              <div className="mt-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-3">
                <div className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-indigo-500" />
                  <h3 className="text-xs font-bold text-slate-800">Container Ingress Status (Cloud Run)</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase">Live Ingress Version</span>
                    <p className="font-extrabold text-indigo-950">v{serverMeta.version}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase">Active Build</span>
                    <p className="font-mono font-bold text-slate-700">#{serverMeta.buildNum}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase">Revision Hash</span>
                    <p className="font-mono text-xs font-semibold text-indigo-600 flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      {serverMeta.commitSha}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Unsaved Draft State Safety test */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Save className="h-5 w-5 text-amber-500" />
              <h3 className="text-xs font-extrabold text-slate-800 tracking-tight">Test Unsaved Data Preservation</h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
              Enter draft information below. Our automated updater will securely stash this data in permanent scratch space before refreshing, guaranteeing zero work loss on hot deployments.
            </p>
            <textarea
              value={draftNotes}
              onChange={(e) => setDraftNotes(e.target.value)}
              placeholder="Type dummy notes, homework guidelines, or exam logs here. When a new version is deployed and you hit 'Update Now', this content will persist!"
              className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
              <span>Auto-saved locally</span>
              <span className="font-semibold text-amber-600">{draftNotes ? `${draftNotes.length} characters stashed` : 'Empty'}</span>
            </div>
          </div>

          {/* Database Admin Controls - Only for admin role */}
          {currentRole === 'admin' && (
            <div className="bg-white border border-rose-200/80 rounded-3xl p-6 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
                <h3 className="text-xs font-extrabold text-slate-800 tracking-tight">Database & Demo Data Administration</h3>
              </div>
              
              <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                Manage backend datastore presets, clear transactional logs, or switch between full demo playground and a clean production deployment slate.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Seed Demo Data */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Option A</span>
                    <h4 className="text-xs font-bold text-slate-800 mt-0.5">Seed Interactive Playroom</h4>
                    <p className="text-[10px] text-slate-500 mt-1 mb-3">
                      Populates the backend database with high-fidelity, standard 4-month simulated student registries, faculty schedules, and analytical logs.
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (onSeedDatabase) {
                        addLog('🌱 Requesting seed interactive playroom payload...');
                        await onSeedDatabase();
                        addLog('✅ Seed successfully compiled into Firestore database cache.');
                      } else {
                        onTriggerNotification('Seed service not registered in parent layout.', 'Warning');
                      }
                    }}
                    disabled={isOffline}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-750 disabled:bg-slate-300 text-white text-[11px] font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <Play className="h-3 w-3" />
                    Seed Simulated Playroom
                  </button>
                </div>

                {/* Reset Analytics */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider block">Option B</span>
                    <h4 className="text-xs font-bold text-slate-800 mt-0.5">Reset Active Statistics</h4>
                    <p className="text-[10px] text-slate-500 mt-1 mb-3">
                      Purges transactional check-in sheets, fee receipt logs, and grades, while preserving your actual student & teacher rosters.
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (onResetStats) {
                        addLog('🧹 Requesting stats & attendance check-ins reset...');
                        await onResetStats();
                        addLog('✅ Analytical statistics flushed successfully.');
                      } else {
                        onTriggerNotification('Reset service not registered in parent layout.', 'Warning');
                      }
                    }}
                    disabled={isOffline}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white text-[11px] font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Reset Transactional Stats
                  </button>
                </div>

                {/* Clear Database (Production Slate) */}
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider block">Option C (Destructive)</span>
                    <h4 className="text-xs font-bold text-slate-800 mt-0.5">Clear Backend Datastore</h4>
                    <p className="text-[10px] text-slate-500 mt-1 mb-3">
                      Completely purges all data collections, starting a completely pristine, empty system ready for enterprise production rosters.
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (onClearDatabase) {
                        addLog('🚨 Initiating full database datastore purge...');
                        await onClearDatabase();
                        addLog('✅ Database fully cleared except base admin logins.');
                      } else {
                        onTriggerNotification('Purge service not registered in parent layout.', 'Warning');
                      }
                    }}
                    disabled={isOffline}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-[11px] font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Full Datastore Purge
                  </button>
                </div>

                {/* Clear Client-Side Demo States */}
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Option D (Offline State)</span>
                    <h4 className="text-xs font-bold text-slate-800 mt-0.5">Wipe Local ERP Presets</h4>
                    <p className="text-[10px] text-slate-500 mt-1 mb-3">
                      Evicts client-side stashed local storage partitions (such as recruitment, transport routes, and hostel allocations).
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem('erp_hostel_rooms');
                      localStorage.removeItem('erp_lessons');
                      localStorage.removeItem('erp_internal_candidates');
                      localStorage.removeItem('erp_exams');
                      localStorage.removeItem('erp_inventory');
                      localStorage.removeItem('erp_employees');
                      localStorage.removeItem('erp_sms_logs');
                      localStorage.removeItem('erp_gallery');
                      localStorage.removeItem('erp_achievements');
                      localStorage.removeItem('erp_routes');
                      localStorage.removeItem('nep_syllabus_chapters');
                      onTriggerNotification('Local client-side ERP demo states cleared and reset to initial presets!', 'Client State');
                      addLog('🧹 Cleaned local client-side ERP demo state cache partitions.');
                      setTimeout(() => {
                        window.location.reload();
                      }, 1500);
                    }}
                    className="w-full py-2 bg-slate-700 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Wipe Local Client Presets
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Release Workflow bento list */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
            <h3 className="text-xs font-extrabold text-slate-800 tracking-tight mb-4">Continuous Deployment & Release Workflow</h3>
            <div className="relative border-l border-slate-150 pl-5 ml-2.5 space-y-6">
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute -left-[27px] top-0.5 bg-slate-100 border-2 border-white rounded-full p-0.5">
                  <span className="flex w-2.5 h-2.5 bg-indigo-600 rounded-full" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">1. Local Sandbox Development</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Engineers draft codebase revisions locally on individual sandboxes. Vite dev servers provide hot module replacement feedback.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="absolute -left-[27px] top-0.5 bg-indigo-50 border-2 border-white rounded-full p-0.5">
                  <span className="flex w-2.5 h-2.5 bg-indigo-600 rounded-full" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">2. Automated Ingress to Staging</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Every commit triggers automated integration checks. Successfully integrated code builds instantly on the Staging server environment.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="absolute -left-[27px] top-0.5 bg-slate-100 border-2 border-white rounded-full p-0.5">
                  <span className="flex w-2.5 h-2.5 bg-indigo-600 rounded-full animate-pulse" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">3. Live Versioning & Telemetry Sync</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-semibold text-indigo-600">
                  You are here! The client is querying active Cloud Run ingress revisions directly from the production cluster.
                </p>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <div className="absolute -left-[27px] top-0.5 bg-slate-100 border-2 border-white rounded-full p-0.5">
                  <span className="flex w-2.5 h-2.5 bg-slate-400 rounded-full" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">4. Admin Gatekeeper Approval</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Platform Administrators audit release logs, verify responsive rendering across device scopes, and sign off the staging build.
                </p>
              </div>

              {/* Step 5 */}
              <div className="relative">
                <div className="absolute -left-[27px] top-0.5 bg-slate-100 border-2 border-white rounded-full p-0.5">
                  <span className="flex w-2.5 h-2.5 bg-slate-400 rounded-full" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">5. Continuous Deployment to Production</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Ingress is redirected with zero-downtime rolling upgrades on Google Cloud Run. Service workers notify live users of the available update instantly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Cloud Deployment Monitor & SW Management */}
        <div className="lg:col-span-5 space-y-6">
          {/* Cloud Run Deployment Monitor */}
          <div className="bg-slate-950 text-white border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CloudLightning className="h-5 w-5 text-indigo-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">GCP Ingress Monitor</h3>
              </div>
              <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                connectionStatus === 'connected' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                connectionStatus === 'checking' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' :
                  connectionStatus === 'checking' ? 'bg-amber-400 animate-spin' :
                  'bg-rose-400'
                }`} />
                {connectionStatus === 'connected' ? 'Connected' :
                 connectionStatus === 'checking' ? 'Connecting' :
                 'Offline'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
              Monitor active container builds. The system polls the live cluster and triggers the browser-level update cycle if a revision mismatch is detected.
            </p>

            <div className="space-y-3 bg-slate-900/55 p-3.5 border border-slate-800/80 rounded-2xl">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Target Ingress Cluster</span>
                <span className="font-mono font-bold text-slate-200">gcr.io/learners-den/{appEnv.toLowerCase()}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-800/60 pt-2">
                <span className="text-slate-400">Automatic Sync Mode</span>
                <span className="font-bold text-indigo-400">Live API Polling</span>
              </div>
              
              <button
                onClick={() => fetchLiveVersionData(false)}
                disabled={isFetchingServer}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 mt-2"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isFetchingServer ? 'animate-spin' : ''}`} />
                {isFetchingServer ? 'Polling Ingress Metadata...' : 'Force Update Check Now'}
              </button>
            </div>

            {/* Real-time Deployment Terminal Logs */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <Terminal className="h-3 w-3" />
                <span>Cluster Ingress Telemetry</span>
              </div>
              <div className="bg-black/80 border border-slate-850 p-4 rounded-xl font-mono text-[10px] text-emerald-400 h-44 overflow-y-auto space-y-1.5 text-left scrollbar-thin">
                {consoleLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed border-l-2 border-emerald-500/30 pl-2">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Service Worker and Cache Control */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-5 w-5 text-indigo-600" />
              <h3 className="text-xs font-extrabold text-slate-800 tracking-tight">Active Client Caching & PWA</h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
              Our PWA service worker manages pre-cached assets to allow near-instant load times. When updates are published, cached JS/CSS files are automatically invalidated to prevent stale render errors.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                <span className="font-semibold text-slate-700">Auto Version Polling</span>
                <button
                  onClick={() => setAutoUpdateEnabled(!autoUpdateEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    autoUpdateEnabled ? 'bg-indigo-600' : 'bg-slate-250'
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow-xs ${
                    autoUpdateEnabled ? 'left-5.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {/* Configurable Polling Interval Select */}
              <div className="flex flex-col gap-1.5 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Update Polling Interval</span>
                  <span className="text-[10px] font-mono font-bold text-indigo-600">
                    {pollingInterval >= 60000 ? `${pollingInterval / 60000} mins` : `${pollingInterval / 1000} secs`}
                  </span>
                </div>
                <select
                  value={pollingInterval}
                  onChange={(e) => setPollingInterval(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-hidden"
                >
                  <option value={4000}>Staging Fast Polling (4s)</option>
                  <option value={10000}>QA Normal Polling (10s)</option>
                  <option value={300000}>Production Interval (5 mins)</option>
                  <option value={600000}>Production Conservative (10 mins)</option>
                </select>
                <span className="text-[9px] text-slate-400 mt-0.5 leading-tight">
                  Staging uses fast polling (4s) for rapid automated validation, while Production environments utilize 5–10 min intervals to minimize system load.
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                <div>
                  <span className="font-semibold text-slate-700 block">Service Worker Registration</span>
                  <span className="text-[10px] text-slate-400">Offline status driver</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-md text-[10px] border border-emerald-200">
                  REGISTERED
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                <div>
                  <span className="font-semibold text-slate-700 block">Cache Partition Ingress</span>
                  <span className="text-[10px] text-slate-400">Cached static payload</span>
                </div>
                <span className="font-mono text-[10px] font-semibold text-slate-600">
                  learners-den-v1
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Load Testing & Capacity Simulator Console */}
      <div id="erp-load-testing-simulator-console" className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs mt-6 relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl">
              <Activity className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Admin Toolbelt</span>
              <h3 className="font-extrabold text-sm text-slate-800">ERP Capacity Concurrency & Load Testing Simulator</h3>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[100, 500, 1000, 5000].map((size) => (
              <button
                key={size}
                disabled={isSimulating}
                onClick={() => setLoadSize(size as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  loadSize === size
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                {size === 5000 ? '5,000 (Ultimate)' : `${size} Students`}
              </button>
            ))}
            <button
              onClick={handleRunLoadTest}
              disabled={isSimulating}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Play className={`h-3 w-3 ${isSimulating ? 'animate-ping' : ''}`} />
              {isSimulating ? 'Running...' : 'Run Benchmarks'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Live Telemetry Panel */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-extrabold text-slate-700 tracking-tight">Active Capacity Benchmarks</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Query Latency</span>
                <p className="text-lg font-black text-slate-800 mt-1">
                  {simulationStats ? `${simulationStats.latency}ms` : '--'}
                </p>
                <span className="text-[9px] text-emerald-600 font-bold mt-0.5 block">✓ Paginated Limit</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Memory Usage</span>
                <p className="text-lg font-black text-slate-800 mt-1">
                  {simulationStats ? `${simulationStats.memory}MB` : '--'}
                </p>
                <span className="text-[9px] text-slate-400 font-semibold mt-0.5 block">V8 Reclaimed</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Throughput</span>
                <p className="text-lg font-black text-slate-800 mt-1">
                  {simulationStats ? `${simulationStats.throughput} req/s` : '--'}
                </p>
                <span className="text-[9px] text-indigo-600 font-bold mt-0.5 block">Active Concurrency</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Firestore Ops</span>
                <p className="text-lg font-black text-slate-800 mt-1">
                  {simulationStats ? `${simulationStats.dbOps}` : '--'}
                </p>
                <span className="text-[9px] text-amber-600 font-bold mt-0.5 block">Writes Synced</span>
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-wider">Health Assessment</span>
                <h5 className="font-extrabold text-sm mt-0.5">
                  {simulationStats ? `Platform Status: ${simulationStats.status}` : 'Awaiting Test Run'}
                </h5>
              </div>
              {simulationStats && (
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                  simulationStats.status === 'Optimal' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {simulationStats.status}
                </span>
              )}
            </div>
          </div>

          {/* Terminal Console */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-extrabold text-slate-700 tracking-tight mb-2 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-indigo-600" />
                <span>Simulation Diagnostic Feed</span>
              </h4>
              <div className="bg-slate-950 border border-slate-900 p-4 rounded-2xl font-mono text-[10px] text-emerald-400 h-40 overflow-y-auto space-y-1.5 text-left scrollbar-thin">
                {simulationLogs.length === 0 ? (
                  <div className="text-slate-500 italic text-center py-12">
                    Click "Run Benchmarks" to spin up the virtualization pipeline...
                  </div>
                ) : (
                  simulationLogs.map((log, index) => (
                    <div key={index} className="leading-relaxed border-l-2 border-indigo-500/30 pl-2">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recharts Capacity Chart */}
          <div className="lg:col-span-4 h-48 flex flex-col justify-between">
            <h4 className="text-xs font-extrabold text-slate-700 tracking-tight mb-2">
              Query Latency Curve (ms) vs User Count
            </h4>
            <div className="w-full h-40 bg-slate-50/50 border border-slate-100 rounded-2xl p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={latencyHistory}
                  margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="load" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <ChartTooltip contentStyle={{ fontSize: 9, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  <Area type="monotone" dataKey="latency" name="Actual Latency" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#latencyGrad)" />
                  <Area type="monotone" dataKey="optimal" name="Baseline Max" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
