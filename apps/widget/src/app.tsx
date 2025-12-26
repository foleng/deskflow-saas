import { useEffect, useState, useRef } from 'preact/hooks';
import io, { Socket } from 'socket.io-client';
import { 
  MessageCircle, 
  X, 
  Send, 
  Paperclip, 
  Mic, 
  MoreHorizontal, 
  ChevronDown, 
  FileText, 
  Play 
} from 'lucide-preact';

interface Message {
  text?: string;
  sender: 'me' | 'agent';
  type: 'text' | 'image' | 'file' | 'audio';
  meta?: {
    imageUrl?: string;
    fileName?: string;
    fileSize?: string;
    fileType?: string;
    duration?: string;
  };
}

interface AppProps {
  websiteId: string | null;
}

const App = ({ websiteId }: AppProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi there! 👋 How can I help you with your order today?", sender: 'agent', type: 'text' },
    { text: "I received my package, but one item is broken.", sender: 'me', type: 'text' },
    { 
        text: "Do you mean this product?", 
        sender: 'agent', 
        type: 'image',
        meta: { imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" }
    },
    {
        sender: 'me',
        type: 'file',
        meta: { fileName: "receipt_broken.pdf", fileSize: "1.2 MB", fileType: "PDF" }
    },
    {
        sender: 'agent',
        type: 'audio',
        meta: { duration: "0:14" }
    }
  ]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (!websiteId) return;

    // 1. Connect to backend
    const newSocket = io('http://localhost:3000', {
      query: { websiteId },
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('Connected to DeskFlow Support');
    });

    newSocket.on('agent_message', (msg: string) => {
      setMessages(prev => [...prev, { text: msg, sender: 'agent', type: 'text' }]);
    });

    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
  }, [websiteId]);

  const sendMessage = () => {
    if (!inputValue.trim() || !socket) return;
    
    // Emit message to backend
    socket.emit('client_message', { text: inputValue });
    
    // Add to local state
    setMessages(prev => [...prev, { text: inputValue, sender: 'me', type: 'text' }]);
    setInputValue('');
  };

  const renderMessageContent = (m: Message) => {
    switch (m.type) {
        case 'text':
            return (
                <div className={`
                    p-3 rounded-2xl shadow-sm text-sm leading-relaxed
                    ${m.sender === 'me' 
                        ? 'bg-blue-600 text-white rounded-br-none shadow-md' 
                        : 'bg-white text-gray-700 rounded-bl-none border border-gray-100'
                    }
                `}>
                    {m.text}
                </div>
            );
        case 'image':
            return (
                <div className="flex flex-col gap-1">
                    <div className="bg-white p-1 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 overflow-hidden">
                        <img src={m.meta?.imageUrl} className="rounded-xl w-full h-32 object-cover" />
                    </div>
                    {m.text && <span className="text-[10px] text-gray-400 ml-1">{m.text}</span>}
                </div>
            );
        case 'file':
            return (
                <div className="bg-blue-600 p-3 rounded-2xl rounded-br-none shadow-md text-white flex items-center gap-3 min-w-[200px] cursor-pointer hover:bg-blue-700 transition">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-bold truncate">{m.meta?.fileName}</span>
                        <span className="text-xs text-blue-100">{m.meta?.fileSize} • {m.meta?.fileType}</span>
                    </div>
                </div>
            );
        case 'audio':
            return (
                <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex items-center gap-3 min-w-[180px]">
                    <button className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition">
                        <Play className="w-4 h-4 fill-current" />
                    </button>
                    <div className="flex items-center gap-0.5 h-6">
                        {/* Fake Waveform */}
                        <div className="w-1 bg-blue-400 rounded-full h-2"></div>
                        <div className="w-1 bg-blue-500 rounded-full h-4"></div>
                        <div className="w-1 bg-blue-600 rounded-full wave-bar h-3"></div>
                        <div className="w-1 bg-blue-500 rounded-full wave-bar h-5"></div>
                        <div className="w-1 bg-blue-400 rounded-full wave-bar h-2"></div>
                        <div className="w-1 bg-blue-300 rounded-full h-3"></div>
                        <div className="w-1 bg-blue-200 rounded-full h-1"></div>
                    </div>
                    <span className="text-xs text-gray-400 font-mono ml-auto">{m.meta?.duration}</span>
                </div>
            );
        default:
            return null;
    }
  };

  return (
    <div id="deskflow-widget-container" className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans text-base">

        {/* 1. Chat Window */}
        <div 
            id="chat-window" 
            className={`
                w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden 
                transition-all duration-300 ease-out origin-bottom-right border border-gray-100
                ${isOpen ? 'widget-active' : 'widget-enter'}
            `}
        >
            
            {/* Header */}
            <div className="h-20 bg-gradient-to-r from-blue-600 to-blue-500 p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img src="https://i.pravatar.cc/150?u=agent" className="w-10 h-10 rounded-full border-2 border-white/30 shadow-sm" alt="Agent" />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                    </div>
                    <div className="text-white">
                        <h3 className="font-bold text-base leading-tight">Sarah Jenkins</h3>
                        <p className="text-blue-100 text-xs opacity-90">Support Agent • Online</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                    <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 bg-slate-50 overflow-y-auto p-4 space-y-4 scrollbar-hide" id="message-list">
                
                {/* Time Divider */}
                <div className="flex justify-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-1 rounded-full">Today</span>
                </div>

                {messages.map((m, i) => (
                    <div key={i} className={`flex gap-3 max-w-[85%] ${m.sender === 'me' ? 'ml-auto flex-row-reverse' : ''}`}>
                        {m.sender === 'agent' && (
                             <img src="https://i.pravatar.cc/150?u=agent" className="w-8 h-8 rounded-full self-end mb-1 shadow-sm" alt="Agent" />
                        )}
                        
                        {renderMessageContent(m)}
                    </div>
                ))}
                
                {/* Scroll Anchor */}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Type a message..." 
                        className="w-full bg-gray-50 border border-gray-200 rounded-full pl-4 pr-24 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all text-gray-800"
                        value={inputValue}
                        onInput={(e) => setInputValue((e.target as HTMLInputElement).value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {/* Attachment */}
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition" title="Attach file">
                            <Paperclip className="w-4 h-4" />
                        </button>
                        {/* Voice */}
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition" title="Record voice">
                            <Mic className="w-4 h-4" />
                        </button>
                        {/* Send */}
                        <button 
                            onClick={sendMessage}
                            className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition shadow-sm shadow-blue-200"
                        >
                            <Send className="w-4 h-4 ml-0.5" />
                        </button>
                    </div>
                </div>
                <div className="text-center mt-2">
                     <span className="text-[10px] text-gray-300 flex items-center justify-center gap-1">
                        Powered by <span className="font-bold text-gray-400">DeskFlow</span>
                     </span>
                </div>
            </div>
        </div>

        {/* 2. Launcher Button */}
        <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="w-14 h-14 bg-blue-600 rounded-full shadow-lg shadow-blue-600/30 text-white flex items-center justify-center hover:scale-105 hover:bg-blue-700 transition-all duration-300 group z-50 relative"
        >
            {/* Chat Icon (Default) */}
            <div className={`absolute transition-all duration-300 ${isOpen ? 'opacity-0 scale-0 rotate-90' : 'opacity-100 scale-100 rotate-0'}`}>
                <MessageCircle className="w-7 h-7" />
            </div>
            
            {/* Close Icon (Hidden) */}
            <div className={`absolute transition-all duration-300 ${isOpen ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 -rotate-90'}`}>
                <ChevronDown className="w-7 h-7" />
            </div>
        </button>

    </div>
  );
};

export default App;
