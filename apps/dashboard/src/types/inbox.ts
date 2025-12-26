export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'system'; // 支持系统消息
  fileName?: string;
}

export interface Conversation {
  id: string;
  customerName: string;
  customerAvatar: string;
  subject: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  status: 'open' | 'resolved' | 'snoozed';
  tags: string[]; // 如 'Urgent', 'Feature Request'
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  location: string;
  plan: string;
  ltv: string; // Lifetime Value
  userId: string;
  signedUp: string;
}