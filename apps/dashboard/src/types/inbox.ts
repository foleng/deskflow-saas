export interface Message {
  id: string;
  senderId: string;
  senderRole?: string; // Added
  senderName?: string; // Added
  senderAvatar?: string; // Added
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'system'; // 支持系统消息
  fileName?: string;
  size?: string; // Added
  meta?: any; // Added for flexible metadata
}

export interface Conversation {
  id: string;
  customerName: string;
  customerAvatar: string;
  subject: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  agentId?: number; // Added
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
