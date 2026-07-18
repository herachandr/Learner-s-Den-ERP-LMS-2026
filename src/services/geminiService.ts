export interface PredictAttendancePayload {
  studentId: string;
  currentAttendanceRate: number;
  missedClassesCount: number;
  leaveReasons: string;
}

export interface PredictPerformancePayload {
  studentName: string;
  currentAverageScore: number;
  subjectStrengths: string;
  weakTopics: string;
  examTarget: string;
}

export interface WritingAssistantPayload {
  topic: string;
  recipient: string;
  format: string;
  tone: string;
}

export interface ReportGeneratorPayload {
  studentName: string;
  batchName: string;
  attendanceRate: number;
  scores: string;
  strengths: string;
  weaknesses: string;
  teacherRemarks: string;
}

export const geminiService = {
  async solveDoubt(doubt: string, subject: string): Promise<{ answer: string }> {
    const res = await fetch('/api/gemini/doubt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doubt, subject }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to clear academic doubt');
    return data;
  },

  async generatePlanner(payload: { examTarget: string; weakAreas: string; studyHoursPerDay: number }): Promise<{ plan: string }> {
    const res = await fetch('/api/gemini/planner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate custom planner');
    return data;
  },

  async generateQuiz(payload: { title: string; subject: string; topic: string; batchId: string; count: number }): Promise<any> {
    const res = await fetch('/api/gemini/quiz-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate automated test');
    return data;
  },

  async getAnalytics(): Promise<any> {
    const res = await fetch('/api/gemini/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate institution analytics');
    return data;
  },

  async predictAttendance(payload: PredictAttendancePayload): Promise<any> {
    const res = await fetch('/api/gemini/predict-attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to forecast attendance risk');
    return data;
  },

  async predictPerformance(payload: PredictPerformancePayload): Promise<any> {
    const res = await fetch('/api/gemini/predict-performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to predict performance outcomes');
    return data;
  },

  async draftWritingAssistant(payload: WritingAssistantPayload): Promise<{ text: string }> {
    const res = await fetch('/api/gemini/writing-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to draft communications copy');
    return data;
  },

  async checkModeration(text: string): Promise<any> {
    const res = await fetch('/api/gemini/moderation-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to evaluate safety moderation');
    return data;
  },

  async generateReport(payload: ReportGeneratorPayload): Promise<{ report: string }> {
    const res = await fetch('/api/gemini/report-generator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate report card');
    return data;
  },

  async chatParent(messageOrPayload: any, history?: any[], context?: any): Promise<{ answer: string }> {
    const payload = typeof messageOrPayload === 'object' && messageOrPayload !== null
      ? messageOrPayload
      : { message: messageOrPayload, history, context };

    const res = await fetch('/api/gemini/parent-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate counselor answer');
    return data;
  },

  async suggestCareer(profile: any): Promise<{ pathways: any[]; analysis: string }> {
    const res = await fetch('/api/gemini/career', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to map career pathways');
    return data;
  }
};
