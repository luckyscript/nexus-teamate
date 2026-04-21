import apiClient from '../client';
import type { CurrentUser } from '../../types';

export async function getMe(): Promise<CurrentUser> {
  return apiClient.get<CurrentUser>('/auth/me');
}

export async function getContext(): Promise<{ menu: unknown[]; permissions: string[] }> {
  return apiClient.get<{ menu: unknown[]; permissions: string[] }>('/auth/context');
}
