import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Settings,
  Book
} from 'lucide-react';
import type { SidebarItem } from '../types';

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    key: '/dashboard',
    label: 'menu.dashboard', // 使用 Translation Key
    icon: <LayoutDashboard size={20} />,
  },
  {
    key: '/inbox',
    label: 'menu.inbox',
    icon: <MessageSquare size={20} />,
    badge: 12,
  },
  {
    key: '/contacts',
    label: 'menu.contacts',
    icon: <Users size={20} />,
  },
  {
    key: '/knowledge',
    label: 'menu.knowledge',
    icon: <Book size={20} />,
  },
  {
    key: '/reports',
    label: 'menu.reports',
    icon: <BarChart3 size={20} />,
  },
  {
    key: '/settings',
    label: 'menu.settings',
    icon: <Settings size={20} />,
  }
];