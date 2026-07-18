import { CareerOpportunity } from '../types';

export const CAREER_DATABASE: CareerOpportunity[] = [
  {
    id: 'ai-ml-specialist',
    title: 'AI & Machine Learning Specialist',
    category: 'Technical',
    overview: 'Design, develop, and deploy intelligent algorithms and neural networks that enable computers to learn from data and automate tasks.',
    eligibility: 'Class XII Science (PCM) with high proficiency in mathematics and computing.',
    requiredSubjects: ['Mathematics', 'Physics', 'Computer Science'],
    pathways: ['B.Tech/B.E. in Computer Science/AI', 'M.Tech or MS in Data Science/ML', 'Advanced Certifications in Deep Learning'],
    alternativePathways: ['B.Sc in Statistics/Mathematics followed by specialized AI Bootcamp and industry certifications'],
    entranceExams: ['JEE Main', 'JEE Advanced', 'GATE', 'BITSAT'],
    skills: ['Python', 'PyTorch', 'TensorFlow', 'Linear Algebra', 'SQL', 'Algorithms'],
    certifications: ['Google Professional Machine Learning Engineer', 'TensorFlow Developer Certificate'],
    roadmap: [
      'Master high school calculus, probability, and linear algebra.',
      'Learn core programming concepts (Python) and data structures.',
      'Take specialized machine learning courses on regression and neural networks.',
      'Build end-to-end projects and showcase them on GitHub/Kaggle.',
      'Pursue a specialized engineering degree or professional certification pathway.'
    ],
    responsibilities: [
      'Design machine learning pipelines and data preprocessing workflows.',
      'Train, fine-tune, and evaluate deep neural networks.',
      'Deploy models into secure, high-scale production systems.'
    ],
    industries: ['IT & Software', 'Automotive (Autonomous Driving)', 'Healthcare Technology', 'Finance & FinTech'],
    opportunities: {
      government: 'Scientist role at DRDO, ISRO, or National Informatics Centre (NIC).',
      private: 'AI Research Scientist, ML Engineer, or prompt strategist in multinational tech firms.',
      selfEmployment: 'Freelance AI consultancy and custom model building.'
    },
    salaryRange: {
      min: 800000,
      max: 3500000,
      formatted: '₹8,00,000 - ₹35,00,000 / year'
    },
    outlook: 'Hyper-growth. Expected demand increase of 40% over the next decade.',
    automationImpact: 'Low',
    relatedCareers: ['Software Engineer', 'Data Scientist', 'Robotics Architect'],
    resources: ['Kaggle Learn', 'Fast.ai courses', 'Learner\'s Den Advanced AI Bootcamps'],
    matchingCriteria: {
      interests: ['coding', 'ai', 'math'],
      aptitude: { logical: 5, verbal: 3, spatial: 4, quantitative: 5 },
      subjects: ['cs', 'maths', 'physics'],
      workStyle: 'Collaborative',
      theoryVsPractice: 'balanced',
      educationLevel: 'Degree',
      locationPreference: 'Flexible',
      relocationRequired: true,
      entrepreneurialInclination: true
    }
  },
  {
    id: 'clinical-psychologist',
    title: 'Clinical Psychologist & Mental Health Counselor',
    category: 'Medical & Healthcare',
    overview: 'Assess, diagnose, and treat psychological disorders and mental health issues, helping clients build resilience and improve well-being.',
    eligibility: 'Bachelor\'s degree in Psychology followed by specialized Master\'s or Ph.D.',
    requiredSubjects: ['Biology', 'Psychology', 'English'],
    pathways: ['B.A./B.Sc in Psychology', 'M.A./M.Sc in Clinical Psychology', 'M.Phil or Psy.D. approved by Rehabilitation Council of India (RCI)'],
    alternativePathways: ['Medical degree (MBBS) followed by MD in Psychiatry (to practice as a medical Psychiatrist with prescribing rights)'],
    entranceExams: ['CUET PG', 'University Specific Postgraduate Entrance Exams', 'NEET UG (if pursuing Psychiatry)'],
    skills: ['Empathy', 'Active Listening', 'Diagnostic Formulation', 'Cognitive Behavioral Therapy (CBT)', 'Counseling'],
    certifications: ['Licensed Clinical Psychologist (RCI certified)', 'Certified Trauma Therapist'],
    roadmap: [
      'Study general biology and humanities in secondary school.',
      'Earn a bachelor\'s degree in Psychology or related social science with honors.',
      'Pursue clinical internship hours at registered hospitals or counseling centers.',
      'Complete a professional Rehabilitation Council of India licensed postgraduate program.',
      'Open a licensed private practice or join leading mental health facilities.'
    ],
    responsibilities: [
      'Conduct clinical interviews and administer standardized psychological tests.',
      'Develop personalized therapeutic treatment plans for anxiety, depression, or trauma.',
      'Coordinate with families, doctors, and educators to support patient recovery.'
    ],
    industries: ['Healthcare & Hospitals', 'Mental Health Clinics', 'Educational Institutions', 'Corporate Wellness'],
    opportunities: {
      government: 'Clinical Psychologist in government hospitals, state health clinics, or defence services (DIPR).',
      private: 'Senior psychologist at private multi-specialty hospitals or specialized corporate wellness firms.',
      selfEmployment: 'Establishing an independent counseling clinic and online telehealth practice.'
    },
    salaryRange: {
      min: 400000,
      max: 1500000,
      formatted: '₹4,00,000 - ₹15,00,000 / year'
    },
    outlook: 'Very Strong. Mental health awareness is surging globally with 25% annual market growth.',
    automationImpact: 'Low',
    relatedCareers: ['Psychiatrist', 'Social Worker', 'Corporate Wellness Specialist'],
    resources: ['American Psychological Association (APA) guides', 'RCI registered training directories'],
    matchingCriteria: {
      interests: ['teaching', 'med'],
      aptitude: { logical: 3, verbal: 5, spatial: 2, quantitative: 2 },
      subjects: ['bio'],
      workStyle: 'Independent',
      theoryVsPractice: 'theoretical',
      educationLevel: 'PhD',
      locationPreference: 'Flexible',
      relocationRequired: false,
      entrepreneurialInclination: true
    }
  },
  {
    id: 'environmental-scientist',
    title: 'Environmental Scientist',
    category: 'Science & Research',
    overview: 'Analyze environmental problems, monitor ecosystem health, and develop actionable solutions to combat climate change and biodiversity loss.',
    eligibility: 'Bachelor\'s degree in Environmental Science, Chemistry, Biology, or Geology.',
    requiredSubjects: ['Chemistry', 'Physics', 'Biology', 'Mathematics'],
    pathways: ['B.Sc in Environmental Science/Chemistry', 'M.Sc in Ecology or Environmental Management', 'Ph.D. in Climate Studies or Conservation Biology'],
    alternativePathways: ['B.Tech in Environmental Engineering followed by corporate ESG auditing roles'],
    entranceExams: ['CUET UG/PG', 'IIT JAM (for M.Sc at IITs)', 'GATE'],
    skills: ['Ecosystem Analysis', 'Environmental Impact Assessment (EIA)', 'GIS Mapping', 'Laboratory Diagnostics', 'Data Analysis'],
    certifications: ['Associate Environmental Auditor (IEMA)', 'GIS Certified Professional (GISP)'],
    roadmap: [
      'Build solid foundations in chemical reactions and organic biology.',
      'Pursue a specialized scientific bachelor\'s degree with laboratory and field study modules.',
      'Learn GIS software and environmental data reporting techniques.',
      'Contribute to academic research or industrial sustainability audits.',
      'Collaborate with governmental bodies or global conservation NGOs.'
    ],
    responsibilities: [
      'Collect and analyze soil, water, and air quality samples to monitor pollutants.',
      'Perform detailed Environmental Impact Assessments (EIA) for construction projects.',
      'Formulate conservation strategies and guide companies on emission reductions.'
    ],
    industries: ['Renewable Energy', 'Government Environmental Agencies', 'Scientific Research Labs', 'Construction & Consulting'],
    opportunities: {
      government: 'Scientific officer at State and Central Pollution Control Boards, Forest Department, or ISRO/GIS labs.',
      private: 'Sustainability Lead, ESG Auditor, or environmental impact specialist in multinational corps.',
      selfEmployment: 'Independent environmental consultancy for infrastructure builders.'
    },
    salaryRange: {
      min: 450000,
      max: 1800000,
      formatted: '₹4,50,000 - ₹18,00,000 / year'
    },
    outlook: 'Strong. Driven by global net-zero targets and strict green regulations.',
    automationImpact: 'Low',
    relatedCareers: ['Conservation Officer', 'Climatologist', 'ESG Manager'],
    resources: ['UNEP Publications', 'Learner\'s Den Climate Action initiatives'],
    matchingCriteria: {
      interests: ['med', 'math'],
      aptitude: { logical: 4, verbal: 3, spatial: 4, quantitative: 4 },
      subjects: ['chem', 'physics', 'bio'],
      workStyle: 'Collaborative',
      theoryVsPractice: 'theoretical',
      educationLevel: 'Degree',
      locationPreference: 'Domestic',
      relocationRequired: true,
      entrepreneurialInclination: false
    }
  },
  {
    id: 'chartered-accountant',
    title: 'Chartered Accountant (CA)',
    category: 'Commerce & Finance',
    overview: 'Manage financial accounting, auditing, taxation, and corporate financial advisory, serving as the trusted backbone of corporate governance.',
    eligibility: 'Register with Institute of Chartered Accountants of India (ICAI) after Class XII.',
    requiredSubjects: ['Mathematics', 'Accountancy', 'Economics', 'Business Studies'],
    pathways: ['CA Foundation exam after Class XII', 'CA Intermediate exam', '3 years of practical articleship training', 'CA Final examination'],
    alternativePathways: ['Direct entry to CA Intermediate for graduates with commerce background (55%+) or others (60%+)'],
    entranceExams: ['ICAI CA Foundation/Intermediate/Final exams'],
    skills: ['Financial Auditing', 'Corporate Taxation', 'Cost Accounting', 'Financial Analysis', 'Tally/ERP Systems', 'Corporate Law'],
    certifications: ['ACA / FCA (ICAI Membership)', 'Certified Information Systems Auditor (CISA)'],
    roadmap: [
      'Excel in commercial accounting, finance, and mathematical problem-solving in high school.',
      'Clear the highly rigorous CA Foundation exam immediately after Class XII.',
      'Pass CA Intermediate modules and undergo practical Articleship under a practicing CA.',
      'Master commercial law and complex direct/indirect tax frameworks.',
      'Clear CA Final modules to register as a certified practicing Chartered Accountant.'
    ],
    responsibilities: [
      'Conduct statutory, internal, and tax audits for corporate entities.',
      'Prepare and file complex corporate and individual direct/indirect tax returns.',
      'Provide strategic financial advisory on mergers, acquisitions, and asset management.'
    ],
    industries: ['Audit & Tax Firms (Big 4)', 'Investment Banks', 'Corporate Finance Departments', 'Government Tax Directorates'],
    opportunities: {
      government: 'Indian Revenue Service (IRS) via UPSC, or senior auditor roles in CAG (Comptroller and Auditor General).',
      private: 'Financial Controller, Chief Financial Officer (CFO), or tax specialist in top corporate firms.',
      selfEmployment: 'Establishing an independent CA practice offering auditing and tax consultancy services.'
    },
    salaryRange: {
      min: 700000,
      max: 2800000,
      formatted: '₹7,00,000 - ₹28,00,000 / year'
    },
    outlook: 'Very Stable. Financial compliance and economic growth fuel non-stop demand.',
    automationImpact: 'Medium',
    relatedCareers: ['Investment Banker', 'Corporate Secretary (CS)', 'Financial Analyst'],
    resources: ['ICAI Official Portal', 'Learner\'s Den Finance Foundation series'],
    matchingCriteria: {
      interests: ['finance', 'business'],
      aptitude: { logical: 5, verbal: 4, spatial: 1, quantitative: 5 },
      subjects: ['maths'],
      workStyle: 'Independent',
      theoryVsPractice: 'practical',
      educationLevel: 'Cert',
      locationPreference: 'Domestic',
      relocationRequired: false,
      entrepreneurialInclination: true
    }
  },
  {
    id: 'civil-services-officer',
    title: 'Civil Services Officer (IAS/IPS/IFS)',
    category: 'Government & Civil Services',
    overview: 'Administer government policies, manage law and order, and drive socioeconomic developmental initiatives at district, state, and national levels.',
    eligibility: 'Any bachelor\'s degree from a recognized university. Minimum age of 21.',
    requiredSubjects: ['History', 'Polity', 'Geography', 'Economics', 'English', 'General Studies'],
    pathways: ['UPSC Civil Services Preliminary Examination', 'UPSC Mains (Written) Examination', 'Personality Test (Interview)'],
    alternativePathways: ['State Public Service Commissions (SPSC) exams for regional administrative services (PCS/PPS)'],
    entranceExams: ['UPSC CSE', 'State PSC exams'],
    skills: ['Public Administration', 'Leadership', 'Crisis Management', 'Policy Formulation', 'Communication', 'Emotional Intelligence'],
    certifications: ['LBSNAA Training Completion Certificate (in-service training)'],
    roadmap: [
      'Maintain strong academic scores in humanities and general science.',
      'Obtain a solid graduation degree while building comprehensive general awareness.',
      'Begin rigorous study of UPSC syllabus: history, polity, geography, and current events.',
      'Practice intense essay writing, answer drafting, and logical case-study analyses.',
      'Excel in the UPSC Preliminary and Mains exams followed by the interview panel.'
    ],
    responsibilities: [
      'Oversee the implementation of developmental schemes and social policies.',
      'Maintain public order, security, and address citizen grievances.',
      'Provide administrative inputs to state ministers and central policy committees.'
    ],
    industries: ['Public Administration', 'Foreign Service', 'National Security', 'Societal Development'],
    opportunities: {
      government: 'Prestigious postings as District Magistrate (DM), Superintendent of Police (IPS), or Diplomatic Ambassador (IFS).',
      private: 'Post-retirement or advisory consultancies, think-tanks, and public relations firms (restricted during active tenure).',
      selfEmployment: 'Not applicable (Exclusive government service).'
    },
    salaryRange: {
      min: 670000,
      max: 2500000,
      formatted: '₹6,70,000 - ₹25,00,000 / year (plus housing, transport & medical perks)'
    },
    outlook: 'Extremely Stable. Built-in constitutional career protection and structured progression.',
    automationImpact: 'Low',
    relatedCareers: ['Public Policy Analyst', 'Diplomat', 'State Civil Services Officer'],
    resources: ['UPSC portal guides', 'Learner\'s Den Civil Services Preparation hub'],
    matchingCriteria: {
      interests: ['teaching', 'business'],
      aptitude: { logical: 4, verbal: 5, spatial: 3, quantitative: 4 },
      subjects: ['maths'],
      workStyle: 'Leadership',
      theoryVsPractice: 'theoretical',
      educationLevel: 'Degree',
      locationPreference: 'Domestic',
      relocationRequired: true,
      entrepreneurialInclination: false
    }
  },
  {
    id: 'defence-commissioned-officer',
    title: 'Defence Commissioned Officer (Army/Navy/Air Force)',
    category: 'Defence & Uniformed Services',
    overview: 'Lead combat units, operate state-of-the-art military assets, and defend national sovereignty against external and internal threats.',
    eligibility: 'Class XII (Physics & Maths for Navy/Air Force) or Bachelor\'s graduation.',
    requiredSubjects: ['Physics', 'Mathematics', 'English', 'General Awareness'],
    pathways: ['NDA (National Defence Academy) after Class XII', 'CDSE (Combined Defence Services Exam) after Graduation', 'SSB (Services Selection Board) selection'],
    alternativePathways: ['NCC Special Entry scheme', 'Technical Graduate Course (TGC)', 'Short Service Commission (SSC)'],
    entranceExams: ['NDA exam', 'CDS exam', 'AFCAT', 'SSB Interview'],
    skills: ['Strategic Planning', 'Physical Endurance', 'Combat Command', 'Weapon Systems Operations', 'Crisis Leadership'],
    certifications: ['IMA / INA / AFA Military Training Certification'],
    roadmap: [
      'Maintain peak physical fitness and mental agility during secondary school.',
      'Excel in Physics and Mathematics tracks at school or during graduation.',
      'Crack the NDA or CDS written examinations on military tactics and logical awareness.',
      'Succeed in the rigorous 5-day SSB psychological and field testing process.',
      'Complete military cadet training at premium academies and earn your commission.'
    ],
    responsibilities: [
      'Command operational units during peacetime, rescue missions, and active conflicts.',
      'Maintain and supervise high-tech military assets, radar setups, or fighter jets.',
      'Oversee training, discipline, and welfare of troop contingents.'
    ],
    industries: ['National Defence', 'Aeronautics', 'Maritime Operations', 'Disaster Relief'],
    opportunities: {
      government: 'Lieutenant / Sub-Lieutenant / Flying Officer starting ranks in Indian Armed Forces.',
      private: 'Security infrastructure directors or logistics management consultants (post-retirement).',
      selfEmployment: 'Strategic security consultancy and tactical training camps.'
    },
    salaryRange: {
      min: 800000,
      max: 3000000,
      formatted: '₹8,00,000 - ₹30,00,000 / year (with free housing, healthcare, pension, rations)'
    },
    outlook: 'Very Stable. Critical national security priority with lifetime benefits.',
    automationImpact: 'Low',
    relatedCareers: ['Commercial Pilot', 'Security Director', 'Logistics Operations Lead'],
    resources: ['Indian Armed Forces Join portals', 'NDA Preparation classes at Learner\'s Den'],
    matchingCriteria: {
      interests: ['ai', 'math'],
      aptitude: { logical: 4, verbal: 4, spatial: 5, quantitative: 4 },
      subjects: ['physics', 'maths'],
      workStyle: 'Leadership',
      theoryVsPractice: 'practical',
      educationLevel: 'Degree',
      locationPreference: 'Domestic',
      relocationRequired: true,
      entrepreneurialInclination: false
    }
  },
  {
    id: 'higher-education-professor',
    title: 'Higher Education Professor & Researcher',
    category: 'Education',
    overview: 'Deliver academic lectures to university students, guide doctoral research, and publish groundbreaking papers in scientific or humanities journals.',
    eligibility: 'Master\'s degree followed by clearing National Eligibility Test (NET) or earning a Ph.D.',
    requiredSubjects: ['Subject-Specific Domain expertise', 'Research Methodology', 'English'],
    pathways: ['Graduation + Master\'s degree', 'UGC-NET or CSIR-NET Exam', 'Ph.D. with published peer-reviewed journals'],
    alternativePathways: ['Industrial subject matter experts joining as adjunct faculty or Professors of Practice'],
    entranceExams: ['UGC-NET', 'CSIR-NET', 'University Specific PhD Entrances'],
    skills: ['Academic Pedagogy', 'Scientific Research Writing', 'Public Speaking', 'Curriculum Design', 'Peer Reviewing'],
    certifications: ['UGC-NET Eligibility Qualification Certificate'],
    roadmap: [
      'Build exceptional deep knowledge in your favorite school subject.',
      'Complete a specialized Master\'s degree with research thesis achievements.',
      'Clear the national eligibility framework (NET) to lock in assistant professorship eligibility.',
      'Complete a rigorous Ph.D. program with active publications.',
      'Apply to UGC-approved universities and build a lifelong educational tenure.'
    ],
    responsibilities: [
      'Lecture undergraduate and postgraduate cohorts on advanced course modules.',
      'Guide and evaluate thesis drafts for Master\'s and Ph.D. students.',
      'Write grant proposals and lead scientific or humanities laboratories.'
    ],
    industries: ['Higher Education', 'Academic Research', 'Publishing & Think-tanks'],
    opportunities: {
      government: 'Assistant Professor at Central/State Universities, IITs, IIMs, IISERs, or NITs.',
      private: 'Senior professor or Research & Development director at leading private universities.',
      selfEmployment: 'Independent online educational content publisher and global academic consultant.'
    },
    salaryRange: {
      min: 600000,
      max: 2200000,
      formatted: '₹6,00,000 - ₹22,00,000 / year'
    },
    outlook: 'Stable. Rising student enrollments fuel steady academic opportunities.',
    automationImpact: 'Low',
    relatedCareers: ['School Principal', 'Curriculum Architect', 'Scientific Advisor'],
    resources: ['UGC official manuals', 'Learner\'s Den Research Mentorship'],
    matchingCriteria: {
      interests: ['teaching', 'med'],
      aptitude: { logical: 4, verbal: 5, spatial: 2, quantitative: 4 },
      subjects: ['cs', 'maths', 'physics', 'chem', 'bio'],
      workStyle: 'Collaborative',
      theoryVsPractice: 'theoretical',
      educationLevel: 'PhD',
      locationPreference: 'Flexible',
      relocationRequired: false,
      entrepreneurialInclination: false
    }
  },
  {
    id: 'corporate-legal-counsel',
    title: 'Corporate Legal Counsel & Advocate',
    category: 'Legal',
    overview: 'Advise businesses on legal rights, compliance parameters, contract drafts, mergers, and intellectual property protection, defending corporate interests.',
    eligibility: 'Pass 3-year LL.B or 5-year integrated B.A. LL.B program and clear All India Bar Exam (AIBE).',
    requiredSubjects: ['Legal Aptitude', 'Polity', 'English', 'Logic & Analytical Reasoning'],
    pathways: ['Integrated 5-year B.A. LL.B or B.B.A. LL.B after Class XII', 'All India Bar Examination (AIBE)', 'State Bar Council registration'],
    alternativePathways: ['3-year LL.B degree after completing any undergraduate graduation course'],
    entranceExams: ['CLAT', 'AILET', 'LSAT India', 'MH CET Law'],
    skills: ['Contract Drafting', 'Legal Advocacy', 'M&A Due Diligence', 'Negotiation', 'Analytical Writing', 'Corporate Governance'],
    certifications: ['Bar Council of India License', 'Certified Corporate Compliance Officer'],
    roadmap: [
      'Focus heavily on reading comprehension, logic, and general knowledge in school.',
      'Succeed in CLAT or other legal entrance examinations after Class XII.',
      'Undergo multiple mock court (moot court) exercises and corporate legal internships.',
      'Register with the state bar council and pass the compulsory All India Bar Exam.',
      'Join corporate legal desks, leading law offices, or start your trial court practice.'
    ],
    responsibilities: [
      'Draft, negotiate, and finalize complex commercial agreements and employment contracts.',
      'Ensure absolute regulatory compliance with state, labor, and financial laws.',
      'Represent corporate interests in mediation, arbitration, or tribunals.'
    ],
    industries: ['Corporate Law Firms', 'Multinational Corporations', 'Financial Institutions', 'Independent Advocacy'],
    opportunities: {
      government: 'Public Prosecutor, Judicial Services (Civil Judge) via state exams, or Legal Advisor at government units.',
      private: 'Legal Director, General Counsel, or Associate Lawyer at major tier-1 corporate law offices.',
      selfEmployment: 'Independent trial court advocate or establishing a corporate law consultancy.'
    },
    salaryRange: {
      min: 600000,
      max: 2600000,
      formatted: '₹6,00,000 - ₹26,00,000 / year'
    },
    outlook: 'Very Strong. Rapid corporate expansions and digital compliance laws create a constant need.',
    automationImpact: 'Medium',
    relatedCareers: ['Arbitrator', 'Patent Attorney', 'Corporate Secretary'],
    resources: ['Bar Council resources', 'Learner\'s Den Law Aspirants stream'],
    matchingCriteria: {
      interests: ['teaching', 'business'],
      aptitude: { logical: 5, verbal: 5, spatial: 1, quantitative: 2 },
      subjects: ['maths'],
      workStyle: 'Collaborative',
      theoryVsPractice: 'theoretical',
      educationLevel: 'Degree',
      locationPreference: 'Flexible',
      relocationRequired: false,
      entrepreneurialInclination: true
    }
  },
  {
    id: 'industrial-automation-technician',
    title: 'Industrial Automation & CNC Technician',
    category: 'Blue Collar',
    overview: 'Install, program, troubleshoot, and maintain high-tech computer numerical control (CNC) machines and robotic assembly setups on smart factory floors.',
    eligibility: 'ITI (Industrial Training Institute) certificate or Polytechnic Diploma.',
    requiredSubjects: ['Applied Mathematics', 'Basic Electronics', 'Workshop Practice', 'Engineering Drawing'],
    pathways: ['Class X/XII followed by ITI Machinist/Fitter/Turner trade', '3-year Diploma in Mechanical/Electrical Engineering', 'Apprenticeship at industrial units'],
    alternativePathways: ['Hands-on machine operator experience backed by specialized automation workshops and software training'],
    entranceExams: ['State Polytechnic Joint Entrance Examinations'],
    skills: ['CNC Programming', 'PLC Troubleshooting', 'Engineering Drawing Reading', 'Precision Measurement', 'Preventative Maintenance'],
    certifications: ['National Apprenticeship Certificate (NAC)', 'Siemens/Fanuc Automation Certification'],
    roadmap: [
      'Gain hands-on skills in basic geometry and manual crafts in high school.',
      'Enroll in a state-recognized ITI or polytechnic engineering diploma.',
      'Master G-code, M-code, and PLC program parameters in engineering workshops.',
      'Undergo mandatory industrial apprenticeship training under senior operators.',
      'Work in automated smart manufacturing hubs, supervising assembly robotics.'
    ],
    responsibilities: [
      'Set up, program, and operate complex CNC laser cutters, mills, or lathed machinery.',
      'Conduct scheduled preventative maintenance audits to prevent factory downtime.',
      'Optimize robotics calibration parameters to ensure maximum precision.'
    ],
    industries: ['Automobile Manufacturing', 'Aerospace components', 'Precision Tooling', 'Heavy Machinery'],
    opportunities: {
      government: 'Technical staff at Indian Railways, BHEL, ONGC, HAL, or state electricity boards.',
      private: 'CNC Programmer, automation technician, or assembly supervisor in private automotive corps.',
      selfEmployment: 'Opening a custom precision lathe workshop or micro manufacturing tooling shop.'
    },
    salaryRange: {
      min: 300000,
      max: 1000000,
      formatted: '₹3,00,000 - ₹10,00,000 / year'
    },
    outlook: 'Strong. The growth of "Make in India" manufacturing increases demand for automated machine operators.',
    automationImpact: 'High',
    relatedCareers: ['Robotics Engineer', 'Maintenance Supervisor', 'Industrial Welder'],
    resources: ['National Skill Development Corporation (NSDC) guides', 'Learner\'s Den vocational tracks'],
    matchingCriteria: {
      interests: ['ai', 'coding'],
      aptitude: { logical: 3, verbal: 2, spatial: 5, quantitative: 3 },
      subjects: ['physics', 'cs'],
      workStyle: 'Independent',
      theoryVsPractice: 'practical',
      educationLevel: 'Diploma',
      locationPreference: 'Domestic',
      relocationRequired: true,
      entrepreneurialInclination: true
    }
  },
  {
    id: 'solar-energy-engineer',
    title: 'Solar Energy & Renewable Grid Consultant',
    category: 'Green Collar',
    overview: 'Design, optimize, and install solar photovoltaic power setups and smart renewable energy microgrids for industrial and residential sectors.',
    eligibility: 'B.Tech/B.E. in Electrical/Mechanical/Renewable Energy or certified polytechnic courses.',
    requiredSubjects: ['Physics', 'Mathematics', 'Chemistry', 'Electrical Circuits'],
    pathways: ['B.Tech in Electrical/Renewable Energy Engineering', 'M.Tech in Solar Photovoltaic Systems', 'Specialized NSQF Renewable energy courses'],
    alternativePathways: ['B.Sc in Physics or Chemistry followed by certified solar installer training programs'],
    entranceExams: ['JEE Main', 'State Engineering Entrance Exams', 'GATE'],
    skills: ['Solar PV Array Design', 'Smart Grid Integration', 'Load Calculation', 'CAD (AutoCAD/PVSyst)', 'Regulatory Net-Metering Laws'],
    certifications: ['NABCEP Solar Professional Certification', 'National Solar Energy Federation installer card'],
    roadmap: [
      'Excel in high school physics, particularly electromagnetism and electrical systems.',
      'Pursue a specialized engineering degree or dedicated solar polytechnic course.',
      'Learn solar modeling software like PVsyst and AutoCAD layouts.',
      'Intern with utility-scale solar developers or green building agencies.',
      'Register as a licensed renewable energy project auditor or solar site consultant.'
    ],
    responsibilities: [
      'Perform detailed site visits, evaluating solar irradiance and shade profiles.',
      'Design comprehensive solar PV configurations, sizing batteries, and calculating inverter loads.',
      'Supervise solar grid installations and secure government net-metering approvals.'
    ],
    industries: ['Renewable Energy Developers', 'Green Building Consultants', 'Utility Power Grid agencies'],
    opportunities: {
      government: 'Project manager at SECI (Solar Energy Corporation of India) or state renewable agencies (e.g. MNRE).',
      private: 'Senior design consultant, technical installer, or project manager at green energy corps.',
      selfEmployment: 'Establishing a solar EPC (Engineering, Procurement, Commissioning) startup.'
    },
    salaryRange: {
      min: 450000,
      max: 1800000,
      formatted: '₹4,50,000 - ₹18,00,000 / year'
    },
    outlook: 'Excellent. Huge national green grid goals drive unmatched project pipeline.',
    automationImpact: 'Low',
    relatedCareers: ['Wind Power Analyst', 'Energy Auditor', 'Electrical Engineer'],
    resources: ['MNRE solar installer guides', 'Learner\'s Den Sustainability Lab'],
    matchingCriteria: {
      interests: ['ai', 'math'],
      aptitude: { logical: 4, verbal: 3, spatial: 4, quantitative: 4 },
      subjects: ['physics', 'maths'],
      workStyle: 'Collaborative',
      theoryVsPractice: 'practical',
      educationLevel: 'Degree',
      locationPreference: 'Domestic',
      relocationRequired: true,
      entrepreneurialInclination: true
    }
  },
  {
    id: 'prompt-engineer',
    title: 'Prompt Engineer & AI Content Architect',
    category: 'New Collar',
    overview: 'Design, optimize, and evaluate input queries (prompts) to maximize the precision, safety, and effectiveness of large language models (LLMs).',
    eligibility: 'Skills-first role. Formal degree not strictly required; certifications and public project portfolios are prioritized.',
    requiredSubjects: ['Computational Linguistics', 'Logic', 'English', 'Basic Coding Concepts'],
    pathways: ['Advanced Generative AI Certifications', 'NLP and Language Model Prompting Bootcamps', 'Proven Git repositories of prompt libraries'],
    alternativePathways: ['A strong background in English Literature, Philosophy, or Linguistics paired with basic Python coding and API testing'],
    entranceExams: ['None (Evaluated purely on live prompt engineering portfolio challenges)'],
    skills: ['Large Language Models (LLMs)', 'System Prompt Design', 'Python/JS APIs', 'Prompt Chaining', 'A/B Testing', 'Safety Guardrailing'],
    certifications: ['Google Cloud Generative AI Path', 'Cohere/OpenAI Developer Certs'],
    roadmap: [
      'Master English grammar, logic, and precise descriptive writing in school.',
      'Experiment with consumer AI interfaces (Gemini, Claude, GPT) to learn API limitations.',
      'Learn basic Python scripting to automate API calls and evaluate bulk model responses.',
      'Build open-source prompt libraries, custom agents, and share interactive demos on HuggingFace.',
      'Join modern AI application teams as the bridge between software code and LLMs.'
    ],
    responsibilities: [
      'Craft precise system instruction templates to steer AI agents in production systems.',
      'Run rigorous testing to avoid model hallucination, jailbreaks, and toxic outputs.',
      'Collaborate with developers to chain prompts using tools like LangChain or LlamaIndex.'
    ],
    industries: ['AI & Tech Startups', 'Digital Marketing Agencis', 'Customer Support Tech', 'Publishing & Copywriting'],
    opportunities: {
      government: 'Generative AI consultant for digital public infrastructure (Bhashini AI, e-Gov projects).',
      private: 'Prompt Engineer, AI Solutions Architect, or AI Content Quality Evaluator in top software houses.',
      selfEmployment: 'Freelance AI workflow automation consultant or prompt template marketplace seller.'
    },
    salaryRange: {
      min: 500000,
      max: 2200000,
      formatted: '₹5,00,000 - ₹22,00,000 / year'
    },
    outlook: 'Emerging & Rapidly Expanding. Rapid industry adoption of LLMs creates immediate demand.',
    automationImpact: 'Medium',
    relatedCareers: ['Data Analyst', 'Technical Writer', 'Conversational UX Designer'],
    resources: ['LearnPrompting.org', 'Google AI Studio tutorials', 'Learner\'s Den Prompting workshops'],
    matchingCriteria: {
      interests: ['coding', 'ai', 'design'],
      aptitude: { logical: 5, verbal: 5, spatial: 3, quantitative: 3 },
      subjects: ['cs'],
      workStyle: 'Independent',
      theoryVsPractice: 'practical',
      educationLevel: 'No Degree',
      locationPreference: 'Remote',
      relocationRequired: false,
      entrepreneurialInclination: true
    }
  },
  {
    id: 'ui-ux-designer',
    title: 'UI/UX & Interactive Product Designer',
    category: 'Creative',
    overview: 'Design intuitive, beautiful, and accessible user interfaces (UI) and user experiences (UX) for mobile apps, websites, and digital devices.',
    eligibility: 'Bachelor\'s in Design (B.Des), Fine Arts (BFA), or certified design portfolios.',
    requiredSubjects: ['Graphic Design', 'Applied Arts', 'Human-Computer Interaction (HCI)', 'English'],
    pathways: ['B.Des in Communication or Interaction Design', 'Self-taught portfolio path with specialized Figma/Adobe masterclasses', 'M.Des at IIT IDC or National Institute of Design (NID)'],
    alternativePathways: ['B.Sc in Computer Science followed by specialized UX Research masterclasses, combining coding and design'],
    entranceExams: ['UCEED', 'CEED', 'NID DAT', 'NIFT Entrance'],
    skills: ['Wireframing', 'Prototyping (Figma)', 'User Research', 'Information Architecture', 'Visual Hierarchy', 'Typography'],
    certifications: ['Google UX Design Professional Certificate', 'Interaction Design Foundation (IxDF) certified courses'],
    roadmap: [
      'Develop strong skills in drawing, typography, color theory, and digital art in school.',
      'Learn standard design tools (Figma, Adobe XD) and UX theories.',
      'Conduct user research studies and map out customer journeys.',
      'Create responsive web mockups and build a comprehensive personal case-study portfolio.',
      'Succeed in design school examinations or secure direct corporate design internships.'
    ],
    responsibilities: [
      'Translate abstract software flows into beautiful, responsive wireframes and prototypes.',
      'Conduct user testing sessions to uncover navigation obstacles and refine app UX.',
      'Design style guides, component systems, and supervise asset handoffs to front-end coders.'
    ],
    industries: ['IT & Software Development', 'Digital Design Agencies', 'E-commerce firms', 'Mobile Game Studios'],
    opportunities: {
      government: 'Lead digital UX strategist for central government portals (MyGov, Digital India initiatives).',
      private: 'Senior UX Researcher, Lead UI Designer, or Interaction Designer at top consumer-facing startups.',
      selfEmployment: 'Freelance design consultant or setting up an independent creative boutique studio.'
    },
    salaryRange: {
      min: 500000,
      max: 2000000,
      formatted: '₹5,00,000 - ₹20,0,000 / year'
    },
    outlook: 'Very Strong. Mobile-first economies and digital banking necessitate top-tier UX.',
    automationImpact: 'Low',
    relatedCareers: ['Graphic Designer', 'Front-End Developer', 'Product Manager'],
    resources: ['NID DAT directories', 'Figma Community files', 'Learner\'s Den Creative Design club'],
    matchingCriteria: {
      interests: ['design', 'coding'],
      aptitude: { logical: 4, verbal: 4, spatial: 5, quantitative: 2 },
      subjects: ['cs'],
      workStyle: 'Collaborative',
      theoryVsPractice: 'practical',
      educationLevel: 'Degree',
      locationPreference: 'Flexible',
      relocationRequired: false,
      entrepreneurialInclination: true
    }
  },
  {
    id: 'startup-founder',
    title: 'Startup Founder & Tech Entrepreneur',
    category: 'Entrepreneurship',
    overview: 'Identify a glaring market problem, design an innovative solution, raise capital, and build an enterprise from scratch with ultimate ownership.',
    eligibility: 'Unrestricted. Driven by resilience, execution capacity, problem-solving skills, and financial strategy.',
    requiredSubjects: ['Business Administration', 'Finance & Accounting', 'Marketing', 'Systems Engineering'],
    pathways: ['Self-taught entrepreneurial path with immediate product launch', 'BBA/MBA followed by startup incubation', 'B.Tech in Engineering followed by tech product launch'],
    alternativePathways: ['Joining a seed-stage startup as early employee to learn core operations, then founding your own firm'],
    entranceExams: ['None (Evaluated on revenue generation, product-market fit, and VC pitch success)'],
    skills: ['Product Management', 'Venture Capital Pitching', 'Financial Bootstrapping', 'Team Recruiting', 'Agile Operations', 'Growth Marketing'],
    certifications: ['Y Combinator Startup School Certificate', 'Certified Product Manager'],
    roadmap: [
      'Develop strong public speaking, financial logic, and coding skills in school.',
      'Identify a real-world problem or pain-point experienced by people daily.',
      'Build a Minimum Viable Product (MVP) using no-code platforms or basic scripting.',
      'Gather early customer feedback, iterate the product, and acquire paid customers.',
      'Secure seed funding or bootstrap using internal revenues to scale operations.'
    ],
    responsibilities: [
      'Define the core vision, product roadmap, and go-to-market strategies.',
      'Pitch to venture capitalists, secure bank loans, and manage cash runways.',
      'Recruit top-tier engineering, sales, and operations talent, maintaining company culture.'
    ],
    industries: ['Technology & SaaS', 'E-commerce & D2C', 'Social Impact Enterprise', 'Consumer Services'],
    opportunities: {
      government: 'Securing grants under Startup India schemes, SIDBI venture funds, or central incubator loans.',
      private: 'Scaling your private equity valuation, or successful corporate acquisition exit.',
      selfEmployment: 'Complete self-employment as the ultimate decision-making Chief Executive Officer (CEO).'
    },
    salaryRange: {
      min: 0,
      max: 5000000,
      formatted: 'Variable (₹0 - ₹50,00,000+ / year based on startup stage, funding & revenues)'
    },
    outlook: 'High Risk / High Reward. Supported by robust global venture capital and government incubation frameworks.',
    automationImpact: 'Low',
    relatedCareers: ['Venture Capital Analyst', 'Product Manager', 'Management Consultant'],
    resources: ['Y Combinator Startup School', 'Startup India Portal', 'Learner\'s Den Incubation Centre'],
    matchingCriteria: {
      interests: ['business', 'finance', 'ai'],
      aptitude: { logical: 5, verbal: 5, spatial: 3, quantitative: 4 },
      subjects: ['maths', 'cs'],
      workStyle: 'Leadership',
      theoryVsPractice: 'practical',
      educationLevel: 'No Degree',
      locationPreference: 'Flexible',
      relocationRequired: true,
      entrepreneurialInclination: true
    }
  },
  {
    id: 'polytechnic-structural-drafter',
    title: 'Polytechnic Structural Drafter & CAD Technician',
    category: 'Skilled Vocational',
    overview: 'Translate civil engineering concepts and architects\' sketches into high-precision digital 2D drawings and 3D structural models.',
    eligibility: 'Polytechnic Diploma in Civil/Mechanical Engineering, or NSQF Level 5 Drafting course.',
    requiredSubjects: ['Applied Mathematics', 'Engineering Drawing', 'Basic Physics', 'Building Materials'],
    pathways: ['3-year Polytechnic Diploma in Civil Engineering', 'AutoCAD/Revit Professional course', 'State technical apprenticeship'],
    alternativePathways: ['ITI Draftsman (Civil) course followed by practical construction blueprinting apprenticeships'],
    entranceExams: ['State Polytechnic Joint Entrance Examinations'],
    skills: ['AutoCAD Civil 3D', 'Autodesk Revit', 'BIM (Building Information Modeling)', 'Rera Compliance norms', 'Blueprint Reading'],
    certifications: ['Autodesk Certified Professional (AutoCAD / Revit)', 'State Technical Board Fitter card'],
    roadmap: [
      'Focus on basic geometry, spatial reasoning, and physics in secondary school.',
      'Enroll in a certified Civil or Drafting Polytechnic engineering track.',
      'Gain deep competency in CAD software and Building Information Modeling (BIM).',
      'Intern at real construction sites, learning how to match plans with active masonry.',
      'Join real estate agencies, structural planning firms, or public works contractors.'
    ],
    responsibilities: [
      'Generate highly accurate architectural and structural blueprints using Revit/AutoCAD.',
      'Update digital structural models to reflect real-world site changes and material shifts.',
      'Ensure drawings strictly comply with local municipality zoning and building safety codes.'
    ],
    industries: ['Real Estate Development', 'Infrastructure Construction', 'Civil Engineering Consultants'],
    opportunities: {
      government: 'Technical draftsman in PWD (Public Works Department), Municipal Corporations, or Indian Railways.',
      private: 'CAD Technician, structural drafter, or building design modeler in private infrastructure firms.',
      selfEmployment: 'Providing freelance drafting and municipal drawing approval consultancies.'
    },
    salaryRange: {
      min: 250000,
      max: 800000,
      formatted: '₹2,50,000 - ₹8,00,000 / year'
    },
    outlook: 'Steady. Fueled by national real estate developments and rapid urban infrastructure schemes.',
    automationImpact: 'Medium',
    relatedCareers: ['Civil Engineer', 'Architectural Assistant', 'GIS Surveyor'],
    resources: ['Autodesk training guides', 'State board polytechnic curriculums'],
    matchingCriteria: {
      interests: ['design', 'math'],
      aptitude: { logical: 3, verbal: 2, spatial: 5, quantitative: 4 },
      subjects: ['physics', 'maths'],
      workStyle: 'Independent',
      theoryVsPractice: 'practical',
      educationLevel: 'Diploma',
      locationPreference: 'Domestic',
      relocationRequired: false,
      entrepreneurialInclination: true
    }
  },
  {
    id: 'digital-nomad-cloud-consultant',
    title: 'International Remote Cloud Consultant',
    category: 'International',
    overview: 'Design, configure, and manage cloud network architectures for global companies, working entirely remotely from any location globally as a digital nomad.',
    eligibility: 'Advanced cloud architect certifications, strong English fluency, and remote system management experience.',
    requiredSubjects: ['Computer Networks', 'Operating Systems', 'Information Security', 'English Communication'],
    pathways: ['Graduation in CS/IT', 'Global Cloud Certifications (AWS / Google Cloud)', 'Building remote freelancer profile with international clients'],
    alternativePathways: ['Skills-first entry: Self-taught system admin experience paired with highly sought-after professional cloud certificates'],
    entranceExams: ['None (Evaluated on certified global cloud exams and remote consulting history)'],
    skills: ['Amazon Web Services (AWS)', 'Google Cloud Platform (GCP)', 'Kubernetes', 'Terraform (IaC)', 'Linux SysAdmin', 'Asynchronous Communication'],
    certifications: ['AWS Certified Solutions Architect (Professional)', 'Google Cloud Certified Professional Cloud Architect'],
    roadmap: [
      'Master English fluency and software systems in school.',
      'Earn a bachelor\'s degree in Computer Science or complete equivalent technical training.',
      'Achieve advanced, globally-recognized professional cloud certificates.',
      'Gain work experience in local DevOps teams, mastering cloud migrations and container setups.',
      'Transition to asynchronous global freelancing or full-time remote international jobs.'
    ],
    responsibilities: [
      'Design reliable, self-scaling, and secure cloud server setups for global companies.',
      'Automate cloud infrastructure setups using Infrastructure as Code (Terraform).',
      'Monitor cloud resource allocations, minimizing hosting bills and fixing system down periods.'
    ],
    industries: ['Global Tech Consultancies', 'International SaaS Firms', 'E-commerce Platforms', 'Remote-first Tech Startups'],
    opportunities: {
      government: 'Not common due to strict country compliance rules (though global inter-government agency contracts exist).',
      private: 'Senior DevOps Architect, Remote Infrastructure Director, or cloud migration lead for global firms.',
      selfEmployment: 'Freelance Cloud Consultant managing client portfolios globally under digital nomad visa schemes.'
    },
    salaryRange: {
      min: 1200000,
      max: 4500000,
      formatted: '₹12,00,000 - ₹45,00,000 / year (Often paid in USD/EUR)'
    },
    outlook: 'Excellent. Global remote work is highly stable, and companies prioritize lowering office costs.',
    automationImpact: 'Low',
    relatedCareers: ['DevOps Associate', 'Cybersecurity Consultant', 'Remote Team Manager'],
    resources: ['AWS Free Tier Labs', 'GCP Skill Boost paths', 'Learner\'s Den Global Career Track'],
    matchingCriteria: {
      interests: ['coding', 'ai', 'finance'],
      aptitude: { logical: 5, verbal: 4, spatial: 3, quantitative: 4 },
      subjects: ['cs'],
      workStyle: 'Independent',
      theoryVsPractice: 'practical',
      educationLevel: 'Degree',
      locationPreference: 'International',
      relocationRequired: true,
      entrepreneurialInclination: true
    }
  },
  {
    id: 'precision-agriculturist',
    title: 'Precision Agriculturist & Smart Farm Manager',
    category: 'Green Collar',
    overview: 'Utilize IoT sensors, satellite imagery, drone maps, and AI data diagnostics to maximize crop yields and soil hydration while practicing climate-smart, eco-friendly agriculture.',
    eligibility: 'B.Sc. in Agriculture, Agronomy, Agricultural Engineering, or related biological science.',
    requiredSubjects: ['Biology', 'Chemistry', 'Physics', 'Mathematics'],
    pathways: ['B.Sc in Agriculture (4 years)', 'M.Sc in Agronomy or Precision Farming', 'Certifications in GIS and Drone Operations'],
    alternativePathways: ['B.Tech in Electronics/Mechanical Engineering followed by specialized agri-tech PG diplomas'],
    entranceExams: ['ICAR AIEEA', 'CUET UG', 'State Agriculture Joint Entrances'],
    skills: ['IoT Sensors Integration', 'GIS & Remote Sensing', 'Hydroponics & Soil Chemistry', 'Drone Mapping', 'Data Diagnostics'],
    certifications: ['Certified Crop Adviser (CCA)', 'Commercial Remote Pilot License (Drone DGCA)'],
    roadmap: [
      'Focus on chemical systems, botany, and geography in school.',
      'Earn an ICAR-accredited bachelor\'s degree in Agriculture or Agronomy.',
      'Gain hands-on training with smart irrigation systems and aerial telemetry drones.',
      'Complete field experiments testing bio-fertilizers and automated crop metrics.',
      'Consult with large-scale corporate plantations, agri-tech startups, or state agricultural boards.'
    ],
    responsibilities: [
      'Integrate multi-spectral drone telemetry to track early pest outbreaks and moisture deficits.',
      'Configure automated drip irrigation systems based on real-time soil chemistry data.',
      'Analyze historical crop yield models to build sustainable, high-output farming rotations.'
    ],
    industries: ['Agri-Tech Enterprises', 'Corporate Organic Farming', 'Agricultural Equipment & Machinery', 'Environmental Consultancy'],
    opportunities: {
      government: 'Scientist at ICAR (Indian Council of Agricultural Research), State Department of Agriculture, or NABARD development officer.',
      private: 'Agronomist or Smart Farming Architect in multinational fertilizer, drone, or seed corporations.',
      selfEmployment: 'Launching a precision drone spraying service or establishing a commercial soilless hydroponic greenhouse startup.'
    },
    salaryRange: {
      min: 400000,
      max: 1500000,
      formatted: '₹4,00,000 - ₹15,00,000 / year'
    },
    outlook: 'Very Strong. Driven by climate change adaptations, global food security mandates, and high-tech farming investments.',
    automationImpact: 'Medium',
    relatedCareers: ['Soil Scientist', 'Agri-Business Manager', 'Hydrologist'],
    resources: ['ICAR Research Bulletins', 'DGCA Drone Pilot Guidelines', 'Learner\'s Den Organic Agri Labs'],
    matchingCriteria: {
      interests: ['environment', 'machinery', 'ai'],
      aptitude: { logical: 4, verbal: 3, spatial: 4, quantitative: 3 },
      subjects: ['bio', 'chem', 'physics'],
      workStyle: 'Independent',
      theoryVsPractice: 'practical',
      educationLevel: 'Degree',
      locationPreference: 'Flexible',
      relocationRequired: true,
      entrepreneurialInclination: true
    }
  },
  {
    id: 'semiconductor-process-engineer',
    title: 'Semiconductor Process & Micro-fabrication Engineer',
    category: 'Technical',
    overview: 'Design and supervise complex silicon chemical vapor depositions, lithography, and high-vacuum cleanroom etching to fabricate state-of-the-art microchips, microcontrollers, and quantum processors.',
    eligibility: 'B.Tech/B.E. in Electronics, Chemical Engineering, Material Science, or Nano-technology.',
    requiredSubjects: ['Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
    pathways: ['B.Tech in Electronics & Communication or Chemical Engineering', 'M.Tech / MS in Microelectronics & VLSI Design', 'Hands-on cleanroom lab internship'],
    alternativePathways: ['M.Sc in Applied Physics followed by a specialized semiconductor fabrication training fellowship'],
    entranceExams: ['JEE Main', 'JEE Advanced', 'GATE'],
    skills: ['Photolithography', 'Chemical Vapor Deposition (CVD)', 'VLSI Design (Verilog/VHDL)', 'Vacuum Physics', 'Statistical Process Control (SPC)', 'Nano-materials'],
    certifications: ['Certified Cleanroom Technician', 'Professional Certificate in VLSI Design'],
    roadmap: [
      'Master advanced electrostatics, organic chemistry, and semiconductor physics in high school.',
      'Succeed in engineering entrances to secure a microelectronics-related bachelor\'s track.',
      'Acquire deep competency in circuit layout simulation and VLSI design softwares.',
      'Intern in a high-vacuum cleanroom facility or fabrication lab testing wafer coatings.',
      'Secure a fabrication role in semiconductor foundries or advanced space/defence technology research groups.'
    ],
    responsibilities: [
      'Supervise deep-UV photolithography processes to etch nanoscale circuit logic boards.',
      'Troubleshoot cleanroom particulate counters and manage chemical deposition recipes.',
      'Optimize silicon wafer throughput, minimizing hardware micro-defects and optimizing heat dissipation.'
    ],
    industries: ['Semiconductor Foundries (fabs)', 'Consumer Electronics Manufacturers', 'Defence & Aerospace Technology', 'Automotive Electronic units'],
    opportunities: {
      government: 'Scientist at ISRO Semi-Conductor Laboratory (SCL), DRDO Solid State Physics Laboratory (SSPL), or PSU foundries.',
      private: 'Process Engineer, VLSI Layout Specialist, or Silicon wafer diagnostic engineer at international tech firms.',
      selfEmployment: 'Not applicable for early career (Founding semiconductor firms requires capital-intensive fab structures, but custom IC design houses can be launched).'
    },
    salaryRange: {
      min: 800000,
      max: 3200000,
      formatted: '₹8,00,000 - ₹32,00,000 / year'
    },
    outlook: 'Excellent. Supported by massive national chip initiatives (India Semiconductor Mission) and international silicon demand.',
    automationImpact: 'Low',
    relatedCareers: ['VLSI Design Engineer', 'Material Scientist', 'Robotics Architect'],
    resources: ['IEEE Micro publications', 'India Semiconductor Mission portals', 'Learner\'s Den VLSI Workshops'],
    matchingCriteria: {
      interests: ['coding', 'ai', 'machinery'],
      aptitude: { logical: 5, verbal: 3, spatial: 5, quantitative: 5 },
      subjects: ['physics', 'chem', 'maths'],
      workStyle: 'Collaborative',
      theoryVsPractice: 'practical',
      educationLevel: 'Degree',
      locationPreference: 'Flexible',
      relocationRequired: true,
      entrepreneurialInclination: false
    }
  },
  {
    id: 'cybersecurity-analyst',
    title: 'Cybersecurity Incident Responder & Ethical Hacker',
    category: 'Technical',
    overview: 'Defend organizational digital infrastructures against malicious cyber attacks. Conduct vulnerability audits, execute penetration tests, and coordinate security operations in high-scale cloud networks.',
    eligibility: 'B.Tech/B.Sc. in Computer Science or IT; or skills-first credentials backed by professional certifications.',
    requiredSubjects: ['Computer Science', 'Mathematics', 'English'],
    pathways: ['B.Tech in Computer Science/Cybersecurity', 'In-depth ethical hacking training modules', 'Completing complex security capture-the-flag (CTF) assessments'],
    alternativePathways: ['Self-taught track: Attaining CEH and OSCP certificates while building a verified public bug-bounty profile'],
    entranceExams: ['JEE Main', 'CUET PG', 'GATE'],
    skills: ['Penetration Testing', 'Network Cryptography', 'Linux Terminal', 'Wireshark & Metasploit', 'Python Security Scripting', 'Cloud Compliance (ISO 27001)'],
    certifications: ['Certified Ethical Hacker (CEH)', 'Offensive Security Certified Professional (OSCP)', 'CompTIA Security+'],
    roadmap: [
      'Master computer software networks, numbering systems, and discrete logic in school.',
      'Enroll in a cybersecurity-focused degree or undergo a comprehensive IT systems bootcamp.',
      'Learn standard security suites like Kali Linux, Wireshark, and Metasploit.',
      'Succeed in global bug bounty boards and showcase open-source security tool contributions.',
      'Join corporate security operations centers (SOC) as an incident analyst or ethical pen-tester.'
    ],
    responsibilities: [
      'Conduct scheduled black-box and white-box penetration tests across client servers and APIs.',
      'Analyze packet telemetry during firewall intrusion alerts to trace attack vectors.',
      'Establish strict system authorization policies, implementing modern multi-factor OAuth security.'
    ],
    industries: ['Banking & Financial Services', 'Defense & Intelligence Units', 'E-commerce Giants', 'Specialized Cybersecurity Firms'],
    opportunities: {
      government: 'Scientist or analyst at CERT-In (Indian Computer Emergency Response Team), NTRO, IB, RAW, or defense cyber agency.',
      private: 'Senior Penetration Tester, Cybersecurity Consultant, or Chief Information Security Officer (CISO).',
      selfEmployment: 'Launching an independent cybersecurity consulting firm or providing external remote security audit operations.'
    },
    salaryRange: {
      min: 600000,
      max: 2800000,
      formatted: '₹6,00,000 - ₹28,00,000 / year'
    },
    outlook: 'Very Strong. Exponential rise in digitisation and cloud migrations makes cybersecurity a critical, board-level priority.',
    automationImpact: 'Low',
    relatedCareers: ['Cloud Architect', 'Systems Administrator', 'Blockchain Security Auditor'],
    resources: ['OWASP Security Guides', 'TryHackMe/HackTheBox laboratories', 'Learner\'s Den Cyber Defence Hub'],
    matchingCriteria: {
      interests: ['coding', 'ai', 'defence'],
      aptitude: { logical: 5, verbal: 4, spatial: 3, quantitative: 4 },
      subjects: ['cs', 'maths'],
      workStyle: 'Independent',
      theoryVsPractice: 'practical',
      educationLevel: 'Degree',
      locationPreference: 'Flexible',
      relocationRequired: false,
      entrepreneurialInclination: true
    }
  },
  {
    id: 'biotech-scientist',
    title: 'Biotechnology & Gene Therapy Research Scientist',
    category: 'Science & Research',
    overview: 'Manipulate cellular genomes, design recombinant proteins, engineer vaccines, and leverage CRISPR gene-editing tools to treat chronic genetic diseases and optimize bio-industrial outputs.',
    eligibility: 'B.Tech or B.Sc. in Biotechnology, Biochemistry, Molecular Biology, or genetics.',
    requiredSubjects: ['Biology', 'Chemistry', 'Mathematics', 'English'],
    pathways: ['B.Tech / B.Sc in Biotechnology', 'M.Tech / M.Sc in Genetic Engineering or Bioinformatics', 'Ph.D. with published genetic research journals'],
    alternativePathways: ['MBBS followed by MD in Medical Biochemistry or Genetics to operate clinical laboratories'],
    entranceExams: ['IIT JAM', 'GAT-B', 'CUET PG', 'GATE'],
    skills: ['Gene Editing (CRISPR)', 'Recombinant DNA Technology', 'Bioinformatics (BLAST/R)', 'Spectrophotometry', 'Cell Culture', 'High-Performance Liquid Chromatography (HPLC)'],
    certifications: ['Bio-Safety Level (BSL) Lab Assessor', 'Bioinformatics Specialist Certificate'],
    roadmap: [
      'Master cellular division, biochemistry, and algebraic models in school.',
      'Succeed in national science entrances to secure a biotechnology bachelor\'s degree.',
      'Acquire laboratory certifications in cell culture methods and molecular assays.',
      'Contribute to peer-reviewed genetic research publications or biosimilar clinical trial reports.',
      'Join multinational pharmaceutical research units or state biotech incubators.'
    ],
    responsibilities: [
      'Design CRISPR-Cas9 guide RNA configurations to knockout disease-associated gene loci.',
      'Analyze high-throughput next-generation sequencing (NGS) data using bioinformatics tools.',
      'Supervise bio-reactor parameters to manufacture vaccine proteins or bio-similars under sterile protocols.'
    ],
    industries: ['Pharmaceutical & Biopharma', 'Genetic Testing Labs', 'Agri-Biotech Enterprises', 'Scientific Research Institutes'],
    opportunities: {
      government: 'Scientist at CSIR labs, DBT (Department of Biotechnology) institutes, or ICMR research centers.',
      private: 'Biopharma R&D scientist, Bioinformatics Analyst, or clinical trial coordinator in private healthcare corps.',
      selfEmployment: 'Founding a clinical diagnosis center, bio-fertilizer manufacturing unit, or gene-analytics consulting firm.'
    },
    salaryRange: {
      min: 500000,
      max: 2000000,
      formatted: '₹5,00,000 - ₹20,00,000 / year'
    },
    outlook: 'Strong. The growth of personalized healthcare and synthetic biology accelerates lab investments.',
    automationImpact: 'Low',
    relatedCareers: ['Clinical Research Associate', 'Biochemical Engineer', 'Forensic Scientist'],
    resources: ['NCBI database tutorials', 'DBT India publications', 'Learner\'s Den Genetics Lab'],
    matchingCriteria: {
      interests: ['med', 'math'],
      aptitude: { logical: 4, verbal: 4, spatial: 3, quantitative: 4 },
      subjects: ['bio', 'chem', 'maths'],
      workStyle: 'Collaborative',
      theoryVsPractice: 'theoretical',
      educationLevel: 'PhD',
      locationPreference: 'Flexible',
      relocationRequired: true,
      entrepreneurialInclination: true
    }
  },
  {
    id: 'game-director',
    title: 'Game Director & Unreal Engine Developer',
    category: 'Creative',
    overview: 'Lead the creative vision, level architecture, and logic scripting of video games. Oversee mechanics, storyline flow, and asset compilations in Unreal Engine and Unity to publish high-performance immersive games.',
    eligibility: 'Degree in Game Design, Computer Science, Animation, or verified personal portfolio of published games.',
    requiredSubjects: ['Computer Science', 'English', 'Applied Mathematics', 'Fine Arts'],
    pathways: ['B.Tech in Computer Science with game design focus', 'Self-taught game dev path compiling rich interactive portfolios', 'M.Des in Digital Game Design at premium institutes (e.g. NID)'],
    alternativePathways: ['A background in animation or scriptwriting paired with visual blueprint coding in Unreal Engine'],
    entranceExams: ['NID DAT', 'CEED', 'Private College Entrance Tests'],
    skills: ['C++ / C# Scripting', 'Unreal Engine (Blueprints)', 'Unity Engine', '3D Math (Vectors/Matrices)', 'UI/UX Interactive Layout', 'Agile Production'],
    certifications: ['Epic Games Unreal Engine Certified Creator', 'Unity Certified Programmer'],
    roadmap: [
      'Master algebra, basic physics, computer logic, and graphic arts in school.',
      'Learn object-oriented languages (C++ or C#) and standard game engines (Unity / Unreal).',
      'Design, test, and release interactive game prototypes in developer jams (e.g., itch.io).',
      'Create standard game mechanics, lighting profiles, and optimize frame-rate rendering.',
      'Publish cross-platform indie games or join professional game studios as a layout/logic engineer.'
    ],
    responsibilities: [
      'Author highly responsive engine scripts for user controls, character logic, and AI pathfinding.',
      'Coordinate with sound designers, 3D artists, and QA testers to ensure smooth frame deliveries.',
      'Optimize engine memory buffers and multi-threading models to avoid rendering lag.'
    ],
    industries: ['Game Development Studios', 'Animation & VFX Houses', 'Immersive AR/VR Enterprises', 'Interactive Media & Advertising'],
    opportunities: {
      government: 'Digital content designer for municipal museums, defense simulations, or state e-learning boards.',
      private: 'Gameplay Programmer, Lead Level Designer, or Creative Director in global gaming houses.',
      selfEmployment: 'Establishing an independent game studio, publishing original games on Steam/App Store, or remote freelancing.'
    },
    salaryRange: {
      min: 450000,
      max: 2200000,
      formatted: '₹4,50,000 - ₹22,00,000 / year'
    },
    outlook: 'Very Strong. Supported by the global gaming industry, esports growth, and immersive VR trends.',
    automationImpact: 'Low',
    relatedCareers: ['VFX Artist', 'UI/UX Designer', 'Software Engineer'],
    resources: ['Unreal Engine Learning Portal', 'Unity Learn resources', 'Learner\'s Den Indie Game incubator'],
    matchingCriteria: {
      interests: ['coding', 'design', 'ai'],
      aptitude: { logical: 4, verbal: 4, spatial: 5, quantitative: 4 },
      subjects: ['cs', 'english'],
      workStyle: 'Collaborative',
      theoryVsPractice: 'practical',
      educationLevel: 'Degree',
      locationPreference: 'Flexible',
      relocationRequired: false,
      entrepreneurialInclination: true
    }
  },
  {
    id: 'merchant-navy-officer',
    title: 'Marine Chief Engineer & Merchant Navy Officer',
    category: 'International',
    overview: 'Supervise marine propulsion machinery, high-voltage generators, fuel purifiers, and auxiliary equipment on international cargo ships, oil tankers, and bulk carriers sailing globally.',
    eligibility: 'Class XII Science (PCM with 60%+) and Directorate General of Shipping (DGS) approved degrees.',
    requiredSubjects: ['Physics', 'Chemistry', 'Mathematics', 'English'],
    pathways: ['B.Tech in Marine Engineering (4 years)', 'Diploma in Marine Engineering followed by sea-time training', 'Clearing Class-1 Marine Engineering Certificate of Competency (MEO COC)'],
    alternativePathways: ['B.Sc in Nautical Science followed by deck cadet training to practice as ship Navigation Captain'],
    entranceExams: ['IMU CET (Indian Maritime University)'],
    skills: ['Propulsion Machinery Maintenance', 'Thermodynamics & Hydraulics', 'High-Voltage Switchboards', 'Maritime Navigation Laws', 'First-Aid & Survival Operations'],
    certifications: ['DGS MEO Certificate of Competency (Class 1 to 4)', 'STCW Basic Safety Training'],
    roadmap: [
      'Focus on peak physical stamina, thermodynamics, electrical math, and English in high school.',
      'Pass the IMU CET entrance examination and enroll in a DGS-approved maritime college.',
      'Undergo intensive shipboard training as a Junior Engineer, logging mandatory sea-time.',
      'Progressively clear structural competence examinations (MEO Class-4 to Class-1 COCs).',
      'Earn promotions to Second Engineer and Marine Chief Engineer supervising oceanic voyages.'
    ],
    responsibilities: [
      'Maintain, test, and troubleshoot mega marine diesel engines and propulsion shafts.',
      'Manage fuel efficiency parameters, ballast water treatment, and emergency steering systems.',
      'Ensure strict compliance with international maritime environmental laws (MARPOL).'
    ],
    industries: ['Global Ship Management Corps', 'Oil & Gas Conglomerates', 'Oceanic Container Freight Lines', 'Offshore Supply Operators'],
    opportunities: {
      government: 'Engineer surveyor roles at Directorate General of Shipping, Port Trusts, or SCI (Shipping Corporation of India).',
      private: 'Chief Engineer or Technical Manager in elite international shipping lines (highly lucrative, tax-free incomes).',
      selfEmployment: 'Not applicable for active sea service (but marine surveyor or superintendent consultancies can be established on land).'
    },
    salaryRange: {
      min: 1200000,
      max: 6000000,
      formatted: '₹12,00,000 - ₹60,00,000 / year (Often tax-free on foreign-going vessels)'
    },
    outlook: 'Very Strong. Critical backbone of global trade logistics handling 90% of international commerce.',
    automationImpact: 'Low',
    relatedCareers: ['Port Superintendent', 'Mechanical Engineer', 'Logistics Director'],
    resources: ['Directorate General of Shipping portals', 'IMU CET brochures', 'Learner\'s Den Maritime Club'],
    matchingCriteria: {
      interests: ['machinery', 'environment', 'defence'],
      aptitude: { logical: 4, verbal: 3, spatial: 5, quantitative: 4 },
      subjects: ['physics', 'maths'],
      workStyle: 'Leadership',
      theoryVsPractice: 'practical',
      educationLevel: 'Degree',
      locationPreference: 'International',
      relocationRequired: true,
      entrepreneurialInclination: false
    }
  },
  {
    id: 'railway-operations-manager',
    title: 'Railway Operations & Signaling Systems Manager',
    category: 'Government & Civil Services',
    overview: 'Manage railway transport networks, train traffic dispatch schedulers, smart interlocking signaling lines, and station staff operations to ensure secure, efficient passenger and freight transit.',
    eligibility: 'Bachelor\'s degree in Engineering, Transportation Management, or a general graduation.',
    requiredSubjects: ['General Studies', 'Logic', 'English', 'Basic Physics & Mechanics'],
    pathways: ['Graduation in any stream', 'UPSC Indian Railway Management Service (IRMS)', 'Railway Recruitment Board (RRB) Officer exams'],
    alternativePathways: ['Specialized MBA in Infrastructure and Supply Chain Logistics followed by private metro rail operational hires'],
    entranceExams: ['UPSC Civil Services (IRMS)', 'RRB NTPC (Group A/B) Exams', 'Metro Rail Recruitment Exams'],
    skills: ['Interlocking Signaling systems', 'Transit Dispatch Optimization', 'SLA Monitoring', 'Railway Safety Act compliance', 'Emergency Crisis Command'],
    certifications: ['Indian Railway Academy Training Certificate', 'Certified Transit Planner'],
    roadmap: [
      'Develop strong logical awareness, organizational planning, and science skills in school.',
      'Succeed in general college graduation or technical engineering degrees.',
      'Crack the competitive national civil services (IRMS) or RRB officer examinations.',
      'Undergo intensive professional signaling and dispatch training at elite railway academies.',
      'Manage zonal rail dispatching hubs, rapid transit metros, or high-speed freight grids.'
    ],
    responsibilities: [
      'Oversee zonal train routing timetables, coordinating dispatch lines to eliminate bottlenecks.',
      'Direct safety compliance audits on computerized solid-state interlocking signaling tracks.',
      'Organize immediate rescue and line clearance operations during weather disruptions or signaling faults.'
    ],
    industries: ['National Railways (Indian Railways)', 'Urban Metro Transit Corporations (e.g. DMRC)', 'Industrial Freight Logistics Grids'],
    opportunities: {
      government: 'Group A Gazette Postings: Assistant Operations Manager (AOM), Divisional Operations Manager (DOM) in Railways.',
      private: 'Senior operational planner, metro systems auditor, or supply chain routing analyst in private shipping conglomerates.',
      selfEmployment: 'Not applicable (Exclusive government or state metro public service).'
    },
    salaryRange: {
      min: 600000,
      max: 2000000,
      formatted: '₹6,00,000 - ₹20,00,000 / year (plus housing, lifetime pension allowances & rail travel passes)'
    },
    outlook: 'Very Stable. Heavy government modernizations, dedicated freight corridors, and new metro lines sustain steady recruitment.',
    automationImpact: 'Medium',
    relatedCareers: ['Logistics Coordinator', 'Supply Chain Director', 'Air Traffic Controller'],
    resources: ['Railway Board Indian recruitment manuals', 'Learner\'s Den Railway & Metro Exam Cell'],
    matchingCriteria: {
      interests: ['machinery', 'publicPolicy', 'business'],
      aptitude: { logical: 4, verbal: 4, spatial: 4, quantitative: 4 },
      subjects: ['maths', 'physics'],
      workStyle: 'Leadership',
      theoryVsPractice: 'balanced',
      educationLevel: 'Degree',
      locationPreference: 'Domestic',
      relocationRequired: true,
      entrepreneurialInclination: false
    }
  },
  {
    id: 'public-sector-banker',
    title: 'Public Sector Banker & Corporate Credit Analyst',
    category: 'Commerce & Finance',
    overview: 'Review corporate credit histories, manage financial accounts, analyze retail loan applications, and execute retail banking transactions in leading nationalized banking institutions.',
    eligibility: 'Bachelor\'s degree in Commerce, Economics, Mathematics, or any equivalent graduation.',
    requiredSubjects: ['Accountancy', 'Mathematics', 'Economics', 'English Communication', 'General Studies'],
    pathways: ['Graduation from any accredited university', 'IBPS PO (Probationary Officer) Examination', 'State Bank of India (SBI PO) Examination'],
    alternativePathways: ['B.Com followed by private investment banking exams or corporate finance analyst postings'],
    entranceExams: ['IBPS PO', 'SBI PO', 'RBI Grade B Officer Examination'],
    skills: ['Financial Analysis (Ratio/Cash Flow)', 'Corporate Credit Appraisal', 'Tally & Finacle Core Systems', 'RBI Compliance norms', 'Customer Relations'],
    certifications: ['JAIIB / CAIIB Certification (Indian Institute of Banking and Finance)', 'NISM Research Analyst Cert'],
    roadmap: [
      'Master commercial accounting, verbal logic, and financial mathematics in school.',
      'Succeed in an economics, accounting, or business undergraduate program.',
      'Clear the competitive IBPS or SBI PO preliminary, mains, and interview phases.',
      'Undergo mandatory banking operations and lending credit analysis training.',
      'Serve as Assistant Manager, progressing to Senior Credit Manager executing industrial loans.'
    ],
    responsibilities: [
      'Analyze prospective balance sheets and cash flows to evaluate corporate creditworthiness.',
      'Oversee daily branch treasury transactions, balancing physical and digital vaults under RBI limits.',
      'Counsel retail customers on loans, investment policies, and wealth management protocols.'
    ],
    industries: ['Public Sector Banks (SBI, PNB, BOB)', 'Private Commercial Banks', 'Non-Banking Financial Companies (NBFCs)', 'Micro-Finance Institutions'],
    opportunities: {
      government: 'Assistant Manager PO, Branch Manager, or RBI Grade B development officers.',
      private: 'Corporate Relationship Officer, Credit Analyst, or branch head in private or foreign banks.',
      selfEmployment: 'Setting up an independent financial planning agency or loan/subsidy syndication consultancies.'
    },
    salaryRange: {
      min: 550000,
      max: 1800000,
      formatted: '₹5,50,000 - ₹18,00,000 / year (plus housing, transport perks & low-interest staff loans)'
    },
    outlook: 'Very Stable. Financial credit extensions and banking inclusions remain a core developmental focus.',
    automationImpact: 'Medium',
    relatedCareers: ['Chartered Accountant', 'Financial Analyst', 'Risk Manager'],
    resources: ['IIBF Official manuals', 'IBPS portal guidelines', 'Learner\'s Den Banking & Commerce Academics'],
    matchingCriteria: {
      interests: ['finance', 'business', 'publicPolicy'],
      aptitude: { logical: 4, verbal: 4, spatial: 1, quantitative: 5 },
      subjects: ['accountancy', 'maths'],
      workStyle: 'Collaborative',
      theoryVsPractice: 'practical',
      educationLevel: 'Degree',
      locationPreference: 'Domestic',
      relocationRequired: false,
      entrepreneurialInclination: true
    }
  },
  {
    id: 'judicial-magistrate',
    title: 'Civil Judge & Judicial Magistrate',
    category: 'Legal',
    overview: 'Preside over court trials, hear evidence, arbitrate legal disputes, and deliver verdicts in conformity with the Indian Penal Code and Civil Procedure Codes.',
    eligibility: 'Bachelor of Laws (LL.B.) and clearing the provincial Judicial Services Examination (PCS-J).',
    requiredSubjects: ['Constitutional Law', 'Criminal Jurisprudence', 'Civil Law', 'English'],
    pathways: ['3-year or 5-year LL.B. graduation', 'State-level Judicial Services Examination', 'Specialist Judges training at the National Judicial Academy'],
    alternativePathways: ['7+ years of active high court litigation practice to clear the Higher Judicial Services (HJS) entrance'],
    entranceExams: ['Provincial Civil Services Judicial Exam (PCS-J)', 'HJS Examination'],
    skills: ['Legal Jurisprudence', 'Critical Fact Analysis', 'Courtroom Arbitration', 'Impartial Verdict Formulation', 'Legal Composition'],
    certifications: ['State Bar Enrollment', 'PCS-J Merit Commission list'],
    roadmap: [
      'Maintain an outstanding scholastic background in humanities, speech, and composition.',
      'Enroll in a top-tier BA-LLB joint honors program or general law school.',
      'Gain extensive trial research exposure under senior advocates and judicial clerks.',
      'Clear the state Judicial Services competitive exam (prelims, mains, oral interview).',
      'Receive official state commission and undergo academy magistrate drills.'
    ],
    responsibilities: [
      'Preside over courtroom procedures, maintaining decorum and adhering to procedural rules.',
      'Evaluate admissibility of witness testimonies, forensics, and statutory precedents.',
      'Formulate binding legal judgments, balancing fairness, constitutional rights, and statutory mandates.'
    ],
    industries: ['Judiciary & Courts', 'State Law Departments', 'Legal Education'],
    opportunities: {
      government: 'Presiding Magistrate in District courts, progressing to High Court or Supreme Court Bench.',
      private: 'Corporate legal arbitrator or post-retirement advisory boards (restricted during tenure).',
      selfEmployment: 'Arbitration service consultant.'
    },
    salaryRange: {
      min: 1000000,
      max: 3000000,
      formatted: '₹10,00,000 - ₹30,00,000 / year (plus free state bungalow, security staff, and car)'
    },
    outlook: 'Very Stable. Rising judicial backlogs create a massive and non-stop demand for judicial officers.',
    automationImpact: 'Low',
    relatedCareers: ['Corporate Arbitrator', 'Trial Lawyer', 'Public Prosecutor'],
    resources: ['Bar Council of India bulletins', 'Learner\'s Den Judiciary Excellence Series'],
    matchingCriteria: {
      interests: ['publicPolicy', 'teaching'],
      aptitude: { logical: 5, verbal: 5, spatial: 2, quantitative: 3 },
      subjects: ['civics', 'history'],
      workStyle: 'Leadership',
      theoryVsPractice: 'theoretical',
      educationLevel: 'Degree',
      locationPreference: 'Domestic',
      relocationRequired: true,
      entrepreneurialInclination: false
    }
  },
  {
    id: 'veterinary-surgeon',
    title: 'Veterinary Surgeon & Animal Health Consultant',
    category: 'Medical & Healthcare',
    overview: 'Diagnose and treat diseases, perform surgeries, prescribe pharmacological drugs, and oversee general healthcare routines for pets, livestock, and exotic wildlife.',
    eligibility: 'Bachelor of Veterinary Science & Animal Husbandry (B.V.Sc. & A.H.) from an ICAR-accredited university.',
    requiredSubjects: ['Biology', 'Chemistry', 'Physics', 'Biochemistry'],
    pathways: ['5.5-year B.V.Sc. & A.H. including compulsory clinical rotatory internship', 'M.V.Sc in specialized animal medicine, surgery, or pathology'],
    alternativePathways: ['Diploma in Animal Husbandry or Veterinary Nursing for technical assistant roles'],
    entranceExams: ['NEET UG', 'State Veterinary Joint Entrance Examinations'],
    skills: ['Animal Anatomy', 'Veterinary Surgery', 'Pathological Diagnostic Procedures', 'Pharma Prescriptions', 'Wildlife Immobilization'],
    certifications: ['Veterinary Council of India (VCI) Registration'],
    roadmap: [
      'Exceed high standards in secondary school biology, chemistry, and organic sciences.',
      'Succeed in the national NEET or state-level veterinary joint entrances.',
      'Complete the rigorous clinical modules, anesthesia laboratories, and farm surgery units.',
      'Acquire hands-on training at domestic dairy, poultry, and forest zoo reserves.',
      'Register under VCI and commence diagnostic animal surgery practice.'
    ],
    responsibilities: [
      'Conduct surgical procedures including orthopedics, soft-tissue repairs, and obstetrics.',
      'Analyze hematology, radiographs, and cultures to diagnose infectious animal diseases.',
      'Advise livestock farmers on biosecurity, immunization schedules, and balanced nutrition.'
    ],
    industries: ['Animal Hospitals', 'Wildlife Sanctuaries', 'Poultry & Dairy Corporate Farms', 'Pharmaceutical R&D'],
    opportunities: {
      government: 'Veterinary Officer (VO) in state animal husbandry wings, army remount units, or zoo scientist.',
      private: 'Senior surgeon at private multi-speciality veterinary facilities or pharmaceutical advisor.',
      selfEmployment: 'Establishing a private veterinary clinic, grooming wellness center, or farm consultancy.'
    },
    salaryRange: {
      min: 500000,
      max: 2000000,
      formatted: '₹5,00,000 - ₹20,00,000 / year'
    },
    outlook: 'Strong. Expanding livestock investments and rising pet-parenthood trends support robust demand.',
    automationImpact: 'Low',
    relatedCareers: ['Wildlife Biologist', 'Zookeeper', 'Animal Nutrition Scientist'],
    resources: ['Veterinary Council of India handbook', 'Learner\'s Den Pre-Vet entrance bootcamp'],
    matchingCriteria: {
      interests: ['med', 'teaching'],
      aptitude: { logical: 4, verbal: 4, spatial: 4, quantitative: 3 },
      subjects: ['bio', 'chem'],
      workStyle: 'Independent',
      theoryVsPractice: 'practical',
      educationLevel: 'Degree',
      locationPreference: 'Flexible',
      relocationRequired: true,
      entrepreneurialInclination: true
    }
  },
  {
    id: 'hospitality-director',
    title: 'Luxury Hotel & Hospitality Director',
    category: 'Skilled Vocational',
    overview: 'Oversee multi-million dollar luxury hotel operations, guest relations, catering divisions, global conferences, and high-scale tourism programs.',
    eligibility: 'Bachelor of Hotel Management (BHM) or MBA in Hospitality & Tourism from a premier culinary or aviation institute.',
    requiredSubjects: ['English', 'Business Studies', 'Economics', 'General Studies'],
    pathways: ['4-year Bachelor of Hotel Management (BHM)', 'Specialized international placements in operational hospitality streams'],
    alternativePathways: ['Direct entry via general management trainee routes at leading global five-star brands'],
    entranceExams: ['NCHMCT JEE', 'AIHMCT', 'Institutional Entrance Panels'],
    skills: ['Luxury Operations Management', 'Financial Budgeting & Revenue Optimization', 'Interpersonal Protocol', 'Culinary & Beverage Analytics', 'Crisis Remediation'],
    certifications: ['Certified Hotel Administrator (CHA)', 'HACCP Food Safety Certification'],
    roadmap: [
      'Build excellent communication skills, languages, and grooming in high school.',
      'Succeed in the NCHMCT JEE exam to enter premier National IHMs.',
      'Undergo extensive culinary, front-office, housekeeping, and bar service modules.',
      'Complete management training programs at luxury hospitality chains.',
      'Climb operational ranks to General Manager overseeing international resorts.'
    ],
    responsibilities: [
      'Manage hotel revenue plans, occupancy optimizations, and capital expend budgets.',
      'Audit culinary kitchens, banquets, spa resorts, and front office workflows for premium luxury standards.',
      'Resolve VIP guest crises, organizing international delegate protocols.'
    ],
    industries: ['Luxury Hotels & Resorts', 'International Cruise Liners', 'Aviation Airlines', 'Global Event Agencies'],
    opportunities: {
      government: 'Manager roles in state tourism departments, railway catering services (IRCTC), or state guest house cells.',
      private: 'General Manager, Brand Director, or Operations Vice President in luxury global hotel conglomerates.',
      selfEmployment: 'Establishing boutique resorts, luxury travel agencies, or event consultancies.'
    },
    salaryRange: {
      min: 600000,
      max: 4000000,
      formatted: '₹6,00,000 - ₹40,00,000 / year'
    },
    outlook: 'Very Strong. Driven by high-end experiential leisure travels and corporate convention booms.',
    automationImpact: 'Low',
    relatedCareers: ['Travel Planner', 'Event Executive', 'Aviation Flight Manager'],
    resources: ['NCHMCT guidance books', 'Learner\'s Den Hospitality & English Grooming Cell'],
    matchingCriteria: {
      interests: ['business', 'finance'],
      aptitude: { logical: 4, verbal: 5, spatial: 3, quantitative: 4 },
      subjects: ['english', 'commerce'],
      workStyle: 'Leadership',
      theoryVsPractice: 'practical',
      educationLevel: 'Degree',
      locationPreference: 'Flexible',
      relocationRequired: true,
      entrepreneurialInclination: true
    }
  },
  {
    id: 'smart-factory-technician',
    title: 'Precision CNC Machinist & Smart Factory Technician',
    category: 'Blue Collar',
    overview: 'Program, calibrate, operate, and troubleshoot high-precision automated CNC machines, robotic production tools, and 3D printing modules on smart factory floors.',
    eligibility: 'ITI Certification or Diploma in Mechanical/Automation Engineering after Class X or XII.',
    requiredSubjects: ['Mathematics', 'Basic Physics', 'Technical Drawing', 'Workshop Practice'],
    pathways: ['ITI CNC Operator/Machinist Course', 'Diploma in Mechanical or Automation Engineering', 'On-job apprenticeship on smart assembly lines'],
    alternativePathways: ['Lateral training for traditional metal turners into CNC computer programmers'],
    entranceExams: ['ITI Entrance Exams', 'State Polytechnic Entrance Examinations'],
    skills: ['G-Code / M-Code Programming', 'Robotics Calibration', 'Precision Micro-Measurement (Verniers/Micrometers)', 'Industrial Safety Protocols', 'Preventative Machinery Maintenance'],
    certifications: ['National Trade Certificate (NTC)', 'Siemens/Fanuc CNC Programming Cert'],
    roadmap: [
      'Build basic mechanical intuition, mathematics, and technical drawing skills in school.',
      'Enroll in an ITI or polytechnic diploma course focused on manufacturing technologies.',
      'Gain intensive shop floor training calibrating hydraulic tools and automatic machine systems.',
      'Learn computerized G-Code programming and industrial diagnostic procedures.',
      'Become a Lead Technician overseeing fully automated manufacturing cells.'
    ],
    responsibilities: [
      'Program and feed structural G-code instruction models into high-precision millers.',
      'Monitor and tune robotic arms, automated conveyor belts, and pneumatic tools for ideal throughput.',
      'Perform micro-measurements on machined parts to maintain safety and compliance standards.'
    ],
    industries: ['Aerospace Component Manufacturing', 'Automotive Assemblers', 'Heavy Engineering Industries', 'Medical Device Foundries'],
    opportunities: {
      government: 'Technical Operator at Ordnance Factories, Railway workshops, ISRO, or DRDO facilities.',
      private: 'Lead machinist, automated cell supervisor, or precision tooling specialist in auto and defense plants.',
      selfEmployment: 'Setting up an independent precision CNC job-work facility.'
    },
    salaryRange: {
      min: 300000,
      max: 1200000,
      formatted: '₹3,00,000 - ₹12,00,000 / year'
    },
    outlook: 'Strong. Driven by national "Make in India" campaigns and heavy factory automation.',
    automationImpact: 'Medium',
    relatedCareers: ['Robotics Technician', 'Industrial Maintenance Engineer', 'Tool & Die Maker'],
    resources: ['DGET ITI curricula catalogs', 'Learner\'s Den Vocational Skill development modules'],
    matchingCriteria: {
      interests: ['machinery', 'coding'],
      aptitude: { logical: 4, verbal: 2, spatial: 5, quantitative: 4 },
      subjects: ['maths', 'physics'],
      workStyle: 'Independent',
      theoryVsPractice: 'practical',
      educationLevel: 'Diploma',
      locationPreference: 'Domestic',
      relocationRequired: true,
      entrepreneurialInclination: true
    }
  },
  {
    id: 'sports-esports-director',
    title: 'Sports Media & Esports Tournament Director',
    category: 'Creative',
    overview: 'Design, organize, budget, and execute regional, national, and global physical sports events and digital esports league broadcasts.',
    eligibility: 'Bachelor\'s degree in Sports Management, Mass Communication, or Business Administration.',
    requiredSubjects: ['English Literature', 'Media Studies', 'Economics', 'Information Technology'],
    pathways: ['B.Sc/BBA in Sports Management', 'Graduate Diploma in Mass Communication & Live Broadcasts', 'Extensive ground-level sports club volunteerism'],
    alternativePathways: ['Successful professional gaming or athletic background leading to coordinator and director roles'],
    entranceExams: ['CUET UG', 'Institutional Interview and Media Aptitude Checks'],
    skills: ['Live Event Coordination', 'Esports Broadcast Engineering (OBS/vMix)', 'Corporate Sponsorship Acquisition', 'Athletic Regulatory Compliance', 'Brand Management'],
    certifications: ['Certified Sports Event Organizer (CSEO)', 'Advanced Media Stream Engineering Cert'],
    roadmap: [
      'Express keen interest in school athletics, organizing campus tournaments, or managing web forums.',
      'Pursue sports management or media communication undergraduate programs.',
      'Manage regional digital gaming clans or local school tournaments.',
      'Master video streaming setups, live cameras, sponsorship pitches, and community handles.',
      'Establish global league standards as Director of premium sports and esports organizations.'
    ],
    responsibilities: [
      'Formulate tournament rules, matches scheduling, and prize pool escrow frameworks.',
      'Direct live digital broadcast engineering, supervising camera operators, commentators, and overlay servers.',
      'Pitch to and lock corporate sponsorships and brand placement campaigns.'
    ],
    industries: ['Esports Leagues & Agencies', 'Sports Broadcasting Networks', 'Global Gaming Publishers', 'Athletic Club Associations'],
    opportunities: {
      government: 'Sports Officer in state councils, Sports Authority of India (SAI) athletic planners.',
      private: 'Esports League Producer, Broadcast Director, or Sports Brand Lead in major networks.',
      selfEmployment: 'Establishing an independent sports events agency, esports tournament platform, or team management.'
    },
    salaryRange: {
      min: 450000,
      max: 2500000,
      formatted: '₹4,50,000 - ₹25,00,000 / year'
    },
    outlook: 'Hyper-Growth. Sustained by multi-million dollar sponsorships and worldwide online streaming charts.',
    automationImpact: 'Low',
    relatedCareers: ['Sports Commentator', 'Live Video Producer', 'Esports Manager'],
    resources: ['SAI manuals', 'OBS Studio docs', 'Learner\'s Den Sports & Gaming Management Hub'],
    matchingCriteria: {
      interests: ['business', 'ai', 'finance'],
      aptitude: { logical: 4, verbal: 5, spatial: 4, quantitative: 3 },
      subjects: ['english', 'cs'],
      workStyle: 'Leadership',
      theoryVsPractice: 'practical',
      educationLevel: 'Degree',
      locationPreference: 'Flexible',
      relocationRequired: true,
      entrepreneurialInclination: true
    }
  },
  {
    id: 'prompt-engineer',
    title: 'Prompt Engineer & Generative AI Orchestrator',
    category: 'New Collar',
    overview: 'Design, optimize, and pipeline natural language directives (prompts) to maximize safety, factual compliance, and functional output from Large Language Models.',
    eligibility: 'Open to all backgrounds. Professional coursework or portfolio showing advanced generative tool workflows.',
    requiredSubjects: ['English Linguistics', 'Computer Logic', 'Data Literacy', 'Cognitive Psychology'],
    pathways: ['Self-paced learning with certified portfolio reviews', 'Specialized non-degree AI bootcamps', 'B.Sc / B.Tech in Computational Linguistics or CS'],
    alternativePathways: ['Linguists or creative writers transition via hands-on LLM prompt diagnostics and workflow builds'],
    entranceExams: ['None (Strictly Portfolio and technical assessments)'],
    skills: ['Prompt Engineering & Tuning', 'Python Scripting', 'API Integration (LangChain/LlamaIndex)', 'Natural Language Semantics', 'Systemic Bias Auditing'],
    certifications: ['Certified Prompt Engineer (AWS/Google Cloud)', 'AI Safety & Security Auditor cert'],
    roadmap: [
      'Master crisp written composition, critical logic, and basic computer scripts in school.',
      'Build a robust open-source portfolio of custom-designed AI bots and agent tools on GitHub.',
      'Learn advanced semantic structures, fine-tuning APIs, and guardrailing frameworks.',
      'Consult for early-stage startups to automate corporate workflows with generative bots.',
      'Lead enterprise automation as Principal Generative AI Orchestrator.'
    ],
    responsibilities: [
      'Engineer robust system instruction prompts to safely run enterprise applications on LLM nodes.',
      'Audit generated answers for security risks, bias, hallucinations, and injection attacks.',
      'Build end-to-end multi-agent pipelines connecting models to enterprise databases.'
    ],
    industries: ['Software & SaaS', 'Corporate Consulting', 'Digital Media Agencies', 'Legal-Tech & Edu-Tech'],
    opportunities: {
      government: 'AI Consultant at NIC, Digital India platforms, or state technology taskforces.',
      private: 'Prompt Engineer, Generative Workflows Developer, or AI Integration Specialist.',
      selfEmployment: 'Freelance prompt developer on gig networks, AI workflow consultant.'
    },
    salaryRange: {
      min: 600000,
      max: 3000000,
      formatted: '₹6,00,000 - ₹30,00,000 / year'
    },
    outlook: 'Exponential. Core career path arising out of the global generative artificial intelligence wave.',
    automationImpact: 'Medium',
    relatedCareers: ['AI Product Manager', 'Data Labeling Auditor', 'Computational Linguist'],
    resources: ['LearnPrompting portals', 'Anthropic prompt guidelines', 'Learner\'s Den Advanced AI Lab'],
    matchingCriteria: {
      interests: ['ai', 'coding', 'teaching'],
      aptitude: { logical: 5, verbal: 5, spatial: 2, quantitative: 4 },
      subjects: ['english', 'cs'],
      workStyle: 'Independent',
      theoryVsPractice: 'practical',
      educationLevel: 'No Degree',
      locationPreference: 'Remote',
      relocationRequired: false,
      entrepreneurialInclination: true
    }
  }
];


