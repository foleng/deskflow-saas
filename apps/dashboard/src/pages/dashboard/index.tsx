import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { 
  MessageSquare, 
  Clock, 
  Smile, 
  Headphones, 
  Bell 
} from 'lucide-react';
import { Avatar, Table, Tag, Button, Timeline, Segmented } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import StatsCard from './components/StatsCard';

// --- Types ---
interface Ticket {
  key: string;
  status: 'Urgent' | 'Open' | 'Pending';
  subject: string;
  customerName: string;
  customerAvatar: string; // 简化为颜色或 URL
  updated: string;
}

interface Agent {
  name: string;
  role: string;
  status: 'Online' | 'Away' | 'Offline';
  avatar: string;
}

// --- Mock Data ---
const TICKETS_DATA: Ticket[] = [
  { key: '1', status: 'Urgent', subject: 'Payment gateway failure', customerName: 'John Doe', customerAvatar: '#3b82f6', updated: '5m ago' },
  { key: '2', status: 'Open', subject: 'Account access locked', customerName: 'Sarah M.', customerAvatar: '#ec4899', updated: '24m ago' },
  { key: '3', status: 'Pending', subject: 'Feature request: Dark Mode', customerName: 'Mike K.', customerAvatar: '#10b981', updated: '2h ago' },
  { key: '4', status: 'Open', subject: 'Billing Inquiry', customerName: 'Anna L.', customerAvatar: '#f59e0b', updated: '3h ago' },
];

const AGENTS_DATA: Agent[] = [
  { name: 'Sarah Jenks', role: 'Support Lead', status: 'Online', avatar: 'https://i.pravatar.cc/150?u=1' },
  { name: 'Michael Chen', role: 'Technical', status: 'Away', avatar: 'https://i.pravatar.cc/150?u=2' },
  { name: 'Emily Rose', role: 'Billing', status: 'Offline', avatar: 'https://i.pravatar.cc/150?u=3' },
];

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  // 表格列定义
  const columns: ColumnsType<Ticket> = [
    {
      title: t('dashboard.inbox.columns.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'Urgent') color = 'red';
        if (status === 'Open') color = 'blue';
        if (status === 'Pending') color = 'orange';
        return <Tag color={color} className="font-semibold border-0 px-2 py-1 rounded-md">{status}</Tag>;
      },
    },
    {
      title: t('dashboard.inbox.columns.subject'),
      dataIndex: 'subject',
      key: 'subject',
      render: (text) => <span className="font-medium text-slate-700">{text}</span>,
    },
    {
      title: t('dashboard.inbox.columns.customer'),
      dataIndex: 'customerName',
      key: 'customer',
      render: (name, record) => (
        <div className="flex items-center gap-2">
          <Avatar size="small" style={{ backgroundColor: record.customerAvatar }}>{name[0]}</Avatar>
          <span className="text-slate-600">{name}</span>
        </div>
      ),
    },
    {
      title: t('dashboard.inbox.columns.updated'),
      dataIndex: 'updated',
      key: 'updated',
      className: 'text-slate-500',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('dashboard.title')}</h1>
          <p className="text-slate-500 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Segmented 
            options={[t('dashboard.period.today'), t('dashboard.period.7days'), t('dashboard.period.30days')]} 
            className="bg-white p-1 border border-slate-200 shadow-sm"
          />
          <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm">
            <Bell size={20} />
          </button>
        </div>
      </div>

      {/* 2. Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title={t('dashboard.stats.conversations')} 
          value="24" 
          icon={<MessageSquare size={20} />} 
          trend="12%" 
          trendDirection="up"
          trendColor="green"
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatsCard 
          title={t('dashboard.stats.responseTime')} 
          value="4m 12s" 
          icon={<Clock size={20} />} 
          trend="30s" 
          trendDirection="down"
          trendColor="green" // 响应时间下降是好事(Green)
          iconBgColor="bg-orange-50"
          iconColor="text-orange-600"
        />
        <StatsCard 
          title={t('dashboard.stats.csat')} 
          value="4.8/5" 
          icon={<Smile size={20} />} 
          trend="" 
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatsCard 
          title={t('dashboard.stats.agents')} 
          value="8" 
          icon={<Headphones size={20} />} 
          trend="" 
          iconBgColor="bg-sky-50"
          iconColor="text-sky-600"
        />
      </div>

      {/* 3. Main Content Grid (Inbox & Team) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Priority Inbox */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-lg text-slate-800">{t('dashboard.inbox.title')}</h2>
            <Button type="link" className="text-primary-600 font-medium">{t('dashboard.inbox.viewAll')}</Button>
          </div>
          <div className="p-2">
            <Table 
              columns={columns} 
              dataSource={TICKETS_DATA} 
              pagination={false} 
              rowClassName="hover:bg-slate-50 transition-colors cursor-pointer"
            />
          </div>
        </div>

        {/* Right Column: Team & Activity */}
        <div className="flex flex-col gap-6">
          
          {/* Team Availability */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-slate-800">{t('dashboard.team.title')}</h2>
              <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full">3 Online</span>
            </div>
            
            <div className="space-y-4">
              {AGENTS_DATA.map((agent, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                       <Avatar src={agent.avatar} size="large" />
                       <span className={classNames(
                         "absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full",
                         {
                           'bg-green-500': agent.status === 'Online',
                           'bg-yellow-500': agent.status === 'Away',
                           'bg-slate-400': agent.status === 'Offline',
                         }
                       )}></span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{agent.name}</p>
                      <p className="text-xs text-slate-500">{agent.role}</p>
                    </div>
                  </div>
                  <span className={classNames(
                    "text-xs font-medium",
                    {
                      'text-green-600': agent.status === 'Online',
                      'text-yellow-600': agent.status === 'Away',
                      'text-slate-400': agent.status === 'Offline',
                    }
                  )}>{agent.status}</span>
                </div>
              ))}
            </div>
            
            <Button block className="mt-6 bg-slate-50 border-slate-200 text-slate-600 font-medium hover:bg-slate-100 hover:text-slate-900">
              {t('dashboard.team.viewAll')}
            </Button>
          </div>

          {/* Live Activity */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex-1">
            <h2 className="font-bold text-lg text-slate-800 mb-6">{t('dashboard.activity.title')}</h2>
            <Timeline
              items={[
                {
                  color: 'blue',
                  children: (
                    <div className="text-sm">
                      <span className="font-bold text-slate-900">Sarah Jenks</span> resolved ticket <a href="#" className="text-primary-600 font-medium">#2459</a>
                      <div className="text-xs text-slate-400 mt-0.5">Just now</div>
                    </div>
                  ),
                },
                {
                  color: 'gray',
                  children: (
                    <div className="text-sm">
                      New ticket created by <span className="font-bold text-slate-900">John Doe</span>
                      <div className="text-xs text-slate-400 mt-0.5">15 mins ago</div>
                    </div>
                  ),
                },
                {
                  color: 'orange',
                  children: (
                    <div className="text-sm">
                      <span className="font-bold text-slate-900">Michael Chen</span> changed status to <span className="text-orange-500 font-medium">Away</span>
                      <div className="text-xs text-slate-400 mt-0.5">42 mins ago</div>
                    </div>
                  ),
                },
              ]}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;