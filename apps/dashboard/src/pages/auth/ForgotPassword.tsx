import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MessageSquare, ArrowLeft } from 'lucide-react';
import { Input, Button, App } from 'antd';
import api from '../../lib/api';
import type { ForgotPasswordDto } from '@repo/types';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      message.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await api.post('/agent/forgot-password', { email } as ForgotPasswordDto);
      setSubmitted(true);
      message.success('Reset link sent to your email');
    } catch (error) {
      console.error(error);
      message.error('Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-6">
            <MessageSquare size={24} />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {submitted ? 'Check your email' : 'Forgot Password?'}
          </h2>
          
          <p className="text-slate-500 mb-8">
            {submitted 
              ? `We've sent a password reset link to ${email}` 
              : 'Enter your email address and we will send you a link to reset your password.'}
          </p>

          {!submitted ? (
            <div className="space-y-4">
              <div className="text-left">
                 <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                 <Input 
                   size="large" 
                   prefix={<Mail size={18} className="text-slate-400 mr-2" />} 
                   placeholder="name@company.com" 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="h-12 rounded-xl"
                 />
              </div>

              <Button 
                type="primary" 
                size="large" 
                block 
                onClick={handleSubmit}
                loading={loading}
                className="h-12 bg-primary-600 hover:bg-primary-500 font-bold rounded-xl"
              >
                Send Reset Link
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
                <Button 
                    size="large"
                    block
                    onClick={() => setSubmitted(false)}
                    className="h-12 rounded-xl"
                >
                    Resend Link
                </Button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100">
             <button 
               onClick={() => navigate('/login')}
               className="flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mx-auto font-medium"
             >
               <ArrowLeft size={16} />
               Back to Login
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;