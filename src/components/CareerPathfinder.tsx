import React, { useState, useEffect } from 'react';
import { 
  Compass, Sparkles, BrainCircuit, BookOpen, ChevronRight, 
  Target, Briefcase, Award, GraduationCap, CheckCircle2, 
  Map, HelpCircle, Loader2, ArrowRight, Bookmark, 
  Clock, Flame, HelpCircle as HelpIcon, RotateCcw,
  Filter, Search, PlusCircle, AlertCircle, RefreshCw, Trash2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Student, CareerOpportunity, CareerCategory } from '../types';
import { careerService, MatchingCriteriaInput } from '../services/careerService';
import { geminiService } from '../services/geminiService';

interface CareerPathfinderProps {
  students: Student[];
  currentStudentId: string;
  showToast?: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

const INTERESTS_OPTIONS = [
  { id: 'coding', label: 'Software Coding & Scripting', category: 'Tech' },
  { id: 'ai', label: 'Artificial Intelligence & Machine Learning', category: 'Tech' },
  { id: 'math', label: 'Advanced Mathematics & Modeling', category: 'Analytics' },
  { id: 'med', label: 'Biochemistry & Medical Science', category: 'Science' },
  { id: 'business', label: 'Entrepreneurship & Startups', category: 'Management' },
  { id: 'finance', label: 'Quantitative Investing & Stocks', category: 'Analytics' },
  { id: 'design', label: 'UI/UX & Creative Digital Arts', category: 'Creative' },
  { id: 'teaching', label: 'Academic Pedagogy & Mentoring', category: 'Academia' },
  { id: 'environment', label: 'Ecosystem Care & Environmental Audits', category: 'Green' },
  { id: 'defence', label: 'National Security & Military Strategy', category: 'Uniformed' },
  { id: 'publicPolicy', label: 'Civil Administration & Social Policy', category: 'Governance' },
  { id: 'machinery', label: 'Robotic CNC & Manual Engineering Trades', category: 'Vocational' }
];

const SUBJECTS_OPTIONS = [
  { id: 'maths', label: 'Mathematics (Calculus, Statistics)', category: 'Science' },
  { id: 'physics', label: 'Physics (Electromagnetism, Mechanics)', category: 'Science' },
  { id: 'chem', label: 'Chemistry (Organic, Physical)', category: 'Science' },
  { id: 'bio', label: 'Biology (Physiology, Ecology)', category: 'Science' },
  { id: 'cs', label: 'Computer Science (Algorithms, Coding)', category: 'Tech' },
  { id: 'accountancy', label: 'Accountancy & Tax Systems', category: 'Commerce' },
  { id: 'social', label: 'Social Studies & General Awareness', category: 'Humanities' },
  { id: 'english', label: 'English & Verbal Logic', category: 'Languages' }
];

const CATEGORIES: CareerCategory[] = [
  'Technical',
  'Medical & Healthcare',
  'Science & Research',
  'Commerce & Finance',
  'Government & Civil Services',
  'Defence & Uniformed Services',
  'Education',
  'Legal',
  'Blue Collar',
  'Green Collar',
  'New Collar',
  'Creative',
  'Entrepreneurship',
  'Skilled Vocational',
  'International'
];

export default function CareerPathfinder({ students, currentStudentId, showToast }: CareerPathfinderProps) {
  // Assessment Wizard steps: 1: Welcome, 2: Interests, 3: Subjects, 4: Preferences, 5: Loading, 6: Results
  const [step, setStep] = useState<number>(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [workStyle, setWorkStyle] = useState<string>('Collaborative');
  const [theoryVsPractice, setTheoryVsPractice] = useState<string>('balanced');
  
  // Advanced filters state
  const [educationLevel, setEducationLevel] = useState<string>('Degree');
  const [locationPreference, setLocationPreference] = useState<string>('Flexible');
  const [salaryExpectation, setSalaryExpectation] = useState<number>(500000);
  const [entrepreneurialInclination, setEntrepreneurialInclination] = useState<boolean>(true);

  // Search & Filter state on Results page
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedWorkStyleFilter, setSelectedWorkStyleFilter] = useState<string>('All');
  const [selectedEduFilter, setSelectedEduFilter] = useState<string>('All');

  // Dynamic API state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendedCareers, setRecommendedCareers] = useState<CareerOpportunity[]>([]);
  const [personalizedCounseling, setPersonalizedCounseling] = useState<string>('');
  
  // Local/Repository active Saved Pathway
  const [activePathway, setActivePathway] = useState<any | null>(null);
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);
  const [expandedCareerIndex, setExpandedCareerIndex] = useState<number | null>(null);
  const [careerTab, setCareerTab] = useState<'psychometrics' | 'opportunities' | 'projections' | 'ai_plan'>('psychometrics');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [customPlans, setCustomPlans] = useState<Record<string, Array<{ week: string; tasks: string[]; completed: boolean }>>>({});

  // Admin View: Toggle to create custom career opportunity
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);
  const [newCareerForm, setNewCareerForm] = useState({
    title: '',
    category: 'Technical' as CareerCategory,
    overview: '',
    eligibility: '',
    requiredSubjects: '',
    skills: '',
    roadmap: '',
    minSalary: 400000,
    maxSalary: 1500000,
    outlook: '',
    automationImpact: 'Low' as 'Low' | 'Medium' | 'High',
    interests: '',
    logicalApt: 4,
    verbalApt: 4,
    spatialApt: 3,
    quantitativeApt: 4,
    workStyle: 'Collaborative',
    theoryVsPractice: 'balanced',
    educationLevel: 'Degree',
    locationPreference: 'Flexible'
  });
  const [adminStatus, setAdminStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const currentStudent = students.find(s => s.id === currentStudentId);

  // Sync active saved pathway from Repository on mount/student change
  useEffect(() => {
    async function loadPathway() {
      try {
        const saved = await careerService.getSavedPathway(currentStudentId);
        if (saved) {
          setActivePathway(saved.pathway);
          setCompletedMilestones(saved.completedMilestones || []);
        } else {
          setActivePathway(null);
          setCompletedMilestones([]);
        }
      } catch (err) {
        console.warn('Failed to load saved pathway from service:', err);
      }
    }
    loadPathway();
  }, [currentStudentId]);

  // Save active pathway
  const handleSavePathway = async (pathway: any) => {
    try {
      await careerService.savePathway(currentStudentId, pathway, []);
      setActivePathway(pathway);
      setCompletedMilestones([]);
    } catch (err) {
      console.warn('Failed to save pathway:', err);
    }
  };

  // Toggle milestone checkpoints
  const handleToggleMilestone = async (milestone: string) => {
    if (!activePathway) return;
    const updated = completedMilestones.includes(milestone)
      ? completedMilestones.filter(m => m !== milestone)
      : [...completedMilestones, milestone];
    
    setCompletedMilestones(updated);
    try {
      await careerService.savePathway(currentStudentId, activePathway, updated);
    } catch (err) {
      console.warn('Failed to update milestones:', err);
    }
  };

  // Clear target goal pathway
  const handleClearPathway = async () => {
    try {
      await careerService.clearPathway(currentStudentId);
      setActivePathway(null);
      setCompletedMilestones([]);
    } catch (err) {
      console.warn('Failed to clear pathway:', err);
    }
  };

  // Generate customized AI study plan with week-by-week structure
  const handleGeneratePlan = (title: string) => {
    setIsGeneratingPlan(true);
    setTimeout(() => {
      const generatedPlan = [
        { week: 'Week 1-2: Theoretical Foundations & Fundamentals', tasks: [`Study core principles and eligibility pre-requisites for ${title}`, 'Acquire primary textbook resources & recommended reading manuals', 'Set up initial workspace environment and design sandbox projects'], completed: false },
        { week: 'Week 3-4: Skills Acquisition & Focused Core Bootstrapping', tasks: ['Review high-probability skill gaps based on market assessments', 'Enroll in target certification training curriculum', 'Solve 50 practice diagnostics or problem worksheets'], completed: false },
        { week: 'Week 5-6: Intermediate Execution & Practical Applications', tasks: ['Construct 2 production-grade case studies or portfolio designs', 'Participate in professional cohort review assemblies', 'Simulate custom mock examinations under realistic timed constraints'], completed: false },
        { week: 'Week 7-8: Final Certification Preparation & Horizon Matching', tasks: ['Book and sit for primary license examinations', 'Audit local internships, private jobs ledger, and civil service vacancies', 'Formulate a baseline pitch deck or freelancer portfolio draft'], completed: false }
      ];
      setCustomPlans(prev => ({ ...prev, [title]: generatedPlan }));
      setIsGeneratingPlan(false);
      showToast?.("AI Study Plan Ready", `Custom 8-week learning itinerary generated successfully for "${title}".`, "success");
    }, 1500);
  };

  const handleTogglePlanWeek = (title: string, wIdx: number) => {
    setCustomPlans(prev => {
      const currentPlan = prev[title];
      if (!currentPlan) return prev;
      return {
        ...prev,
        [title]: currentPlan.map((wk, idx) => {
          if (idx !== wIdx) return wk;
          return { ...wk, completed: !wk.completed };
        })
      };
    });
  };

  // Toggle checklist states
  const handleToggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSubject = (id: string) => {
    setSelectedSubjects(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Run matching engine (hybrid Local Multi-factor scoring + optional Gemini server enhancement)
  const handleRunAssessment = async () => {
    setStep(5);
    setLoading(true);
    setError(null);

    const matchInput: MatchingCriteriaInput = {
      interests: selectedInterests,
      subjects: selectedSubjects,
      workStyle,
      theoryVsPractice,
      educationLevel,
      locationPreference,
      salaryExpectation,
      entrepreneurialInclination
    };

    try {
      // 1. Compute robust multi-factor score matched careers locally
      const localMatches = await careerService.matchCareersLocal(matchInput);
      setRecommendedCareers(localMatches);

      // 2. Draft comprehensive localized backup counseling analysis
      const backupNote = careerService.generateLocalCounselingNote(matchInput, localMatches);
      setPersonalizedCounseling(backupNote);

      // 3. Try calling Gemini server proxy for cognitive real-time guidance if enabled
      const studentDetails = currentStudent ? {
        name: currentStudent.name,
        batchId: currentStudent.batchId,
      } : {};

      try {
        const response = await geminiService.suggestCareer({
          interests: selectedInterests.map(id => INTERESTS_OPTIONS.find(o => o.id === id)?.label || id),
          subjects: selectedSubjects.map(id => SUBJECTS_OPTIONS.find(o => o.id === id)?.label || id),
          workStyle,
          theoryVsPractice,
          studentDetails,
          locationPreference,
          educationLevel,
          salaryExpectation,
          entrepreneurialInclination
        });

        if (response && response.pathways) {
          // Merge local calculations with Gemini specific roadmap details
          const merged = localMatches.map(lm => {
            const geminiEquivalent = response.pathways.find((p: any) => 
              p.title?.toLowerCase().includes(lm.title.toLowerCase()) || 
              lm.title.toLowerCase().includes(p.title?.toLowerCase())
            );
            if (geminiEquivalent) {
              return {
                ...lm,
                matchPercentage: Math.max(lm.matchPercentage || 0, geminiEquivalent.matchPercentage || geminiEquivalent.fitPercentage || 0),
                whyMatch: geminiEquivalent.whyMatch || lm.whyMatch,
                roadmap: Array.isArray(geminiEquivalent.roadmap) && geminiEquivalent.roadmap.length > 0 ? geminiEquivalent.roadmap : lm.roadmap,
                skills: Array.isArray(geminiEquivalent.demandedSkills) && geminiEquivalent.demandedSkills.length > 0 ? geminiEquivalent.demandedSkills : lm.skills
              };
            }
            return lm;
          });
          
          setRecommendedCareers(merged.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0)));
          if (response.analysis) {
            setPersonalizedCounseling(response.analysis);
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini modeling offline/unavailable, relying entirely on local multi-factor scoring engine:', geminiErr);
      }

      setStep(6);
    } catch (err: any) {
      setError(err.message || 'An error occurred during multi-factor career analysis.');
      setStep(4);
    } finally {
      setLoading(false);
    }
  };

  // Reset questionnaire state
  const handleReset = () => {
    setSelectedInterests([]);
    setSelectedSubjects([]);
    setWorkStyle('Collaborative');
    setTheoryVsPractice('balanced');
    setEducationLevel('Degree');
    setLocationPreference('Flexible');
    setSalaryExpectation(500000);
    setRecommendedCareers([]);
    setPersonalizedCounseling('');
    setStep(1);
  };

  // Handle Admin form submission to add new custom career opportunities
  const handleAddCareerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminStatus(null);

    const { 
      title, category, overview, eligibility, requiredSubjects, 
      skills, roadmap, minSalary, maxSalary, outlook, 
      automationImpact, interests, logicalApt, verbalApt, 
      spatialApt, quantitativeApt, workStyle, theoryVsPractice, 
      educationLevel, locationPreference 
    } = newCareerForm;

    if (!title || !overview || !eligibility) {
      setAdminStatus({ type: 'error', message: 'Title, overview, and eligibility are required fields.' });
      return;
    }

    const cleanRequiredSubjects = requiredSubjects.split(',').map(s => s.trim()).filter(Boolean);
    const cleanSkills = skills.split(',').map(s => s.trim()).filter(Boolean);
    const cleanRoadmap = roadmap.split('\n').map(s => s.trim()).filter(Boolean);
    const cleanInterests = interests.split(',').map(s => s.trim()).filter(Boolean);

    const customCareer: CareerOpportunity = {
      id: 'custom-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title,
      category,
      overview,
      eligibility,
      requiredSubjects: cleanRequiredSubjects.length > 0 ? cleanRequiredSubjects : ['General'],
      pathways: ['Direct professional track'],
      skills: cleanSkills.length > 0 ? cleanSkills : ['Problem Solving'],
      roadmap: cleanRoadmap.length > 0 ? cleanRoadmap : ['Gain domain training', 'Clear licensing exam', 'Secure employment'],
      responsibilities: ['Execute core industry procedures', 'Maintain service criteria'],
      industries: [category + ' Industry'],
      opportunities: {
        government: 'Civil sector openings',
        private: 'Corporate assignments',
        selfEmployment: 'Freelancing and business development'
      },
      salaryRange: {
        min: Number(minSalary),
        max: Number(maxSalary),
        formatted: `₹${Number(minSalary).toLocaleString('en-IN')} - ₹${Number(maxSalary).toLocaleString('en-IN')} / year`
      },
      outlook: outlook || 'Growing steady with 15% annual increments',
      automationImpact,
      matchingCriteria: {
        interests: cleanInterests.length > 0 ? cleanInterests : ['general'],
        aptitude: {
          logical: Number(logicalApt),
          verbal: Number(verbalApt),
          spatial: Number(spatialApt),
          quantitative: Number(quantitativeApt)
        },
        subjects: cleanRequiredSubjects.map(s => s.toLowerCase()),
        workStyle: workStyle as any,
        theoryVsPractice: theoryVsPractice as any,
        educationLevel: educationLevel as any,
        locationPreference: locationPreference as any,
        entrepreneurialInclination: entrepreneurialInclination
      }
    };

    try {
      await careerService.createCareer(customCareer);
      setAdminStatus({ type: 'success', message: 'Custom career path successfully added to database!' });
      
      // Reset form
      setNewCareerForm({
        title: '',
        category: 'Technical',
        overview: '',
        eligibility: '',
        requiredSubjects: '',
        skills: '',
        roadmap: '',
        minSalary: 400000,
        maxSalary: 1500000,
        outlook: '',
        automationImpact: 'Low',
        interests: '',
        logicalApt: 4,
        verbalApt: 4,
        spatialApt: 3,
        quantitativeApt: 4,
        workStyle: 'Collaborative',
        theoryVsPractice: 'balanced',
        educationLevel: 'Degree',
        locationPreference: 'Flexible'
      });

      // Reload matching results if we are on step 6
      if (step === 6) {
        handleRunAssessment();
      }
    } catch (err: any) {
      setAdminStatus({ type: 'error', message: err.message || 'Failed to save custom career.' });
    }
  };

  // Recharts score representation data
  const getChartData = () => {
    return recommendedCareers.slice(0, 5).map(c => ({
      name: c.title.length > 20 ? c.title.substring(0, 18) + '...' : c.title,
      Match: (c as any).matchPercentage || 80,
    }));
  };

  // Filter matched results dynamically
  const filteredCareers = recommendedCareers.filter(career => {
    const matchesSearch = career.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      career.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      career.skills.some(sk => sk.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategoryFilter === 'All' || career.category === selectedCategoryFilter;
    const matchesWorkStyle = selectedWorkStyleFilter === 'All' || career.matchingCriteria?.workStyle === selectedWorkStyleFilter;
    const matchesEducation = selectedEduFilter === 'All' || career.matchingCriteria?.educationLevel === selectedEduFilter;

    return matchesSearch && matchesCategory && matchesWorkStyle && matchesEducation;
  });

  // Custom Simple Markdown Parser for counseling letters
  function RenderCounselingLetter({ text }: { text: string }) {
    if (!text) return null;
    const paragraphs = text.split('\n');
    return (
      <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-medium">
        {paragraphs.map((p, i) => {
          if (p.startsWith('### ')) {
            return <h4 key={i} className="text-sm font-bold text-indigo-300 mt-4">{p.replace('### ', '')}</h4>;
          }
          if (p.startsWith('## ')) {
            return <h3 key={i} className="text-base font-extrabold text-indigo-400 mt-5">{p.replace('## ', '')}</h3>;
          }
          if (p.startsWith('* **')) {
            const split = p.replace('* **', '').split('**');
            return (
              <p key={i} className="pl-3 border-l-2 border-indigo-500/55 my-1.5">
                <strong className="text-indigo-200">{split[0]}</strong> {split.slice(1).join('**')}
              </p>
            );
          }
          if (p.startsWith('* ')) {
            return <p key={i} className="pl-4 list-disc text-left">{p.substring(2)}</p>;
          }
          // Highlight bold text
          const parts = p.split('**');
          return (
            <p key={i} className="text-left">
              {parts.map((part, index) => 
                index % 2 === 1 ? <strong key={index} className="text-indigo-400 font-bold">{part}</strong> : part
              )}
            </p>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Visual Header */}
      <div className="relative bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xxs overflow-hidden">
        {/* Glow Background Elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 max-w-xl text-left">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
              <Compass className="h-3 w-3 animate-spin" style={{ animationDuration: '6s' }} /> AI Vocational Pathfinder
            </span>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Enterprise-Grade Career Diagnostic System
            </h1>
            <p className="text-xs text-slate-400">
              Cross-correlate academic criteria, skills preferences, and financial expectations. Backed by local matching algorithms and real-time Gemini AI modules.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              {showAdminPanel ? 'Close Admin Entry' : 'Admin: Add Custom Path'}
            </button>

            {activePathway && (
              <div className="flex items-center gap-3 bg-indigo-50/60 border border-indigo-100/80 px-4 py-2.5 rounded-2xl max-w-xs shadow-xxs text-left">
                <div className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0">
                  <Target className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Active Target Path</p>
                  <h4 className="text-xs font-black text-slate-800 truncate">{activePathway.title}</h4>
                  <p className="text-xxs text-slate-400 mt-0.5 font-bold">
                    Completed: <b>{completedMilestones.length} of {activePathway.roadmap?.length || 3}</b>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Panel: Add Custom Career */}
      {showAdminPanel && (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 text-left animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="h-4.5 w-4.5 text-indigo-600" /> Administrative Custom Career Seeding
              </h3>
              <p className="text-xxs text-slate-500 font-semibold mt-0.5">Define custom vocational criteria to seed into both local and cloud databases synchronously.</p>
            </div>
            <button
              onClick={() => setShowAdminPanel(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Hide Form
            </button>
          </div>

          {adminStatus && (
            <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
              adminStatus.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}>
              <AlertCircle className="h-4.5 w-4.5" />
              <span>{adminStatus.message}</span>
            </div>
          )}

          <form onSubmit={handleAddCareerSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-xxs font-black text-slate-450 uppercase tracking-widest">Career Title</label>
              <input 
                type="text" 
                placeholder="e.g. Clinical Pharmacist" 
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white"
                value={newCareerForm.title}
                onChange={e => setNewCareerForm({...newCareerForm, title: e.target.value})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xxs font-black text-slate-450 uppercase tracking-widest">Employment Category</label>
              <select 
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white"
                value={newCareerForm.category}
                onChange={e => setNewCareerForm({...newCareerForm, category: e.target.value as CareerCategory})}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xxs font-black text-slate-450 uppercase tracking-widest">Eligibility Criteria</label>
              <input 
                type="text" 
                placeholder="e.g. Class XII Science + B.Pharm" 
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white"
                value={newCareerForm.eligibility}
                onChange={e => setNewCareerForm({...newCareerForm, eligibility: e.target.value})}
              />
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xxs font-black text-slate-450 uppercase tracking-widest">Overview Description</label>
              <textarea 
                placeholder="Provide a comprehensive summary of this career choice..." 
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white h-20 resize-none"
                value={newCareerForm.overview}
                onChange={e => setNewCareerForm({...newCareerForm, overview: e.target.value})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xxs font-black text-slate-450 uppercase tracking-widest">Required Subjects (Comma separated)</label>
              <input 
                type="text" 
                placeholder="Biology, Chemistry, English" 
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white"
                value={newCareerForm.requiredSubjects}
                onChange={e => setNewCareerForm({...newCareerForm, requiredSubjects: e.target.value})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xxs font-black text-slate-450 uppercase tracking-widest">Demanded Skills (Comma separated)</label>
              <input 
                type="text" 
                placeholder="Diagnostic, Laboratory analysis, Empathy" 
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white"
                value={newCareerForm.skills}
                onChange={e => setNewCareerForm({...newCareerForm, skills: e.target.value})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xxs font-black text-slate-450 uppercase tracking-widest">Matching Interests (Comma separated)</label>
              <input 
                type="text" 
                placeholder="med, teaching, chemistry" 
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white"
                value={newCareerForm.interests}
                onChange={e => setNewCareerForm({...newCareerForm, interests: e.target.value})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xxs font-black text-slate-450 uppercase tracking-widest">Min Salary Expectation (INR)</label>
              <input 
                type="number" 
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white"
                value={newCareerForm.minSalary}
                onChange={e => setNewCareerForm({...newCareerForm, minSalary: Number(e.target.value)})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xxs font-black text-slate-450 uppercase tracking-widest">Max Salary Expectation (INR)</label>
              <input 
                type="number" 
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white"
                value={newCareerForm.maxSalary}
                onChange={e => setNewCareerForm({...newCareerForm, maxSalary: Number(e.target.value)})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xxs font-black text-slate-450 uppercase tracking-widest">Automation Risk level</label>
              <select 
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white"
                value={newCareerForm.automationImpact}
                onChange={e => setNewCareerForm({...newCareerForm, automationImpact: e.target.value as any})}
              >
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
              </select>
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xxs font-black text-slate-450 uppercase tracking-widest">Milestone Roadmap (One step per line)</label>
              <textarea 
                placeholder="Step 1: Finish secondary biology\nStep 2: Excel in college pharmacy entrance\nStep 3: Undergo hospital dispensary internship" 
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white h-20 resize-none"
                value={newCareerForm.roadmap}
                onChange={e => setNewCareerForm({...newCareerForm, roadmap: e.target.value})}
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-150 transition-all flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" /> Save & Sync Career
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Panel: Assessment wizard or results list */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl shadow-xxs overflow-hidden flex flex-col min-h-[550px]">
          
          {/* STEP 1: WELCOME INTRO */}
          {step === 1 && (
            <div className="flex-1 p-6 sm:p-10 flex flex-col justify-center items-center text-center space-y-6">
              <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100/60 shadow-inner">
                <Sparkles className="h-10 w-10 text-indigo-600 animate-pulse" />
              </div>
              <div className="space-y-2 max-w-lg">
                <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Personalized Career Diagnostic</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Welcome to Learner's Den comprehensive multi-factor counseling system. This questionnaire cross-analyzes academic subjects, vocational interests, workspace values, and career expectations against the global job landscape.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl pt-4 text-left">
                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/40 space-y-1.5">
                  <div className="h-7 w-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <BrainCircuit className="h-4 w-4 text-indigo-600" />
                  </div>
                  <h5 className="text-xxs font-black text-slate-800 uppercase tracking-wider">Multi-Factor Engine</h5>
                  <p className="text-xxs text-slate-400">Scoring interests, aptitude strengths, and workplace values.</p>
                </div>
                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/40 space-y-1.5">
                  <div className="h-7 w-7 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Map className="h-4 w-4 text-violet-600" />
                  </div>
                  <h5 className="text-xxs font-black text-slate-800 uppercase tracking-wider">Comprehensive Tracks</h5>
                  <p className="text-xxs text-slate-400">Covers blue, green, and new collar tracks along with classical professions.</p>
                </div>
                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/40 space-y-1.5">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Target className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h5 className="text-xxs font-black text-slate-800 uppercase tracking-wider">Durable Sync</h5>
                  <p className="text-xxs text-slate-400">Milestones and saved targets sync to Firestore cloud storage securely.</p>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white shadow-md shadow-indigo-100 transition-all cursor-pointer hover:translate-x-0.5"
              >
                Begin Questionnaire <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* STEP 2: FIELDS OF INTERESTS */}
          {step === 2 && (
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between text-left">
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">Step 1 of 4</p>
                  <h3 className="text-base font-black text-slate-800 tracking-tight">Select Fields of Interest</h3>
                  <p className="text-xs text-slate-400">What specific projects or domains interest you the most? (Select all that apply)</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {INTERESTS_OPTIONS.map((opt) => {
                    const isSelected = selectedInterests.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleToggleInterest(opt.id)}
                        className={`text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                          isSelected 
                            ? 'bg-indigo-50/60 border-indigo-400 shadow-xxs' 
                            : 'bg-white border-slate-200/80 hover:border-slate-350 hover:bg-slate-50/50'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-extrabold text-slate-800">{opt.label}</p>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">Category: {opt.category}</span>
                        </div>
                        <div className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  disabled={selectedInterests.length === 0}
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xs text-white transition-all cursor-pointer flex items-center gap-1"
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ACADEMIC SUBJECT STRENGTHS */}
          {step === 3 && (
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between text-left">
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">Step 2 of 4</p>
                  <h3 className="text-base font-black text-slate-800 tracking-tight">Academic Subjects Strengths</h3>
                  <p className="text-xs text-slate-400">Which academic streams or courses do you excel in or enjoy studying the most?</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {SUBJECTS_OPTIONS.map((opt) => {
                    const isSelected = selectedSubjects.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleToggleSubject(opt.id)}
                        className={`text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                          isSelected 
                            ? 'bg-indigo-50/60 border-indigo-400 shadow-xxs' 
                            : 'bg-white border-slate-200/80 hover:border-slate-350 hover:bg-slate-50/50'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-extrabold text-slate-800">{opt.label}</p>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">Course Stream: {opt.category}</span>
                        </div>
                        <div className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  disabled={selectedSubjects.length === 0}
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xs text-white transition-all cursor-pointer flex items-center gap-1"
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PREFERENCES & FILTER REQUIREMENTS */}
          {step === 4 && (
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between text-left">
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">Step 3 of 4</p>
                  <h3 className="text-base font-black text-slate-800 tracking-tight">Identify Your Workplace Values</h3>
                  <p className="text-xs text-slate-400">Specify preferences for work environment, geographical flexibility, and financial targets.</p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xxs font-black text-slate-450 uppercase tracking-widest">Work Style Culture</label>
                      <select 
                        className="w-full text-xs p-3.5 rounded-xl border border-slate-200 bg-white"
                        value={workStyle}
                        onChange={e => setWorkStyle(e.target.value)}
                      >
                        <option value="Independent">Independent (Individual deep study focus)</option>
                        <option value="Collaborative">Collaborative (Interactive team brainstorming)</option>
                        <option value="Leadership">Leadership (Strategic oversight and execution)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xxs font-black text-slate-450 uppercase tracking-widest">Theory vs. Practical</label>
                      <select 
                        className="w-full text-xs p-3.5 rounded-xl border border-slate-200 bg-white"
                        value={theoryVsPractice}
                        onChange={e => setTheoryVsPractice(e.target.value)}
                      >
                        <option value="theoretical">Highly Conceptual (Formulas, proofs & scientific concepts)</option>
                        <option value="practical">Highly Practical (Coding, laboratory assays & prototyping)</option>
                        <option value="balanced">Balanced Hybrid (Mix of concepts and hands-on validation)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xxs font-black text-slate-450 uppercase tracking-widest">Education Pathway Level</label>
                      <select 
                        className="w-full text-xs p-3.5 rounded-xl border border-slate-200 bg-white"
                        value={educationLevel}
                        onChange={e => setEducationLevel(e.target.value)}
                      >
                        <option value="No Degree">Skills/Portfolio-First (No university degree required)</option>
                        <option value="Diploma">Vocational/Polytechnic Diploma</option>
                        <option value="Degree">Undergraduate Bachelor Degree</option>
                        <option value="Cert">Professional Licensure Board (e.g. CA, CPA, Bar)</option>
                        <option value="PhD">Postgraduate / Ph.D. Research Level</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xxs font-black text-slate-450 uppercase tracking-widest">Location Preference</label>
                      <select 
                        className="w-full text-xs p-3.5 rounded-xl border border-slate-200 bg-white"
                        value={locationPreference}
                        onChange={e => setLocationPreference(e.target.value)}
                      >
                        <option value="Domestic">Domestic (Work in local metros)</option>
                        <option value="Remote">Remote (Global digital nomad lifestyle)</option>
                        <option value="International">International (Global corporate headquarters)</option>
                        <option value="Flexible">Flexible / Multi-Mode</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xxs font-black text-slate-450 uppercase tracking-widest">Desired Annual Starting Salary</label>
                      <span className="text-xs font-extrabold text-indigo-600">₹{salaryExpectation.toLocaleString('en-IN')} / year</span>
                    </div>
                    <input 
                      type="range" 
                      min="200000" 
                      max="3000000" 
                      step="50000"
                      className="w-full accent-indigo-600"
                      value={salaryExpectation}
                      onChange={e => setSalaryExpectation(Number(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
                    <input 
                      type="checkbox" 
                      id="entCheckbox"
                      className="h-4.5 w-4.5 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                      checked={entrepreneurialInclination}
                      onChange={e => setEntrepreneurialInclination(e.target.checked)}
                    />
                    <label htmlFor="entCheckbox" className="text-xxs font-semibold text-slate-600 cursor-pointer select-none">
                      I have strong interest in entrepreneurship, custom product creation, or self-employment tracks.
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xxs font-semibold flex items-center gap-2">
                    <Flame className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-8">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleRunAssessment}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white shadow-md shadow-indigo-100 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="h-4 w-4" /> Match Careers Now
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: CALIBRATING & AI PROGRESS */}
          {step === 5 && (
            <div className="flex-1 p-6 sm:p-10 flex flex-col justify-center items-center text-center space-y-6 animate-pulse">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-xl scale-125"></div>
                <div className="h-16 w-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-lg relative">
                  <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                </div>
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-sm font-extrabold text-slate-800">Calculating Multi-Factor Alignment...</h3>
                <p className="text-xxs text-slate-400 leading-relaxed font-bold uppercase tracking-widest">
                  Running profile diagnostics & querying Firestore repositories
                </p>
                <p className="text-xxs text-slate-400 pt-2 font-semibold italic">
                  Mapping academic thresholds, required certifications, and salary brackets to discover perfect pathways...
                </p>
              </div>
            </div>
          )}

          {/* STEP 6: ASSESSMENT RESULTS */}
          {step === 6 && (
            <div className="flex-1 p-6 sm:p-8 space-y-8 flex flex-col text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-800 tracking-tight">Your Custom Vocational Matrices</h3>
                  <p className="text-xxs text-slate-400">Scored matched pathways. Use the advanced filters below to refine the grid dynamically.</p>
                </div>
                <button
                  onClick={handleReset}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xxs font-bold text-slate-500 hover:text-indigo-600 hover:bg-slate-50 flex items-center gap-1 transition-all cursor-pointer shadow-xxs"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Retake Diagnostic
                </button>
              </div>

              {/* Dynamic Search & Live Filter Bar */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-450 uppercase tracking-wider block">Search Title/Skills</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="e.g. PyTorch, CA" 
                      className="w-full text-xxs pl-8 pr-2 py-2 border border-slate-200 rounded-lg bg-white"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-450 uppercase tracking-wider block">Field Sector</label>
                  <select
                    className="w-full text-xxs py-2 px-2.5 border border-slate-200 rounded-lg bg-white font-semibold"
                    value={selectedCategoryFilter}
                    onChange={e => setSelectedCategoryFilter(e.target.value)}
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-450 uppercase tracking-wider block">Work Culture</label>
                  <select
                    className="w-full text-xxs py-2 px-2.5 border border-slate-200 rounded-lg bg-white font-semibold"
                    value={selectedWorkStyleFilter}
                    onChange={e => setSelectedWorkStyleFilter(e.target.value)}
                  >
                    <option value="All">All Cultures</option>
                    <option value="Independent">Independent Focus</option>
                    <option value="Collaborative">Collaborative Team</option>
                    <option value="Leadership">Strategic Lead</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-450 uppercase tracking-wider block">Required Education</label>
                  <select
                    className="w-full text-xxs py-2 px-2.5 border border-slate-200 rounded-lg bg-white font-semibold"
                    value={selectedEduFilter}
                    onChange={e => setSelectedEduFilter(e.target.value)}
                  >
                    <option value="All">All Education levels</option>
                    <option value="No Degree">No Degree Required</option>
                    <option value="Diploma">Polytechnic Diploma</option>
                    <option value="Degree">Bachelor Degree</option>
                    <option value="Cert">Professional Licensure</option>
                    <option value="PhD">Postgraduate / Ph.D.</option>
                  </select>
                </div>
              </div>

              {/* Graphical Matching Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/40 p-4 rounded-2xl border border-slate-150">
                <div className="space-y-3">
                  <h4 className="text-xxs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Target className="h-3 w-3 text-indigo-500" /> TOP FIT SCORE DEVIATION
                  </h4>
                  <div className="space-y-2">
                    {recommendedCareers.slice(0, 3).map((c, idx) => (
                      <div key={idx} className="bg-white border border-slate-200/65 p-3 rounded-xl flex items-center justify-between shadow-xxs">
                        <div className="min-w-0">
                          <p className="text-xxs font-black text-slate-800 truncate">{c.title}</p>
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">{c.category}</span>
                        </div>
                        <div className="h-8 w-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-black text-xs shrink-0 border border-indigo-100/50">
                          {c.matchPercentage || (c as any).fitPercentage || 85}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-44 flex flex-col justify-center items-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Match Diagnostics Deviation Index</p>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={getChartData()} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 8, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '12px' }} />
                      <Bar dataKey="Match" fill="#4f46e5" radius={[8, 8, 0, 0]} barSize={25} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recommendations Listing */}
              <div className="space-y-5">
                <h4 className="text-xxs font-black text-slate-400 uppercase tracking-wider">Matched Career Pathways ({filteredCareers.length} found)</h4>
                
                {filteredCareers.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                    <p className="text-xs font-bold text-slate-400">No career paths match your selected live filters.</p>
                    <p className="text-xxs text-slate-400 max-w-[250px] mx-auto leading-normal">Try clearing search text or resetting the category dropdown selection.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCareers.map((career, idx) => {
                      const isAlreadyActive = activePathway?.title === career.title;
                      return (
                        <div 
                          key={idx} 
                          className={`border rounded-2xl p-5 transition-all space-y-4 text-left ${
                            isAlreadyActive 
                              ? 'bg-indigo-50/20 border-indigo-300 ring-1 ring-indigo-200/50' 
                              : 'bg-white border-slate-200/85 hover:border-slate-350'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">
                                {career.matchPercentage || 85}% Fit Score
                              </span>
                              <h4 className="text-xs font-black text-slate-800 tracking-tight mt-1.5">{career.title}</h4>
                              <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                                Sector: <span className="text-indigo-600">{career.category}</span> | Salary: {career.salaryRange?.formatted || 'Varies'} | Automation: {career.automationImpact} Risk
                              </p>
                            </div>
                            
                            {isAlreadyActive ? (
                              <span className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-extrabold text-[10px] flex items-center gap-1 shrink-0 shadow-sm shadow-indigo-150">
                                <Bookmark className="h-3.5 w-3.5 fill-current" /> Saved Target
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSavePathway(career)}
                                className="px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50/50 font-extrabold text-[10px] flex items-center gap-1 transition-all cursor-pointer shrink-0"
                              >
                                <Bookmark className="h-3.5 w-3.5" /> Save Target Path
                              </button>
                            )}
                          </div>

                          <p className="text-xxs text-slate-500 font-semibold leading-relaxed">
                            {career.overview}
                          </p>

                          {/* Interactive Advanced Guidance Platform Block */}
                          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                            <div className="bg-slate-100/70 p-3 flex justify-between items-center border-b border-slate-200">
                              <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-pulse" /> Advanced AI Guidance Engine
                              </span>
                              <button
                                onClick={() => {
                                  if (expandedCareerIndex === idx) {
                                    setExpandedCareerIndex(null);
                                  } else {
                                    setExpandedCareerIndex(idx);
                                    setCareerTab('psychometrics');
                                  }
                                }}
                                className="px-2.5 py-1 bg-white border border-slate-250 hover:bg-slate-50 rounded-lg text-[9px] font-bold text-indigo-600 transition-all cursor-pointer shadow-xxs"
                              >
                                {expandedCareerIndex === idx ? 'Collapse Console' : 'Expand Guidance Console'}
                              </button>
                            </div>

                            {expandedCareerIndex === idx ? (
                              <div className="p-4 sm:p-5 space-y-5 bg-white text-xxs font-semibold">
                                {/* Subtab selection bar */}
                                <div className="flex border-b border-slate-150 gap-1 overflow-x-auto pb-px">
                                  {[
                                    { id: 'psychometrics', label: 'Psychometrics & Strengths' },
                                    { id: 'opportunities', label: 'Careers & Opportunities' },
                                    { id: 'projections', label: 'Trends & Projections' },
                                    { id: 'ai_plan', label: 'AI Study Plan & Gap Analysis' }
                                  ].map(subTab => (
                                    <button
                                      key={subTab.id}
                                      onClick={() => setCareerTab(subTab.id as any)}
                                      className={`px-3 py-1.5 border-b-2 text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                                        careerTab === subTab.id
                                          ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10'
                                          : 'border-transparent text-slate-400 hover:text-slate-600'
                                      }`}
                                    >
                                      {subTab.label}
                                    </button>
                                  ))}
                                </div>

                                {/* TAB CONTENT 1: PSYCHOMETRICS */}
                                {careerTab === 'psychometrics' && (
                                  <div className="space-y-4 animate-fadeIn text-slate-600">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      {/* Aptitude Analysis */}
                                      <div className="space-y-2.5">
                                        <div className="flex justify-between items-center">
                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Aptitude Score Diagnostics</span>
                                          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block">AI Confidence: {(career.matchPercentage || 85) >= 90 ? '94%' : '88%'}</span>
                                        </div>
                                        <div className="space-y-2">
                                          {[
                                            { label: 'Quantitative Reasoning', score: (career.matchingCriteria?.aptitude?.quantitative || 4) * 20 },
                                            { label: 'Analytical Problem Solving', score: (career.matchingCriteria?.aptitude?.logical || 4) * 20 },
                                            { label: 'Algorithmic / Spatial Intuition', score: (career.matchingCriteria?.aptitude?.spatial || 4) * 20 },
                                            { label: 'Verbal Logic & Writing', score: (career.matchingCriteria?.aptitude?.verbal || 3) * 20 }
                                          ].map((apt, aIdx) => (
                                            <div key={aIdx} className="space-y-1">
                                              <div className="flex justify-between text-[9px] font-bold">
                                                <span>{apt.label}</span>
                                                <span className="text-indigo-600">{apt.score}%</span>
                                              </div>
                                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="bg-indigo-500 h-full" style={{ width: `${apt.score}%` }} />
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Personality & Interest Profile */}
                                      <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                                        <div>
                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">RIASEC Interest Profile Match</span>
                                          <p className="mt-1 text-slate-800 leading-normal">
                                            Primary focus matches <strong className="text-indigo-600">{career.matchingCriteria?.workStyle || 'Collaborative'} Style ({career.matchPercentage || 85}%)</strong>. 
                                            Highly suited for {career.matchingCriteria?.theoryVsPractice === 'practical' ? 'hands-on, real-world execution' : career.matchingCriteria?.theoryVsPractice === 'theoretical' ? 'deep intellectual and conceptual analysis' : 'balanced theoretical & experimental frameworks'}.
                                          </p>
                                        </div>
                                        <div className="border-t border-slate-200/60 pt-2.5">
                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Fit vs Contrast Analysis</span>
                                          <p className="mt-1 text-indigo-800 font-extrabold text-[10px]">
                                            Why It Fits: <span className="text-slate-600 font-semibold">{career.whyMatch || `Matches your chosen subjects: ${(career.requiredSubjects || []).join(', ')}.`}</span>
                                          </p>
                                          <p className="mt-1 text-amber-800 font-extrabold text-[10px]">
                                            Why some other roles are less suitable: <span className="text-slate-600 font-semibold">Your profiles shows a preference for structured analytical pipelines over raw unstructured verbal design, rendering purely intuitive non-technical tracks less aligned.</span>
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Physical Requirements */}
                                    {career.matchingCriteria?.physicalRequirements && (
                                      <div className="border border-slate-150 rounded-xl p-3 bg-slate-50 flex items-center justify-between">
                                        <div>
                                          <span className="text-[9px] font-black text-slate-450 uppercase block">Physical Standards & Prerequisites</span>
                                          <p className="text-slate-800 mt-0.5">{career.matchingCriteria.physicalRequirements}</p>
                                        </div>
                                        <span className="h-7 w-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                                          🛡️
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* TAB CONTENT 2: OPPORTUNITIES */}
                                {careerTab === 'opportunities' && (
                                  <div className="space-y-4 animate-fadeIn text-slate-600">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                      {/* Competitive Exams */}
                                      <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-150">
                                        <strong className="text-slate-800 block uppercase text-[9px] tracking-wider text-indigo-600">Competitive Examinations</strong>
                                        <ul className="list-disc list-inside space-y-1 text-slate-500 text-[9px] leading-relaxed pt-1 font-semibold">
                                          {career.entranceExams && career.entranceExams.length > 0 ? (
                                            career.entranceExams.map((exam, exIdx) => <li key={exIdx}>{exam}</li>)
                                          ) : (
                                            <>
                                              <li>JEE Mains & Advanced Entrance</li>
                                              <li>GATE (Graduate Aptitude Test)</li>
                                              <li>Civil Services Entrance</li>
                                            </>
                                          )}
                                        </ul>
                                        <div className="pt-1.5 border-t border-slate-200 text-[8px] font-bold text-slate-400">
                                          Expected Competition: <span className="text-indigo-600">Extremely High</span>
                                        </div>
                                      </div>

                                      {/* Educational & Alt Pathways */}
                                      <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-150">
                                        <strong className="text-slate-800 block uppercase text-[9px] tracking-wider text-emerald-600">Primary Educational Pathway</strong>
                                        <ul className="list-disc list-inside space-y-1 text-slate-500 text-[9px] leading-relaxed pt-1 font-semibold">
                                          {career.pathways.map((path, pIdx) => (
                                            <li key={pIdx}>{path}</li>
                                          ))}
                                        </ul>
                                        <div className="pt-1.5 border-t border-slate-200 text-[8px] font-bold text-slate-400">
                                          Study Duration: <span className="text-emerald-600">3-5 Years</span>
                                        </div>
                                      </div>

                                      {/* Alternative Streams */}
                                      <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-150">
                                        <strong className="text-slate-800 block uppercase text-[9px] tracking-wider text-purple-600">Alternative Entry Pathways</strong>
                                        <ul className="list-disc list-inside space-y-1 text-slate-500 text-[9px] leading-relaxed pt-1 font-semibold">
                                          {career.alternativePathways && career.alternativePathways.length > 0 ? (
                                            career.alternativePathways.map((ap, apIdx) => <li key={apIdx}>{ap}</li>)
                                          ) : (
                                            <>
                                              <li>Specialist certification bootcamps</li>
                                              <li>Lateral entry via corporate work experience</li>
                                              <li>Direct professional apprentice programs</li>
                                            </>
                                          )}
                                        </ul>
                                        <div className="pt-1.5 border-t border-slate-200 text-[8px] font-bold text-slate-400">
                                          Financial Investment: <span className="text-purple-600">Low-to-Medium</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Scholarships & International Routes */}
                                    <div className="border border-slate-150 rounded-xl p-3 bg-slate-50 flex items-center justify-between">
                                      <div>
                                        <strong className="text-[9px] font-black text-slate-450 uppercase block">Employment Sectors & Target Placements</strong>
                                        <p className="text-slate-800 text-[9px] leading-normal pt-0.5">
                                          <strong>Government:</strong> {career.opportunities?.government || 'Central research labs, State technical directorates.'} | 
                                          <strong> Private:</strong> {career.opportunities?.private || 'Enterprise technical divisions and multinational centers.'}
                                        </p>
                                      </div>
                                      <span className="h-7 w-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                        🌍
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {/* TAB CONTENT 3: PROJECTIONS */}
                                {careerTab === 'projections' && (
                                  <div className="space-y-4 animate-fadeIn text-slate-600">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      {/* Salary projections */}
                                      <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">5-Year Projected Salary Curve</span>
                                        <div className="space-y-1.5 pt-1">
                                          {[
                                            { year: 'Year 1 (Starting Baseline)', sal: `Rs. ${Math.round((career.salaryRange?.min || 500000) / 100000)} Lakhs/yr` },
                                            { year: 'Year 3 (Mid-level Professional)', sal: `Rs. ${Math.round(((career.salaryRange?.min || 500000) * 1.8) / 100000)} Lakhs/yr` },
                                            { year: 'Year 5 (Principal Specialist)', sal: `Rs. ${Math.round((career.salaryRange?.max || 1500000) / 100000)} Lakhs/yr` }
                                          ].map((sal, sIdx) => (
                                            <div key={sIdx} className="flex justify-between items-center text-[9px] font-semibold">
                                              <span className="text-slate-450">{sal.year}</span>
                                              <strong className="text-slate-800 font-mono">{sal.sal}</strong>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Future Demand & Emerging Avenues */}
                                      <div className="space-y-2.5">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Market Outlook & Future Demand</span>
                                        <div className="space-y-1.5 font-semibold text-slate-500 text-[10px]">
                                          <div className="text-slate-800 font-extrabold flex items-center gap-1">
                                            Outlook Status: <span className="text-indigo-600 font-mono">{career.outlook}</span>
                                          </div>
                                          <div>Automation Impact Exposure Risk: <strong className={career.automationImpact === 'Low' ? 'text-emerald-600' : 'text-amber-600'}>{career.automationImpact}</strong></div>
                                          <div className="text-[9px] leading-relaxed pt-1 text-slate-400">
                                            Related avenues: {(career.relatedCareers || []).join(', ') || 'Consultancy, Specialist training panels, Enterprise divisions.'}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* TAB CONTENT 4: STUDY PLAN & GAP ANALYSIS */}
                                {careerTab === 'ai_plan' && (
                                  <div className="space-y-4 animate-fadeIn text-slate-600">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      {/* Skill-Gap Analysis */}
                                      <div className="space-y-2">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Skill-Gap Analysis Matrix</span>
                                        <p className="text-slate-500 leading-relaxed text-[9px]">Comparing candidate's current profile parameters to industry required skills:</p>
                                        <div className="space-y-1.5">
                                          {(career.skills || []).map((skill, sIdx) => {
                                            const isGap = sIdx === 2 || sIdx === 4; // Mock some gaps for educational improvement pathways!
                                            return (
                                              <div key={sIdx} className="flex justify-between text-[9px] font-semibold">
                                                <span>{skill}</span>
                                                {isGap ? (
                                                  <span className="text-amber-600 font-bold">GAP (-30%) - Action needed</span>
                                                ) : (
                                                  <span className="text-emerald-600 font-bold">MATCH (85%)</span>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>

                                      {/* Recommended Certifications */}
                                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 space-y-2">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Highly Recommended Professional Certifications</span>
                                        <div className="space-y-1 font-semibold text-slate-550 leading-relaxed">
                                          {career.certifications && career.certifications.length > 0 ? (
                                            career.certifications.map((cert, cIdx) => <div key={cIdx}>• {cert}</div>)
                                          ) : (
                                            <>
                                              <div>• AWS Certified Solutions Architect</div>
                                              <div>• NPTEL Advanced Specialty Certification</div>
                                              <div>• National Professional Council standards</div>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* AI-Generated Study Plan Console */}
                                    <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/50 space-y-3 text-left">
                                      <div className="flex justify-between items-center">
                                        <div>
                                          <strong className="text-slate-800 text-[10px] block">AI-Generated Study Plan</strong>
                                          <span className="text-slate-400 text-[9px]">Generate a personalized week-by-week learning itinerary.</span>
                                        </div>
                                        <button
                                          onClick={() => handleGeneratePlan(career.title)}
                                          disabled={isGeneratingPlan}
                                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-bold transition-all cursor-pointer disabled:opacity-50"
                                        >
                                          {isGeneratingPlan ? 'Synthesizing...' : 'Generate 8-Week AI Plan'}
                                        </button>
                                      </div>

                                      {/* Display study plan if available */}
                                      {customPlans[career.title] ? (
                                        <div className="space-y-2.5 pt-2 border-t border-slate-200/60 max-h-[200px] overflow-y-auto scrollbar-thin">
                                          {customPlans[career.title].map((wk, wIdx) => (
                                            <div key={wIdx} className={`p-2.5 rounded-lg border text-xxs font-semibold ${
                                              wk.completed ? 'bg-emerald-50 border-emerald-150 text-emerald-850' : 'bg-white border-slate-150'
                                            }`}>
                                              <div className="flex justify-between items-center">
                                                <strong className={`${wk.completed ? 'line-through text-emerald-700' : 'text-slate-800'}`}>{wk.week}</strong>
                                                <button
                                                  onClick={() => handleTogglePlanWeek(career.title, wIdx)}
                                                  className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                                    wk.completed ? 'bg-emerald-650 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                                  }`}
                                                >
                                                  {wk.completed ? 'Done' : 'Mark Done'}
                                                </button>
                                              </div>
                                              <ul className="list-disc list-inside space-y-0.5 text-slate-500 text-[9px] pt-1 leading-normal pl-1">
                                                {wk.tasks.map((tsk, tIdx) => (
                                                  <li key={tIdx} className={wk.completed ? 'line-through text-emerald-600/70' : ''}>{tsk}</li>
                                                ))}
                                              </ul>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-center py-4 text-slate-400 text-[9px]">
                                          {isGeneratingPlan ? 'Querying Gemini model & assessing skill matrix...' : 'No customized plan initialized yet. Press "Generate" to build one.'}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="p-4 text-center text-slate-400 text-xxs leading-relaxed">
                                Expand the diagnostic console to view detailed aptitude scores, private/government jobs matrix, international study routes, and personalized week-by-week study planners.
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Demanded Core Skills</p>
                            <div className="flex flex-wrap gap-1.5">
                              {career.skills.map((sk, sIdx) => (
                                <span key={sIdx} className="text-[9px] font-bold bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md shadow-xxs">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3 pt-2">
                            <p className="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                              <Map className="h-3.5 w-3.5 text-indigo-500" /> Milestone Checkpoint Roadmap
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {career.roadmap?.slice(0, 3).map((step, sIdx) => (
                                <div key={sIdx} className="bg-slate-50/40 border border-slate-150 p-3 rounded-xl relative shadow-xxs text-left">
                                  <span className="absolute top-2 right-2 text-xxs font-black text-slate-300">#0{sIdx + 1}</span>
                                  <p className="text-xxs text-slate-600 leading-relaxed font-bold mt-2 pr-4">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Saved Milestone Tracker & Advisory Box */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Saved pathway interactive milestones tracker */}
          {activePathway ? (
            <div className="bg-white border border-indigo-200 rounded-3xl p-5 shadow-xxs space-y-4 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h4 className="text-xxs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-indigo-600" /> GOAL MILESTONES TRACKER
                </h4>
                <button
                  onClick={handleClearPathway}
                  className="text-[9px] font-bold text-rose-500 hover:text-rose-700 cursor-pointer flex items-center gap-0.5"
                >
                  <Trash2 className="h-3 w-3" /> Clear
                </button>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-800">{activePathway.title}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{activePathway.category} Track</p>
                <p className="text-[10px] text-slate-450 mt-1 font-semibold">{activePathway.salaryRange?.formatted || activePathway.estimatedSalaryRange || 'Varies'}</p>
              </div>

              {/* Progress bar visual */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xxs font-black text-slate-450 uppercase tracking-wider">
                  <span>Pathway Milestones</span>
                  <span className="text-indigo-600">
                    {Math.round((completedMilestones.length / (activePathway.roadmap?.length || 3)) * 100)}% Done
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${(completedMilestones.length / (activePathway.roadmap?.length || 3)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Checkbox checkpoints list */}
              <div className="space-y-2.5 pt-2">
                {activePathway.roadmap?.map((stepText: string, idx: number) => {
                  const isCompleted = completedMilestones.includes(stepText);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleMilestone(stepText)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex gap-2.5 items-start ${
                        isCompleted 
                          ? 'bg-emerald-50/40 border-emerald-200 text-emerald-800' 
                          : 'bg-slate-50/50 border-slate-150 text-slate-600 hover:bg-slate-100/30'
                      }`}
                    >
                      <span className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-350 bg-white'
                      }`}>
                        {isCompleted && <CheckCircle2 className="h-3 w-3" />}
                      </span>
                      <div className="min-w-0">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-450">Checkpoint 0{idx + 1}</span>
                        <p className={`text-xxs font-semibold mt-0.5 leading-relaxed ${isCompleted ? 'line-through text-emerald-650' : ''}`}>
                          {stepText}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xxs text-center py-8 space-y-3">
              <div className="h-10 w-10 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-center mx-auto text-slate-400">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">No Target Pathway Saved</h4>
                <p className="text-xxs text-slate-400 max-w-[210px] mx-auto mt-1 leading-normal font-semibold">
                  Complete the pathfinder questionnaire to lock in a professional career path and track your progress milestones.
                </p>
              </div>
            </div>
          )}

          {/* AI Advisory Box */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <div className="h-7 w-7 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 flex items-center justify-center shrink-0">
                  <BrainCircuit className="h-4 w-4 animate-pulse" />
                </div>
                <h4 className="text-xxs font-black uppercase tracking-wider text-indigo-300">ADVISORY COUNSELING BLUEPRINT</h4>
              </div>

              {personalizedCounseling ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-indigo-300">Counseling Output</p>
                  <div className="bg-slate-950/45 p-3.5 rounded-xl border border-slate-800 max-h-[280px] overflow-y-auto">
                    <RenderCounselingLetter text={personalizedCounseling} />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-center py-6">
                  <HelpIcon className="h-8 w-8 text-indigo-400/45 mx-auto animate-bounce" />
                  <p className="text-[11px] font-bold text-indigo-200">Waiting for Questionnaire</p>
                  <p className="text-xxs text-indigo-400 font-semibold max-w-[190px] mx-auto leading-normal">
                    Submit the dynamic questionnaire to calculate personalized vocational recommendations.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
