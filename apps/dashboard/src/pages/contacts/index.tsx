import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Plus, 
  Upload as UploadIcon, 
  Filter, 
  ArrowUpDown, 
  LayoutGrid, 
  List, 
  Mail, 
  Phone, 
  Building2,
  MessageSquare,
  Pencil,
  Trash2
} from 'lucide-react';
import { Table, Button, Input, Avatar, Modal, Form, message, Tag, Popconfirm, Upload } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { UploadOutlined, DownloadOutlined, InboxOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import api from '../../lib/api';
import { useAuthStore } from '../../store/useAuthStore';

// --- 1. 定义数据类型 ---
interface Contact {
  id: number;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  companyName: string; // Mapped from company_name
  lastActive: string;  // Mapped from last_active
  tags: string[];
  status: 'online' | 'offline'; // Derived or stored
}

const Contacts: React.FC = () => {
  const { t } = useTranslation();
  const token = localStorage.getItem('access_token');
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [form] = Form.useForm();

  // Fetch Contacts
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/contacts');
      if (res.data.success) {
        // Map backend data to frontend interface
        const mappedData = res.data.data.map((item: any) => ({
          key: item.id.toString(),
          id: item.id,
          name: item.name,
          avatar: item.avatar || `https://ui-avatars.com/api/?name=${item.name}&background=random`,
          email: item.email || '--',
          phone: item.phone || '--',
          companyName: item.company_name || '--',
          lastActive: item.last_active ? new Date(item.last_active).toLocaleString() : '--',
          tags: item.tags || [],
          status: 'offline' // Default for now
        }));
        setContacts(mappedData);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      message.error(t('contacts.fetchError', 'Failed to load contacts'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // CRUD Operations
  const handleSave = async (values: any) => {
    try {
      const payload = {
        ...values,
        company_name: values.companyName,
        tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()) : []
      };

      if (currentContact) {
        await api.put(`/contacts/${currentContact.id}`, payload);
        message.success(t('contacts.updateSuccess', 'Contact updated successfully'));
      } else {
        await api.post('/contacts', payload);
        message.success(t('contacts.createSuccess', 'Contact created successfully'));
      }
      setIsModalOpen(false);
      form.resetFields();
      fetchContacts();
    } catch (error) {
      console.error('Failed to save contact:', error);
      message.error(t('contacts.saveError', 'Failed to save contact'));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/contacts/${id}`);
      message.success(t('contacts.deleteSuccess', 'Contact deleted successfully'));
      fetchContacts();
    } catch (error) {
      console.error('Failed to delete contact:', error);
      message.error(t('contacts.deleteError', 'Failed to delete contact'));
    }
  };

  const openEditModal = (contact: Contact) => {
    setCurrentContact(contact);
    form.setFieldsValue({
      name: contact.name,
      email: contact.email !== '--' ? contact.email : '',
      phone: contact.phone !== '--' ? contact.phone : '',
      companyName: contact.companyName !== '--' ? contact.companyName : '',
      tags: contact.tags.join(', ')
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setCurrentContact(null);
    form.resetFields();
    setIsModalOpen(true);
  };

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
            <span className="text-xs text-slate-400">ID: #{record.id}</span>
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
      width: 120,
      render: (_, record) => (
        <div className="flex items-center gap-2">
           <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
              <MessageSquare size={16} />
           </button>
           <button onClick={() => openEditModal(record)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors">
              <Pencil size={16} />
           </button>
           <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(record.id)}>
             <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                <Trash2 size={16} />
             </button>
           </Popconfirm>
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
          <Button 
            icon={<UploadIcon size={16} />} 
            className="flex items-center h-10 border-slate-300 text-slate-700 font-medium"
            onClick={() => setIsImportModalOpen(true)}
          >
            {t('contacts.import')}
          </Button>
          <Button type="primary" icon={<Plus size={18} />} onClick={openCreateModal} className="flex items-center h-10 bg-primary-600 hover:bg-primary-500 font-medium px-4">
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
          loading={loading}
          rowSelection={rowSelection}
          columns={columns} 
          dataSource={contacts}
          pagination={{ 
            total: contacts.length, 
            pageSize: 10, 
            showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} results`,
            className: "px-6 py-4"
          }}
          rowClassName="hover:bg-slate-50 transition-colors"
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        title={currentContact ? "Edit Contact" : "Add New Contact"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name="companyName" label="Company">
            <Input />
          </Form.Item>
          <Form.Item name="tags" label="Tags (comma separated)">
            <Input placeholder="VIP, Customer" />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">Save</Button>
          </div>
        </Form>
      </Modal>

      {/* Import Modal */}
      <Modal
        title={t('contacts.importTitle', 'Import Contacts')}
        open={isImportModalOpen}
        onCancel={() => setIsImportModalOpen(false)}
        footer={null}
      >
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="font-medium text-slate-800 mb-2">{t('contacts.step1', 'Step 1: Download Template')}</h4>
            <p className="text-sm text-slate-500 mb-3">
              {t('contacts.downloadTemplateDesc', 'Download the CSV template to ensure your data is formatted correctly.')}
            </p>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={async () => {
                try {
                  const response = await api.get('/contacts/template', { responseType: 'blob' });
                  const url = window.URL.createObjectURL(new Blob([response.data]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', 'contact_template.csv');
                  document.body.appendChild(link);
                  link.click();
                  link.parentNode?.removeChild(link);
                } catch (error) {
                  console.error('Download template failed:', error);
                  message.error(t('contacts.downloadError', 'Failed to download template'));
                }
              }}
            >
              {t('contacts.downloadTemplate', 'Download Template')}
            </Button>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="font-medium text-slate-800 mb-2">{t('contacts.step2', 'Step 2: Upload File')}</h4>
            <p className="text-sm text-slate-500 mb-3">
              {t('contacts.uploadDesc', 'Upload your filled CSV file here.')}
            </p>
            
            <Upload.Dragger
              name="file"
              multiple={false}
              action="http://localhost:3000/api/contacts/import"
              headers={{
                Authorization: `Bearer ${token}`
              }}
              onChange={(info) => {
                const { status } = info.file;
                if (status === 'done') {
                  message.success(`${info.file.name} file uploaded successfully.`);
                  setIsImportModalOpen(false);
                  fetchContacts();
                } else if (status === 'error') {
                  message.error(`${info.file.name} file upload failed.`);
                }
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">
                Support for a single CSV file upload.
              </p>
            </Upload.Dragger>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Contacts;
