import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Calendar, 
  Download, 
  Filter, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  Smile, 
  MoreHorizontal 
} from 'lucide-react';
import { Button, Select, Avatar, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import classNames from 'classnames';
import api from '../../lib/api';

// --- Mock Data (Fallback) ---
const CHART_DATA_MOCK = [
  { date: 'Sep 01', incoming: 120, resolved: 100 },
  { date: 'Sep 05', incoming: 230, resolved: 180 },
  { date: 'Sep 10', incoming: 180, resolved: 240 },
  { date: 'Sep 15', incoming: 342, resolved: 280 }, 
  { date: 'Sep 20', incoming: 450, resolved: 390 },
  { date: 'Sep 25', incoming: 380, resolved: 410 },
  { date: 'Sep 30', incoming: 420, resolved: 400 },
];

const PIE_DATA = [
  { name: 'Great', value: 70, color: '#3b82f6' },  // Blue
  { name: 'Okay', value: 20, color: '#cbd5e1' },   // Slate 300
  { name: 'Bad', value: 10, color: '#f87171' },    // Red 400
];

interface AgentStat {
  key: string;
  name: string;
  avatar: string;
  volume: number;
  avgTime: string;
  rating: number;
}

const Reports: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('30');
  
  // State for data
  const [overview, setOverview] = useState({
    totalConversations: 0,
    resolvedConversations: 0,
    avgCsat: '0.0',
    avgResponseTime: '--',
    resolutionRate: '0%'
  });
  const [volumeData, setVolumeData] = useState<any[]>(CHART_DATA_MOCK);
  const [agentData, setAgentData] = useState<AgentStat[]>([]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));
      
      const res = await api.get('/reports/dashboard', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });

      if (res.data.success) {
        const { overview, volume, agents } = res.data.data;
        
        // Calculate resolution rate
        const resolutionRate = overview.totalConversations > 0 
          ? Math.round((overview.resolvedConversations / overview.totalConversations) * 100) + '%'
          : '0%';

        setOverview({
          ...overview,
          resolutionRate
        });
        
        // Format volume data for chart
        if (volume && volume.length > 0) {
            setVolumeData(volume.map((v: any) => ({
                date: new Date(v.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                incoming: parseInt(v.incoming),
                resolved: parseInt(v.resolved)
            })));
        }

        setAgentData(agents || []);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      message.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [period]);

  // --- Components ---
  const StatCard = ({ title, value, change, icon, iconColor, suffix }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
      <div className="flex justify-between items-start">
         <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
         <div className={classNames("p-2 rounded-lg", iconColor)}>
            {icon}
         </div>
      </div>
      <div>
         <div className="flex items-baseline gap-3">
           <span className="text-4xl font-bold text-slate-900">{value}</span>
           {change && (
             <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
               {change}
             </span>
           )}
         </div>
         <p className="text-xs text-slate-400 mt-2">{suffix || 'vs. previous 30 days'}</p>
      </div>
    </div>
  );

  const agentColumns: ColumnsType<AgentStat> = [
    {
      title: t('reports.agentTable.agent'),
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar src={record.avatar} />
          <span className="font-medium text-slate-900">{record.name}</span>
        </div>
      )
    },
    {
      title: t('reports.agentTable.volume'),
      dataIndex: 'volume',
      key: 'volume',
      align: 'right',
      render: (val) => <span className="text-slate-600">{val}</span>
    },
    {
      title: t('reports.agentTable.avgTime'),
      dataIndex: 'avgTime',
      key: 'avgTime',
      align: 'right',
      render: (val) => <span className="text-slate-600">{val}</span>
    },
    {
      title: t('reports.agentTable.rating'),
      dataIndex: 'rating',
      key: 'rating',
      align: 'right',
      render: (val) => (
        <Tag color={val >= 4.8 ? 'green' : 'blue'} className="border-0 font-bold m-0">
          {val}
        </Tag>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('reports.title')}</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">{t('reports.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-3">
           <Select 
             value={period}
             onChange={setPeriod}
             className="w-40 h-10"
             options={[
               { value: '7', label: t('reports.period.last7') },
               { value: '30', label: t('reports.period.last30') },
               { value: '90', label: t('reports.period.last90') },
             ]}
             suffixIcon={<Calendar size={16} />}
           />
           <Button icon={<Filter size={16} />} className="h-10 flex items-center gap-2">
             {t('reports.filter')}
           </Button>
           <Button type="primary" icon={<Download size={16} />} className="bg-primary-600 h-10 flex items-center gap-2 font-medium">
             {t('reports.export')}
           </Button>
        </div>
      </div>

      {/* 2. Key Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard 
           title={t('reports.cards.totalConversations')} 
           value={overview.totalConversations.toLocaleString()} 
           change="--" 
           icon={<MessageSquare size={20} className="text-blue-600" />}
           iconColor="bg-blue-50"
         />
         <StatCard 
           title={t('reports.cards.avgResponseTime')} 
           value={overview.avgResponseTime} 
           change="--" 
           icon={<Clock size={20} className="text-orange-600" />}
           iconColor="bg-orange-50"
         />
         <StatCard 
           title={t('reports.cards.resolutionRate')} 
           value={overview.resolutionRate} 
           change="--" 
           icon={<CheckCircle size={20} className="text-green-600" />}
           iconColor="bg-green-50"
         />
         <StatCard 
           title={t('reports.cards.csat')} 
           value={overview.avgCsat} 
           change="--" 
           suffix="out of 5.0 scale"
           icon={<Smile size={20} className="text-purple-600" />}
           iconColor="bg-purple-50"
         />
      </div>

      {/* 3. Main Chart (Volume) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-8">
           <div>
             <h3 className="text-lg font-bold text-slate-900">{t('reports.charts.volume')}</h3>
             <p className="text-sm text-slate-500">{t('reports.charts.volumeSubtitle')}</p>
           </div>
           <div className="flex items-center gap-4 text-sm">
             <div className="flex items-center gap-2">
               <span className="w-3 h-3 rounded-full bg-primary-500"></span>
               <span className="text-slate-600">Incoming</span>
             </div>
             <div className="flex items-center gap-2">
               <span className="w-3 h-3 rounded-full bg-slate-200"></span>
               <span className="text-slate-600">Resolved</span>
             </div>
           </div>
        </div>
        
        <div className="h-[300px] w-full">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={volumeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
               <defs>
                 <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                   <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
               <XAxis 
                 dataKey="date" 
                 axisLine={false} 
                 tickLine={false} 
                 tick={{ fill: '#64748b', fontSize: 12 }} 
                 dy={10}
               />
               <YAxis 
                 axisLine={false} 
                 tickLine={false} 
                 tick={{ fill: '#64748b', fontSize: 12 }} 
               />
               <Tooltip 
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
               />
               <Area 
                 type="monotone" 
                 dataKey="incoming" 
                 stroke="#3b82f6" 
                 strokeWidth={3}
                 fillOpacity={1} 
                 fill="url(#colorIncoming)" 
               />
               <Area 
                 type="monotone" 
                 dataKey="resolved" 
                 stroke="#cbd5e1" 
                 strokeWidth={2}
                 strokeDasharray="5 5"
                 fill="none" 
               />
             </AreaChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Bottom Section (Agent Perf & CSAT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Agent Performance Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900">{t('reports.charts.agentPerf')}</h3>
            <Button type="link" className="text-primary-600 font-medium">View All</Button>
          </div>
          <Table 
             columns={agentColumns} 
             dataSource={agentData} 
             pagination={false} 
             className="flex-1"
          />
        </div>

        {/* CSAT Donut Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
           <div className="flex justify-between items-start mb-6">
             <h3 className="text-lg font-bold text-slate-900">{t('reports.charts.satisfaction')}</h3>
             <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={20} /></button>
           </div>
           
           <div className="flex-1 flex items-center justify-center relative">
              <div className="w-[200px] h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={PIE_DATA}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {PIE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <span className="text-4xl font-bold text-slate-900">{overview.avgCsat}</span>
                   <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Average</span>
                </div>
              </div>
           </div>

           <div className="mt-6 space-y-2">
              {PIE_DATA.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                     <span className="text-slate-600">{item.name}</span>
                   </div>
                   <span className="font-bold text-slate-900">{item.value}%</span>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;