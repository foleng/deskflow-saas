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
  Play,
  Image as ImageIcon,
  StopCircle,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Smile
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

const API_URL = 'http://localhost:3000';

const EMOJI_LIST = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
    "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
    "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩",
    "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣",
    "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬",
    "👍", "👎", "👏", "🙌", "👐", "🤲", "🤝", "👊", "✊", "🤛",
    "🤜", "🤞", "✌️", "🤟", "🤘", "👌", "🤏", "👈", "👉", "👆",
    "👇", "☝️", "✋", "🤚", "🖐", "🖖", "👋", "🤙", "💪", "🖕",
    "✍️", "🙏", "🦶", "🦵", "👂", "👃", "🧠", "🦷", "🦴", "👀",
    "👁", "👅", "👄", "💋", "❤️", "🧡", "💛", "💚", "💙", "💜"
];

const App = ({ websiteId: _ }: AppProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  
  // Image Preview State
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const openPreview = (url: string) => {
      setPreviewImage(url);
      setScale(1);
      setRotation(0);
  };

  const closePreview = () => {
      setPreviewImage(null);
      setScale(1);
      setRotation(0);
  };
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Ref to control auto-scrolling behavior
  const shouldScrollRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchHistory = async (convId: number, authToken: string) => {
    try {
      const res = await fetch(`${API_URL}/api/conversations/${convId}/messages`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        const history = data.data.map((msg: any) => ({
          text: msg.content.data,
          sender: msg.sender.role === 'visitor' ? 'me' : 'agent',
          type: msg.content.type,
          meta: msg.content.meta
        }));
        // Scroll to bottom when loading history
        shouldScrollRef.current = true;
        setMessages(history);
      }
    } catch (err) {
      console.error('Fetch History Failed', err);
    }
  };

  // Scroll logic: Controlled by shouldScrollRef
  useEffect(() => {
    if (shouldScrollRef.current) {
        scrollToBottom();
        shouldScrollRef.current = false;
    }
  }, [messages]);

  // Scroll when opening chat
  useEffect(() => {
      if (isOpen) {
          setTimeout(scrollToBottom, 100);
      }
  }, [isOpen]);

  // 1. Initialize Visitor (Get Token)
  useEffect(() => {
    const initVisitor = async () => {
      let vUuid = localStorage.getItem('deskflow_visitor_uuid');
      if (!vUuid) {
        vUuid = 'v_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('deskflow_visitor_uuid', vUuid);
      }

      try {
        const res = await fetch(`${API_URL}/api/visitor/init`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ v_uuid: vUuid })
        });
        const data = await res.json();
        if (data.success) {
          setToken(data.token);
        }
      } catch (err) {
        console.error('Visitor Init Failed', err);
      }
    };
    initVisitor();
  }, []);

  // 2. Connect Socket & Join Chat
  useEffect(() => {
    if (!token) return;

    const newSocket = io(API_URL, {
      auth: { token },
      transports: ['websocket']
    });

    let heartbeatInterval: any;

    newSocket.on('connect', () => {
      console.log('Connected to DeskFlow Support');
      
      // Start Heartbeat
      heartbeatInterval = setInterval(() => {
          newSocket.emit('heartbeat');
      }, 30000); // 30s interval

      // Join Chat to get Conversation ID
      newSocket.emit('join_chat', {}, (response: any) => {
        if (response && response.status === 'ok') {
          setConversationId(response.conversationId);
          console.log('Joined Conversation:', response.conversationId);
          fetchHistory(response.conversationId, token);
        } else {
            console.error('Failed to join chat', response);
        }
      });
    });

    newSocket.on('receive_msg', (msg: any) => {
      console.log('Received:', msg);
      const isMe = msg.sender.role === 'visitor';
      const uiMsg: Message = {
        text: msg.content.data,
        sender: isMe ? 'me' : 'agent',
        type: msg.content.type as any,
      };
      // Do NOT scroll automatically for incoming messages (unless it's me, which is handled in sendMessage response usually, but for consistency if receive_msg catches my own message?)
      // Actually receive_msg usually catches incoming from others. If I send, I get ack.
      // But if I receive my own message via socket broadcast?
      // The logic: if isMe, scroll. If not, don't.
      if (isMe) {
          shouldScrollRef.current = true;
      } else {
          shouldScrollRef.current = false;
      }
      setMessages(prev => [...prev, uiMsg]);
    });

    newSocket.on('chat_ended', () => {
        setMessages(prev => [...prev, { text: 'Chat ended by agent.', sender: 'agent', type: 'text' }]);
        setConversationId(null);
    });

    setSocket(newSocket);
    return () => {
      clearInterval(heartbeatInterval);
      newSocket.disconnect();
    };
  }, [token]);

  const handleUpload = async (file: File, type: 'image' | 'file' | 'audio') => {
    if (!token) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await fetch(`${API_URL}/api/upload/local`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = await res.json();
        
        if (data.url) {
            const fullUrl = data.url.startsWith('http') ? data.url : `${API_URL}${data.url}`;
            const meta: any = {
                fileName: file.name,
                fileSize: (file.size / 1024).toFixed(1) + ' KB',
                fileType: file.type,
            };
            if (type === 'image') {
                meta.imageUrl = fullUrl;
            }
            if (type === 'audio') {
                meta.duration = 'Voice'; 
            }
            sendMessage(fullUrl, type, meta);
        }
    } catch (err) {
        console.error('Upload Failed', err);
    } finally {
        setIsUploading(false);
    }
  };

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const audioFile = new File([audioBlob], 'voice-message.webm', { type: 'audio/webm' });
            handleUpload(audioFile, 'audio');
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
    } catch (err) {
        console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
      }
  };

  const sendMessage = (content?: string, type: 'text'|'image'|'file'|'audio' = 'text', meta: any = {}) => {
    const textToSend = content || inputValue;
    if ((!textToSend || !textToSend.trim()) && type === 'text') return;
    if (!socket || !conversationId) return;
    
    if (type === 'text') setInputValue('');

    socket.emit('send_msg', { 
        conversationId, 
        content: textToSend,
        contentType: type,
        meta
    }, (response: any) => {
        if (response?.status === 'ok') {
            const m = response.data;
            const newMessage: Message = {
                text: m.content.data,
                sender: 'me',
                type: m.content.type as any,
                meta: m.content.meta
            };
            shouldScrollRef.current = true;
            setMessages(prev => [...prev, newMessage]);
        } else {
            console.error('Message Send Failed', response);
            if (type === 'text') setInputValue(textToSend);
        }
    });
  };

  const renderMessageContent = (m: Message) => {
    switch (m.type) {
        case 'text':
            return (
                <div className={`
                    p-3 rounded-2xl shadow-sm text-sm leading-relaxed break-all whitespace-pre-wrap
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
                <div className="flex flex-col gap-1 min-w-0">
                    <div className={`
                        bg-white p-2 rounded-2xl shadow-sm border border-gray-100 overflow-hidden
                        ${m.sender === 'me' ? 'rounded-br-none' : 'rounded-bl-none'}
                    `}>
                        <img 
                            src={m.meta?.imageUrl || m.text} 
                            className="rounded-xl max-w-full max-h-[300px] w-auto h-auto block object-contain cursor-zoom-in hover:opacity-95 transition" 
                            onClick={() => openPreview(m.meta?.imageUrl || m.text || '')}
                        />
                    </div>
                    {/* Only show text if it's not the URL */}
                    {m.text && m.text !== m.meta?.imageUrl && <span className="text-[10px] text-gray-400 ml-1 truncate">{m.text}</span>}
                </div>
            );
        case 'file':
            return (
                <div className="bg-blue-600 p-3 rounded-2xl rounded-br-none shadow-md text-white flex items-center gap-3 min-w-[200px] cursor-pointer hover:bg-blue-700 transition" onClick={() => window.open(m.text, '_blank')}>
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-bold truncate">{m.meta?.fileName || 'File'}</span>
                        <span className="text-xs text-blue-100">{m.meta?.fileSize} • {m.meta?.fileType || 'File'}</span>
                    </div>
                </div>
            );
        case 'audio':
            return (
                <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex items-center gap-3 min-w-[180px]">
                    <button 
                        onClick={() => new Audio(m.text).play()}
                        className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition"
                    >
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
                    <span className="text-xs text-gray-400 font-mono ml-auto">{m.meta?.duration || '0:00'}</span>
                </div>
            );
        default:
            return null;
    }
  };

  return (
    <>
        {/* Image Preview Overlay - Rendered in Shadow DOM but outside Widget Container */}
        {previewImage && (
            <div 
                className="fixed inset-0 z-[99999] bg-black/90 flex flex-col items-center justify-center animate-in fade-in duration-200"
                onClick={closePreview}
            >
                {/* Controls */}
                <div 
                    className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full text-white shadow-xl z-50"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button 
                        onClick={() => setScale(s => Math.min(s + 0.5, 5))}
                        className="p-2 hover:bg-white/20 rounded-full transition"
                        title="Zoom In"
                    >
                        <ZoomIn className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setScale(s => Math.max(s - 0.5, 0.5))}
                        className="p-2 hover:bg-white/20 rounded-full transition"
                        title="Zoom Out"
                    >
                        <ZoomOut className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setRotation(r => r + 90)}
                        className="p-2 hover:bg-white/20 rounded-full transition"
                        title="Rotate"
                    >
                        <RotateCw className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => window.open(previewImage, '_blank')}
                        className="p-2 hover:bg-white/20 rounded-full transition"
                        title="Download/Open"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-white/20 mx-2"></div>
                    <button 
                        onClick={closePreview}
                        className="p-2 hover:bg-white/20 rounded-full transition hover:text-red-400"
                        title="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Image Container */}
                <div 
                    className="w-full h-full flex items-center justify-center p-8 overflow-auto"
                    onClick={closePreview}
                >
                    <img 
                        src={previewImage} 
                        className="max-w-none transition-transform duration-200 ease-out select-none"
                        style={{ 
                            transform: `scale(${scale}) rotate(${rotation}deg)`,
                            cursor: scale > 1 ? 'grab' : 'default',
                            maxWidth: scale === 1 ? '100%' : 'auto',
                            maxHeight: scale === 1 ? '100%' : 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
            </div>
        )}

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
                        <h3 className="font-bold text-base leading-tight">Support Team</h3>
                        <p className="text-blue-100 text-xs opacity-90">We typically reply in minutes</p>
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

                {messages.length === 0 && (
                     <div className="text-center text-gray-400 text-sm mt-10">
                         Start a conversation with us!
                     </div>
                )}

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
            <div className="p-4 bg-white border-t border-gray-100 shrink-0 flex flex-col gap-3">
                {/* Hidden Inputs */}
                <input 
                    type="file" 
                    ref={imageInputRef} 
                    className="hidden" 
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={(e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleUpload(file, 'image');
                    }} 
                />
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleUpload(file, 'file');
                    }} 
                />

                <div className="relative">
                     {/* Emoji Picker Popover - Adjusted Position */}
                     {showEmojiPicker && (
                        <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-2xl border border-gray-100 p-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <div className="grid grid-cols-7 gap-1 h-60 overflow-y-auto custom-scrollbar overflow-x-hidden">
                                {EMOJI_LIST.map((emoji) => (
                                    <button
                                        key={emoji}
                                        className="text-2xl p-2 hover:bg-gray-50 rounded-lg transition flex items-center justify-center aspect-square"
                                        onClick={() => {
                                            setInputValue(prev => prev + emoji);
                                            setShowEmojiPicker(false);
                                        }}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <input 
                        type="text" 
                        placeholder={isRecording ? "Recording..." : "Type a message..."}
                        disabled={isRecording}
                        className={`w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all text-gray-800 placeholder-gray-400 ${isRecording ? 'animate-pulse bg-red-50 text-red-500 placeholder-red-300' : ''}`}
                        value={inputValue}
                        onInput={(e) => setInputValue((e.target as HTMLInputElement).value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isRecording && sendMessage()}
                    />
                </div>
                
                {/* Toolbar */}
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1">
                        {/* Emoji Toggle */}
                        <button 
                            className={`p-2 rounded-full transition ${showEmojiPicker ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                            title="Insert Emoji"
                            disabled={isUploading || isRecording}
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                            <Smile className="w-5 h-5" />
                        </button>

                        {/* Image */}
                        <button 
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition" 
                            title="Send Image"
                            disabled={isUploading || isRecording}
                            onClick={() => imageInputRef.current?.click()}
                        >
                            <ImageIcon className="w-5 h-5" />
                        </button>

                        {/* Attachment */}
                        <button 
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition" 
                            title="Attach file"
                            disabled={isUploading || isRecording}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Paperclip className="w-5 h-5" />
                        </button>

                        {/* Voice */}
                        <button 
                            className={`p-2 rounded-full transition ${isRecording ? 'text-red-500 bg-red-100 hover:bg-red-200' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`} 
                            title={isRecording ? "Stop Recording" : "Record Voice"}
                            onClick={isRecording ? stopRecording : startRecording}
                        >
                             {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Send Button */}
                    <button 
                        onClick={() => sendMessage()}
                        disabled={isUploading || isRecording || (!inputValue.trim())}
                        className="h-10 px-6 bg-blue-600 text-white rounded-full flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-sm shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-sm font-medium"
                    >
                        <span>Send</span>
                        <Send className="w-4 h-4" />
                    </button>
                </div>

                <div className="text-center pt-1 border-t border-gray-50 mt-1">
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
    </>
  );
};

export default App;