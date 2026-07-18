import { Student } from '../types';
import { isFirestoreActive, db, collection, doc, getDocs, setDoc, deleteDoc, query, where } from './base';

export const StudentRepository = {
  async getStudents(): Promise<Student[]> {
    if (await isFirestoreActive()) {
      try {
        const querySnapshot = await getDocs(collection(db, 'students'));
        const students: Student[] = [];
        querySnapshot.forEach((doc) => {
          students.push({ id: doc.id, ...doc.data() } as Student);
        });
        return students;
      } catch (err) {
        console.warn('Firestore getStudents failed, falling back to API:', err);
      }
    }
    // Fallback/Legacy
    const res = await fetch('/api/students');
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  },

  async createStudent(studentData: Partial<Student>): Promise<Student> {
    const id = studentData.id || `student-${Date.now()}`;
    const fullStudent = { ...studentData, id } as Student;

    if (await isFirestoreActive()) {
      try {
        await setDoc(doc(db, 'students', id), fullStudent);
      } catch (err) {
        console.warn('Firestore createStudent failed:', err);
      }
    }

    // Dual-write / Fallback
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullStudent),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create student');
    }
    return res.json();
  },

  async updateStudent(id: string, studentData: Partial<Student>): Promise<Student> {
    if (await isFirestoreActive()) {
      try {
        await setDoc(doc(db, 'students', id), studentData, { merge: true });
      } catch (err) {
        console.warn('Firestore updateStudent failed:', err);
      }
    }

    // Dual-write / Fallback
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update student');
    }
    return res.json();
  },

  async deleteStudent(id: string): Promise<void> {
    if (await isFirestoreActive()) {
      try {
        await deleteDoc(doc(db, 'students', id));
      } catch (err) {
        console.warn('Firestore deleteStudent failed:', err);
      }
    }

    // Dual-write / Fallback
    const res = await fetch(`/api/students/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete student');
    }
  },

  async bulkImport(students: any[]): Promise<{ count: number }> {
    if (await isFirestoreActive()) {
      try {
        for (const student of students) {
          const id = student.id || `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          await setDoc(doc(db, 'students', id), { ...student, id });
        }
      } catch (err) {
        console.warn('Firestore bulkImport failed:', err);
      }
    }

    // Dual-write / Fallback
    const res = await fetch('/api/students/bulk-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Bulk import failed');
    }
    return res.json();
  },

  async getDailyRemarks(studentId?: string): Promise<any[]> {
    if (await isFirestoreActive()) {
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
        console.warn('Firestore getDailyRemarks failed, falling back to API:', err);
      }
    }

    const url = studentId ? `/api/daily-remarks?studentId=${studentId}` : '/api/daily-remarks';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch daily remarks');
    return res.json();
  },

  async addDailyRemark(remark: { studentId: string; remarkText: string; rating?: number; teacherName: string; date: string }): Promise<any> {
    const id = `remark-${Date.now()}`;
    const fullRemark = { ...remark, id };

    if (await isFirestoreActive()) {
      try {
        await setDoc(doc(db, 'dailyRemarks', id), fullRemark);
      } catch (err) {
        console.warn('Firestore addDailyRemark failed:', err);
      }
    }

    // Dual-write / Fallback
    const res = await fetch('/api/daily-remarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullRemark),
    });
    if (!res.ok) throw new Error('Failed to save daily remark');
    return res.json();
  }
};
