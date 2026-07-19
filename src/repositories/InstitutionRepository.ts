import { AcademicEvent } from '../types';
import { HighlightItem, GalleryItem, TestimonialItem, DailyRemark, AnonymousFeedback } from '../services/institutionService';
import { db, collection, doc, getDocs, setDoc, deleteDoc, query, where } from './base';

export const InstitutionRepository = {
  // Highlights
  async getHighlights(): Promise<HighlightItem[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'highlights'));
      const list: HighlightItem[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as HighlightItem);
      });
      return list;
    } catch (err) {
      console.error('Firestore getHighlights failed:', err);
      throw err;
    }
  },

  async createHighlight(highlight: Partial<HighlightItem>): Promise<HighlightItem> {
    const id = highlight.id || `hl-${Date.now()}`;
    const fullHighlight = { ...highlight, id } as HighlightItem;
    try {
      await setDoc(doc(db, 'highlights', id), fullHighlight);
      return fullHighlight;
    } catch (err) {
      console.error('Firestore createHighlight failed:', err);
      throw err;
    }
  },

  async deleteHighlight(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'highlights', id));
    } catch (err) {
      console.error('Firestore deleteHighlight failed:', err);
      throw err;
    }
  },

  // Gallery
  async getGallery(): Promise<GalleryItem[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'gallery'));
      const list: GalleryItem[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as GalleryItem);
      });
      return list;
    } catch (err) {
      console.error('Firestore getGallery failed:', err);
      throw err;
    }
  },

  async createGalleryItem(item: Partial<GalleryItem>): Promise<GalleryItem> {
    const id = item.id || `gal-${Date.now()}`;
    const fullItem = { ...item, id } as GalleryItem;
    try {
      await setDoc(doc(db, 'gallery', id), fullItem);
      return fullItem;
    } catch (err) {
      console.error('Firestore createGalleryItem failed:', err);
      throw err;
    }
  },

  async deleteGalleryItem(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'gallery', id));
    } catch (err) {
      console.error('Firestore deleteGalleryItem failed:', err);
      throw err;
    }
  },

  // Testimonials
  async getTestimonials(): Promise<TestimonialItem[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'testimonials'));
      const list: TestimonialItem[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as TestimonialItem);
      });
      return list;
    } catch (err) {
      console.error('Firestore getTestimonials failed:', err);
      throw err;
    }
  },

  async createTestimonial(testimonial: Partial<TestimonialItem>): Promise<TestimonialItem> {
    const id = testimonial.id || `test-${Date.now()}`;
    const fullTestimonial = { ...testimonial, id } as TestimonialItem;
    try {
      await setDoc(doc(db, 'testimonials', id), fullTestimonial);
      return fullTestimonial;
    } catch (err) {
      console.error('Firestore createTestimonial failed:', err);
      throw err;
    }
  },

  async updateTestimonial(id: string, testimonial: Partial<TestimonialItem>): Promise<TestimonialItem> {
    const updated = { ...testimonial, id } as TestimonialItem;
    try {
      await setDoc(doc(db, 'testimonials', id), testimonial, { merge: true });
      return updated;
    } catch (err) {
      console.error('Firestore updateTestimonial failed:', err);
      throw err;
    }
  },

  async deleteTestimonial(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'testimonials', id));
    } catch (err) {
      console.error('Firestore deleteTestimonial failed:', err);
      throw err;
    }
  },

  // Daily Remarks
  async getRemarks(all = false): Promise<DailyRemark[]> {
    try {
      let q = query(collection(db, 'remarks'));
      if (!all) {
        q = query(collection(db, 'remarks'), where('deleted', '!=', true));
      }
      const querySnapshot = await getDocs(q);
      const list: DailyRemark[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as DailyRemark);
      });
      return list;
    } catch (err) {
      console.error('Firestore getRemarks failed:', err);
      throw err;
    }
  },

  async createRemark(remark: Partial<DailyRemark>): Promise<DailyRemark> {
    const id = remark.id || `rem-${Date.now()}`;
    const fullRemark = { ...remark, id, deleted: false, createdAt: new Date().toISOString() } as DailyRemark;
    try {
      await setDoc(doc(db, 'remarks', id), fullRemark);
      return fullRemark;
    } catch (err) {
      console.error('Firestore createRemark failed:', err);
      throw err;
    }
  },

  async updateRemark(id: string, text: string): Promise<DailyRemark> {
    try {
      const docRef = doc(db, 'remarks', id);
      const updateData = {
        text,
        updatedAt: new Date().toISOString()
      };
      await setDoc(docRef, updateData, { merge: true });
      return { id, text, ...updateData } as DailyRemark;
    } catch (err) {
      console.error('Firestore updateRemark failed:', err);
      throw err;
    }
  },

  async deleteRemark(id: string, permanent = false): Promise<void> {
    try {
      if (permanent) {
        await deleteDoc(doc(db, 'remarks', id));
      } else {
        await setDoc(doc(db, 'remarks', id), { deleted: true }, { merge: true });
      }
    } catch (err) {
      console.error('Firestore deleteRemark failed:', err);
      throw err;
    }
  },

  async restoreRemark(id: string): Promise<DailyRemark> {
    try {
      await setDoc(doc(db, 'remarks', id), { deleted: false }, { merge: true });
      return { id, deleted: false } as DailyRemark;
    } catch (err) {
      console.error('Firestore restoreRemark failed:', err);
      throw err;
    }
  },

  // Academic Events
  async getAcademicEvents(): Promise<AcademicEvent[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'academicEvents'));
      const list: AcademicEvent[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as AcademicEvent);
      });
      return list;
    } catch (err) {
      console.error('Firestore getAcademicEvents failed:', err);
      throw err;
    }
  },

  async createAcademicEvent(event: Partial<AcademicEvent>): Promise<AcademicEvent> {
    const id = event.id || `ev-${Date.now()}`;
    const fullEvent = { ...event, id } as AcademicEvent;
    try {
      await setDoc(doc(db, 'academicEvents', id), fullEvent);
      return fullEvent;
    } catch (err) {
      console.error('Firestore createAcademicEvent failed:', err);
      throw err;
    }
  },

  async updateAcademicEvent(id: string, event: Partial<AcademicEvent>): Promise<AcademicEvent> {
    const updated = { ...event, id } as AcademicEvent;
    try {
      await setDoc(doc(db, 'academicEvents', id), event, { merge: true });
      return updated;
    } catch (err) {
      console.error('Firestore updateAcademicEvent failed:', err);
      throw err;
    }
  },

  async deleteAcademicEvent(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'academicEvents', id));
    } catch (err) {
      console.error('Firestore deleteAcademicEvent failed:', err);
      throw err;
    }
  },

  // Anonymous Feedback
  async getAnonymousFeedback(): Promise<AnonymousFeedback[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'anonymousFeedback'));
      const list: AnonymousFeedback[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as AnonymousFeedback);
      });
      return list;
    } catch (err) {
      console.error('Firestore getAnonymousFeedback failed:', err);
      throw err;
    }
  },

  async createAnonymousFeedback(feedback: Partial<AnonymousFeedback>): Promise<AnonymousFeedback> {
    const id = feedback.id || `fb-${Date.now()}`;
    const fullFeedback = { ...feedback, id, createdAt: new Date().toISOString() } as AnonymousFeedback;
    try {
      await setDoc(doc(db, 'anonymousFeedback', id), fullFeedback);
      return fullFeedback;
    } catch (err) {
      console.error('Firestore createAnonymousFeedback failed:', err);
      throw err;
    }
  },

  async updateAnonymousFeedback(id: string, feedback: Partial<AnonymousFeedback>): Promise<AnonymousFeedback> {
    const updated = { ...feedback, id } as AnonymousFeedback;
    try {
      await setDoc(doc(db, 'anonymousFeedback', id), feedback, { merge: true });
      return updated;
    } catch (err) {
      console.error('Firestore updateAnonymousFeedback failed:', err);
      throw err;
    }
  },

  async deleteAnonymousFeedback(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'anonymousFeedback', id));
    } catch (err) {
      console.error('Firestore deleteAnonymousFeedback failed:', err);
      throw err;
    }
  }
};
