import { Course, Batch } from '../types';
import { db, collection, doc, getDocs, setDoc, deleteDoc } from './base';

export const CourseRepository = {
  async getCourses(): Promise<Course[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'courses'));
      const courses: Course[] = [];
      querySnapshot.forEach((doc) => {
        courses.push({ id: doc.id, ...doc.data() } as Course);
      });
      return courses;
    } catch (err) {
      console.error('Firestore getCourses failed:', err);
      throw err;
    }
  },

  async createCourse(course: Partial<Course>): Promise<Course> {
    const id = course.id || `course-${Date.now()}`;
    const fullCourse = { ...course, id } as Course;
    try {
      await setDoc(doc(db, 'courses', id), fullCourse);
      return fullCourse;
    } catch (err) {
      console.error('Firestore createCourse failed:', err);
      throw err;
    }
  },

  async updateCourse(id: string, course: Partial<Course>): Promise<Course> {
    const updatedCourse = { ...course, id } as Course;
    try {
      await setDoc(doc(db, 'courses', id), course, { merge: true });
      return updatedCourse;
    } catch (err) {
      console.error('Firestore updateCourse failed:', err);
      throw err;
    }
  },

  async deleteCourse(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'courses', id));
    } catch (err) {
      console.error('Firestore deleteCourse failed:', err);
      throw err;
    }
  },

  async getBatches(): Promise<Batch[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'batches'));
      const batches: Batch[] = [];
      querySnapshot.forEach((doc) => {
        batches.push({ id: doc.id, ...doc.data() } as Batch);
      });
      return batches;
    } catch (err) {
      console.error('Firestore getBatches failed:', err);
      throw err;
    }
  },

  async createBatch(batch: Partial<Batch>): Promise<Batch> {
    const id = batch.id || `batch-${Date.now()}`;
    const fullBatch = { ...batch, id } as Batch;
    try {
      await setDoc(doc(db, 'batches', id), fullBatch);
      return fullBatch;
    } catch (err) {
      console.error('Firestore createBatch failed:', err);
      throw err;
    }
  },

  async updateBatch(id: string, batch: Partial<Batch>): Promise<Batch> {
    const updatedBatch = { ...batch, id } as Batch;
    try {
      await setDoc(doc(db, 'batches', id), batch, { merge: true });
      return updatedBatch;
    } catch (err) {
      console.error('Firestore updateBatch failed:', err);
      throw err;
    }
  },

  async deleteBatch(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'batches', id));
    } catch (err) {
      console.error('Firestore deleteBatch failed:', err);
      throw err;
    }
  }
};
