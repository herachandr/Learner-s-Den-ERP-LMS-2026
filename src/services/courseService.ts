import { Course, Batch } from '../types';

export const courseService = {
  async getCourses(): Promise<Course[]> {
    const res = await fetch('/api/courses');
    if (!res.ok) throw new Error('Failed to fetch courses');
    return res.json();
  },

  async createCourse(course: Partial<Course>): Promise<Course> {
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(course),
    });
    if (!res.ok) throw new Error('Failed to create course');
    return res.json();
  },

  async getBatches(): Promise<Batch[]> {
    const res = await fetch('/api/batches');
    if (!res.ok) throw new Error('Failed to fetch batches');
    return res.json();
  },

  async createBatch(batch: Partial<Batch>): Promise<Batch> {
    const res = await fetch('/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch),
    });
    if (!res.ok) throw new Error('Failed to create batch');
    return res.json();
  },

  async updateBatch(id: string, batch: Partial<Batch>): Promise<Batch> {
    const res = await fetch(`/api/batches/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch),
    });
    if (!res.ok) throw new Error('Failed to update batch');
    return res.json();
  },

  async deleteBatch(id: string): Promise<void> {
    const res = await fetch(`/api/batches/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete batch');
  }
};
