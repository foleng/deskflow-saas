import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MoreVertical, CheckCircle, Paperclip, Send, Smile, Clock } from 'lucide-react';
import { Avatar, Button, Spin, Empty } from 'antd';
import classNames from 'classnames';
import { useChatStore } from '../../../store/useChatStore';

const ChatArea: React.FC = () => {
  const { t } = useTranslation();
  const { messages, activeConversationId, sendMessage, isLoadingMessages } = useChatStore();
  const [inputText, setInputText] = useState('');

  const handleSend = async () => {
    if (!inputText.trim()) return;
    await sendMessage(inputText);
    setInputText('');
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
                      {msg.type === 'file' ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 text-red-500 rounded-lg flex items-center justify-center shrink-0">
                            <Paperclip size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{msg.fileName}</p>
                            <p className="text-xs text-slate-500">{msg.size}</p>
                          </div>
                        </div>
                      ) : msg.content}
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
             className="w-full p-4 h-24 outline-none resize-none text-slate-700 placeholder:text-slate-400 text-sm"
             placeholder={t('inbox.chat.replyPlaceholder')}
             value={inputText}
             onChange={(e) => setInputText(e.target.value)}
             onKeyDown={(e) => {
               if (e.key === 'Enter' && !e.shiftKey) {
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
               <button className="hover:text-slate-600"><Paperclip size={18} /></button>
             </div>
             <Button 
                type="primary" 
                icon={<Send size={16} />} 
                className="bg-primary-600 hover:bg-primary-500"
                onClick={handleSend}
                loading={isLoadingMessages && false} // Optional: add sending state
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
