import { Quiz, Grade } from '../types';
import { ExamRepository } from '../repositories/ExamRepository';

export const examService = {
  async getQuizzes(batchId?: string): Promise<Quiz[]> {
    return ExamRepository.getQuizzes(batchId);
  },

  async createQuiz(quizData: Partial<Quiz>): Promise<Quiz> {
    return ExamRepository.createQuiz(quizData);
  },

  async deleteQuiz(id: string): Promise<void> {
    return ExamRepository.deleteQuiz(id);
  },

  async getGrades(studentId?: string, quizId?: string): Promise<Grade[]> {
    return ExamRepository.getGrades(studentId, quizId);
  },

  async submitGrade(gradeData: Partial<Grade>): Promise<Grade> {
    return ExamRepository.submitGrade(gradeData);
  }
};

