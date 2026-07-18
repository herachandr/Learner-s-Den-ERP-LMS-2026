import { AlumniMessage, ModerationLog } from '../types';

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  audience: 'all' | 'students' | 'teachers' | 'parents' | 'batches';
  targetBatches?: string[];
  pinned: boolean;
  date: string;
  author: string;
  acknowledgements?: string[];
}

export const communicationService = {
  // Notices
  async getNotices(): Promise<NoticeItem[]> {
    const res = await fetch('/api/notices');
    if (!res.ok) throw new Error('Failed to fetch notices');
    return res.json();
  },

  async createNotice(notice: Partial<NoticeItem>): Promise<NoticeItem> {
    const res = await fetch('/api/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notice),
    });
    if (!res.ok) throw new Error('Failed to create notice');
    return res.json();
  },

  async updateNotice(id: string, notice: Partial<NoticeItem>): Promise<NoticeItem> {
    const res = await fetch(`/api/notices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notice),
    });
    if (!res.ok) throw new Error('Failed to update notice');
    return res.json();
  },

  async deleteNotice(id: string): Promise<void> {
    const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete notice');
  },

  async acknowledgeNotice(noticeId: string, userId: string): Promise<any> {
    const res = await fetch(`/api/notices/${noticeId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to acknowledge notice');
    return res.json();
  },

  // Communications Logs & Settings
  async getCommunicationLogs(): Promise<any[]> {
    const res = await fetch('/api/communication/logs');
    if (!res.ok) throw new Error('Failed to fetch communication logs');
    return res.json();
  },

  async clearCommunicationLogs(): Promise<any> {
    const res = await fetch('/api/communication/clear-logs', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to clear communication logs');
    return res.json();
  },

  async getCommunicationSettings(): Promise<any> {
    const res = await fetch('/api/communication/settings');
    if (!res.ok) throw new Error('Failed to fetch communication settings');
    return res.json();
  },

  async updateCommunicationSettings(settings: any): Promise<any> {
    const res = await fetch('/api/communication/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update communication settings');
    return res.json();
  },

  async sendBulkMessage(messageData: { channel: 'SMS' | 'WhatsApp' | 'Email' | 'Push'; message: string; recipients: string[]; filterType: string }): Promise<any> {
    const res = await fetch('/api/communication/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send transmission');
    }
    return res.json();
  },

  async aiAssist(prompt: string, type: string): Promise<{ suggestion: string }> {
    const res = await fetch('/api/communication/ai-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, type }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to get AI assistance');
    return data;
  },

  // Alumni Portal
  async getAlumniMessages(roomType?: string, roomId?: string): Promise<AlumniMessage[]> {
    let url = '/api/alumni/chat';
    const params: string[] = [];
    if (roomType) params.push(`roomType=${roomType}`);
    if (roomId) params.push(`roomId=${roomId}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch alumni messages');
    return res.json();
  },

  async sendAlumniMessage(message: Partial<AlumniMessage>): Promise<AlumniMessage> {
    const res = await fetch('/api/alumni/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send message');
    }
    return res.json();
  },

  async deleteAlumniMessage(messageId: string): Promise<any> {
    const res = await fetch(`/api/alumni/chat/${messageId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete message');
    return res.json();
  },

  async getModerationLogs(): Promise<ModerationLog[]> {
    const res = await fetch('/api/alumni/moderation-logs');
    if (!res.ok) throw new Error('Failed to fetch moderation logs');
    return res.json();
  }
};
