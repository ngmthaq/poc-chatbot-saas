import { atom } from 'jotai';

export type UserSession = {
  userId: string;
  displayName: string;
  token: string;
} | null;

export const userSessionAtom = atom<UserSession>(null);
