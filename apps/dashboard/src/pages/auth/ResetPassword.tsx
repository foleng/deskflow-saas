import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, MessageSquare, CheckCircle } from 'lucide-react';
import { Input, Button, App } from 'antd';
import api from '../../lib/api';
import type { ResetPasswordDto } from '@repo/types';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { message } = App.useApp();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!token) {
        message.error('Invalid token');
        return;
    }
    if (!password || !confirmPassword) {
      message.error('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      message.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/agent/reset-password', { token, newPassword: password } as ResetPasswordDto);
      setSuccess(true);
      message.success('Password reset successfully');
    } catch (error) {
      console.error(error);
      message.error('Failed to reset password. Token may be expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
              Invalid or missing reset token.
          </div>
      );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-6">
            {success ? <CheckCircle size={24} /> : <MessageSquare size={24} />}
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {success ? 'Password Reset' : 'Set New Password'}
          </h2>
          
          <p className="text-slate-500 mb-8">
            {success 
              ? 'Your password has been successfully reset. You can now login with your new password.' 
              : 'Please enter your new password below.'}
          </p>

          {!success ? (
            <div className="space-y-4">
              <div className="text-left">
                 <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                 <Input.Password 
                   size="large" 
                   prefix={<Lock size={18} className="text-slate-400 mr-2" />} 
                   placeholder="••••••••" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="h-12 rounded-xl"
                 />
              </div>
              
              <div className="text-left">
                 <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                 <Input.Password 
                   size="large" 
                   prefix={<Lock size={18} className="text-slate-400 mr-2" />} 
                   placeholder="••••••••" 
                   value={confirmPassword}
                   onChange={(e) => setConfirmPassword(e.target.value)}
                   className="h-12 rounded-xl"
                 />
              </div>

              <Button 
                type="primary" 
                size="large" 
                block 
                onClick={handleSubmit}
                loading={loading}
                className="h-12 bg-primary-600 hover:bg-primary-500 font-bold rounded-xl mt-2"
              >
                Reset Password
              </Button>
            </div>
          ) : (
            <Button 
                type="primary" 
                size="large" 
                block 
                onClick={() => navigate('/login')}
                className="h-12 bg-primary-600 hover:bg-primary-500 font-bold rounded-xl"
            >
                Back to Login
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;