import { AcademicEvent } from '../types';

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
    const res = await fetch('/api/highlights');
    if (!res.ok) throw new Error('Failed to fetch highlights');
    return res.json();
  },
  async createHighlight(highlight: Partial<HighlightItem>): Promise<HighlightItem> {
    const res = await fetch('/api/highlights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(highlight),
    });
    if (!res.ok) throw new Error('Failed to create highlight');
    return res.json();
  },
  async deleteHighlight(id: string): Promise<void> {
    const res = await fetch(`/api/highlights/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete highlight');
  },

  // Gallery
  async getGallery(): Promise<GalleryItem[]> {
    const res = await fetch('/api/gallery');
    if (!res.ok) throw new Error('Failed to fetch gallery items');
    return res.json();
  },
  async createGalleryItem(item: Partial<GalleryItem>): Promise<GalleryItem> {
    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to upload image to gallery');
    return res.json();
  },
  async deleteGalleryItem(id: string): Promise<void> {
    const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to remove gallery item');
  },

  // Testimonials
  async getTestimonials(): Promise<TestimonialItem[]> {
    const res = await fetch('/api/testimonials');
    if (!res.ok) throw new Error('Failed to fetch testimonials');
    return res.json();
  },
  async createTestimonial(testimonial: Partial<TestimonialItem>): Promise<TestimonialItem> {
    const res = await fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testimonial),
    });
    if (!res.ok) throw new Error('Failed to post testimonial');
    return res.json();
  },
  async updateTestimonial(id: string, testimonial: Partial<TestimonialItem>): Promise<TestimonialItem> {
    const res = await fetch(`/api/testimonials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testimonial),
    });
    if (!res.ok) throw new Error('Failed to moderate testimonial');
    return res.json();
  },
  async deleteTestimonial(id: string): Promise<void> {
    const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete testimonial');
  },

  // Daily Remarks
  async getRemarks(all = false): Promise<DailyRemark[]> {
    const res = await fetch(`/api/remarks${all ? '?all=true' : ''}`);
    if (!res.ok) throw new Error('Failed to fetch remarks');
    return res.json();
  },
  async createRemark(remark: Partial<DailyRemark>): Promise<DailyRemark> {
    const res = await fetch('/api/remarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(remark),
    });
    if (!res.ok) throw new Error('Failed to record remark');
    return res.json();
  },
  async updateRemark(id: string, text: string): Promise<DailyRemark> {
    const res = await fetch(`/api/remarks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error('Failed to update remark');
    return res.json();
  },
  async deleteRemark(id: string, permanent = false): Promise<void> {
    const res = await fetch(`/api/remarks/${id}${permanent ? '?permanent=true' : ''}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete remark');
  },
  async restoreRemark(id: string): Promise<DailyRemark> {
    const res = await fetch(`/api/remarks/${id}/restore`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to restore remark');
    return res.json();
  },

  // Academic Events
  async getAcademicEvents(): Promise<AcademicEvent[]> {
    const res = await fetch('/api/academic-events');
    if (!res.ok) throw new Error('Failed to fetch academic events');
    return res.json();
  },
  async createAcademicEvent(event: Partial<AcademicEvent>): Promise<AcademicEvent> {
    const res = await fetch('/api/academic-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    if (!res.ok) throw new Error('Failed to create academic event');
    return res.json();
  },
  async updateAcademicEvent(id: string, event: Partial<AcademicEvent>): Promise<AcademicEvent> {
    const res = await fetch(`/api/academic-events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    if (!res.ok) throw new Error('Failed to update academic event');
    return res.json();
  },
  async deleteAcademicEvent(id: string): Promise<void> {
    const res = await fetch(`/api/academic-events/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete academic event');
  },

  // Anonymous Feedback
  async getAnonymousFeedback(): Promise<AnonymousFeedback[]> {
    const res = await fetch('/api/anonymous-feedback');
    if (!res.ok) throw new Error('Failed to fetch anonymous feedback list');
    return res.json();
  },
  async createAnonymousFeedback(feedback: Partial<AnonymousFeedback>): Promise<AnonymousFeedback> {
    const res = await fetch('/api/anonymous-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedback),
    });
    if (!res.ok) throw new Error('Failed to submit feedback');
    return res.json();
  },
  async updateAnonymousFeedback(id: string, feedback: Partial<AnonymousFeedback>): Promise<AnonymousFeedback> {
    const res = await fetch(`/api/anonymous-feedback/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedback),
    });
    if (!res.ok) throw new Error('Failed to update feedback details');
    return res.json();
  },
  async deleteAnonymousFeedback(id: string): Promise<void> {
    const res = await fetch(`/api/anonymous-feedback/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete feedback');
  }
};
