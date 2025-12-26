import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, MessageSquare, BarChart2, ArrowRight, User } from 'lucide-react';
import { Input, Button, App } from 'antd';
import { useAuthStore } from '../../store/useAuthStore';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const register = useAuthStore((state) => state.register);
  
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nickname || !email || !password) {
      message.error(t('auth.register.error.required', 'Please fill in all fields'));
      return;
    }

    setLoading(true);
    try {
      await register({ nickname, email, password });
      message.success(t('auth.register.success', 'Registration successful. Please login.'));
      navigate('/login');
    } catch (error) {
      console.error(error);
      message.error(t('auth.register.error.failed', 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
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
             {t('auth.hero.title', 'Customer Service Reimagined')}
           </h1>
           <p className="text-primary-100 text-lg max-w-xl leading-relaxed">
             {t('auth.hero.desc', 'Join thousands of businesses using DeskFlow to deliver exceptional support experiences.')}
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

      {/* --- Right Column: Register Form (40% Width) --- */}
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
            <h2 className="text-3xl font-bold text-slate-900">{t('auth.register.title', 'Create Account')}</h2>
            <p className="mt-2 text-slate-500">
              {t('auth.register.subtitle', 'Sign up to get started')}
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 block ml-1">{t('auth.register.nickname', 'Nickname')}</label>
              <Input 
                size="large" 
                prefix={<User className="text-slate-400 mr-2" size={18} />} 
                placeholder={t('auth.register.nickname.placeholder', 'Your Nickname')}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="rounded-xl py-2.5 border-slate-200 hover:border-primary-400 focus:border-primary-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 block ml-1">{t('auth.login.email', 'Email Address')}</label>
              <Input 
                size="large" 
                prefix={<Mail className="text-slate-400 mr-2" size={18} />} 
                placeholder={t('auth.login.email.placeholder', 'name@company.com')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl py-2.5 border-slate-200 hover:border-primary-400 focus:border-primary-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 block ml-1">{t('auth.login.password', 'Password')}</label>
              <Input.Password 
                size="large" 
                prefix={<Lock className="text-slate-400 mr-2" size={18} />} 
                placeholder={t('auth.login.password.placeholder', '••••••••')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl py-2.5 border-slate-200 hover:border-primary-400 focus:border-primary-500"
              />
            </div>
            
            <Button 
              type="primary" 
              size="large" 
              block 
              onClick={handleRegister} 
              loading={loading}
              className="h-12 text-base font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/30 border-none mt-4"
            >
              <div className="flex items-center justify-center gap-2">
                {t('auth.register.submit', 'Create Account')}
                <ArrowRight size={18} />
              </div>
            </Button>
          </div>

          <div className="text-center text-sm text-slate-500">
            {t('auth.register.has_account', 'Already have an account?')}
            <button onClick={() => navigate('/login')} className="ml-2 font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-all">
              {t('auth.login.submit', 'Sign in')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;