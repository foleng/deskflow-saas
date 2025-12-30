import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Plus, 
  Book, 
  Edit2, 
  Trash2,
  FileText,
  MoreHorizontal
} from 'lucide-react';
import { 
  Input, 
  Button, 
  Table, 
  Tag, 
  Modal, 
  Form, 
  Select, 
  message, 
  Dropdown, 
  Space 
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import api from '../../lib/api';

interface Article {
  key: string;
  id: number;
  title: string;
  content: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  updatedAt: string;
}

const KnowledgeBase: React.FC = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/knowledge');
      if (res.data.success) {
        const mappedData = res.data.data.map((item: any) => ({
          key: item.id.toString(),
          id: item.id,
          title: item.title,
          content: item.content,
          category: item.category,
          status: item.status,
          updatedAt: item.updatedAt,
        }));
        setArticles(mappedData);
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      message.error(t('knowledge.fetchError', 'Failed to load articles'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSave = async (values: any) => {
    try {
      if (currentArticle) {
        await api.put(`/knowledge/${currentArticle.id}`, values);
        message.success(t('knowledge.updateSuccess', 'Article updated successfully'));
      } else {
        await api.post('/knowledge', values);
        message.success(t('knowledge.createSuccess', 'Article created successfully'));
      }
      setIsModalOpen(false);
      form.resetFields();
      fetchArticles();
    } catch (error) {
      console.error('Failed to save article:', error);
      message.error(t('knowledge.saveError', 'Failed to save article'));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/knowledge/${id}`);
      message.success(t('knowledge.deleteSuccess', 'Article deleted successfully'));
      fetchArticles();
    } catch (error) {
      console.error('Failed to delete article:', error);
      message.error(t('knowledge.deleteError', 'Failed to delete article'));
    }
  };

  const openModal = (article: Article | null) => {
    setCurrentArticle(article);
    if (article) {
      form.setFieldsValue(article);
    } else {
      form.resetFields();
      form.setFieldsValue({ status: 'draft' });
    }
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'default';
      case 'archived': return 'warning';
      default: return 'default';
    }
  };

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchText.toLowerCase()) ||
    article.category?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<Article> = [
    {
      title: t('knowledge.columns.title'),
      dataIndex: 'title',
      key: 'title',
      render: (text) => (
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-slate-400" />
          <span className="font-medium text-slate-700">{text}</span>
        </div>
      ),
    },
    {
      title: t('knowledge.columns.category'),
      dataIndex: 'category',
      key: 'category',
      render: (text) => text ? <Tag>{text}</Tag> : '-',
    },
    {
      title: t('knowledge.columns.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {t(`knowledge.status.${status}`)}
        </Tag>
      ),
    },
    {
      title: t('knowledge.columns.updated'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: t('knowledge.columns.actions'),
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                label: t('common.edit', 'Edit'),
                icon: <Edit2 size={14} />,
                onClick: () => openModal(record),
              },
              {
                key: 'delete',
                label: t('common.delete', 'Delete'),
                icon: <Trash2 size={14} />,
                danger: true,
                onClick: () => {
                  Modal.confirm({
                    title: t('common.confirmDelete', 'Are you sure?'),
                    content: t('knowledge.deleteConfirm', 'This action cannot be undone.'),
                    onOk: () => handleDelete(record.id),
                  });
                },
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreHorizontal size={16} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Book className="w-8 h-8 text-blue-600" />
            {t('knowledge.title')}
          </h1>
          <p className="text-slate-500 mt-1">{t('knowledge.subtitle')}</p>
        </div>
        <Button 
          type="primary" 
          icon={<Plus size={18} />} 
          size="large"
          onClick={() => openModal(null)}
        >
          {t('knowledge.add')}
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex justify-between items-center">
        <Input 
          prefix={<Search size={18} className="text-slate-400" />}
          placeholder={t('knowledge.searchPlaceholder')} 
          className="max-w-md"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={filteredArticles} 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Modal */}
      <Modal
        title={currentArticle ? t('knowledge.editTitle', 'Edit Article') : t('knowledge.createTitle', 'Create Article')}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter title' }]}
          >
            <Input />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="category"
              label="Category"
            >
              <Select
                options={[
                  { value: 'General', label: 'General' },
                  { value: 'Technical', label: 'Technical' },
                  { value: 'Billing', label: 'Billing' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'published', label: 'Published' },
                  { value: 'archived', label: 'Archived' },
                ]}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: 'Please enter content' }]}
          >
            <Input.TextArea rows={10} />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default KnowledgeBase;
