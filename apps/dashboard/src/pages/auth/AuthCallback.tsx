import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Spin } from 'antd';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('access_token', token);
      checkAuth().then(() => {
        navigate('/');
      });
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, checkAuth]);

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <Spin size="large" tip="Authenticating..." />
    </div>
  );
};

export default AuthCallback;
