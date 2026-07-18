import { CareerOpportunity } from '../types';
import { isFirestoreActive, db, collection, doc, getDocs, setDoc, deleteDoc } from './base';
import { CAREER_DATABASE } from '../data/careers';

export const CareerRepository = {
  async getCareers(): Promise<CareerOpportunity[]> {
    if (await isFirestoreActive()) {
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
        console.warn('Firestore getCareers failed, falling back to local database:', err);
      }
    }

    // Fallback to API
    try {
      const res = await fetch('/api/careers');
      if (res.ok) {
        return res.json();
      }
    } catch (err) {
      console.warn('API /api/careers failed, falling back to CAREER_DATABASE static:', err);
    }

    return CAREER_DATABASE;
  },

  async createCareer(careerData: CareerOpportunity): Promise<CareerOpportunity> {
    if (await isFirestoreActive()) {
      try {
        await setDoc(doc(db, 'careers', careerData.id), careerData);
      } catch (err) {
        console.warn('Firestore createCareer failed:', err);
      }
    }

    const res = await fetch('/api/careers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(careerData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add career opportunity');
    }
    return res.json();
  },

  async getSavedPathway(studentId: string): Promise<{ pathway: any; completedMilestones: string[] } | null> {
    if (await isFirestoreActive()) {
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

    if (await isFirestoreActive()) {
      try {
        await setDoc(doc(db, 'studentPathways', studentId), data);
      } catch (err) {
        console.warn('Firestore savePathway failed:', err);
      }
    }

    // Local fallback
    localStorage.setItem(`career_pathway_${studentId}`, JSON.stringify({ pathway, completedMilestones }));

    try {
      await fetch(`/api/students/${studentId}/pathway`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (e) {
      console.warn('API savePathway failed:', e);
    }
  },

  async clearPathway(studentId: string): Promise<void> {
    if (await isFirestoreActive()) {
      try {
        await deleteDoc(doc(db, 'studentPathways', studentId));
      } catch (err) {
        console.warn('Firestore clearPathway failed:', err);
      }
    }

    localStorage.removeItem(`career_pathway_${studentId}`);

    try {
      await fetch(`/api/students/${studentId}/pathway`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('API clearPathway failed:', e);
    }
  }
};
