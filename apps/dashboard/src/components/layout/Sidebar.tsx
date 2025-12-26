import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { SIDEBAR_ITEMS } from '../../config/menu';
import { LogOut, Globe } from 'lucide-react'; // 新增 Globe 图标
import { Avatar, Dropdown } from 'antd'; // 引入 Dropdown 用于切换语言
import classNames from 'classnames';
import { useTranslation } from 'react-i18next'; // <--- 引入 Hook
import { useAuthStore } from '../../store/useAuthStore';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation(); // <--- 获取 t 函数和 i18n 实例
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 语言切换菜单项
  const languageItems = [
    {
      key: 'en',
      label: 'English',
      onClick: () => i18n.changeLanguage('en'),
    },
    {
      key: 'zh',
      label: '中文 (简体)',
      onClick: () => i18n.changeLanguage('zh'),
    },
  ];

  return (
    <aside className="h-screen w-64 bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-50">
      {/* 1. Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
             {/* Logo SVG 省略... */}
             <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">{t('app.name')}</span>
        </div>
        
        {/* 语言切换小按钮 */}
        <Dropdown menu={{ items: languageItems }} placement="bottomRight">
            <button className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors">
                <Globe size={18} />
            </button>
        </Dropdown>
      </div>

      {/* 2. User Profile */}
      <div className="px-4 py-6">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:border-primary-200 transition-colors">
          <Avatar 
            src={user?.avatar?.startsWith('/uploads') ? `http://localhost:3000${user.avatar}` : (user?.avatar || "https://i.pravatar.cc/150?u=agent")} 
            size="large" 
            className="border-2 border-white shadow-sm" 
          />
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-slate-900 truncate">{user?.nickname || 'Agent'}</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-xs text-slate-500">{t('status.online')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Menu */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-2">Menu</p>
        
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.key);
          return (
            <NavLink
              key={item.key}
              to={item.key}
              className={({ isActive }) => classNames(
                'flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group',
                {
                  'bg-primary-50 text-primary-600': isActive,
                  'text-slate-600 hover:bg-slate-50 hover:text-slate-900': !isActive
                }
              )}
            >
              <div className="flex items-center gap-3">
                <span className={classNames({ 'text-primary-600': isActive, 'text-slate-400 group-hover:text-slate-600': !isActive })}>
                  {item.icon}
                </span>
                {/* 这里的 item.label 必须断言为 string，或者在 types 里处理好，
                    因为 t() 期望接收一个 Key。
                    实际上我们知道 config 里存的就是 string key */}
                <span className="font-medium text-sm">{t(item.label as any)}</span>
              </div>
              
              {item.badge && (
                <span className={classNames(
                  "px-2 py-0.5 rounded-full text-xs font-bold",
                  {
                    "bg-primary-600 text-white": isActive,
                    "bg-primary-100 text-primary-600": !isActive
                  }
                )}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* 4. Logout */}
      <div className="p-4 border-t border-slate-100">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors group">
          <LogOut size={20} className="text-slate-400 group-hover:text-red-500" />
          <span className="font-medium text-sm">{t('menu.logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;