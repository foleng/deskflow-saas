import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Filter, SlidersHorizontal } from 'lucide-react'
import { Input, Avatar, Badge, Segmented, Empty } from 'antd'
import classNames from 'classnames'

import ChatArea from './components/ChatArea'
import RightSidebar from './components/RightSidebar'

// --- Mock Data ---
const CONVERSATIONS = [
  {
    id: '1',
    customerName: 'Sarah Jenkins',
    customerAvatar: 'https://i.pravatar.cc/150?u=sarah',
    subject: 'Billing Issue #4029',
    lastMessage: 'Hi, I was charged twice for my subscription...',
    time: '10m',
    unreadCount: 1,
    status: 'open',
    isActive: true, // 当前选中
  },
  {
    id: '2',
    customerName: 'Tech Corp Inc.',
    customerAvatar: 'https://i.pravatar.cc/150?u=tech',
    subject: 'Enterprise license renewal',
    lastMessage: 'Re: Enterprise license renewal query attached',
    time: '1h',
    unreadCount: 0,
    status: 'open',
    isActive: false,
  },
  {
    id: '3',
    customerName: 'David Kim',
    customerAvatar: 'https://i.pravatar.cc/150?u=david',
    subject: 'Feature Request',
    lastMessage: 'Is there a way to export data to CSV?',
    time: '2h',
    unreadCount: 0,
    status: 'open',
    isActive: false,
  },
  {
    id: '4',
    customerName: 'Alice Wonderland',
    customerAvatar: 'https://i.pravatar.cc/150?u=alice',
    subject: 'Login troubles',
    lastMessage: 'I keep getting error 503 when...',
    time: '1d',
    unreadCount: 0,
    status: 'resolved',
    isActive: false,
  },
]

const Inbox: React.FC = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('Mine')

  return (
    // 使用 h-[calc(100vh-4rem)] 来确保高度填满屏幕，减去 padding
    <div className="flex h-[calc(100vh-4rem)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* --- Column 1: Conversation List (Width 350px) --- */}
      <div className="w-[350px] border-r border-slate-200 flex flex-col bg-white">
        {/* Header: Title & Filter */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900">Conversations</h2>
            <button className="text-slate-400 hover:text-slate-600">
              <SlidersHorizontal size={18} />
            </button>
          </div>

          <Input
            prefix={<Search size={16} className="text-slate-400" />}
            placeholder={t('inbox.search')}
            className="bg-slate-50 border-slate-200 rounded-lg mb-3"
          />

          <Segmented
            block
            options={[
              t('inbox.tabs.mine'),
              t('inbox.tabs.unassigned'),
              t('inbox.tabs.all'),
            ]}
            value={activeTab}
            onChange={(val) => setActiveTab(val as string)}
          />
        </div>

        {/* List Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto">
          {CONVERSATIONS.map((item) => (
            <div
              key={item.id}
              className={classNames(
                'p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 flex gap-3',
                {
                  'bg-blue-50/50 hover:bg-blue-50': item.isActive, // 选中态
                }
              )}
            >
              <div className="relative">
                <Avatar src={item.customerAvatar} size={44} />
                {item.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>

              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline mb-1">
                  <h4
                    className={classNames(
                      'font-bold text-sm truncate',
                      item.unreadCount > 0 ? 'text-slate-900' : 'text-slate-700'
                    )}
                  >
                    {item.customerName}
                  </h4>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {item.time}
                  </span>
                </div>

                <p className="text-sm font-medium text-slate-800 truncate mb-0.5">
                  {item.subject}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {item.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Column 2: Chat Area --- */}
      <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
        <ChatArea />
      </div>

      {/* --- Column 3: Right Sidebar --- */}
      <div className="hidden xl:block h-full">
        {' '}
        {/* 大屏幕显示，小屏幕隐藏 */}
        <RightSidebar />
      </div>
    </div>
  )
}

export default Inbox
