import { AppUser } from '../types';

export interface LoginResponse {
  requiresOtp?: boolean;
  email?: string;
  userId?: string;
  role?: string;
  token?: string;
  id?: string;
  name?: string;
}

export const authService = {
  async login(email: string, password: string, deviceId: string): Promise<LoginResponse & AppUser> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, deviceId }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }
    return data;
  },

  async signup(signupData: {
    email: string;
    password?: string;
    name: string;
    role: string;
    phone?: string;
    subject?: string;
    parentName?: string;
    batchId?: string;
  }): Promise<{ message: string; user?: AppUser }> {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Signup failed');
    }
    return data;
  },

  async verifyOtp(email: string, code: string, deviceId: string): Promise<AppUser> {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, deviceId }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Verification failed');
    }
    return data;
  },

  async resendOtp(email: string): Promise<{ message: string }> {
    const res = await fetch('/api/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to resend verification code');
    }
    return data;
  },

  async uploadPassportPhoto(userId: string, photo: string): Promise<{ photoUrl: string }> {
    const res = await fetch(`/api/users/${userId}/photo`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload photo');
    return data;
  },

  async rejectPassportPhoto(userId: string, reason: string): Promise<any> {
    const res = await fetch(`/api/users/${userId}/photo/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reject photo');
    return data;
  },

  async getUsers(): Promise<AppUser[]> {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async approveUser(userId: string): Promise<any> {
    const res = await fetch(`/api/users/${userId}/approve`, { method: 'PUT' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to approve user');
    return data;
  },

  async deleteUser(userId: string): Promise<any> {
    const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete user');
    return data;
  },

  async updateUserStatus(userId: string, approved: boolean, reason?: string): Promise<any> {
    const res = await fetch(`/api/users/${userId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update user status');
    return data;
  }
};
