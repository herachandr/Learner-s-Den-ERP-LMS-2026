import { Quiz, Grade } from '../types';

export const examService = {
  async getQuizzes(batchId?: string): Promise<Quiz[]> {
    const url = batchId ? `/api/quizzes?batchId=${batchId}` : '/api/quizzes';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch quizzes');
    return res.json();
  },

  async createQuiz(quizData: Partial<Quiz>): Promise<Quiz> {
    const res = await fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quizData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create quiz');
    }
    return res.json();
  },

  async getGrades(studentId?: string, quizId?: string): Promise<Grade[]> {
    let url = '/api/grades';
    const params: string[] = [];
    if (studentId) params.push(`studentId=${studentId}`);
    if (quizId) params.push(`quizId=${quizId}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch grades');
    return res.json();
  },

  async submitGrade(gradeData: Partial<Grade>): Promise<Grade> {
    const res = await fetch('/api/grades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gradeData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save exam score');
    }
    return res.json();
  }
};
