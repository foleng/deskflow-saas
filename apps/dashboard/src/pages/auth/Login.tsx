import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, MessageSquare, BarChart2, ArrowRight } from 'lucide-react';
import { Input, Button, Checkbox, Divider } from 'antd';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogin = () => {
    // 模拟登录成功，跳转到 Dashboard
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full flex">
      
      {/* --- Left Column: Brand & Hero (60% Width) --- */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-primary-600 overflow-hidden flex-col justify-between p-12 text-white">
        
        {/* Background Patterns (Abstract Shapes) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-500 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary-700 rounded-full opacity-50 blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <MessageSquare className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight">DeskFlow</span>
          </div>
        </div>

        <div className="relative z-10 mb-12">
           <h1 className="text-5xl font-bold leading-tight mb-6 max-w-2xl">
             {t('auth.hero.title')}
           </h1>
           <p className="text-primary-100 text-lg max-w-xl leading-relaxed">
             {t('auth.hero.desc')}
           </p>
        </div>

        {/* Feature Cards (Bottom) */}
        <div className="relative z-10 flex gap-4">
           <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center gap-4 w-64">
             <div className="bg-white/20 p-2 rounded-lg"><MessageSquare size={20} /></div>
             <div>
               <p className="font-bold text-sm">Real-time Responses</p>
               <p className="text-xs text-primary-200">Instant chat engine</p>
             </div>
           </div>
           <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center gap-4 w-64">
             <div className="bg-white/20 p-2 rounded-lg"><BarChart2 size={20} /></div>
             <div>
               <p className="font-bold text-sm">Deep Analytics</p>
               <p className="text-xs text-primary-200">Data-driven insights</p>
             </div>
           </div>
        </div>
      </div>

      {/* --- Right Column: Login Form (40% Width) --- */}
      <div className="w-full lg:w-[45%] bg-white flex flex-col justify-center items-center p-8 lg:p-24 relative">
        
        {/* Mobile Logo (Visible only on small screens) */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2 text-primary-600 mb-8">
           <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="text-white" size={18} />
           </div>
           <span className="text-xl font-bold">DeskFlow</span>
        </div>

        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900">{t('auth.login.title')}</h2>
            <p className="text-slate-500 mt-2">{t('auth.login.subtitle')}</p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('auth.login.email')}</label>
              <Input 
                size="large" 
                prefix={<Mail size={18} className="text-slate-400 mr-2" />} 
                placeholder={t('auth.login.placeholder.email')} 
                className="h-12 rounded-lg border-slate-300"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-slate-700">{t('auth.login.password')}</label>
                <a href="#" className="text-sm font-semibold text-primary-600 hover:text-primary-500">{t('auth.login.forgot')}</a>
              </div>
              <Input.Password 
                size="large" 
                prefix={<Lock size={18} className="text-slate-400 mr-2" />} 
                placeholder="••••••••" 
                className="h-12 rounded-lg border-slate-300"
              />
            </div>

            <Button 
              type="primary" 
              size="large" 
              block 
              onClick={handleLogin}
              className="h-12 bg-primary-600 hover:bg-primary-500 font-bold text-base rounded-lg mt-2 shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 group"
            >
              {t('auth.login.submit')}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-400 font-medium tracking-wider text-xs uppercase">{t('auth.login.or')}</span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-4">
             <button className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-600">
               <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
               Google
             </button>
             <button className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-600">
               <img src="https://www.svgrepo.com/show/355117/microsoft.svg" className="w-5 h-5" alt="Microsoft" />
               Microsoft
             </button>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-slate-500 mt-8">
            {t('auth.login.noAccount')} <a href="#" className="font-bold text-primary-600 hover:text-primary-500">{t('auth.login.signup')}</a>
          </p>
        </div>

        {/* Support Link */}
        <div className="absolute bottom-6 text-xs text-slate-400 flex items-center gap-1 cursor-pointer hover:text-slate-600">
          <span>Need help? Contact Support</span>
        </div>

      </div>
    </div>
  );
};

export default Login;