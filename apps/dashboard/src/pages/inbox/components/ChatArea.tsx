import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MoreVertical, CheckCircle, Paperclip, Send, Smile, Clock, Image as ImageIcon, Mic, StopCircle, FileText, Play, Download } from 'lucide-react';
import { Avatar, Button, Spin, Empty, Image } from 'antd';
import classNames from 'classnames';
import { useChatStore } from '../../../store/useChatStore';

const API_URL = 'http://localhost:3000';

const ChatArea: React.FC = () => {
  const { t } = useTranslation();
  const { messages, activeConversationId, sendMessage, isLoadingMessages } = useChatStore();
  const [inputText, setInputText] = useState('');
  
  // Upload & Recording State
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleSend = async () => {
    if (!inputText.trim() && !isRecording) return;
    await sendMessage(inputText);
    setInputText('');
  };

  const handleUpload = async (file: File, type: 'image' | 'file' | 'audio') => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/api/upload/local`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
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
            meta.duration = 'Voice'; // Placeholder, could calculate actual duration
        }

        await sendMessage(fullUrl, type, meta);
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
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const renderMessageContent = (msg: any) => {
    if (msg.type === 'image') {
      return (
        <div className="max-w-[300px] rounded-lg overflow-hidden">
             <Image 
                src={msg.meta?.imageUrl || msg.content} 
                alt="Image" 
                fallback="https://via.placeholder.com/300?text=Image+Error"
                className="w-full h-auto object-cover"
             />
        </div>
      );
    }

    if (msg.type === 'file') {
      return (
        <div 
            className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg cursor-pointer hover:bg-slate-100 transition border border-slate-200"
            onClick={() => window.open(msg.content, '_blank')}
        >
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <FileText size={20} />
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-slate-900 truncate max-w-[200px]">{msg.meta?.fileName || msg.fileName || 'File'}</p>
            <p className="text-xs text-slate-500">{msg.meta?.fileSize || msg.size || 'Unknown size'}</p>
          </div>
          <div className="ml-2 text-slate-400">
             <Download size={16} />
          </div>
        </div>
      );
    }

    if (msg.type === 'audio') {
        return (
            <div className="flex items-center gap-3 min-w-[200px]">
                <button 
                    className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition"
                    onClick={() => {
                        const audio = new Audio(msg.content);
                        audio.play();
                    }}
                >
                    <Play size={14} fill="currentColor" />
                </button>
                <div className="flex-1">
                    <div className="h-1 bg-slate-200 rounded-full w-full overflow-hidden">
                        <div className="h-full bg-slate-400 w-1/2"></div> {/* Mock progress */}
                    </div>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                    {msg.meta?.duration || 'Voice'}
                </span>
            </div>
        )
    }

    return <p className="whitespace-pre-wrap">{msg.content}</p>;
  };

  if (!activeConversationId) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50">
        <Empty description="Select a conversation to start chatting" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 1. Chat Header */}
      <div className="h-16 border-b border-slate-100 flex justify-between items-center px-6 bg-white shrink-0">
        <div>
          <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            #{activeConversationId}
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full uppercase font-bold tracking-wide">Open</span>
          </h2>
          <p className="text-xs text-slate-500">via Email • Assigned to <span className="font-medium text-slate-700">You</span></p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button icon={<Clock size={16} />} className="text-slate-500 border-slate-200" />
          <Button type="primary" icon={<CheckCircle size={16} />} className="bg-primary-600">
             {t('inbox.chat.resolve')}
          </Button>
          <Button type="text" icon={<MoreVertical size={20} />} className="text-slate-400" />
        </div>
      </div>

      {/* 2. Messages List (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <Spin />
          </div>
        ) : (
          <>
            {/* Date Divider */}
            <div className="flex justify-center">
               <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full">Today</span>
            </div>

            {messages.map((msg) => {
              if (msg.type === 'system') {
                 return (
                   <div key={msg.id} className="flex justify-center items-center gap-2 my-4">
                     <Clock size={12} className="text-slate-400" />
                     <span className="text-xs text-slate-400 italic">{msg.content}</span>
                   </div>
                 );
              }

              const isAgent = msg.senderRole === 'agent';

              return (
                <div key={msg.id} className={classNames("flex gap-4 max-w-[80%]", { "ml-auto flex-row-reverse": isAgent })}>
                  <Avatar src={isAgent ? "https://i.pravatar.cc/150?u=agent" : "https://i.pravatar.cc/150?u=visitor"} size={40} className="shrink-0" />
                  
                  <div>
                    <div className={classNames("flex items-baseline gap-2 mb-1", { "justify-end": isAgent })}>
                      <span className="text-xs font-bold text-slate-700">{isAgent ? 'You' : msg.senderName}</span>
                      <span className="text-xs text-slate-400">{msg.timestamp}</span>
                    </div>

                    {/* Message Bubble */}
                    <div className={classNames(
                      "p-4 rounded-2xl shadow-sm text-sm leading-relaxed",
                      {
                        "bg-primary-600 text-white rounded-tr-none": isAgent,
                        "bg-white border border-slate-100 text-slate-700 rounded-tl-none": !isAgent
                      }
                    )}>
                      {renderMessageContent(msg)}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* 3. Reply Box */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
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

         <div className="border border-slate-200 rounded-xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-400 transition-all">
           {/* Toolbar */}
           <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50">
             <button className="text-sm font-bold text-primary-600 border-b-2 border-primary-600 px-2 py-1">Reply</button>
             <button className="text-sm font-medium text-slate-500 hover:text-slate-700 px-2 py-1 flex items-center gap-1">
               <span className="w-3 h-3 border border-slate-400 rounded-sm bg-yellow-100"></span>
               {t('inbox.chat.privateNote')}
             </button>
           </div>
           
           {/* Text Area */}
           <textarea 
             className={classNames("w-full p-4 h-24 outline-none resize-none text-slate-700 placeholder:text-slate-400 text-sm", { "bg-red-50": isRecording })}
             placeholder={isRecording ? "Recording voice message..." : t('inbox.chat.replyPlaceholder')}
             value={inputText}
             disabled={isRecording}
             onChange={(e) => setInputText(e.target.value)}
             onKeyDown={(e) => {
               if (e.key === 'Enter' && !e.shiftKey && !isRecording) {
                 e.preventDefault();
                 handleSend();
               }
             }}
           ></textarea>

           {/* Footer Actions */}
           <div className="flex justify-between items-center px-4 py-3 bg-white">
             <div className="flex items-center gap-3 text-slate-400">
               <button className="hover:text-slate-600 font-bold">B</button>
               <button className="hover:text-slate-600"><Smile size={18} /></button>
               
               {/* Image Upload */}
               <button 
                  className="hover:text-slate-600 hover:bg-slate-100 p-1 rounded transition" 
                  title="Upload Image"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploading || isRecording}
               >
                   <ImageIcon size={18} />
               </button>

               {/* File Upload */}
               <button 
                  className="hover:text-slate-600 hover:bg-slate-100 p-1 rounded transition" 
                  title="Attach File"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isRecording}
               >
                   <Paperclip size={18} />
               </button>

               {/* Voice Recorder */}
               <button 
                  className={classNames("p-1 rounded transition", { "text-red-500 bg-red-50": isRecording, "hover:text-slate-600 hover:bg-slate-100": !isRecording })} 
                  title={isRecording ? "Stop Recording" : "Record Voice"}
                  onClick={isRecording ? stopRecording : startRecording}
               >
                   {isRecording ? <StopCircle size={18} /> : <Mic size={18} />}
               </button>
             </div>

             <Button 
                type="primary" 
                icon={<Send size={16} />} 
                className="bg-primary-600 hover:bg-primary-500"
                onClick={handleSend}
                disabled={isUploading || isRecording}
                loading={isLoadingMessages || isUploading} 
             >
               {t('inbox.chat.send')}
             </Button>
           </div>
         </div>
      </div>
    </div>
  );
};

export default ChatArea;
