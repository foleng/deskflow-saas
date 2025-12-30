import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Input, Avatar, Segmented, Spin } from 'antd'
import classNames from 'classnames'

import ChatArea from './components/ChatArea'
import RightSidebar from './components/RightSidebar'
import { useChatStore } from '../../store/useChatStore'
import { getAvatarUrl } from '../../lib/utils'

const Inbox: React.FC = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('Mine')
  
  const { 
    conversations, 
    activeConversationId, 
    fetchConversations, 
    selectConversation, 
    connectSocket, 
    disconnectSocket,
    isLoadingConversations 
  } = useChatStore()
  
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchConversations()
    if (token) {
      connectSocket(token)
    }
    return () => {
      disconnectSocket()
    }
  }, [fetchConversations, connectSocket, disconnectSocket, token])

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
          {isLoadingConversations ? (
             <div className="flex justify-center items-center h-full">
               <Spin />
             </div>
          ) : (
            conversations.map((item) => (
              <div
                key={item.id}
                onClick={() => selectConversation(item.id)}
                className={classNames(
                  'p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 flex gap-3',
                  {
                    'bg-blue-50/50 hover:bg-blue-50': item.id === activeConversationId, // 选中态
                  }
                )}
              >
                <div className="relative">
                  <Avatar src={getAvatarUrl(item.customerAvatar)} size={44} />
                  {item.unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white flex items-center justify-center shadow-sm z-10">
                        {item.unreadCount > 99 ? '99+' : item.unreadCount}
                    </span>
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
            ))
          )}
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
