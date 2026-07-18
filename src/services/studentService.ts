import { Student } from '../types';
import { StudentRepository } from '../repositories/StudentRepository';

export const studentService = {
  async getStudents(): Promise<Student[]> {
    return StudentRepository.getStudents();
  },

  async createStudent(studentData: Partial<Student>): Promise<Student> {
    return StudentRepository.createStudent(studentData);
  },

  async updateStudent(id: string, studentData: Partial<Student>): Promise<Student> {
    return StudentRepository.updateStudent(id, studentData);
  },

  async deleteStudent(id: string): Promise<void> {
    return StudentRepository.deleteStudent(id);
  },

  async bulkImport(students: any[]): Promise<{ count: number }> {
    return StudentRepository.bulkImport(students);
  },

  async getDailyRemarks(studentId?: string): Promise<any[]> {
    return StudentRepository.getDailyRemarks(studentId);
  },

  async addDailyRemark(remark: { studentId: string; remarkText: string; rating?: number; teacherName: string; date: string }): Promise<any> {
    return StudentRepository.addDailyRemark(remark);
  }
};
