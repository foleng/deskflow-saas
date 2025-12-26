import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Plus, 
  Upload, 
  Filter, 
  ArrowUpDown, 
  LayoutGrid, 
  List, 
  Mail, 
  Phone, 
  Building2,
  MessageSquare,
  Pencil
} from 'lucide-react';
import { Table, Button, Input, Avatar, Tag, Dropdown, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import classNames from 'classnames'; // 别忘了这个！

// --- 1. 定义数据类型 ---
interface Contact {
  key: string;
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  companyName: string;
  companyLogo?: string; // 简易处理，仅用颜色或Icon代替
  lastActive: string;
  tags: string[];
  status: 'online' | 'offline';
}

// --- 2. Mock 数据 ---
const CONTACTS_DATA: Contact[] = [
  {
    key: '1',
    id: '#8823',
    name: 'Alice Freeman',
    avatar: 'https://i.pravatar.cc/150?u=alice',
    email: 'alice@example.com',
    phone: '+1 555-0199',
    companyName: 'TechCorp',
    lastActive: '2 mins ago',
    tags: ['VIP', 'Support'],
    status: 'online'
  },
  {
    key: '2',
    id: '#8824',
    name: 'Bob Smith',
    avatar: 'https://i.pravatar.cc/150?u=bob',
    email: 'bob@test.com',
    phone: '+1 555-0200',
    companyName: '--',
    lastActive: '2 days ago',
    tags: ['New Lead'],
    status: 'offline'
  },
  {
    key: '3',
    id: '#8825',
    name: 'Charlie Davis',
    avatar: 'https://i.pravatar.cc/150?u=charlie',
    email: 'charlie@demo.com',
    phone: '+1 555-0201',
    companyName: 'Acme Inc',
    lastActive: '5 hours ago',
    tags: ['Customer'],
    status: 'offline'
  },
  {
    key: '4',
    id: '#8826',
    name: 'Diana Prince',
    avatar: 'https://i.pravatar.cc/150?u=diana',
    email: 'diana@mail.com',
    phone: '+1 555-0202',
    companyName: 'Global Ltd',
    lastActive: '1 day ago',
    tags: ['Urgent'],
    status: 'online'
  },
  {
    key: '5',
    id: '#8827',
    name: 'Eve Walker',
    avatar: 'https://i.pravatar.cc/150?u=eve',
    email: 'eve@test.co',
    phone: '+1 555-0203',
    companyName: 'Logistics Co',
    lastActive: '3 days ago',
    tags: [],
    status: 'offline'
  },
];

const Contacts: React.FC = () => {
  const { t } = useTranslation();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 多选配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  // --- 3. 辅助函数：根据 Tag 获取颜色 ---
  const getTagStyle = (tag: string) => {
    switch (tag) {
      case 'VIP': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'New Lead': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Customer': return 'bg-green-100 text-green-700 border-green-200';
      case 'Urgent': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  // --- 4. 表格列定义 ---
  const columns: ColumnsType<Contact> = [
    {
      title: t('contacts.columns.user'),
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="relative">
             <Avatar src={record.avatar} size={40} />
             {record.status === 'online' && (
               <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
             )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900">{record.name}</span>
            <span className="text-xs text-slate-400">ID: {record.id}</span>
          </div>
        </div>
      ),
    },
    {
      title: t('contacts.columns.contactInfo'),
      key: 'info',
      width: 250,
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <Mail size={14} className="text-slate-400" />
            <span>{record.email}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Phone size={14} className="text-slate-400" />
            <span>{record.phone}</span>
          </div>
        </div>
      ),
    },
    {
      title: t('contacts.columns.company'),
      dataIndex: 'companyName',
      key: 'company',
      render: (text) => (
        text !== '--' ? (
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Building2 size={16} />
            </div>
            <span className="font-medium text-slate-700">{text}</span>
          </div>
        ) : <span className="text-slate-400">--</span>
      ),
    },
    {
      title: t('contacts.columns.lastActive'),
      dataIndex: 'lastActive',
      key: 'lastActive',
      sorter: true,
      render: (text) => <span className="text-slate-600">{text}</span>,
    },
    {
      title: t('contacts.columns.tags'),
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <div className="flex flex-wrap gap-2">
          {tags.length > 0 ? tags.map(tag => (
            <span 
              key={tag} 
              className={classNames("px-2.5 py-0.5 rounded-full text-xs font-bold border", getTagStyle(tag))}
            >
              {tag}
            </span>
          )) : <span className="text-slate-400 text-xs">--</span>}
        </div>
      ),
    },
    {
      title: '', // Actions Column
      key: 'actions',
      width: 100,
      render: () => (
        <div className="flex items-center gap-2">
           <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
              <MessageSquare size={16} />
           </button>
           <button className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors">
              <Pencil size={16} />
           </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('contacts.title')}</h1>
          <p className="text-slate-500 mt-1">{t('contacts.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button icon={<Upload size={16} />} className="flex items-center h-10 border-slate-300 text-slate-700 font-medium">
            {t('contacts.import')}
          </Button>
          <Button type="primary" icon={<Plus size={18} />} className="flex items-center h-10 bg-primary-600 hover:bg-primary-500 font-medium px-4">
            {t('contacts.add')}
          </Button>
        </div>
      </div>

      {/* 2. Filters & Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-2 rounded-xl">
        {/* Search */}
        <div className="w-full md:w-96 relative">
           <Input 
             prefix={<Search size={18} className="text-slate-400 mr-2" />} 
             placeholder={t('contacts.searchPlaceholder')}
             className="h-10 bg-slate-50 border-slate-200 hover:bg-white focus:bg-white text-base rounded-lg"
           />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
           <Button className="flex items-center gap-2 h-10 text-slate-600 border-slate-200">
             <ArrowUpDown size={16} />
             <span>{t('contacts.sort')}</span>
           </Button>
           <Button className="flex items-center gap-2 h-10 text-slate-600 border-slate-200">
             <Filter size={16} />
             <span>{t('contacts.filter')}</span>
           </Button>
           
           <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>
           
           <div className="flex bg-slate-100 p-1 rounded-lg">
              <button className="p-1.5 bg-white rounded shadow-sm text-slate-900"><List size={18} /></button>
              <button className="p-1.5 text-slate-400 hover:text-slate-600"><LayoutGrid size={18} /></button>
           </div>
        </div>
      </div>

      {/* 3. Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table 
          rowSelection={rowSelection}
          columns={columns} 
          dataSource={CONTACTS_DATA}
          pagination={{ 
            total: 1240, 
            pageSize: 10, 
            showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} results`,
            className: "px-6 py-4"
          }}
          rowClassName="hover:bg-slate-50 transition-colors"
        />
      </div>
    </div>
  );
};

export default Contacts;