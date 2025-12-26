import React from 'react';
import { useTranslation } from 'react-i18next';
import { MoreVertical, CheckCircle, Paperclip, Send, Smile, Clock } from 'lucide-react';
import { Avatar, Button } from 'antd';
import classNames from 'classnames';

const MESSAGES = [
  { id: '1', sender: 'customer', text: 'Hi, I was charged twice for my subscription this month. Can you please help me refund one of the charges?', time: '10:00 AM' },
  { id: '2', sender: 'system', text: 'Conversation assigned to You by Automation Rule', time: '' },
  { id: '3', sender: 'agent', text: 'Hi Sarah! Thanks for reaching out. I\'m sorry to hear about the billing issue. Let me pull up your account details and check what happened.', time: '10:05 AM' },
  { id: '4', sender: 'customer', text: 'Sure, my email is sarah@example.com. Thanks for looking into it!', time: '10:07 AM' },
  { id: '5', sender: 'customer', type: 'file', fileName: 'Receipt_Oct.pdf', size: '240 KB', time: '10:07 AM' },
];

const ChatArea: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 1. Chat Header */}
      <div className="h-16 border-b border-slate-100 flex justify-between items-center px-6 bg-white shrink-0">
        <div>
          <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            #4029 - Issue with Billing
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
        {/* Date Divider */}
        <div className="flex justify-center">
           <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full">Today, Oct 24</span>
        </div>

        {MESSAGES.map((msg) => {
          if (msg.sender === 'system') {
             return (
               <div key={msg.id} className="flex justify-center items-center gap-2 my-4">
                 <Clock size={12} className="text-slate-400" />
                 <span className="text-xs text-slate-400 italic">{msg.text}</span>
               </div>
             );
          }

          const isAgent = msg.sender === 'agent';

          return (
            <div key={msg.id} className={classNames("flex gap-4 max-w-[80%]", { "ml-auto flex-row-reverse": isAgent })}>
              <Avatar src={isAgent ? "https://i.pravatar.cc/150?u=agent" : "https://i.pravatar.cc/150?u=sarah"} size={40} className="shrink-0" />
              
              <div>
                <div className={classNames("flex items-baseline gap-2 mb-1", { "justify-end": isAgent })}>
                  <span className="text-xs font-bold text-slate-700">{isAgent ? 'You' : 'Sarah Jenkins'}</span>
                  <span className="text-xs text-slate-400">{msg.time}</span>
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
                  ) : msg.text}
                </div>
              </div>
            </div>
          );
        })}
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
           ></textarea>

           {/* Footer Actions */}
           <div className="flex justify-between items-center px-4 py-3 bg-white">
             <div className="flex items-center gap-3 text-slate-400">
               <button className="hover:text-slate-600 font-bold">B</button>
               <button className="hover:text-slate-600"><Smile size={18} /></button>
               <button className="hover:text-slate-600"><Paperclip size={18} /></button>
             </div>
             <Button type="primary" icon={<Send size={16} />} className="bg-primary-600 hover:bg-primary-500">
               {t('inbox.chat.send')}
             </Button>
           </div>
         </div>
      </div>
    </div>
  );
};

export default ChatArea;