import type { ReactNode } from 'react';

export interface SidebarItem {
  key: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

export interface User {
  id: string;
  nickname: string;
  email: string;
  avatar?: string;
}
