import { CareerOpportunity } from '../types';
import { db, collection, doc, getDocs, setDoc, deleteDoc } from './base';
import { CAREER_DATABASE } from '../data/careers';

export const CareerRepository = {
  async getCareers(): Promise<CareerOpportunity[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'careers'));
      const careers: CareerOpportunity[] = [];
      querySnapshot.forEach((doc) => {
        careers.push({ id: doc.id, ...doc.data() } as CareerOpportunity);
      });
      if (careers.length > 0) {
        return careers;
      }
    } catch (err) {
      console.error('Firestore getCareers failed:', err);
    }

    return CAREER_DATABASE;
  },

  async createCareer(careerData: CareerOpportunity): Promise<CareerOpportunity> {
    try {
      await setDoc(doc(db, 'careers', careerData.id), careerData);
      return careerData;
    } catch (err) {
      console.error('Firestore createCareer failed:', err);
      throw err;
    }
  },

  async getSavedPathway(studentId: string): Promise<{ pathway: any; completedMilestones: string[] } | null> {
    try {
      const querySnapshot = await getDocs(collection(db, 'studentPathways'));
      let found: any = null;
      querySnapshot.forEach((doc) => {
        if (doc.id === studentId) {
          found = doc.data();
        }
      });
      if (found) {
        return {
          pathway: found.pathway,
          completedMilestones: found.completedMilestones || []
        };
      }
    } catch (err) {
      console.warn('Firestore getSavedPathway failed, falling back to localStorage:', err);
    }

    // LocalStorage fallback
    const saved = localStorage.getItem(`career_pathway_${studentId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved pathway from localStorage', e);
      }
    }
    return null;
  },

  async savePathway(studentId: string, pathway: any, completedMilestones: string[]): Promise<void> {
    const data = {
      pathway,
      completedMilestones,
      studentId,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'studentPathways', studentId), data);
    } catch (err) {
      console.error('Firestore savePathway failed:', err);
    }

    // Local fallback
    localStorage.setItem(`career_pathway_${studentId}`, JSON.stringify({ pathway, completedMilestones }));
  },

  async clearPathway(studentId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'studentPathways', studentId));
    } catch (err) {
      console.error('Firestore clearPathway failed:', err);
    }

    localStorage.removeItem(`career_pathway_${studentId}`);
  }
};

