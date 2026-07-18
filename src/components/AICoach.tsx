import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  MessageSquare, 
  CalendarClock, 
  Send, 
  Loader2, 
  BookOpen, 
  AlertCircle, 
  RefreshCw, 
  BarChart3, 
  TrendingUp, 
  GraduationCap, 
  PenTool, 
  ShieldCheck, 
  ShieldAlert, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Info, 
  Award, 
  UserCheck 
} from 'lucide-react';
import { Quiz, Batch } from '../types';
import { geminiService } from '../services/geminiService';

// Simple Markdown component to render bold, list and paragraphs cleanly
function SimpleMarkdown({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-2 text-xs text-slate-700 leading-relaxed font-medium">
      {lines.map((line, i) => {
        // Headers
        if (line.startsWith('### ')) {
          return <h4 key={i} className="text-sm font-bold text-slate-800 mt-4 mb-2">{line.replace('### ', '')}</h4>;
        }
        if (line.startsWith('## ')) {
          return <h3 key={i} className="text-base font-extrabold text-indigo-700 mt-5 mb-3">{line.replace('## ', '')}</h3>;
        }
        if (line.startsWith('# ')) {
          return <h2 key={i} className="text-lg font-black text-indigo-800 mt-6 mb-4">{line.replace('# ', '')}</h2>;
        }
        // Bullets
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <li key={i} className="list-disc ml-5 pl-1 text-slate-600">
              {line.substring(2)}
            </li>
          );
        }
        // Bold parsing
        if (line.trim() === '') return <div key={i} className="h-2" />;
        
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}

interface AICoachProps {
  batches: Batch[];
  onGenerateQuiz: (quizData: { title: string; subject: string; topic: string; batchId: string; count: number }) => Promise<void>;
  initialTab?: string;
}

type AIServiceId = 
  | 'coach' 
  | 'planner' 
  | 'quiz' 
  | 'analytics' 
  | 'attendance_pred' 
  | 'performance_pred' 
  | 'writing' 
  | 'moderation' 
  | 'report';

export default function AICoach({ batches, onGenerateQuiz, initialTab }: AICoachProps) {
  // Map legacy initial tabs to new service IDs
  const getMappedServiceId = (tab?: string): AIServiceId => {
    if (tab === 'quiz') return 'quiz';
    if (tab === 'planner') return 'planner';
    return 'coach'; // default
  };

  const [activeService, setActiveService] = useState<AIServiceId>(getMappedServiceId(initialTab));
  
  // Universal States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 1. AI Coach (Doubt Solver)
  const [doubtText, setDoubtText] = useState('');
  const [doubtSubject, setDoubtSubject] = useState('Physics');
  const [doubtResponse, setDoubtResponse] = useState('');

  // 2. AI Study Planner
  const [examTarget, setExamTarget] = useState('IIT-JEE Advanced 2027');
  const [weakAreas, setWeakAreas] = useState('Integration calculus, Organic nomenclature, Mechanics kinetics');
  const [studyHours, setStudyHours] = useState('5');
  const [plannerResponse, setPlannerResponse] = useState('');

  // 3. AI Question Generator (Mock Test Builder)
  const [quizTopic, setQuizTopic] = useState('');
  const [quizSubject, setQuizSubject] = useState('Physics');
  const [quizBatchId, setQuizBatchId] = useState(batches[0]?.id || '');
  const [quizCount, setQuizCount] = useState(5);
  const [quizSuccessMsg, setQuizSuccessMsg] = useState('');

  // 4. AI Analytics
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // 5. AI Attendance Prediction
  const [predStudentId, setPredStudentId] = useState('student-1');
  const [predAttendanceRate, setPredAttendanceRate] = useState(80);
  const [predMissedClasses, setPredMissedClasses] = useState(3);
  const [predLeaveReasons, setPredLeaveReasons] = useState('Fever, Transport strike in Imphal');
  const [attendancePredictionResult, setAttendancePredictionResult] = useState<any>(null);

  // 6. AI Performance Prediction
  const [perfStudentName, setPerfStudentName] = useState('Chongtham Premjit');
  const [perfAverageScore, setPerfAverageScore] = useState(76);
  const [perfStrengths, setPerfStrengths] = useState('Calculus, Organic conversions');
  const [perfWeakTopics, setPerfWeakTopics] = useState('Rotational dynamics, Wave optics');
  const [perfExamTarget, setPerfExamTarget] = useState('JEE Main & Advanced 2027');
  const [performancePredictionResult, setPerformancePredictionResult] = useState<any>(null);

  // 7. AI Writing Assistant
  const [writeTopic, setWriteTopic] = useState('Upcoming Parent-Teacher Meeting regarding competitive revision');
  const [writeRecipient, setWriteRecipient] = useState('Parents');
  const [writeFormat, setWriteFormat] = useState('Official Circular');
  const [writeTone, setWriteTone] = useState('Professional');
  const [writingAssistantResult, setWritingAssistantResult] = useState('');

  // 8. AI Chat Moderation
  const [modText, setModText] = useState('Hey seniors, did anyone find a cheat sheet for the Physics mechanics quiz online? Pls upload here or message me directly at scam-link.com/free-notes for a bypass!');
  const [moderationResult, setModerationResult] = useState<any>(null);

  // 9. AI Report Generator
  const [repStudentName, setRepStudentName] = useState('Laishram Sanatombi');
  const [repBatch, setRepBatch] = useState('batch-1');
  const [repAttendance, setRepAttendance] = useState(88);
  const [repScores, setRepScores] = useState('72%, 84%, 68%');
  const [repStrengths, setRepStrengths] = useState('Electrodynamics, Physical Chemistry calculations');
  const [repWeaknesses, setRepWeaknesses] = useState('Thermodynamics, Probability models');
  const [repRemarks, setRepRemarks] = useState('Very sharp analytics, but homework submissions are slightly delayed.');
  const [reportResult, setReportResult] = useState('');

  // Auto-set batch-id if batches load
  useEffect(() => {
    if (batches.length > 0 && !quizBatchId) {
      setQuizBatchId(batches[0].id);
    }
  }, [batches]);

  const triggerCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Ask Doubt (AI Coach)
  const handleAskDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtText.trim()) return;
    setLoading(true);
    setError(null);
    setDoubtResponse('');

    try {
      const data = await geminiService.solveDoubt(doubtText, doubtSubject);
      setDoubtResponse(data.answer);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Build Plan (AI Study Planner)
  const handleBuildPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPlannerResponse('');

    try {
      const data = await geminiService.generatePlanner({
        examTarget,
        weakAreas,
        studyHoursPerDay: Number(studyHours),
      });
      setPlannerResponse(data.plan);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Quiz generator (AI Question Generator)
  const handleQuizGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTopic) return;
    setLoading(true);
    setError(null);
    setQuizSuccessMsg('');

    try {
      await geminiService.generateQuiz({
        title: `${quizTopic} AI-Generated Test`,
        subject: quizSubject,
        topic: quizTopic,
        batchId: quizBatchId,
        count: Number(quizCount),
      });
      setQuizSuccessMsg(`Successfully generated and published the quiz: "${quizTopic} AI-Generated Test"!`);
      setQuizTopic('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Fetch AI Analytics
  const handleGenerateAnalytics = async () => {
    setLoading(true);
    setError(null);
    setAnalyticsData(null);

    try {
      const data = await geminiService.getAnalytics();
      setAnalyticsData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. Predict Attendance
  const handlePredictAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAttendancePredictionResult(null);

    try {
      const data = await geminiService.predictAttendance({
        studentId: predStudentId,
        currentAttendanceRate: predAttendanceRate,
        missedClassesCount: predMissedClasses,
        leaveReasons: predLeaveReasons
      });
      setAttendancePredictionResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 6. Predict Performance
  const handlePredictPerformance = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPerformancePredictionResult(null);

    try {
      const data = await geminiService.predictPerformance({
        studentName: perfStudentName,
        currentAverageScore: perfAverageScore,
        subjectStrengths: perfStrengths,
        weakTopics: perfWeakTopics,
        examTarget: perfExamTarget
      });
      setPerformancePredictionResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 7. Writing Assistant
  const handleWritingAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setWritingAssistantResult('');

    try {
      const data = await geminiService.draftWritingAssistant({
        topic: writeTopic,
        recipient: writeRecipient,
        format: writeFormat,
        tone: writeTone
      });
      setWritingAssistantResult(data.text);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 8. Chat Moderation
  const handleChatModeration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setModerationResult(null);

    try {
      const data = await geminiService.checkModeration(modText);
      setModerationResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 9. Report Generator
  const handleReportGenerator = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setReportResult('');

    try {
      const activeBatchObj = batches.find(b => b.id === repBatch);
      const data = await geminiService.generateReport({
        studentName: repStudentName,
        batchName: activeBatchObj ? activeBatchObj.name : 'Main Cohort',
        attendanceRate: repAttendance,
        scores: repScores,
        strengths: repStrengths,
        weaknesses: repWeaknesses,
        teacherRemarks: repRemarks
      });
      setReportResult(data.report);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const services = [
    { id: 'coach', name: 'AI Coach', group: 'student', desc: 'Doubt resolution & conceptual tutoring', icon: MessageSquare, color: 'text-violet-600 bg-violet-50' },
    { id: 'planner', name: 'AI Study Planner', group: 'student', desc: 'Personalized week blueprints', icon: CalendarClock, color: 'text-teal-600 bg-teal-50' },
    { id: 'performance_pred', name: 'AI Performance Prediction', group: 'student', desc: 'JEE/NEET percentile forecasts', icon: Award, color: 'text-amber-600 bg-amber-50' },
    { id: 'attendance_pred', name: 'AI Attendance Prediction', group: 'student', desc: 'Attendance forecasting & metrics', icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
    
    { id: 'quiz', name: 'AI Question Generator', group: 'instructor', desc: 'Generate & publish LMS tests', icon: BrainCircuit, color: 'text-indigo-600 bg-indigo-50' },
    { id: 'report', name: 'AI Report Generator', group: 'instructor', desc: 'Draft comprehensive report cards', icon: FileSpreadsheet, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'writing', name: 'AI Writing Assistant', group: 'instructor', desc: 'Official notice & message copywriter', icon: PenTool, color: 'text-fuchsia-600 bg-fuchsia-50' },
    { id: 'moderation', name: 'AI Chat Moderation', group: 'instructor', desc: 'Screen texts for safety policies', icon: ShieldCheck, color: 'text-rose-600 bg-rose-50' },
    { id: 'analytics', name: 'AI Analytics', group: 'instructor', desc: 'Academy performance intelligence', icon: BarChart3, color: 'text-sky-600 bg-sky-50' },
  ];

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 shadow-xxs">
      {/* Upper header summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-600 fill-indigo-100 animate-pulse" />
            <span>Learner's Den Centralized AI Services Suite</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">9 specialized neural modules powered by Gemini for coaching acceleration.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200/50 w-fit text-xxs font-bold text-slate-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Core Model: Gemini 3.5 Flash</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex gap-2.5 items-start">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <div>
            <p className="font-bold text-slate-800">Neural Gateway Resolution Failed</p>
            <p className="opacity-90 font-medium mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side Navigation Columns - 4/12 */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Student Services Group */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5 px-1.5">🎓 Student Copilot Desk</p>
            <div className="space-y-1">
              {services.filter(s => s.group === 'student').map((serv) => {
                const Icon = serv.icon;
                const isSelected = activeService === serv.id;
                return (
                  <button
                    key={serv.id}
                    onClick={() => {
                      setActiveService(serv.id as AIServiceId);
                      setError(null);
                      setCopied(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-all border flex items-center gap-3 ${
                      isSelected 
                        ? 'bg-white border-indigo-200 shadow-xs' 
                        : 'border-transparent hover:bg-slate-200/50 hover:border-slate-200'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${serv.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-indigo-600' : 'text-slate-700'}`}>{serv.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{serv.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instructor & Admin Group */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5 px-1.5">🏫 Instructor & Admin Panel</p>
            <div className="space-y-1">
              {services.filter(s => s.group === 'instructor').map((serv) => {
                const Icon = serv.icon;
                const isSelected = activeService === serv.id;
                return (
                  <button
                    key={serv.id}
                    onClick={() => {
                      setActiveService(serv.id as AIServiceId);
                      setError(null);
                      setCopied(false);
                      // Auto trigger analytics if selected
                      if (serv.id === 'analytics' && !analyticsData) {
                        handleGenerateAnalytics();
                      }
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-all border flex items-center gap-3 ${
                      isSelected 
                        ? 'bg-white border-indigo-200 shadow-xs' 
                        : 'border-transparent hover:bg-slate-200/50 hover:border-slate-200'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${serv.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-indigo-600' : 'text-slate-700'}`}>{serv.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{serv.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side Working Canvas - 9/12 */}
        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Active Service Forms - 5/12 */}
          <div className="md:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between">
            
            <div className="space-y-4">
              
              {/* Active Header Description */}
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">
                  Active Service Module
                </span>
                <h3 className="text-sm font-black text-slate-800 mt-1.5 flex items-center gap-1.5">
                  {React.createElement(services.find(s => s.id === activeService)?.icon || MessageSquare, { className: "h-4.5 w-4.5 text-indigo-600" })}
                  <span>{services.find(s => s.id === activeService)?.name}</span>
                </h3>
                <p className="text-xxs text-slate-400 mt-1 font-medium leading-relaxed">
                  {services.find(s => s.id === activeService)?.desc}. Configure parameter values below.
                </p>
              </div>

              {/* Form 1: AI Coach (Doubt) */}
              {activeService === 'coach' && (
                <form onSubmit={handleAskDoubt} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Subject Blueprint</label>
                    <select
                      value={doubtSubject}
                      onChange={(e) => setDoubtSubject(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-semibold"
                    >
                      <option value="Physics">Physics Mechanics / Wave Optics</option>
                      <option value="Chemistry">Organic & Inorganic Chemistry</option>
                      <option value="Mathematics">Algebra, Calculus & Geometry</option>
                      <option value="Biology">Plant Physiology & Anatomy</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Explain your Academic Query</label>
                    <textarea
                      required
                      rows={5}
                      value={doubtText}
                      onChange={(e) => setDoubtText(e.target.value)}
                      placeholder="e.g. Prove that the rate of change of angular momentum of a particle is equal to the torque acting on it."
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 text-slate-700 leading-normal"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span>Solve doubt with AI Coach</span>
                  </button>
                </form>
              )}

              {/* Form 2: AI Study Planner */}
              {activeService === 'planner' && (
                <form onSubmit={handleBuildPlan} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Competitive Target Exam</label>
                    <input
                      type="text"
                      required
                      value={examTarget}
                      onChange={(e) => setExamTarget(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
                      placeholder="e.g. IIT-JEE Advanced 2027"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Study Hours Available Daily</label>
                    <select
                      value={studyHours}
                      onChange={(e) => setStudyHours(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold bg-white"
                    >
                      <option value="3">3 Hours (Part-time / Board Focus)</option>
                      <option value="5">5 Hours (Standard Intensive)</option>
                      <option value="8">8+ Hours (Severe Cracker Mode)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Weak Academic Topics</label>
                    <textarea
                      required
                      rows={3}
                      value={weakAreas}
                      onChange={(e) => setWeakAreas(e.target.value)}
                      placeholder="e.g. integration limits, organic chemical structures"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
                    <span>Formulate 7-Day Plan</span>
                  </button>
                </form>
              )}

              {/* Form 3: AI Question Generator */}
              {activeService === 'quiz' && (
                <form onSubmit={handleQuizGenerateSubmit} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Topic Name</label>
                    <input
                      type="text"
                      required
                      value={quizTopic}
                      onChange={(e) => setQuizTopic(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700"
                      placeholder="e.g. Electromagnetic Induction"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Subject Blueprint</label>
                    <select
                      value={quizSubject}
                      onChange={(e) => setQuizSubject(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white"
                    >
                      <option value="Physics">Physics Mechanics</option>
                      <option value="Chemistry">Organic Chemistry</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Biology">Biology</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Assign Batch</label>
                      <select
                        value={quizBatchId}
                        onChange={(e) => setQuizBatchId(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white"
                      >
                        {batches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Counts</label>
                      <select
                        value={quizCount}
                        onChange={(e) => setQuizCount(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white"
                      >
                        <option value="3">3 MCQs</option>
                        <option value="5">5 MCQs</option>
                        <option value="10">10 MCQs</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-amber-300" />}
                    <span>Generate & Publish LMS Quiz</span>
                  </button>
                </form>
              )}

              {/* Form 4: AI Analytics */}
              {activeService === 'analytics' && (
                <div className="space-y-4 pt-2">
                  <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xxs font-semibold text-indigo-800 leading-normal">
                    💡 <b>Institutional Analytics</b> dynamically crawls overall active databases (enrolments, marks, attendances, digital materials, circulars) to evaluate operational status and strategic improvements.
                  </div>
                  <button
                    onClick={handleGenerateAnalytics}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 animate-spin" style={{ animationDuration: '4s' }} />}
                    <span>Recalculate & Crawl Academy DB</span>
                  </button>
                </div>
              )}

              {/* Form 5: AI Attendance Prediction */}
              {activeService === 'attendance_pred' && (
                <form onSubmit={handlePredictAttendance} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Scholar Key</label>
                    <input
                      type="text"
                      required
                      value={predStudentId}
                      onChange={(e) => setPredStudentId(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700"
                      placeholder="e.g. student-4"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      <span>Historical Rate</span>
                      <span className="text-indigo-600">{predAttendanceRate}%</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      value={predAttendanceRate}
                      onChange={(e) => setPredAttendanceRate(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      <span>Absences Missed Recently</span>
                      <span className="text-indigo-600">{predMissedClasses} classes</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      value={predMissedClasses}
                      onChange={(e) => setPredMissedClasses(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Leave Reasons Context</label>
                    <input
                      type="text"
                      value={predLeaveReasons}
                      onChange={(e) => setPredLeaveReasons(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700"
                      placeholder="e.g. fever, family wedding"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                    <span>Predict Attendance Path</span>
                  </button>
                </form>
              )}

              {/* Form 6: AI Performance Prediction */}
              {activeService === 'performance_pred' && (
                <form onSubmit={handlePredictPerformance} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Scholar Name</label>
                    <input
                      type="text"
                      required
                      value={perfStudentName}
                      onChange={(e) => setPerfStudentName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      <span>LMS Average test Score</span>
                      <span className="text-indigo-600">{perfAverageScore}%</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="100"
                      value={perfAverageScore}
                      onChange={(e) => setPerfAverageScore(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Strong Core Areas</label>
                    <input
                      type="text"
                      value={perfStrengths}
                      onChange={(e) => setPerfStrengths(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700"
                      placeholder="e.g. kinetics, calculus"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Weak/Unsolved Concepts</label>
                    <input
                      type="text"
                      value={perfWeakTopics}
                      onChange={(e) => setPerfWeakTopics(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700"
                      placeholder="e.g. thermodynamics"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Target Assessment</label>
                    <input
                      type="text"
                      value={perfExamTarget}
                      onChange={(e) => setPerfExamTarget(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
                    <span>Run Performance Predictor</span>
                  </button>
                </form>
              )}

              {/* Form 7: AI Writing Assistant */}
              {activeService === 'writing' && (
                <form onSubmit={handleWritingAssistant} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Circular / Notification Topic</label>
                    <textarea
                      required
                      rows={3}
                      value={writeTopic}
                      onChange={(e) => setWriteTopic(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700"
                      placeholder="e.g. Announcement of holiday test schedules"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Audience</label>
                      <select
                        value={writeRecipient}
                        onChange={(e) => setWriteRecipient(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white"
                      >
                        <option value="Parents">Parents</option>
                        <option value="Students">Students</option>
                        <option value="Tutors">Tutors</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Format</label>
                      <select
                        value={writeFormat}
                        onChange={(e) => setWriteFormat(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white"
                      >
                        <option value="Official Circular">Official Circular</option>
                        <option value="Parent SMS Alert">WhatsApp/SMS Copy</option>
                        <option value="App Notification">LMS Push Alert</option>
                        <option value="Newsletter Segment">Email Segment</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Tone & Voice</label>
                    <select
                      value={writeTone}
                      onChange={(e) => setWriteTone(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white font-semibold"
                    >
                      <option value="Professional & Formal">Formal & Professional</option>
                      <option value="Warm & Encouraging">Encouraging & Warm</option>
                      <option value="Urgent Policy Warning">Urgent / Alert Style</option>
                      <option value="Firm & Assertive">Firm & Assertive</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenTool className="h-4 w-4" />}
                    <span>Draft Dynamic Notice Copy</span>
                  </button>
                </form>
              )}

              {/* Form 8: AI Chat Moderation */}
              {activeService === 'moderation' && (
                <form onSubmit={handleChatModeration} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Screen Text Sandbox</label>
                    <textarea
                      required
                      rows={6}
                      value={modText}
                      onChange={(e) => setModText(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    <span>Analyze Content Compliance</span>
                  </button>
                </form>
              )}

              {/* Form 9: AI Report Generator */}
              {activeService === 'report' && (
                <form onSubmit={handleReportGenerator} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Student Name</label>
                    <input
                      type="text"
                      required
                      value={repStudentName}
                      onChange={(e) => setRepStudentName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Batch Division</label>
                      <select
                        value={repBatch}
                        onChange={(e) => setRepBatch(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white"
                      >
                        {batches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                        <span>Attendance</span>
                        <span className="text-indigo-600">{repAttendance}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={repAttendance}
                        onChange={(e) => setRepAttendance(Number(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Recent Scores List</label>
                      <input
                        type="text"
                        required
                        value={repScores}
                        onChange={(e) => setRepScores(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700"
                        placeholder="e.g. 78%, 85%, 69%"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Core Strengths</label>
                      <input
                        type="text"
                        required
                        value={repStrengths}
                        onChange={(e) => setRepStrengths(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Weak Syllabus Areas</label>
                    <input
                      type="text"
                      required
                      value={repWeaknesses}
                      onChange={(e) => setRepWeaknesses(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Tutor Remarks</label>
                    <input
                      type="text"
                      required
                      value={repRemarks}
                      onChange={(e) => setRepRemarks(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
                    <span>Compile Progress Report</span>
                  </button>
                </form>
              )}

            </div>

            {/* Small platform branding watermark */}
            <div className="pt-4 border-t border-slate-100/80 mt-5 hidden md:block">
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Info className="h-3 w-3 text-slate-300" />
                <span>Verified by Learner's Den Cognitive Hub</span>
              </p>
            </div>

          </div>

          {/* Response Viewer Output Area - 7/12 */}
          <div className="md:col-span-7 bg-slate-100 border border-slate-200 rounded-2xl p-5 relative flex flex-col justify-between min-h-[450px]">
            
            {/* Overlay loading glassmorphism */}
            {loading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6 z-10 rounded-2xl animate-in fade-in duration-200">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-3" />
                <p className="text-xs font-bold text-slate-800">Processing with Gemini 3.5 Flash...</p>
                <p className="text-xxs text-slate-400 mt-1 max-w-[250px] font-medium leading-relaxed">Analyzing credentials, compiling statistical records, and synthesizing pedagogical feedback logs.</p>
              </div>
            )}

            {/* Main Response Output Container */}
            <div className="flex-1 flex flex-col">
              
              {/* Output Header banner */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-indigo-600 shrink-0" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Response Terminal</p>
                    <h4 className="text-xs font-bold text-slate-700 mt-0.5">Real-time Resolution Output</h4>
                  </div>
                </div>
                
                {/* Copier Actions */}
                <div className="flex gap-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold bg-slate-200/50 px-2 py-0.5 rounded-md hidden sm:block">
                    UTC Time
                  </span>
                </div>
              </div>

              {/* Dynamic scrollable content depending on active service and state */}
              <div className="flex-1 overflow-y-auto pr-1">
                
                {/* Output 1: Doubt Response (Coach) */}
                {activeService === 'coach' && (
                  doubtResponse ? (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="p-3 bg-violet-50/70 rounded-xl border border-violet-100/80 text-xxs leading-relaxed font-semibold">
                        <p className="text-violet-800 uppercase font-black text-[10px] flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" /> Subject: {doubtSubject}
                        </p>
                        <p className="text-slate-500 italic mt-1 font-medium">Query: "{doubtText}"</p>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xxs">
                        <SimpleMarkdown text={doubtResponse} />
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400/80 p-8 my-auto">
                      <MessageSquare className="h-10 w-10 opacity-30 mb-2.5 text-indigo-500" />
                      <p className="text-xs font-bold">Awaiting doubt input</p>
                      <p className="text-xxs text-slate-400 mt-1 max-w-[240px] font-medium leading-relaxed">Your complex science and math queries will be parsed into beautiful step-by-step paragraphs with clear proofs.</p>
                    </div>
                  )
                )}

                {/* Output 2: Study Plan */}
                {activeService === 'planner' && (
                  plannerResponse ? (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-100/80 text-xxs font-semibold">
                        <p className="text-teal-800 uppercase font-black text-[10px]">
                          🎯 Targeted Schedule: {examTarget}
                        </p>
                        <p className="text-slate-500 mt-1 font-medium">Study hours: {studyHours} hr | Weak Areas: {weakAreas}</p>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xxs">
                        <SimpleMarkdown text={plannerResponse} />
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400/80 p-8 my-auto">
                      <CalendarClock className="h-10 w-10 opacity-30 mb-2.5 text-teal-500" />
                      <p className="text-xs font-bold">Custom study blueprints</p>
                      <p className="text-xxs text-slate-400 mt-1 max-w-[240px] font-medium leading-relaxed">Specify target exam and daily study limits to formulate daily concept revisions and mock checklists.</p>
                    </div>
                  )
                )}

                {/* Output 3: Question Generator success */}
                {activeService === 'quiz' && (
                  quizSuccessMsg ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-emerald-600 p-8 animate-in zoom-in-95 duration-200 my-auto">
                      <div className="h-11 w-11 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center mb-3 text-base font-black">
                        ✓
                      </div>
                      <p className="text-xs font-bold">{quizSuccessMsg}</p>
                      <p className="text-xxs text-slate-400 mt-1 max-w-[250px] font-medium leading-relaxed"> Tutors can access this published multiple-choice quiz from their online LMS dashboard list instantly.</p>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400/80 p-8 my-auto">
                      <BrainCircuit className="h-10 w-10 opacity-30 mb-2.5 text-indigo-500" />
                      <p className="text-xs font-bold">AI Mock Test Builder Panel</p>
                      <p className="text-xxs text-slate-400 mt-1 max-w-[240px] font-medium leading-relaxed">Enter any topic. Gemini will compile complex option options and log step-by-step explanations, saving hours of manual drafting.</p>
                    </div>
                  )
                )}

                {/* Output 4: AI Analytics Dashboard */}
                {activeService === 'analytics' && (
                  analyticsData ? (
                    <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                      
                      {/* Metric widgets */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xxs">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Academic Health Index</p>
                          <div className="flex items-center gap-2.5 mt-1.5">
                            <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-full rounded-full transition-all duration-1000" style={{ width: `${analyticsData.academicHealthIndex}%` }} />
                            </div>
                            <span className="font-extrabold text-slate-800 shrink-0 text-xs">{analyticsData.academicHealthIndex}%</span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xxs">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Attendance Stability</p>
                          <p className="text-xs font-extrabold text-indigo-600 mt-1.5 flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span>{analyticsData.attendanceStability}</span>
                          </p>
                        </div>
                      </div>

                      {/* Strategic Summary */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xxs space-y-2">
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5">Executive Summary</p>
                        <p className="text-slate-600 text-xxs font-medium leading-relaxed">{analyticsData.strategicSummary}</p>
                      </div>

                      {/* Insights */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xxs space-y-2">
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5">Deep Academic Insights</p>
                        <ul className="space-y-1.5 text-xxs font-medium text-slate-600">
                          {analyticsData.insights.map((ins: string, idx: number) => (
                            <li key={idx} className="flex gap-2 items-start">
                              <span className="text-indigo-500 font-extrabold shrink-0">0{idx + 1}.</span>
                              <span>{ins}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Recommendations */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xxs space-y-2">
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5">Strategic Recommendations</p>
                        <ul className="space-y-1.5 text-xxs font-medium text-slate-600">
                          {analyticsData.recommendations.map((rec: string, idx: number) => (
                            <li key={idx} className="flex gap-2 items-start">
                              <span className="text-emerald-500 shrink-0">✓</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400/80 p-8 my-auto">
                      <BarChart3 className="h-10 w-10 opacity-30 mb-2.5 text-sky-500" />
                      <p className="text-xs font-bold">Awaiting database crawls</p>
                      <p className="text-xxs text-slate-400 mt-1 max-w-[240px] font-medium leading-relaxed">Crawl active databases to measure system performance and identify syllabus deficiencies automatically.</p>
                    </div>
                  )
                )}

                {/* Output 5: AI Attendance Prediction */}
                {activeService === 'attendance_pred' && (
                  attendancePredictionResult ? (
                    <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                      
                      {/* Metric meter */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xxs flex justify-between items-center">
                        <div className="space-y-1.5">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Projected Attendance Rate</p>
                          <h4 className="text-xl font-black text-slate-800">{attendancePredictionResult.projectedAttendanceRate}%</h4>
                          <p className="text-[10px] text-slate-400 font-medium">For the upcoming 30-day competitive phase.</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">safety risk level</p>
                          <span className={`inline-block px-3 py-1 text-xxs font-black uppercase rounded-lg border mt-1.5 ${
                            attendancePredictionResult.riskLevel === 'Low' 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                              : attendancePredictionResult.riskLevel === 'Medium'
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : 'bg-rose-50 border-rose-200 text-rose-700'
                          }`}>
                            {attendancePredictionResult.riskLevel}
                          </span>
                        </div>
                      </div>

                      {/* Predictive Analysis */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xxs space-y-2">
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5">Statistical Risk Forecast</p>
                        <p className="text-slate-600 text-xxs font-medium leading-relaxed">{attendancePredictionResult.predictiveAnalysis}</p>
                      </div>

                      {/* Risk factors */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xxs space-y-2">
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5">Absence Drivers Detected</p>
                        <ul className="space-y-1.5 text-xxs font-medium text-slate-600">
                          {attendancePredictionResult.riskFactors.map((f: string, i: number) => (
                            <li key={i} className="flex gap-2 items-start">
                              <span className="text-rose-500 shrink-0">⚠️</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Interventions */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xxs space-y-2">
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5">Corrective Actions</p>
                        <ul className="space-y-1.5 text-xxs font-medium text-slate-600">
                          {attendancePredictionResult.interventions.map((iv: string, i: number) => (
                            <li key={i} className="flex gap-2 items-start">
                              <span className="text-indigo-500 shrink-0">→</span>
                              <span>{iv}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400/80 p-8 my-auto">
                      <TrendingUp className="h-10 w-10 opacity-30 mb-2.5 text-blue-500" />
                      <p className="text-xs font-bold">Awaiting prediction trigger</p>
                      <p className="text-xxs text-slate-400 mt-1 max-w-[240px] font-medium leading-relaxed">Predict upcoming attendance risks based on leave submissions and recent classroom check-ins.</p>
                    </div>
                  )
                )}

                {/* Output 6: Performance Forecast */}
                {activeService === 'performance_pred' && (
                  performancePredictionResult ? (
                    <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                      
                      {/* Metric meter */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xxs flex justify-between items-center">
                        <div className="space-y-1.5">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Projected competitive Percentile</p>
                          <h4 className="text-xl font-black text-indigo-600">{performancePredictionResult.predictedPercentile} Percentile</h4>
                          <p className="text-[10px] text-slate-400 font-medium">Estimated range based on active LMS mock score curves.</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Qualification Status</p>
                          <span className={`inline-block px-3 py-1 text-xxs font-black uppercase rounded-lg border mt-1.5 ${
                            performancePredictionResult.qualificationLikelihood === 'Highly Likely' 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                              : performancePredictionResult.qualificationLikelihood === 'Moderate'
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : 'bg-rose-50 border-rose-200 text-rose-700'
                          }`}>
                            {performancePredictionResult.qualificationLikelihood}
                          </span>
                        </div>
                      </div>

                      {/* Cognitive Gap Analysis */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xxs space-y-2">
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5">Cognitive Gap Evaluation</p>
                        <p className="text-slate-600 text-xxs font-medium leading-relaxed">{performancePredictionResult.cognitiveGapAnalysis}</p>
                      </div>

                      {/* Sub-metrics progress lines */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xxs space-y-3">
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5">Academic Readiness Metrics</p>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xxs font-bold text-slate-500">
                            <span>Conceptual Accuracy</span>
                            <span>{performancePredictionResult.examReadinessMetrics.conceptualAccuracy}%</span>
                          </div>
                          <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-violet-500 h-full rounded-full" style={{ width: `${performancePredictionResult.examReadinessMetrics.conceptualAccuracy}%` }} />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xxs font-bold text-slate-500">
                            <span>Speed & Exam Timing</span>
                            <span>{performancePredictionResult.examReadinessMetrics.speedAndTiming}%</span>
                          </div>
                          <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-teal-500 h-full rounded-full" style={{ width: `${performancePredictionResult.examReadinessMetrics.speedAndTiming}%` }} />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xxs font-bold text-slate-500">
                            <span>Stress Adaptation</span>
                            <span>{performancePredictionResult.examReadinessMetrics.stressAdaptation}%</span>
                          </div>
                          <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${performancePredictionResult.examReadinessMetrics.stressAdaptation}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Recommended milestones */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xxs space-y-2">
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5">Action Milestones</p>
                        <ul className="space-y-1.5 text-xxs font-medium text-slate-600">
                          {performancePredictionResult.recommendedMilestones.map((m: string, i: number) => (
                            <li key={i} className="flex gap-2 items-start">
                              <span className="text-indigo-500 font-extrabold">0{i+1}.</span>
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400/80 p-8 my-auto">
                      <Award className="h-10 w-10 opacity-30 mb-2.5 text-indigo-500" />
                      <p className="text-xs font-bold">Predict Percentile Range</p>
                      <p className="text-xxs text-slate-400 mt-1 max-w-[240px] font-medium leading-relaxed">Enter average exam marks and weak syllabus topics to predict percentiles and secure qualification checkpoints.</p>
                    </div>
                  )
                )}

                {/* Output 7: Writing Assistant Draft */}
                {activeService === 'writing' && (
                  writingAssistantResult ? (
                    <div className="space-y-3 animate-in fade-in duration-200 text-xs">
                      <div className="flex justify-between items-center px-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Generated Communications Copy</p>
                        <button
                          onClick={() => triggerCopy(writingAssistantResult)}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-xxs"
                        >
                          {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          <span>{copied ? 'Copied Draft' : 'Copy to Clipboard'}</span>
                        </button>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200/80 font-medium text-slate-700 whitespace-pre-wrap leading-relaxed shadow-xxs font-mono text-[11px] max-h-[350px] overflow-y-auto">
                        {writingAssistantResult}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400/80 p-8 my-auto">
                      <PenTool className="h-10 w-10 opacity-30 mb-2.5 text-fuchsia-500" />
                      <p className="text-xs font-bold">Awaiting draft parameters</p>
                      <p className="text-xxs text-slate-400 mt-1 max-w-[240px] font-medium leading-relaxed">Generate beautiful notice letters, email segments, and WhatsApp circular announcements instantly in 4 tones.</p>
                    </div>
                  )
                )}

                {/* Output 8: Chat Moderation results */}
                {activeService === 'moderation' && (
                  moderationResult ? (
                    <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                      
                      {/* Safety flag banner */}
                      <div className={`p-4 rounded-xl border shadow-xxs flex justify-between items-center ${
                        moderationResult.flagged 
                          ? 'bg-rose-50 border-rose-200 text-rose-800' 
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      }`}>
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold uppercase tracking-wider opacity-60">Safety Screening Verdict</p>
                          <h4 className="text-sm font-black flex items-center gap-1.5">
                            {moderationResult.flagged ? <ShieldAlert className="h-4.5 w-4.5 text-rose-500" /> : <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />}
                            <span>{moderationResult.flagged ? 'Content Blocked / Flagged' : 'Passed Safety Compliance'}</span>
                          </h4>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[9px] font-bold uppercase tracking-wider opacity-60">Safety Score</p>
                          <span className={`text-base font-black ${moderationResult.safetyScore >= 80 ? 'text-emerald-600' : moderationResult.safetyScore >= 50 ? 'text-amber-500' : 'text-rose-600'}`}>
                            {moderationResult.safetyScore} / 100
                          </span>
                        </div>
                      </div>

                      {/* Detailed evaluation */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xxs space-y-2">
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5">Reasoning Log</p>
                        <p className="text-slate-600 text-xxs font-medium leading-relaxed">{moderationResult.explanation}</p>
                      </div>

                      {/* Policy Category & Action */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xxs">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Violated Category</p>
                          <p className="text-xs font-bold text-slate-700 mt-1">{moderationResult.category}</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xxs">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Suggested action</p>
                          <p className={`text-xs font-black uppercase mt-1 ${moderationResult.suggestedAction === 'allow' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {moderationResult.suggestedAction}
                          </p>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400/80 p-8 my-auto">
                      <ShieldCheck className="h-10 w-10 opacity-30 mb-2.5 text-rose-500" />
                      <p className="text-xs font-bold">Awaiting safety text sandbox</p>
                      <p className="text-xxs text-slate-400 mt-1 max-w-[240px] font-medium leading-relaxed">Paste messages here to trigger advanced Gemini evaluation for spam, cheating, links, and general policy abuse.</p>
                    </div>
                  )
                )}

                {/* Output 9: AI Report Card printable view */}
                {activeService === 'report' && (
                  reportResult ? (
                    <div className="space-y-3 animate-in fade-in duration-200 text-xs">
                      <div className="flex justify-between items-center px-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Report Card Draft</p>
                        <button
                          onClick={() => triggerCopy(reportResult)}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-xxs"
                        >
                          {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          <span>{copied ? 'Copied Report' : 'Copy Report Copy'}</span>
                        </button>
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-slate-200/80 font-medium text-slate-700 whitespace-pre-wrap leading-relaxed shadow-xs font-mono text-[11px] max-h-[350px] overflow-y-auto border-t-4 border-t-indigo-600">
                        {reportResult}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400/80 p-8 my-auto">
                      <FileSpreadsheet className="h-10 w-10 opacity-30 mb-2.5 text-emerald-500" />
                      <p className="text-xs font-bold">Academic report compiler</p>
                      <p className="text-xxs text-slate-400 mt-1 max-w-[240px] font-medium leading-relaxed">Synthesize comprehensive report cards for parents containing score correlations, behavioral analytics, and tailored recovery paths.</p>
                    </div>
                  )
                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
