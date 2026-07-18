import { Attendance, TeacherAttendance } from '../types';
import { AttendanceRepository } from '../repositories/AttendanceRepository';

export const attendanceService = {
  async getStudentAttendance(batchId?: string, date?: string): Promise<Attendance[]> {
    return AttendanceRepository.getStudentAttendance(batchId, date);
  },

  async saveStudentAttendance(attendanceData: Partial<Attendance>): Promise<Attendance> {
    return AttendanceRepository.saveStudentAttendance(attendanceData);
  },

  async getTeacherAttendance(teacherId?: string): Promise<TeacherAttendance[]> {
    return AttendanceRepository.getTeacherAttendance(teacherId);
  },

  async punchInOrOut(punchData: { teacherId: string; date: string; time: string; mode: 'QR' | 'PunchIn' | 'Location'; type: 'in' | 'out'; location?: { lat: number; lng: number } }): Promise<TeacherAttendance> {
    return AttendanceRepository.punchInOrOut(punchData);
  },

  async verifyTeacherAttendance(id: string, hoursWorked: number): Promise<TeacherAttendance> {
    return AttendanceRepository.verifyTeacherAttendance(id, hoursWorked);
  }
};
