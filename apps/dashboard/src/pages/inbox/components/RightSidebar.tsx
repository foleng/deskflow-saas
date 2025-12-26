import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { Avatar, Button } from 'antd';

const RightSidebar: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="w-[300px] border-l border-slate-200 bg-white flex flex-col h-full overflow-y-auto">
      
      {/* Profile Header */}
      <div className="p-6 text-center border-b border-slate-100">
        <div className="relative inline-block mb-3">
          <Avatar src="https://i.pravatar.cc/150?u=sarah" size={80} className="border-4 border-slate-50" />
          <div className="absolute bottom-1 right-1 bg-white p-1 rounded-full shadow-sm">
             <img src="https://abs.twimg.com/emoji/v2/svg/1f426.svg" className="w-4 h-4" alt="twitter" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sarah Jenkins</h2>
        <p className="text-sm text-slate-500">sarah@example.com</p>
        
        <div className="flex justify-center gap-4 mt-4">
           <div className="flex flex-col items-center">
             <button className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1 hover:bg-blue-100">
               <Phone size={18} />
             </button>
             <span className="text-xs text-slate-500">Call</span>
           </div>
           <div className="flex flex-col items-center">
             <button className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1 hover:bg-blue-100">
               <Mail size={18} />
             </button>
             <span className="text-xs text-slate-500">Email</span>
           </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{t('inbox.details.contactInfo')}</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
             <Phone size={16} className="text-slate-400" />
             <span className="text-slate-700">+1 (555) 123-4567</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
             <Clock size={16} className="text-slate-400" />
             <span className="text-slate-700">10:45 AM (PST)</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
             <MapPin size={16} className="text-slate-400" />
             <span className="text-slate-700">San Francisco, CA</span>
          </div>
        </div>
      </div>

      {/* Attributes (Key-Value) */}
      <div className="p-6 border-b border-slate-100">
         <div className="flex justify-between items-center mb-4">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('inbox.details.attributes')}</h3>
         </div>
         <div className="space-y-3 text-sm">
           <div className="flex justify-between">
             <span className="text-slate-500">Plan</span>
             <span className="font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded">Enterprise</span>
           </div>
           <div className="flex justify-between">
             <span className="text-slate-500">LTV</span>
             <span className="font-bold text-slate-900">$1,200.00</span>
           </div>
           <div className="flex justify-between">
             <span className="text-slate-500">User ID</span>
             <span className="font-mono text-slate-600">#882190</span>
           </div>
           <div className="flex justify-between">
             <span className="text-slate-500">Signed Up</span>
             <span className="text-slate-900">Nov 2022</span>
           </div>
         </div>
      </div>

      {/* Previous Conversations */}
      <div className="p-6">
         <div className="flex justify-between items-center mb-4">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('inbox.details.previousConversations')}</h3>
         </div>
         <div className="space-y-4">
           <div className="group cursor-pointer">
             <div className="flex items-center gap-2 mb-1">
               <CheckCircle2 size={14} className="text-green-500" />
               <span className="font-medium text-slate-900 text-sm group-hover:text-primary-600">#3021 - Login Failure</span>
             </div>
             <p className="text-xs text-slate-400 ml-5">Closed 2 days ago</p>
           </div>
           <div className="group cursor-pointer">
             <div className="flex items-center gap-2 mb-1">
               <CheckCircle2 size={14} className="text-green-500" />
               <span className="font-medium text-slate-900 text-sm group-hover:text-primary-600">#2890 - Feature Request</span>
             </div>
             <p className="text-xs text-slate-400 ml-5">Closed 1 month ago</p>
           </div>
         </div>
         
         <Button block className="mt-6 text-primary-600 border-primary-200 bg-primary-50 hover:bg-primary-100 hover:text-primary-700 hover:border-primary-300">
           {t('inbox.details.viewAllHistory')}
         </Button>
      </div>
    </div>
  );
};

export default RightSidebar;