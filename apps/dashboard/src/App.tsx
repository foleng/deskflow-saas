import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { useTranslation } from 'react-i18next';

// 引入 Antd 的语言包
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';

import MainLayout from './components/layout/MainLayout';

// --- 这里修改了：引入真正的页面组件 ---
import Dashboard from './pages/dashboard';
import Contacts from './pages/contacts';
import Inbox from './pages/inbox'; 
import Settings from './pages/settings';
import Login from './pages/auth/Login';
import Reports from './pages/reports';


const App: React.FC = () => {
  const { i18n } = useTranslation();
  const [antdLocale, setAntdLocale] = useState(enUS);

  useEffect(() => {
    if (i18n.language.startsWith('zh')) {
      setAntdLocale(zhCN);
    } else {
      setAntdLocale(enUS);
    }
  }, [i18n.language]);

  return (
    <ConfigProvider locale={antdLocale} theme={{
      token: { colorPrimary: '#3b82f6' }
    }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            {/* 使用真正的 Dashboard 组件 */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;