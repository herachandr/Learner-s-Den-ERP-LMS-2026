import { AcademicEvent } from '../types';
import { InstitutionRepository } from '../repositories/InstitutionRepository';

export interface HighlightItem {
  id: string;
  title: string;
  description?: string;
  category: 'announcement' | 'achievement' | 'event' | 'alert';
  date: string;
  author: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  category: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: 'student' | 'parent' | 'alumni';
  content: string;
  avatarUrl?: string;
  stars: number;
  approved: boolean;
  date: string;
}

export interface RemarkHistoryItem {
  text: string;
  modifiedAt: string;
}

export interface DailyRemark {
  id: string;
  text: string;
  createdAt: string;
  author?: string;
  deleted?: boolean;
  history?: RemarkHistoryItem[];
  updatedAt?: string;
  category?: string;
}

export interface AnonymousFeedback {
  id: string;
  title: string;
  text: string;
  category: string;
  createdAt: string;
  replies?: any[];
  status?: string;
}

export const institutionService = {
  // Highlights
  async getHighlights(): Promise<HighlightItem[]> {
    return InstitutionRepository.getHighlights();
  },
  async createHighlight(highlight: Partial<HighlightItem>): Promise<HighlightItem> {
    return InstitutionRepository.createHighlight(highlight);
  },
  async deleteHighlight(id: string): Promise<void> {
    return InstitutionRepository.deleteHighlight(id);
  },

  // Gallery
  async getGallery(): Promise<GalleryItem[]> {
    return InstitutionRepository.getGallery();
  },
  async createGalleryItem(item: Partial<GalleryItem>): Promise<GalleryItem> {
    return InstitutionRepository.createGalleryItem(item);
  },
  async deleteGalleryItem(id: string): Promise<void> {
    return InstitutionRepository.deleteGalleryItem(id);
  },

  // Testimonials
  async getTestimonials(): Promise<TestimonialItem[]> {
    return InstitutionRepository.getTestimonials();
  },
  async createTestimonial(testimonial: Partial<TestimonialItem>): Promise<TestimonialItem> {
    return InstitutionRepository.createTestimonial(testimonial);
  },
  async updateTestimonial(id: string, testimonial: Partial<TestimonialItem>): Promise<TestimonialItem> {
    return InstitutionRepository.updateTestimonial(id, testimonial);
  },
  async deleteTestimonial(id: string): Promise<void> {
    return InstitutionRepository.deleteTestimonial(id);
  },

  // Daily Remarks
  async getRemarks(all = false): Promise<DailyRemark[]> {
    return InstitutionRepository.getRemarks(all);
  },
  async createRemark(remark: Partial<DailyRemark>): Promise<DailyRemark> {
    return InstitutionRepository.createRemark(remark);
  },
  async updateRemark(id: string, text: string): Promise<DailyRemark> {
    return InstitutionRepository.updateRemark(id, text);
  },
  async deleteRemark(id: string, permanent = false): Promise<void> {
    return InstitutionRepository.deleteRemark(id, permanent);
  },
  async restoreRemark(id: string): Promise<DailyRemark> {
    return InstitutionRepository.restoreRemark(id);
  },

  // Academic Events
  async getAcademicEvents(): Promise<AcademicEvent[]> {
    return InstitutionRepository.getAcademicEvents();
  },
  async createAcademicEvent(event: Partial<AcademicEvent>): Promise<AcademicEvent> {
    return InstitutionRepository.createAcademicEvent(event);
  },
  async updateAcademicEvent(id: string, event: Partial<AcademicEvent>): Promise<AcademicEvent> {
    return InstitutionRepository.updateAcademicEvent(id, event);
  },
  async deleteAcademicEvent(id: string): Promise<void> {
    return InstitutionRepository.deleteAcademicEvent(id);
  },

  // Anonymous Feedback
  async getAnonymousFeedback(): Promise<AnonymousFeedback[]> {
    return InstitutionRepository.getAnonymousFeedback();
  },
  async createAnonymousFeedback(feedback: Partial<AnonymousFeedback>): Promise<AnonymousFeedback> {
    return InstitutionRepository.createAnonymousFeedback(feedback);
  },
  async updateAnonymousFeedback(id: string, feedback: Partial<AnonymousFeedback>): Promise<AnonymousFeedback> {
    return InstitutionRepository.updateAnonymousFeedback(id, feedback);
  },
  async deleteAnonymousFeedback(id: string): Promise<void> {
    return InstitutionRepository.deleteAnonymousFeedback(id);
  }
};

