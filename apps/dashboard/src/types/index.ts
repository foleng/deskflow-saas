import { ReactNode } from 'react';

export interface SidebarItem {
  key: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
