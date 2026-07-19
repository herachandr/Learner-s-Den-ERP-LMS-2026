import { Student } from '../types';
import { db, collection, doc, getDocs, setDoc, deleteDoc, query, where } from './base';

export const StudentRepository = {
  async getStudents(): Promise<Student[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'students'));
      const students: Student[] = [];
      querySnapshot.forEach((doc) => {
        students.push({ id: doc.id, ...doc.data() } as Student);
      });
      return students;
    } catch (err) {
      console.error('Firestore getStudents failed:', err);
      throw err;
    }
  },

  async createStudent(studentData: Partial<Student>): Promise<Student> {
    const id = studentData.id || `student-${Date.now()}`;
    const fullStudent = { ...studentData, id } as Student;

    try {
      await setDoc(doc(db, 'students', id), fullStudent);
      return fullStudent;
    } catch (err) {
      console.error('Firestore createStudent failed:', err);
      throw err;
    }
  },

  async updateStudent(id: string, studentData: Partial<Student>): Promise<Student> {
    try {
      await setDoc(doc(db, 'students', id), studentData, { merge: true });
      return { ...studentData, id } as Student;
    } catch (err) {
      console.error('Firestore updateStudent failed:', err);
      throw err;
    }
  },

  async deleteStudent(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'students', id));
    } catch (err) {
      console.error('Firestore deleteStudent failed:', err);
      throw err;
    }
  },

  async bulkImport(students: any[]): Promise<{ count: number }> {
    try {
      let count = 0;
      for (const student of students) {
        const id = student.id || `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await setDoc(doc(db, 'students', id), { ...student, id });
        count++;
      }
      return { count };
    } catch (err) {
      console.error('Firestore bulkImport failed:', err);
      throw err;
    }
  },

  async getDailyRemarks(studentId?: string): Promise<any[]> {
    try {
      let q = query(collection(db, 'dailyRemarks'));
      if (studentId) {
        q = query(collection(db, 'dailyRemarks'), where('studentId', '==', studentId));
      }
      const querySnapshot = await getDocs(q);
      const remarks: any[] = [];
      querySnapshot.forEach((doc) => {
        remarks.push({ id: doc.id, ...doc.data() });
      });
      return remarks;
    } catch (err) {
      console.error('Firestore getDailyRemarks failed:', err);
      throw err;
    }
  },

  async addDailyRemark(remark: { studentId: string; remarkText: string; rating?: number; teacherName: string; date: string }): Promise<any> {
    const id = `remark-${Date.now()}`;
    const fullRemark = { ...remark, id };

    try {
      await setDoc(doc(db, 'dailyRemarks', id), fullRemark);
      return fullRemark;
    } catch (err) {
      console.error('Firestore addDailyRemark failed:', err);
      throw err;
    }
  }
};

