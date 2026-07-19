import { Attendance, TeacherAttendance } from '../types';
import { db, collection, doc, getDocs, setDoc, query, where } from './base';

export const AttendanceRepository = {
  async getStudentAttendance(batchId?: string, date?: string): Promise<Attendance[]> {
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
      console.error('Firestore getStudentAttendance failed:', err);
      throw err;
    }
  },

  async saveStudentAttendance(attendanceData: Partial<Attendance>): Promise<Attendance> {
    const id = attendanceData.id || `att-${Date.now()}`;
    const fullAttendance = { ...attendanceData, id } as Attendance;

    try {
      await setDoc(doc(db, 'attendance', id), fullAttendance);
      return fullAttendance;
    } catch (err) {
      console.error('Firestore saveStudentAttendance failed:', err);
      throw err;
    }
  },

  async getTeacherAttendance(teacherId?: string): Promise<TeacherAttendance[]> {
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
      console.error('Firestore getTeacherAttendance failed:', err);
      throw err;
    }
  },

  async punchInOrOut(punchData: { teacherId: string; date: string; time: string; mode: 'QR' | 'PunchIn' | 'Location'; type: 'in' | 'out'; location?: { lat: number; lng: number } }): Promise<TeacherAttendance> {
    // Punching has biometric/geofence logic on Express server
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

    try {
      await setDoc(doc(db, 'teacherAttendance', data.id), data);
    } catch (err) {
      console.warn('Firestore sync for punchInOrOut failed:', err);
    }

    return data;
  },

  async verifyTeacherAttendance(id: string, hoursWorked: number): Promise<TeacherAttendance> {
    try {
      await setDoc(doc(db, 'teacherAttendance', id), { verified: true, hoursWorked }, { merge: true });
      return { id, verified: true, hoursWorked } as unknown as TeacherAttendance;
    } catch (err) {
      console.error('Firestore verifyTeacherAttendance failed:', err);
      throw err;
    }
  }
};

