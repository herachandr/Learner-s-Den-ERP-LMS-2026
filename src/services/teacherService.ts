import { Teacher } from '../types';
import { TeacherRepository } from '../repositories/TeacherRepository';

export const teacherService = {
  async getTeachers(): Promise<Teacher[]> {
    return TeacherRepository.getTeachers();
  },

  async createTeacher(teacherData: Partial<Teacher>): Promise<Teacher> {
    return TeacherRepository.createTeacher(teacherData);
  },

  async updateTeacher(id: string, teacherData: Partial<Teacher>): Promise<Teacher> {
    return TeacherRepository.updateTeacher(id, teacherData);
  },

  async deleteTeacher(id: string): Promise<void> {
    return TeacherRepository.deleteTeacher(id);
  },

  async getLeaves(teacherId?: string): Promise<any[]> {
    return TeacherRepository.getLeaves(teacherId);
  },

  async applyLeave(leaveData: { teacherId: string; type: string; startDate: string; endDate: string; reason: string }): Promise<any> {
    return TeacherRepository.applyLeave(leaveData);
  },

  async updateLeaveStatus(leaveId: string, status: 'Approved' | 'Rejected', comment?: string): Promise<any> {
    return TeacherRepository.updateLeaveStatus(leaveId, status, comment);
  }
};
