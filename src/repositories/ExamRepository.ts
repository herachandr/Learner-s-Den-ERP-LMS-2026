import { Quiz, Grade } from '../types';
import { db, collection, doc, getDocs, setDoc, deleteDoc, query, where } from './base';

export const ExamRepository = {
  async getQuizzes(batchId?: string): Promise<Quiz[]> {
    try {
      let q = query(collection(db, 'quizzes'));
      if (batchId) {
        q = query(collection(db, 'quizzes'), where('batchId', '==', batchId));
      }
      const querySnapshot = await getDocs(q);
      const quizzes: Quiz[] = [];
      querySnapshot.forEach((doc) => {
        quizzes.push({ id: doc.id, ...doc.data() } as Quiz);
      });
      return quizzes;
    } catch (err) {
      console.error('Firestore getQuizzes failed:', err);
      throw err;
    }
  },

  async createQuiz(quizData: Partial<Quiz>): Promise<Quiz> {
    const id = quizData.id || `quiz-${Date.now()}`;
    const fullQuiz = { ...quizData, id } as Quiz;
    try {
      await setDoc(doc(db, 'quizzes', id), fullQuiz);
      return fullQuiz;
    } catch (err) {
      console.error('Firestore createQuiz failed:', err);
      throw err;
    }
  },

  async deleteQuiz(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'quizzes', id));
    } catch (err) {
      console.error('Firestore deleteQuiz failed:', err);
      throw err;
    }
  },

  async getGrades(studentId?: string, quizId?: string): Promise<Grade[]> {
    try {
      let q = query(collection(db, 'grades'));
      const conditions = [];
      if (studentId) conditions.push(where('studentId', '==', studentId));
      if (quizId) conditions.push(where('quizId', '==', quizId));
      if (conditions.length > 0) {
        q = query(collection(db, 'grades'), ...conditions);
      }
      const querySnapshot = await getDocs(q);
      const grades: Grade[] = [];
      querySnapshot.forEach((doc) => {
        grades.push({ id: doc.id, ...doc.data() } as Grade);
      });
      return grades;
    } catch (err) {
      console.error('Firestore getGrades failed:', err);
      throw err;
    }
  },

  async submitGrade(gradeData: Partial<Grade>): Promise<Grade> {
    const id = gradeData.id || `grade-${Date.now()}`;
    const fullGrade = { ...gradeData, id } as Grade;
    try {
      await setDoc(doc(db, 'grades', id), fullGrade);
      return fullGrade;
    } catch (err) {
      console.error('Firestore submitGrade failed:', err);
      throw err;
    }
  }
};
