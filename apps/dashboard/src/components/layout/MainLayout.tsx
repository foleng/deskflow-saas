import React from 'react';
import { Outlet } from 'react-router-dom'; // <--- 必须引入这个
import Sidebar from './Sidebar';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />
      <main className="ml-64 p-8 min-h-screen transition-all duration-300">
        <div className="max-w-[1600px] mx-auto"> {/* <--- 临时加个红框 */}
           
           {/* 这里必须有 Outlet，它是子页面的出口 */}
           <Outlet /> 
           
        </div>
      </main>
    </div>
  );
};

export default MainLayout;