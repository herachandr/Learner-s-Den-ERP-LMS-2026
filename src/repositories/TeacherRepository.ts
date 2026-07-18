import { Teacher } from '../types';
import { isFirestoreActive, db, collection, doc, getDocs, setDoc, deleteDoc, query, where } from './base';

export const TeacherRepository = {
  async getTeachers(): Promise<Teacher[]> {
    if (await isFirestoreActive()) {
      try {
        const querySnapshot = await getDocs(collection(db, 'teachers'));
        const teachers: Teacher[] = [];
        querySnapshot.forEach((doc) => {
          teachers.push({ id: doc.id, ...doc.data() } as Teacher);
        });
        return teachers;
      } catch (err) {
        console.warn('Firestore getTeachers failed, falling back to API:', err);
      }
    }
    const res = await fetch('/api/teachers');
    if (!res.ok) throw new Error('Failed to fetch teachers');
    return res.json();
  },

  async createTeacher(teacherData: Partial<Teacher>): Promise<Teacher> {
    const id = teacherData.id || `teacher-${Date.now()}`;
    const fullTeacher = { ...teacherData, id } as Teacher;

    if (await isFirestoreActive()) {
      try {
        await setDoc(doc(db, 'teachers', id), fullTeacher);
      } catch (err) {
        console.warn('Firestore createTeacher failed:', err);
      }
    }

    const res = await fetch('/api/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullTeacher),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create teacher');
    }
    return res.json();
  },

  async updateTeacher(id: string, teacherData: Partial<Teacher>): Promise<Teacher> {
    if (await isFirestoreActive()) {
      try {
        await setDoc(doc(db, 'teachers', id), teacherData, { merge: true });
      } catch (err) {
        console.warn('Firestore updateTeacher failed:', err);
      }
    }

    const res = await fetch(`/api/teachers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacherData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update teacher');
    }
    return res.json();
  },

  async deleteTeacher(id: string): Promise<void> {
    if (await isFirestoreActive()) {
      try {
        await deleteDoc(doc(db, 'teachers', id));
      } catch (err) {
        console.warn('Firestore deleteTeacher failed:', err);
      }
    }

    const res = await fetch(`/api/teachers/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete teacher');
    }
  },

  async getLeaves(teacherId?: string): Promise<any[]> {
    if (await isFirestoreActive()) {
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
        console.warn('Firestore getLeaves failed, falling back to API:', err);
      }
    }

    const url = teacherId ? `/api/leaves?teacherId=${teacherId}` : '/api/leaves';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch leaves');
    return res.json();
  },

  async applyLeave(leaveData: { teacherId: string; type: string; startDate: string; endDate: string; reason: string }): Promise<any> {
    const id = `leave-${Date.now()}`;
    const fullLeave = { ...leaveData, id, status: 'Pending' };

    if (await isFirestoreActive()) {
      try {
        await setDoc(doc(db, 'leaves', id), fullLeave);
      } catch (err) {
        console.warn('Firestore applyLeave failed:', err);
      }
    }

    const res = await fetch('/api/leaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullLeave),
    });
    if (!res.ok) throw new Error('Failed to submit leave request');
    return res.json();
  },

  async updateLeaveStatus(leaveId: string, status: 'Approved' | 'Rejected', comment?: string): Promise<any> {
    if (await isFirestoreActive()) {
      try {
        await setDoc(doc(db, 'leaves', leaveId), { status, comment }, { merge: true });
      } catch (err) {
        console.warn('Firestore updateLeaveStatus failed:', err);
      }
    }

    const res = await fetch(`/api/leaves/${leaveId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, comment }),
    });
    if (!res.ok) throw new Error('Failed to update leave status');
    return res.json();
  }
};
