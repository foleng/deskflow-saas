import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  Bell, 
  Users, 
  ShieldCheck, 
  Settings as SettingsIcon, 
  CreditCard, 
  Grid, 
  Webhook,
  Search,
  Plus,
  Mail,
  Edit2,
  Trash2,
  Upload as UploadIcon
} from 'lucide-react';
import { Input, Button, Avatar, Table, Select, Tag, App, Upload, Modal, Form, Checkbox, Row, Col, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import classNames from 'classnames';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/api';

// --- Types ---
interface TeamMember {
  key: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: 'online' | 'away' | 'invited';
}

interface Permission {
  action: string;
  subject: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt?: string;
  updatedAt?: string;
}

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const [activeMenu, setActiveMenu] = useState('agents');
  
  const { user, updateProfile } = useAuthStore();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<TeamMember[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  
  // Roles State
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [roleForm] = Form.useForm();

  const [formState, setFormState] = useState({
    nickname: user?.nickname || '',
    password: '',
  });

  useEffect(() => {
    if (user) {
        setFormState(prev => ({ ...prev, nickname: user.nickname || '' }));
    }
  }, [user]);

  useEffect(() => {
      if (activeMenu === 'agents') {
          fetchAgents();
          fetchRoles(); // Need roles for the dropdown
      }
      if (activeMenu === 'roles') {
          fetchRoles();
          fetchAgents(); // Need agents for count
      }
  }, [activeMenu]);

  const fetchAgents = async () => {
      setLoadingAgents(true);
      try {
          const res = await api.get<any[]>('/agents');
          const mappedAgents: TeamMember[] = res.data.map(agent => ({
              key: agent.id.toString(),
              name: agent.nickname || 'Unknown',
              email: agent.email || '',
              avatar: agent.avatar?.startsWith('/uploads') ? `http://localhost:3000${agent.avatar}` : (agent.avatar || "https://i.pravatar.cc/150?u=" + agent.id),
              role: agent.role || 'agent',
              status: 'online' // Mock status for now
          }));
          setAgents(mappedAgents);
      } catch (error) {
          console.error(error);
          message.error('Failed to load agents');
      } finally {
          setLoadingAgents(false);
      }
  };

  const fetchRoles = async () => {
      setLoadingRoles(true);
      try {
          const res = await api.get<Role[]>('/roles');
          setRoles(res.data);
      } catch (error) {
          console.error(error);
          message.error('Failed to load roles');
      } finally {
          setLoadingRoles(false);
      }
  };

  const handleUpdateRole = async (id: string, newRole: string) => {
    try {
      await api.put(`/agents/${id}`, { role: newRole });
      message.success('Role updated successfully');
      fetchAgents(); 
    } catch (error) {
      console.error(error);
      message.error('Failed to update role');
    }
  };

  const handleSaveRole = async () => {
      try {
          const values = await roleForm.validateFields();
          // Transform permissions from form values
          const permissions: Permission[] = [];
          
          if (values.isAdmin) {
              permissions.push({ action: 'manage', subject: 'all' });
          } else {
              Object.keys(values).forEach(key => {
                  if (key.startsWith('perm_') && values[key]) {
                      const [, subject, action] = key.split('_');
                      permissions.push({ action, subject });
                  }
              });
              // Always add basic read access
              permissions.push({ action: 'read', subject: 'all' });
          }

          const roleData = {
              name: values.name,
              description: values.description,
              permissions
          };

          if (currentRole) {
              await api.put(`/roles/${currentRole.id}`, roleData);
              message.success('Role updated');
          } else {
              await api.post('/roles', roleData);
              message.success('Role created');
          }
          setIsRoleModalVisible(false);
          fetchRoles();
      } catch (error) {
          console.error(error);
          message.error('Failed to save role');
      }
  };

  const handleDeleteRole = async (id: number) => {
      try {
          await api.delete(`/roles/${id}`);
          message.success('Role deleted');
          fetchRoles();
      } catch (error) {
          message.error('Cannot delete system roles or role in use');
      }
  };

  const openRoleModal = (role: Role | null) => {
      setCurrentRole(role);
      if (role) {
          const initialValues: any = {
              name: role.name,
              description: role.description,
              isAdmin: role.permissions.some(p => p.action === 'manage' && p.subject === 'all')
          };
          role.permissions.forEach(p => {
              initialValues[`perm_${p.subject}_${p.action}`] = true;
          });
          roleForm.setFieldsValue(initialValues);
      } else {
          roleForm.resetFields();
      }
      setIsRoleModalVisible(true);
  };

  const handleUpdateProfile = async () => {
      setLoading(true);
      try {
          await updateProfile({
              nickname: formState.nickname,
              password: formState.password || undefined
          });
          message.success('Profile updated successfully');
          setFormState(prev => ({ ...prev, password: '' }));
      } catch (error) {
          console.error(error);
          message.error('Failed to update profile');
      } finally {
          setLoading(false);
      }
  };

  // --- Sub-Sidebar Menu Configuration ---
  const MENU_SECTIONS = [
    {
      title: 'settings.menu.account',
      items: [
        { key: 'profile', label: 'settings.menu.profile', icon: <User size={18} /> },
        { key: 'notifications', label: 'settings.menu.notifications', icon: <Bell size={18} /> },
      ]
    },
    {
      title: 'settings.menu.team',
      items: [
        { key: 'agents', label: 'settings.menu.agents', icon: <Users size={18} /> },
        { key: 'roles', label: 'settings.menu.roles', icon: <ShieldCheck size={18} /> },
      ]
    },
    {
      title: 'settings.menu.org',
      items: [
        { key: 'general', label: 'settings.menu.general', icon: <SettingsIcon size={18} /> },
        { key: 'billing', label: 'settings.menu.billing', icon: <CreditCard size={18} /> },
      ]
    },
    {
      title: 'settings.menu.integrations',
      items: [
        { key: 'apps', label: 'settings.menu.apps', icon: <Grid size={18} /> },
        { key: 'webhooks', label: 'settings.menu.webhooks', icon: <Webhook size={18} /> },
      ]
    }
  ];

  // --- Table Columns ---
  const columns: ColumnsType<TeamMember> = [
    {
      title: t('settings.team.columns.name'),
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
      title: t('settings.team.columns.email'),
      dataIndex: 'email',
      key: 'email',
      render: (text) => <span className="text-slate-600">{text}</span>
    },
    {
      title: t('settings.team.columns.role'),
      dataIndex: 'role',
      key: 'role',
      render: (role, record) => {
        const isAdmin = user?.role === 'admin';
        
        if (!isAdmin) {
            return <Tag color="blue" className="capitalize">{role}</Tag>;
        }

        return (
            <Select 
                defaultValue={role} 
                style={{ width: 140 }} 
                onChange={(value) => handleUpdateRole(record.key, value)}
                options={roles.map(r => ({ value: r.name, label: r.name }))}
            />
        );
      }
    },
    {
      title: t('settings.team.columns.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <div className="flex items-center gap-2">
           <div className={classNames("w-2 h-2 rounded-full", {
             'bg-green-500': status === 'online',
             'bg-slate-300': status === 'away',
             'border border-slate-300 bg-white': status === 'invited'
           })}></div>
           <span className={classNames("capitalize text-sm", {
             'text-slate-900': status === 'online',
             'text-slate-500': status === 'away',
             'text-slate-400 italic': status === 'invited'
           })}>{status}</span>
        </div>
      )
    },
    {
      title: '',
      key: 'actions',
      render: () => (
        <div className="flex gap-2">
          <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded transition-colors"><Edit2 size={16} /></button>
          <button className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  // --- Render Content Area ---
  const renderContent = () => {
    if (activeMenu === 'profile') {
      return (
        <div className="max-w-2xl space-y-6 animate-in fade-in duration-500">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t('settings.menu.profile')}</h2>
            <p className="text-slate-500 mt-1">Manage your account information</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
             {/* Avatar */}
             <div className="flex items-center gap-4">
               <Avatar 
                  size={80} 
                  src={user?.avatar?.startsWith('/uploads') ? `http://localhost:3000${user.avatar}` : user?.avatar} 
                  icon={<User size={40} />} 
                  className="bg-slate-100 text-slate-400" 
               />
               <div>
                 <Upload 
                    customRequest={async (options) => {
                        const { file, onSuccess, onError } = options;
                        const formData = new FormData();
                        formData.append('file', file as any);
                        
                        try {
                            const res = await api.post<{ url: string }>('/upload/local', formData, {
                                headers: { 'Content-Type': 'multipart/form-data' }
                            });
                            await updateProfile({ avatar: res.data.url });
                            onSuccess && onSuccess(res.data);
                            message.success('Avatar updated successfully');
                        } catch (err) {
                            console.error(err);
                            onError && onError(err as any);
                            message.error('Failed to upload avatar');
                        }
                    }}
                    showUploadList={false}
                 >
                    <Button icon={<UploadIcon size={16} />}>Change Avatar</Button>
                 </Upload>
                 <p className="text-xs text-slate-400 mt-2">JPG, GIF or PNG. Max size of 800K</p>
               </div>
             </div>

             <div className="grid grid-cols-1 gap-6">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Nickname</label>
                 <Input 
                    value={formState.nickname} 
                    onChange={(e) => setFormState(prev => ({ ...prev, nickname: e.target.value }))} 
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                 <Input value={user?.email} disabled />
                 <p className="text-xs text-slate-400 mt-1">Contact admin to change email</p>
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                 <Input.Password 
                    placeholder="Leave blank to keep current"
                    value={formState.password}
                    onChange={(e) => setFormState(prev => ({ ...prev, password: e.target.value }))}
                 />
               </div>
             </div>
             
             <div className="pt-4 border-t border-slate-100 flex justify-end">
               <Button type="primary" loading={loading} onClick={handleUpdateProfile}>Save Changes</Button>
             </div>
          </div>
        </div>
      );
    }

    if (activeMenu === 'agents') {
      return (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Header */}
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{t('settings.team.title')}</h2>
              <p className="text-slate-500 mt-1">{t('settings.team.subtitle')}</p>
            </div>
            <Button type="primary" icon={<Plus size={18} />} className="bg-primary-600 h-10 px-4 font-medium">
               {t('settings.team.addAgent')}
            </Button>
          </div>

          {/* Filters Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
             <div className="flex-1 relative">
               <Input prefix={<Search size={18} className="text-slate-400 mr-2" />} placeholder={t('settings.team.searchPlaceholder')} className="bg-slate-50 border-slate-200 h-10" />
             </div>
             <Select 
               defaultValue="all" 
               className="w-40 h-10"
               options={[{ value: 'all', label: t('settings.team.filterRole') }]}
             />
             <Select 
               defaultValue="active" 
               className="w-40 h-10"
               options={[{ value: 'active', label: t('settings.team.filterStatus') }]}
             />
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <Table 
               columns={columns} 
               dataSource={agents} 
               loading={loadingAgents}
               pagination={{ pageSize: 5 }}
             />
          </div>
          
          {/* Empty State for Invited (Design Element) */}
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/50">
             <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
               <Mail size={24} className="text-slate-400" />
             </div>
             <h3 className="text-slate-900 font-bold">No pending invites</h3>
             <p className="text-slate-500 text-sm mt-1 max-w-sm">
               When you invite new team members, they will appear here until they accept the invitation.
             </p>
          </div>
        </div>
      );
    }

    if (activeMenu === 'roles') {
        const roleColumns = [
            { title: 'Role', dataIndex: 'name', key: 'name', render: (text: string) => <span className="font-bold capitalize">{text}</span> },
            { title: 'Description', dataIndex: 'description', key: 'description' },
            { title: 'Users', key: 'users', render: (_: any, record: Role) => {
                const count = agents.filter(a => a.role === record.name).length;
                return <Tag color="blue">{count} Users</Tag>;
            }},
            { 
                title: 'Action', 
                key: 'action', 
                render: (_: any, record: Role) => (
                    <div className="flex gap-2">
                        <Button type="link" size="small" onClick={() => openRoleModal(record)}>Edit</Button>
                        {!['admin', 'agent'].includes(record.name) && (
                            <Button type="link" danger size="small" onClick={() => handleDeleteRole(record.id)}>Delete</Button>
                        )}
                    </div>
                )
            }
        ];

        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{t('settings.menu.roles')}</h2>
                <p className="text-slate-500 mt-1">View and manage system roles and permissions.</p>
              </div>
              <Button type="primary" icon={<Plus size={18} />} onClick={() => openRoleModal(null)}>
                  Create Role
              </Button>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <Table 
                 columns={roleColumns} 
                 dataSource={roles} 
                 rowKey="id"
                 loading={loadingRoles}
                 pagination={false}
               />
            </div>

            <Modal
                title={currentRole ? "Edit Role" : "Create Role"}
                open={isRoleModalVisible}
                onOk={handleSaveRole}
                onCancel={() => setIsRoleModalVisible(false)}
                width={700}
            >
                <Form form={roleForm} layout="vertical">
                    <Form.Item name="name" label="Role Name" rules={[{ required: true }]}>
                        <Input disabled={currentRole && ['admin', 'agent'].includes(currentRole.name)} />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea />
                    </Form.Item>
                    
                    <Form.Item name="isAdmin" valuePropName="checked">
                        <Checkbox onChange={(e) => {
                            if (e.target.checked) {
                                // Clear other permissions if admin is selected (Admin implies all)
                            }
                        }}>
                            <span className="font-bold">Administrator Access (Full Permissions)</span>
                        </Checkbox>
                    </Form.Item>

                    <Form.Item shouldUpdate={(prev, curr) => prev.isAdmin !== curr.isAdmin}>
                        {({ getFieldValue }) => {
                            const isAdmin = getFieldValue('isAdmin');
                            if (isAdmin) return <div className="text-slate-500">Administrators have full access to all resources.</div>;

                            return (
                                <div className="space-y-4">
                                    <h4 className="font-medium border-b pb-2">Permissions</h4>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <Card title="Agents" size="small">
                                            <Form.Item name="perm_Agent_create" valuePropName="checked" noStyle><Checkbox>Create Agents</Checkbox></Form.Item><br/>
                                            <Form.Item name="perm_Agent_update" valuePropName="checked" noStyle><Checkbox>Update Agents</Checkbox></Form.Item><br/>
                                            <Form.Item name="perm_Agent_delete" valuePropName="checked" noStyle><Checkbox>Delete Agents</Checkbox></Form.Item>
                                        </Card>
                                        <Card title="Roles" size="small">
                                            <Form.Item name="perm_Role_create" valuePropName="checked" noStyle><Checkbox>Create Roles</Checkbox></Form.Item><br/>
                                            <Form.Item name="perm_Role_update" valuePropName="checked" noStyle><Checkbox>Update Roles</Checkbox></Form.Item><br/>
                                            <Form.Item name="perm_Role_delete" valuePropName="checked" noStyle><Checkbox>Delete Roles</Checkbox></Form.Item>
                                        </Card>
                                        {/* Add more resources as needed */}
                                    </div>
                                </div>
                            );
                        }}
                    </Form.Item>
                </Form>
            </Modal>
            
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm">
                <p><strong>Note:</strong> Custom permissions allow fine-grained access control.</p>
            </div>
          </div>
        );
    }

    return (
      <div className="flex items-center justify-center h-full text-slate-400">
         Module under construction
      </div>
    );
  };

  return (
    <div className="flex gap-8 items-start">
       {/* 1. Sub-Sidebar Navigation */}
       <div className="w-64 shrink-0 space-y-8 sticky top-8">
         <div>
           <h1 className="text-2xl font-bold text-slate-900 mb-1">{t('settings.title')}</h1>
           <p className="text-sm text-slate-500">{t('settings.subtitle')}</p>
         </div>

         <div className="space-y-6">
           {MENU_SECTIONS.map((section, idx) => (
             <div key={idx}>
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
                 {t(section.title as any)}
               </h4>
               <div className="space-y-0.5">
                 {section.items.map(item => (
                   <button
                     key={item.key}
                     onClick={() => setActiveMenu(item.key)}
                     className={classNames(
                       "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                       {
                         "bg-white text-primary-600 shadow-sm ring-1 ring-slate-200": activeMenu === item.key,
                         "text-slate-600 hover:bg-slate-100 hover:text-slate-900": activeMenu !== item.key
                       }
                     )}
                   >
                     <span className={activeMenu === item.key ? "text-primary-600" : "text-slate-400"}>{item.icon}</span>
                     {t(item.label as any)}
                   </button>
                 ))}
               </div>
             </div>
           ))}
         </div>
       </div>

       {/* 2. Main Content Area */}
       <div className="flex-1 min-w-0">
          {renderContent()}
       </div>
    </div>
  );
};

export default Settings;
