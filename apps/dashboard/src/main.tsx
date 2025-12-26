import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n'; // <--- 引入 i18n 配置

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <App />
    </Suspense>
  </React.StrictMode>,
);