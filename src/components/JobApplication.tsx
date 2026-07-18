import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Briefcase, 
  MapPin, 
  Award, 
  Sparkles, 
  Send, 
  Loader2, 
  Clock 
} from 'lucide-react';

interface JobApplicationProps {
  jobApplications: any[];
  onAddApplication: (app: any) => void;
  showToast: (title: string, desc: string, type?: 'success' | 'error' | 'info') => void;
}

const VACANCIES = [
  { id: 'vac-1', title: 'Senior Physics Mentor (IIT-JEE)', dept: 'Academics', location: 'Onsite / Bangalore', exp: '5+ Years', type: 'Full-Time', salary: '₹1.5L - ₹2.5L / mo' },
  { id: 'vac-2', title: 'Calculus & Algebra Lecturer', dept: 'Academics', location: 'Onsite / Delhi', exp: '3+ Years', type: 'Full-Time', salary: '₹1.0L - ₹1.8L / mo' },
  { id: 'vac-3', title: 'Chemistry Lab Practical Instructor', dept: 'Academics', location: 'Onsite / Pune', exp: '1+ Years', type: 'Part-Time', salary: '₹40K - ₹60K / mo' },
  { id: 'vac-4', title: 'LMS Academic Coordinator', dept: 'Tech Operations', location: 'Remote', exp: '2+ Years', type: 'Full-Time', salary: '₹50K - ₹75K / mo' },
];

export default function JobApplication({
  jobApplications,
  onAddApplication,
  showToast
}: JobApplicationProps) {
  // Job Seeker Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Calculus');
  const [education, setEducation] = useState("Master's Degree");
  const [experience, setExperience] = useState('1-3 years');
  const [cvName, setCvName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedVacancy, setSelectedVacancy] = useState<string>('vac-2');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        showToast("PDF Required", "Please upload your resume in standard PDF format.", "error");
        return;
      }
      setCvName(file.name);
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate step-by-step interactive upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            showToast("Resume Uploaded", `Successfully parsed file "${file.name}"! Ready for AI fit evaluation.`, "success");
            return 100;
          }
          return prev + 20;
        });
      }, 250);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !cvName) {
      showToast("Missing Attachments", "Please fill all fields and attach your PDF resume/CV.", "error");
      return;
    }

    const matchedVac = VACANCIES.find(v => v.id === selectedVacancy);

    const newApp = {
      id: `app-${Date.now()}`,
      name,
      email,
      phone,
      vacancyTitle: matchedVac?.title || subject + " Educator",
      subject,
      education,
      experience,
      resumeName: cvName,
      submittedAt: new Date().toISOString(),
      status: 'AI Screened (92% Fit)', // fun simulation status
      timeline: [
        { label: 'Application Submitted', date: 'Just Now', done: true },
        { label: 'AI Document Parsing', date: 'Just Now', done: true },
        { label: 'HR Registry Sync', date: 'Pending Review', done: false }
      ]
    };

    onAddApplication(newApp);
    setName('');
    setEmail('');
    setPhone('');
    setCvName('');
    setUploadProgress(0);
    showToast("Application Registered", "Profile mapped to institute talent network! Our recruitment committee will contact you shortly.", "success");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-indigo-600" />
            <span>Careers & Instructor Recruitment Desk</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Submit your professional dossier, stream simulated CV parsing, and monitor HR screening timeline.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-indigo-50/50 border border-indigo-100/60 rounded-xl px-3 py-1.5 self-start">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <span className="text-[10px] font-black text-indigo-800 uppercase tracking-wider">Accepting New Applications</span>
        </div>
      </div>

      {/* Grid structure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Vacancies Board */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Active Vacancies
          </h3>
          <div className="space-y-3">
            {VACANCIES.map((vac) => {
              const isSelected = vac.id === selectedVacancy;
              return (
                <div 
                  key={vac.id}
                  onClick={() => setSelectedVacancy(vac.id)}
                  className={`p-4 border rounded-xl cursor-pointer text-left transition-all relative ${
                    isSelected 
                      ? 'border-indigo-600 bg-indigo-50/25 ring-1 ring-indigo-600/30' 
                      : 'border-slate-100 bg-white hover:border-slate-350'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[8px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-full">
                      {vac.dept}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-slate-450">{vac.type}</span>
                  </div>
                  <h4 className="text-xs font-black text-slate-850 mt-2">{vac.title}</h4>
                  
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" /> {vac.location}
                    </span>
                    <span>•</span>
                    <span>Exp: {vac.exp}</span>
                  </div>
                  
                  <p className="text-[10px] text-indigo-650 font-black mt-1.5">{vac.salary}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Submission dossier */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xxs">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-indigo-600" />
              <span>Submit Academic Profile Dossier</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Prof. / Dr. / Mr. / Ms. Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    placeholder="email@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mobile / Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 XXXXX XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Primary Subject Specialization</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  >
                    <option value="Calculus">Calculus & Algebra</option>
                    <option value="Physics">Quantum & Applied Physics</option>
                    <option value="Chemistry">Organic & Physical Chemistry</option>
                    <option value="ComputerScience">Algorithms & Programming</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Highest Educational Degree</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ph.D. in Physics, M.Sc. Mathematics"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Teaching Experience Tenure</label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  >
                    <option value="Fresh Graduate">Fresh Graduate / Fresh Faculty</option>
                    <option value="1-3 years">1 - 3 Years of Classroom Teaching</option>
                    <option value="3-5 years">3 - 5 Years of Coaching Mentorship</option>
                    <option value="5+ years">Over 5 Years (Senior/Director Level)</option>
                  </select>
                </div>
              </div>

              {/* PDF CV Upload Box */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Attach Professional Resume / CV (PDF Only)</label>
                <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 transition-all bg-slate-50/15 relative overflow-hidden flex flex-col items-center justify-center text-center">
                  <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  
                  <Upload className="h-8 w-8 text-indigo-500 mb-2" />
                  
                  {cvName ? (
                    <div className="space-y-1">
                      <p className="text-xs font-black text-indigo-750 flex items-center justify-center gap-1">
                        <FileText className="h-4 w-4" /> {cvName}
                      </p>
                      <p className="text-[9px] text-slate-450 font-bold">Click or drag files here to replace</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-slate-700">Drag and drop your resume here, or click to upload</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">Accepts standard PDF (Max 15MB)</p>
                    </div>
                  )}

                  {isUploading && (
                    <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-4">
                      <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-2" />
                      <p className="text-xs font-black text-slate-850">Uploading & Parsing Dossier...</p>
                      <div className="w-48 bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">{uploadProgress}%</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 font-bold text-xs text-white cursor-pointer transition-all flex items-center justify-center gap-2 shadow-xxs"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit Dossier to HR Committee</span>
              </button>
            </form>
          </div>

          {/* List of Submitted Applications */}
          {jobApplications.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Your Submitted Portfolios ({jobApplications.length})
              </h3>
              
              <div className="space-y-3">
                {jobApplications.map((app) => (
                  <div key={app.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xxs text-left space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-slate-800">{app.name}</h4>
                          <span className="text-[8px] font-black uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-150">
                            {app.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-450 font-semibold">{app.vacancyTitle} • {app.education}</p>
                        <p className="text-[8px] text-slate-400 font-mono mt-1">Submitted on: {new Date(app.submittedAt).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50/50 border border-indigo-100 px-2.5 py-1 rounded-xl block">
                          AI Scored Fit
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <p className="text-[9px] font-black text-slate-450 uppercase mb-2">Registry Timeline Logs</p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
                        {app.timeline.map((step: any, sIdx: number) => (
                          <div key={sIdx} className="flex items-center gap-2">
                            <div className={`h-4 w-4 rounded-full flex items-center justify-center border text-[9px] font-bold ${
                              step.done ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}>
                              {sIdx + 1}
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-750 leading-none">{step.label}</p>
                              <p className="text-[8px] text-slate-450 leading-none mt-0.5">{step.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
