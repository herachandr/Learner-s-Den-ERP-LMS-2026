import { Teacher } from '../types';
import { db, collection, doc, getDocs, setDoc, deleteDoc, query, where } from './base';

export const TeacherRepository = {
  async getTeachers(): Promise<Teacher[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'teachers'));
      const teachers: Teacher[] = [];
      querySnapshot.forEach((doc) => {
        teachers.push({ id: doc.id, ...doc.data() } as Teacher);
      });
      return teachers;
    } catch (err) {
      console.error('Firestore getTeachers failed:', err);
      throw err;
    }
  },

  async createTeacher(teacherData: Partial<Teacher>): Promise<Teacher> {
    const id = teacherData.id || `teacher-${Date.now()}`;
    const fullTeacher = { ...teacherData, id } as Teacher;

    try {
      await setDoc(doc(db, 'teachers', id), fullTeacher);
      return fullTeacher;
    } catch (err) {
      console.error('Firestore createTeacher failed:', err);
      throw err;
    }
  },

  async updateTeacher(id: string, teacherData: Partial<Teacher>): Promise<Teacher> {
    try {
      await setDoc(doc(db, 'teachers', id), teacherData, { merge: true });
      return { ...teacherData, id } as Teacher;
    } catch (err) {
      console.error('Firestore updateTeacher failed:', err);
      throw err;
    }
  },

  async deleteTeacher(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'teachers', id));
    } catch (err) {
      console.error('Firestore deleteTeacher failed:', err);
      throw err;
    }
  },

  async getLeaves(teacherId?: string): Promise<any[]> {
    try {
      let q = query(collection(db, 'leaves'));
      if (teacherId) {
        q = query(collection(db, 'leaves'), where('teacherId', '==', teacherId));
      }
      const querySnapshot = await getDocs(q);
      const leaves: any[] = [];
      querySnapshot.forEach((doc) => {
        leaves.push({ id: doc.id, ...doc.data() });
      });
      return leaves;
    } catch (err) {
      console.error('Firestore getLeaves failed:', err);
      throw err;
    }
  },

  async applyLeave(leaveData: { teacherId: string; type: string; startDate: string; endDate: string; reason: string }): Promise<any> {
    const id = `leave-${Date.now()}`;
    const fullLeave = { ...leaveData, id, status: 'Pending' };

    try {
      await setDoc(doc(db, 'leaves', id), fullLeave);
      return fullLeave;
    } catch (err) {
      console.error('Firestore applyLeave failed:', err);
      throw err;
    }
  },

  async updateLeaveStatus(leaveId: string, status: 'Approved' | 'Rejected', comment?: string): Promise<any> {
    try {
      await setDoc(doc(db, 'leaves', leaveId), { status, comment }, { merge: true });
      return { id: leaveId, status, comment };
    } catch (err) {
      console.error('Firestore updateLeaveStatus failed:', err);
      throw err;
    }
  }
};

