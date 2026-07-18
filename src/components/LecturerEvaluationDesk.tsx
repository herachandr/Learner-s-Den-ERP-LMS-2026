import React, { useState } from 'react';
import { 
  Star, MessageSquare, CheckCircle2, Sliders, 
  Calendar, AlertCircle, Sparkles, Send, 
  User, ShieldAlert, Award, Volume2, 
  Brain, Shield, Smartphone, Heart, Zap, 
  HelpCircle, Gauge, Lightbulb 
} from 'lucide-react';
import { Teacher, LecturerEvaluation } from '../types';

interface LecturerEvaluationDeskProps {
  currentUser: any;
  currentRole: 'student' | 'teacher' | 'admin';
  teachers: Teacher[];
  candidates: any[];
  evaluations: LecturerEvaluation[];
  onAddEvaluation: (evalItem: LecturerEvaluation) => void;
}

export default function LecturerEvaluationDesk({
  currentUser,
  currentRole,
  teachers,
  candidates,
  evaluations,
  onAddEvaluation,
}: LecturerEvaluationDeskProps) {
  // Student state
  const [selectedLecturerId, setSelectedLecturerId] = useState('');
  const [isDemoType, setIsDemoType] = useState(true);
  const [month, setMonth] = useState('July 2026');
  
  // Evaluation criteria on 1-10 scale
  const [ratingLoudClear, setRatingLoudClear] = useState(10);
  const [ratingTalented, setRatingTalented] = useState(10);
  const [ratingClassManagement, setRatingClassManagement] = useState(10);
  const [ratingGadgetFree, setRatingGadgetFree] = useState(10);
  const [ratingTemperControl, setRatingTemperControl] = useState(10);
  const [ratingActiveEnergy, setRatingActiveEnergy] = useState(10);
  const [ratingInteractive, setRatingInteractive] = useState(10);
  const [ratingPaceOfTeaching, setRatingPaceOfTeaching] = useState(10);
  const [ratingRealLifeContext, setRatingRealLifeContext] = useState(10);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Filter for teacher view
  const [teacherFilter, setTeacherFilter] = useState<'all' | 'demo' | 'regular'>('all');

  // Identify all possible rateable lecturers:
  // 1. Regular teachers from system
  // 2. Candidates in "Demo Lecture" stage
  const activeDemoCandidates = candidates.filter(c => c.status === 'Demo Lecture' || c.status === 'Interviewing');
  
  const selectedLecturer = 
    teachers.find(t => t.id === selectedLecturerId) || 
    activeDemoCandidates.find(c => c.id === selectedLecturerId);

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLecturerId) return;

    const newEval: LecturerEvaluation = {
      id: `ev-${Date.now()}`,
      lecturerId: selectedLecturerId,
      lecturerName: selectedLecturer?.name || 'Unknown Lecturer',
      isDemo: isDemoType,
      month: isDemoType ? undefined : month,
      studentId: currentUser?.associatedId || 'student-anonymous',
      ratingLoudClear,
      ratingTalented,
      ratingClassManagement,
      ratingGadgetFree,
      ratingTemperControl,
      ratingActiveEnergy,
      ratingInteractive,
      ratingPaceOfTeaching,
      ratingRealLifeContext,
      comments: comments.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    onAddEvaluation(newEval);
    setSubmitted(true);
    setComments('');
    
    // Reset state
    setTimeout(() => {
      setSubmitted(false);
      setSelectedLecturerId('');
    }, 3000);
  };

  // Helper score rendering styling
  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-emerald-600 bg-emerald-50 border-emerald-150';
    if (score >= 6.5) return 'text-amber-600 bg-amber-50 border-amber-150';
    return 'text-rose-600 bg-rose-50 border-rose-150';
  };

  const getBarColor = (score: number) => {
    if (score >= 8.5) return 'bg-emerald-500';
    if (score >= 6.5) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  // TEACHER VIEW: Filtered list of evaluations
  const teacherId = currentUser?.associatedId || 'teacher-1';
  const myEvaluations = evaluations.filter(ev => ev.lecturerId === teacherId);
  const filteredMyEvals = myEvaluations.filter(ev => {
    if (teacherFilter === 'demo') return ev.isDemo;
    if (teacherFilter === 'regular') return !ev.isDemo;
    return true;
  });

  // Calculate aggregates
  const calculateAverage = (key: keyof LecturerEvaluation) => {
    if (filteredMyEvals.length === 0) return 0;
    const sum = filteredMyEvals.reduce((acc, ev) => acc + (ev[key] as number), 0);
    return Math.round((sum / filteredMyEvals.length) * 10) / 10;
  };

  const avgLoudClear = calculateAverage('ratingLoudClear');
  const avgTalented = calculateAverage('ratingTalented');
  const avgClassMgmt = calculateAverage('ratingClassManagement');
  const avgGadgetFree = calculateAverage('ratingGadgetFree');
  const avgTemperCtrl = calculateAverage('ratingTemperControl');
  const avgActiveEnergy = calculateAverage('ratingActiveEnergy');
  const avgInteractive = calculateAverage('ratingInteractive');
  const avgPace = calculateAverage('ratingPaceOfTeaching');
  const avgRealLife = calculateAverage('ratingRealLifeContext');

  const totalAvg = Math.round(
    ((avgLoudClear + avgTalented + avgClassMgmt + avgGadgetFree + avgTemperCtrl + avgActiveEnergy + avgInteractive + avgPace + avgRealLife) / 9) * 10
  ) / 10;

  // Criteria data array for mapping
  const dimensions = [
    { label: 'Loud & Clear Voice', val: avgLoudClear, desc: 'Voice projection, clarity, and auditory reach', icon: Volume2 },
    { label: 'Subject Talent & Depth', val: avgTalented, desc: 'Conceptual depth, command, and mastery', icon: Brain },
    { label: 'Classroom Management', val: avgClassMgmt, desc: 'Discipline, attention holding, and decorum', icon: Shield },
    { label: 'Freedom from Gadgets', val: avgGadgetFree, desc: 'Device avoidance & absolute focus on class', icon: Smartphone },
    { label: 'Patience & Calmness', val: avgTemperCtrl, desc: 'Not short-tempered, student-friendly tone', icon: Heart },
    { label: 'Class Energy & Vitality', val: avgActiveEnergy, desc: 'Vibrant presence, interactive teaching (not passive)', icon: Zap },
    { label: 'Interactivity & Questioning', val: avgInteractive, desc: 'Stirring engagement & dynamic Q&A', icon: HelpCircle },
    { label: 'Teaching Pace (Speed)', val: avgPace, desc: 'Optimal timing aligned with student capacity', icon: Gauge },
    { label: 'Real-Life Contextualization', val: avgRealLife, desc: 'Relating logic to practical applications', icon: Lightbulb },
  ];

  if (currentRole === 'teacher') {
    return (
      <div id="teacher-anonymous-feedback-desk" className="space-y-6 animate-fadeIn">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-left space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
                <span>My Anonymous Student Evaluations</span>
              </h2>
              <p className="text-xs text-slate-400">Read monthly regular feedbacks and active demo class reviews submitted anonymously by students.</p>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setTeacherFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xxs font-black transition-all cursor-pointer ${
                  teacherFilter === 'all' ? 'bg-white text-slate-800 shadow-xxs' : 'text-slate-450 hover:text-slate-700'
                }`}
              >
                All Feedbacks ({myEvaluations.length})
              </button>
              <button
                onClick={() => setTeacherFilter('regular')}
                className={`px-3 py-1.5 rounded-lg text-xxs font-black transition-all cursor-pointer ${
                  teacherFilter === 'regular' ? 'bg-white text-emerald-700 shadow-xxs' : 'text-slate-450 hover:text-emerald-750'
                }`}
              >
                Regular Monthly ({myEvaluations.filter(e => !e.isDemo).length})
              </button>
              <button
                onClick={() => setTeacherFilter('demo')}
                className={`px-3 py-1.5 rounded-lg text-xxs font-black transition-all cursor-pointer ${
                  teacherFilter === 'demo' ? 'bg-white text-indigo-700 shadow-xxs' : 'text-slate-450 hover:text-indigo-750'
                }`}
              >
                Demo Class ({myEvaluations.filter(e => e.isDemo).length})
              </button>
            </div>
          </div>

          {filteredMyEvals.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-slate-200 rounded-2xl">
              <ShieldAlert className="h-10 w-10 mx-auto text-slate-350 opacity-50 mb-3" />
              <h3 className="text-sm font-black text-slate-700">No Evaluations Logged</h3>
              <p className="text-xxs text-slate-400 max-w-sm mx-auto mt-1">Students have not yet completed standard evaluation forms for this category in this session cycle.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Overall scorecard */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-150/70 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 justify-between">
                <div className="space-y-1 text-center md:text-left">
                  <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wider">My Dynamic Pedagogy Score</h3>
                  <p className="text-xxs text-emerald-800 font-bold leading-relaxed max-w-md">
                    Based on {filteredMyEvals.length} anonymous responses, your classroom index is compiled on standard parameters including real-world connection, active vitality, and gadget avoidance.
                  </p>
                </div>
                <div className="bg-white border border-emerald-200 rounded-2xl p-4 text-center shrink-0 shadow-sm w-36">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate rating</p>
                  <p className="text-3xl font-black text-emerald-600 mt-1">{totalAvg} <span className="text-xs text-slate-400">/10</span></p>
                </div>
              </div>

              {/* Dimensions matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dimensions.map((dim) => {
                  const Icon = dim.icon;
                  return (
                    <div key={dim.label} className="border border-slate-100 rounded-2xl p-4.5 bg-slate-50/20 space-y-3 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 shrink-0">
                            <Icon className="h-4 w-4" />
                          </div>
                          <h4 className="text-xxs font-black text-slate-700 uppercase tracking-wider">{dim.label}</h4>
                        </div>
                        <p className="text-[10px] text-slate-450 font-bold leading-normal">{dim.desc}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-extrabold">Average Student Score</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${getScoreColor(dim.val)}`}>
                            {dim.val || 'N/A'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-150 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${getBarColor(dim.val)}`} 
                            style={{ width: `${(dim.val || 0) * 10}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Comments Stream */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                  <MessageSquare className="h-4 w-4 text-slate-500" />
                  <span>Student Review Comments (Anonymous)</span>
                </h3>

                <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
                  {filteredMyEvals.filter(ev => ev.comments).map((ev) => (
                    <div key={ev.id} className="border border-slate-100 bg-white rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-xxs">
                      <div className="flex items-center justify-between text-xxs font-bold text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {ev.isDemo ? 'Demo Class Evaluation' : `Monthly evaluation: ${ev.month}`}
                        </span>
                        <span>{new Date(ev.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-700 leading-relaxed italic border-l-3 border-emerald-500 pl-3">
                        "{ev.comments}"
                      </p>
                    </div>
                  ))}
                  {filteredMyEvals.filter(ev => ev.comments).length === 0 && (
                    <p className="text-xxs text-slate-400 italic text-center py-4">No written review comments submitted yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // STUDENT VIEW: Fill out Feedback
  return (
    <div id="student-lecturer-evaluation-desk" className="space-y-6 animate-fadeIn text-left">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-600" />
            <span>Lecturer Evaluation Desk</span>
          </h2>
          <p className="text-xs text-slate-400">Provide direct, completely anonymous evaluations to your regular teachers and demo candidates to refine our educational standards.</p>
        </div>

        {submitted ? (
          <div className="py-12 text-center bg-emerald-50 border border-emerald-150 rounded-2xl space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-sm font-black text-emerald-900">Evaluation Submitted Anonymously!</h3>
            <p className="text-xxs text-emerald-700 max-w-sm mx-auto font-semibold">Your metrics and remarks are successfully logged. Your identity has been encrypted; this feedback goes directly to the instructor and administration anonymously.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitEvaluation} className="space-y-6">
            {/* Target Teacher selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Select Lecturer / Candidate</label>
                <select
                  required
                  value={selectedLecturerId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedLecturerId(val);
                    // Automatically pre-toggle class type based on whether they are demo or regular
                    const isDemo = activeDemoCandidates.some(c => c.id === val);
                    setIsDemoType(isDemo);
                  }}
                  className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                >
                  <option value="">-- Choose Lecturer --</option>
                  
                  {activeDemoCandidates.length > 0 && (
                    <optgroup label="✨ Demo Lecture Auditions (Candidates)">
                      {activeDemoCandidates.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                      ))}
                    </optgroup>
                  )}

                  <optgroup label="👨‍🏫 Regular Academic Faculty (Teachers)">
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Lecture Class Session Type</label>
                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-750 cursor-pointer">
                    <input
                      type="radio"
                      name="lectureType"
                      checked={isDemoType}
                      onChange={() => setIsDemoType(true)}
                      className="accent-indigo-600"
                    />
                    <span>Demo Lecture / Audition</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-750 cursor-pointer">
                    <input
                      type="radio"
                      name="lectureType"
                      checked={!isDemoType}
                      onChange={() => setIsDemoType(false)}
                      className="accent-indigo-600"
                    />
                    <span>Regular Monthly Session</span>
                  </label>
                </div>
              </div>
            </div>

            {/* If regular, select the evaluation month */}
            {!isDemoType && (
              <div className="w-full md:w-1/2">
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Evaluation Cycle Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                >
                  <option value="June 2026">June 2026</option>
                  <option value="July 2026">July 2026 (Current)</option>
                  <option value="August 2026">August 2026</option>
                </select>
              </div>
            )}

            {selectedLecturerId ? (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-4 bg-indigo-50 border border-indigo-150 rounded-2xl flex items-start gap-3 text-xxs font-bold text-indigo-800">
                  <ShieldAlert className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                  <div>
                    <p className="uppercase tracking-widest text-[8px] text-indigo-500 font-black">Anonymous Privacy Active</p>
                    <p className="mt-0.5 leading-relaxed">Evaluating <span className="font-black text-indigo-950 underline">{selectedLecturer?.name}</span>. Your rating dimensions are processed without displaying student details, ensuring transparent, risk-free reviews.</p>
                  </div>
                </div>

                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Sliders className="h-4 w-4 text-indigo-550" />
                  <span>Rating Metrics Matrix (Scale of 1 - 10)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Metric 1 */}
                  <div className="space-y-2 border border-slate-100 bg-slate-50/10 p-4 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-800">1. Loud & Clear Voice</span>
                      <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-xxs font-black">{ratingLoudClear}/10</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">Teacher is audible and speech is extremely clean</p>
                    <input 
                      type="range" min="1" max="10" 
                      value={ratingLoudClear} 
                      onChange={(e) => setRatingLoudClear(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Metric 2 */}
                  <div className="space-y-2 border border-slate-100 bg-slate-50/10 p-4 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-800">2. Domain Expertise & Talent</span>
                      <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-xxs font-black">{ratingTalented}/10</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">Understands doubts and demonstrates supreme concept mastery</p>
                    <input 
                      type="range" min="1" max="10" 
                      value={ratingTalented} 
                      onChange={(e) => setRatingTalented(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Metric 3 */}
                  <div className="space-y-2 border border-slate-100 bg-slate-50/10 p-4 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-800">3. Class Management</span>
                      <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-xxs font-black">{ratingClassManagement}/10</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">Keeps classroom quiet, maintains strict pedagogical focus</p>
                    <input 
                      type="range" min="1" max="10" 
                      value={ratingClassManagement} 
                      onChange={(e) => setRatingClassManagement(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Metric 4 */}
                  <div className="space-y-2 border border-slate-100 bg-slate-50/10 p-4 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-800">4. Freedom from Gadgets</span>
                      <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-xxs font-black">{ratingGadgetFree}/10</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">Teacher is not addicted to gadgets or looking at phones during lecture</p>
                    <input 
                      type="range" min="1" max="10" 
                      value={ratingGadgetFree} 
                      onChange={(e) => setRatingGadgetFree(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Metric 5 */}
                  <div className="space-y-2 border border-slate-100 bg-slate-50/10 p-4 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-800">5. Patience (Not Short-Tempered)</span>
                      <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-xxs font-black">{ratingTemperControl}/10</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">Stays patient with slow learners, is not aggressive or rude</p>
                    <input 
                      type="range" min="1" max="10" 
                      value={ratingTemperControl} 
                      onChange={(e) => setRatingTemperControl(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Metric 6 */}
                  <div className="space-y-2 border border-slate-100 bg-slate-50/10 p-4 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-800">6. Active Classroom Vitality</span>
                      <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-xxs font-black">{ratingActiveEnergy}/10</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">Energetic and active presence, not being passive or boring</p>
                    <input 
                      type="range" min="1" max="10" 
                      value={ratingActiveEnergy} 
                      onChange={(e) => setRatingActiveEnergy(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Metric 7 */}
                  <div className="space-y-2 border border-slate-100 bg-slate-50/10 p-4 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-800">7. Interactive Engagement</span>
                      <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-xxs font-black">{ratingInteractive}/10</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">Asks questions frequently, prompts discussion loops</p>
                    <input 
                      type="range" min="1" max="10" 
                      value={ratingInteractive} 
                      onChange={(e) => setRatingInteractive(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Metric 8 */}
                  <div className="space-y-2 border border-slate-100 bg-slate-50/10 p-4 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-800">8. Optimal Teaching Pace</span>
                      <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-xxs font-black">{ratingPaceOfTeaching}/10</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">Teaching speed is highly appropriate (not too rushed or slow)</p>
                    <input 
                      type="range" min="1" max="10" 
                      value={ratingPaceOfTeaching} 
                      onChange={(e) => setRatingPaceOfTeaching(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Metric 9 */}
                  <div className="space-y-2 border border-slate-100 bg-slate-50/10 p-4 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-800">9. Real-life Contextualizing</span>
                      <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-xxs font-black">{ratingRealLifeContext}/10</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">Ties formulas/topics to real-life examples and practical labs</p>
                    <input 
                      type="range" min="1" max="10" 
                      value={ratingRealLifeContext} 
                      onChange={(e) => setRatingRealLifeContext(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xxs font-black text-slate-500 uppercase">Written Remarks / Specific Suggestions (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Provide any extra details about the lecture experience..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-xl p-3 text-xs text-slate-850 font-semibold focus:outline-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all w-full sm:w-auto"
                >
                  <Send className="h-4 w-4" />
                  <span>Submit Anonymous Evaluation</span>
                </button>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                <Sliders className="h-8 w-8 mx-auto opacity-30 mb-2" />
                <p className="text-xs font-bold">Please select a Lecturer / Candidate from the dropdown to activate the matrix.</p>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
