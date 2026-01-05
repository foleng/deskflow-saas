import { create } from 'zustand';
import api from '../lib/api';
import { io, Socket } from 'socket.io-client';
import type { Conversation, Message } from '../types/inbox';

interface ChatStore {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  messagesCache: Record<string, Message[]>;
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
  markAsRead: (conversationId: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  messagesCache: {},
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
          unreadCount: c.unreadCount || 0,
          agentId: c.agent_id,
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
    const { messagesCache } = get();
    const cachedMessages = messagesCache[id];

    // 1. Clear unread count locally
    set((state) => ({
        conversations: state.conversations.map(c => 
            c.id === id ? { ...c, unreadCount: 0 } : c
        ),
        activeConversationId: id,
        // Use cache if available, otherwise clear messages
        messages: cachedMessages || [], 
        // Only show loading if we don't have cache
        isLoadingMessages: !cachedMessages, 
    }));

    // Join socket room
    const { socket } = get();
    if (socket) {
      socket.emit('join_conversation', { conversationId: id });
    }

    try {
      const res = await api.get(`/conversations/${id}/messages`);
      if (res.data.success) {
        const { conversations } = get();
        const currentConv = conversations.find(c => c.id === id);
        const visitorAvatar = currentConv?.customerAvatar || `https://i.pravatar.cc/150?u=visitor`; // Fallback

        const mappedMessages: Message[] = res.data.data.map((m: any) => ({
          id: m._id || m.createdAt, // Fallback ID
          senderId: m.sender.role === 'agent' ? 'me' : 'customer', // UI uses 'me' for self
          senderRole: m.sender.role,
          senderName: m.sender.nickname,
          senderAvatar: m.sender.role === 'agent' ? 'https://i.pravatar.cc/150?u=agent' : visitorAvatar, // Use consistent avatar
          content: m.content.data,
          type: m.content.type,
          timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          meta: m.content.meta, // Added meta mapping
          fileName: m.content.meta?.fileName,
          size: m.content.meta?.fileSize,
        }));
        
        set((state) => ({ 
            // Only update messages if the user is still on the same conversation
            messages: state.activeConversationId === id ? mappedMessages : state.messages,
            // Update cache
            messagesCache: { ...state.messagesCache, [id]: mappedMessages },
            isLoadingMessages: state.activeConversationId === id ? false : state.isLoadingMessages
        }));
      } else {
        set((state) => state.activeConversationId === id ? { isLoadingMessages: false } : {});
      }
    } catch (error) {
      console.error('Failed to fetch messages', error);
      set((state) => state.activeConversationId === id ? { isLoadingMessages: false } : {});
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
            senderAvatar: 'https://i.pravatar.cc/150?u=agent',
            content: m.content.data,
            type: m.content.type,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            meta: m.content.meta,
            fileName: m.content.meta?.fileName,
            size: m.content.meta?.fileSize,
          };
          set((state) => ({ 
            messages: [...state.messages, newMessage],
            messagesCache: {
              ...state.messagesCache,
              [state.activeConversationId!]: [
                ...(state.messagesCache[state.activeConversationId!] || []),
                newMessage
              ]
            }
          }));
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

    let heartbeatInterval: any;

    newSocket.on('connect', () => {
      console.log('Socket connected');
      // Start Heartbeat
      heartbeatInterval = setInterval(() => {
          newSocket.emit('heartbeat');
      }, 30000); // 30s interval
    });

    newSocket.on('disconnect', () => {
       clearInterval(heartbeatInterval);
    });

    newSocket.on('receive_msg', (msg: any) => {
       get().receiveMessage(msg);
    });
    
    // Listen for new visitors if needed (for real-time conversation list updates)
    newSocket.on('new_visitor', () => {
        // Refresh conversations list
        get().fetchConversations();
    });

    // Listen for conversation updates
    newSocket.on('conversation_updated', () => {
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
    const { activeConversationId, messages, conversations, messagesCache } = get();
    
    // Find conversation to get avatar
    const existingConv = conversations.find(c => String(c.id) === String(m.conversationId));
    const visitorAvatar = existingConv?.customerAvatar || `https://i.pravatar.cc/150?u=${m.conversationId}`; // Fallback with ID

    const newMessage: Message = {
        id: m._id || Date.now().toString(),
        senderId: m.sender.role === 'agent' ? 'me' : 'customer',
        senderRole: m.sender.role,
        senderName: m.sender.nickname,
        senderAvatar: m.sender.role === 'agent' ? 'https://i.pravatar.cc/150?u=agent' : visitorAvatar,
        content: m.content.data,
        type: m.content.type,
        timestamp: new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        meta: m.content.meta,
        fileName: m.content.meta?.fileName,
        size: m.content.meta?.fileSize,
    } as any; 

    // Update Cache
    const targetCache = messagesCache[m.conversationId] || [];
    const updatedCache = {
        ...messagesCache,
        [m.conversationId]: [...targetCache, newMessage]
    };

    // 1. If it belongs to current conversation, append to messages
    if (String(m.conversationId) === String(activeConversationId)) {
        set({ 
            messages: [...messages, newMessage],
            messagesCache: updatedCache
        });
    } else {
        set({ messagesCache: updatedCache });
    }

    // 2. Update conversation list (unread count + last message + reorder)
    const targetConvIndex = conversations.findIndex(c => String(c.id) === String(m.conversationId));
    
    if (targetConvIndex > -1) {
        const targetConv = { ...conversations[targetConvIndex] };
        
        // Update details
        targetConv.lastMessage = m.content.type === 'text' ? m.content.data : `[${m.content.type}]`;
        targetConv.time = new Date(m.createdAt || Date.now()).toLocaleTimeString();
        
        // Increment unread ONLY for visitor messages when NOT active
        // Logic: If user is looking at this conversation, it's read immediately.
        const isActive = String(m.conversationId) === String(activeConversationId);
        
        // Smart Unread Logic:
        // Even if active, if the window is NOT focused (user tabbed away), mark as unread.
        // We check document visibility safely.
        const isWindowFocused = typeof document !== 'undefined' && document.visibilityState === 'visible' && document.hasFocus();

        if (m.sender.role === 'visitor') {
             if (!isActive || (isActive && !isWindowFocused)) {
                 targetConv.unreadCount = (targetConv.unreadCount || 0) + 1;
             }
        }

        // Move to top
        const newConversations = [
            targetConv,
            ...conversations.filter((_, idx) => idx !== targetConvIndex)
        ];
        
        set({ conversations: newConversations });
    } else {
        // New conversation? Fetch all to be safe
        get().fetchConversations();
    }
  },

  markAsRead: async (conversationId: string) => {
    // 1. Optimistic update
    set((state) => {
      const target = state.conversations.find(c => c.id === conversationId);
      if (target && target.unreadCount > 0) {
          return {
            conversations: state.conversations.map(c =>
              c.id === conversationId ? { ...c, unreadCount: 0 } : c
            )
          };
      }
      return {};
    });

    // 2. Sync with backend
    try {
        await api.patch(`/conversations/${conversationId}/read`);
    } catch (error) {
        console.error('Failed to mark as read', error);
    }
  }
}));
