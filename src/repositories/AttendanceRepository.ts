import { Attendance, TeacherAttendance } from '../types';
import { isFirestoreActive, db, collection, doc, getDocs, setDoc, query, where } from './base';

export const AttendanceRepository = {
  async getStudentAttendance(batchId?: string, date?: string): Promise<Attendance[]> {
    if (await isFirestoreActive()) {
      try {
        let q = query(collection(db, 'attendance'));
        const conditions = [];
        if (batchId) conditions.push(where('batchId', '==', batchId));
        if (date) conditions.push(where('date', '==', date));
        if (conditions.length > 0) {
          q = query(collection(db, 'attendance'), ...conditions);
        }
        const querySnapshot = await getDocs(q);
        const attendance: Attendance[] = [];
        querySnapshot.forEach((doc) => {
          attendance.push({ id: doc.id, ...doc.data() } as Attendance);
        });
        return attendance;
      } catch (err) {
        console.warn('Firestore getStudentAttendance failed, falling back to API:', err);
      }
    }

    let url = '/api/attendance';
    const params: string[] = [];
    if (batchId) params.push(`batchId=${batchId}`);
    if (date) params.push(`date=${date}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch student attendance');
    return res.json();
  },

  async saveStudentAttendance(attendanceData: Partial<Attendance>): Promise<Attendance> {
    const id = attendanceData.id || `att-${Date.now()}`;
    const fullAttendance = { ...attendanceData, id } as Attendance;

    if (await isFirestoreActive()) {
      try {
        await setDoc(doc(db, 'attendance', id), fullAttendance);
      } catch (err) {
        console.warn('Firestore saveStudentAttendance failed:', err);
      }
    }

    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullAttendance),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save student attendance');
    }
    return res.json();
  },

  async getTeacherAttendance(teacherId?: string): Promise<TeacherAttendance[]> {
    if (await isFirestoreActive()) {
      try {
        let q = query(collection(db, 'teacherAttendance'));
        if (teacherId) {
          q = query(collection(db, 'teacherAttendance'), where('teacherId', '==', teacherId));
        }
        const querySnapshot = await getDocs(q);
        const logs: TeacherAttendance[] = [];
        querySnapshot.forEach((doc) => {
          logs.push({ id: doc.id, ...doc.data() } as TeacherAttendance);
        });
        return logs;
      } catch (err) {
        console.warn('Firestore getTeacherAttendance failed, falling back to API:', err);
      }
    }

    const url = teacherId ? `/api/teacher-attendance?teacherId=${teacherId}` : '/api/teacher-attendance';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch teacher attendance logs');
    return res.json();
  },

  async punchInOrOut(punchData: { teacherId: string; date: string; time: string; mode: 'QR' | 'PunchIn' | 'Location'; type: 'in' | 'out'; location?: { lat: number; lng: number } }): Promise<TeacherAttendance> {
    const res = await fetch('/api/teacher-attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(punchData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Punch operation failed');
    }
    const data = await res.json();

    if (await isFirestoreActive()) {
      try {
        await setDoc(doc(db, 'teacherAttendance', data.id), data);
      } catch (err) {
        console.warn('Firestore sync for punchInOrOut failed:', err);
      }
    }

    return data;
  },

  async verifyTeacherAttendance(id: string, hoursWorked: number): Promise<TeacherAttendance> {
    if (await isFirestoreActive()) {
      try {
        await setDoc(doc(db, 'teacherAttendance', id), { verified: true, hoursWorked }, { merge: true });
      } catch (err) {
        console.warn('Firestore verifyTeacherAttendance failed:', err);
      }
    }

    const res = await fetch(`/api/teacher-attendance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified: true, hoursWorked }),
    });
    if (!res.ok) throw new Error('Failed to verify teacher attendance record');
    return res.json();
  }
};
