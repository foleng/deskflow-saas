import { create } from 'zustand';
import api from '../lib/api';
import { io, Socket } from 'socket.io-client';
import type { Conversation, Message } from '../types/inbox';

interface ChatStore {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  socket: Socket | null;

  // Actions
  fetchConversations: () => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  sendMessage: (content: string, type?: 'text' | 'image' | 'file' | 'audio', meta?: any) => Promise<void>;
  connectSocket: (token: string) => void;
  disconnectSocket: () => void;
  receiveMessage: (message: any) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  socket: null,

  fetchConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const res = await api.get('/conversations/my');
      if (res.data.success) {
        // Map API data to UI format
        const mappedConversations: Conversation[] = res.data.data.map((c: any) => ({
          id: c.id,
          customerName: `Visitor ${c.visitor_uuid.substring(0, 6)}`, // Placeholder
          customerAvatar: `https://i.pravatar.cc/150?u=${c.visitor_uuid}`,
          subject: `Conversation #${c.id}`,
          lastMessage: 'Click to view messages', // We might need to fetch last message separately or include in API
          time: new Date(c.updatedAt).toLocaleTimeString(),
          unreadCount: 0,
          status: c.status,
          tags: [],
        }));
        set({ conversations: mappedConversations });
      }
    } catch (error) {
      console.error('Failed to fetch conversations', error);
    } finally {
      set({ isLoadingConversations: false });
    }
  },

  selectConversation: async (id: string) => {
    set({ activeConversationId: id, isLoadingMessages: true, messages: [] });

    // Join socket room
    const { socket } = get();
    if (socket) {
      socket.emit('join_conversation', { conversationId: id });
    }

    try {
      const res = await api.get(`/conversations/${id}/messages`);
      if (res.data.success) {
        const mappedMessages: Message[] = res.data.data.map((m: any) => ({
          id: m._id || m.createdAt, // Fallback ID
          senderId: m.sender.role === 'agent' ? 'me' : 'customer', // UI uses 'me' for self
          senderRole: m.sender.role,
          senderName: m.sender.nickname,
          content: m.content.data,
          type: m.content.type,
          timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          meta: m.content.meta, // Added meta mapping
          fileName: m.content.meta?.fileName,
          size: m.content.meta?.fileSize,
        }));
        set({ messages: mappedMessages });
      }
    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (content: string, type = 'text', meta?: any) => {
    const { activeConversationId, socket } = get();
    if (!activeConversationId || !socket) return;

    return new Promise<void>((resolve) => {
      // Emit via Socket.io for real-time
      socket.emit('send_msg', {
        conversationId: activeConversationId,
        content,
        contentType: type,
        meta,
      }, (response: any) => {
        if (response && response.status === 'ok') {
          const m = response.data;
          const newMessage: Message = {
            id: m._id || Date.now().toString(),
            senderId: 'me',
            senderRole: 'agent',
            senderName: 'You',
            content: m.content.data,
            type: m.content.type,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            meta: m.content.meta,
            fileName: m.content.meta?.fileName,
            size: m.content.meta?.fileSize,
          };
          set((state) => ({ messages: [...state.messages, newMessage] }));
        }
        resolve();
      });
    });
  },

  connectSocket: (token: string) => {
    if (get().socket) return;

    const newSocket = io('http://localhost:3000', {
      auth: { token },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('receive_msg', (msg: any) => {
       get().receiveMessage(msg);
    });
    
    // Listen for new visitors if needed (for real-time conversation list updates)
    newSocket.on('new_visitor', () => {
        // Refresh conversations list
        get().fetchConversations();
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  receiveMessage: (m: any) => {
    const { activeConversationId, messages } = get();
    
    // Only append if it belongs to current conversation
    if (String(m.conversationId) === String(activeConversationId)) {
        const newMessage: Message = {
            id: m._id || Date.now().toString(),
            senderId: m.sender.role === 'agent' ? 'me' : 'customer',
            senderRole: m.sender.role,
            senderName: m.sender.nickname,
            content: m.content.data,
            type: m.content.type,
            timestamp: new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            meta: m.content.meta,
            fileName: m.content.meta?.fileName,
            size: m.content.meta?.fileSize,
        } as any; // Cast to any to match loose types if needed
        
        set({ messages: [...messages, newMessage] });
    } else {
        // Optionally update conversation list lastMessage/unreadCount
        get().fetchConversations();
    }
  }
}));
