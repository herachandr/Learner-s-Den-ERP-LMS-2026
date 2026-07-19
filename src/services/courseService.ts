import { Course, Batch } from '../types';
import { CourseRepository } from '../repositories/CourseRepository';

export const courseService = {
  async getCourses(): Promise<Course[]> {
    return CourseRepository.getCourses();
  },

  async createCourse(course: Partial<Course>): Promise<Course> {
    return CourseRepository.createCourse(course);
  },

  async updateCourse(id: string, course: Partial<Course>): Promise<Course> {
    return CourseRepository.updateCourse(id, course);
  },

  async deleteCourse(id: string): Promise<void> {
    return CourseRepository.deleteCourse(id);
  },

  async getBatches(): Promise<Batch[]> {
    return CourseRepository.getBatches();
  },

  async createBatch(batch: Partial<Batch>): Promise<Batch> {
    return CourseRepository.createBatch(batch);
  },

  async updateBatch(id: string, batch: Partial<Batch>): Promise<Batch> {
    return CourseRepository.updateBatch(id, batch);
  },

  async deleteBatch(id: string): Promise<void> {
    return CourseRepository.deleteBatch(id);
  }
};

