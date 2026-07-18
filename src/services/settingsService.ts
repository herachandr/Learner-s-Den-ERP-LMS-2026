import { InstitutionProfile } from '../types';

export const settingsService = {
  async getInstitutionProfile(): Promise<InstitutionProfile> {
    const res = await fetch('/api/institution-profile');
    if (!res.ok) throw new Error('Failed to fetch institution profile');
    return res.json();
  },

  async updateInstitutionProfile(profile: Partial<InstitutionProfile>): Promise<InstitutionProfile> {
    const res = await fetch('/api/institution-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error('Failed to update institution profile');
    return res.json();
  },

  async getGlobalSettings(): Promise<any> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch global settings');
    return res.json();
  },

  async updateGlobalSettings(settings: any): Promise<any> {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to save settings');
    return res.json();
  },

  async getVersion(): Promise<any> {
    const res = await fetch('/api/version');
    if (!res.ok) throw new Error('Failed to fetch system version');
    return res.json();
  },

  async getConfig(): Promise<any> {
    const res = await fetch('/api/config');
    if (!res.ok) throw new Error('Failed to fetch config');
    return res.json();
  }
};
