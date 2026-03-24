import React, { useState, useEffect } from 'react';
import { api } from '../store/authStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { useNotification } from '../components/Notification';
import { userSchema } from '../utils/schemas';
import { SearchableSelect } from '../components/SearchableSelect';
import { Search, UserPlus, Mail, Shield, Building2, Trash2, Edit2 } from 'lucide-react';



export const Users = () => {
  const { showNotification } = useNotification();
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'user',
      clientId: ''
    }
  });

  const selectedRole = watch('role');
  const selectedClientId = watch('clientId');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, clientRes] = await Promise.all([
        api.get('/users'),
        api.get('/clients')
      ]);
      setUsers(Array.isArray(userRes.data) ? userRes.data : []);
      setClients(Array.isArray(clientRes.data) ? clientRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      reset({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        clientId: user.clientId?._id || user.clientId || ''
      });
    } else {
      setEditingUser(null);
      reset({
        name: '',
        email: '',
        password: '',
        role: 'user',
        clientId: ''
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = { ...data };
      if (editingUser && !payload.password) delete payload.password;
      
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, payload);
        showNotification('User updated successfully');
      } else {
        await api.post(`/users`, payload);
        showNotification('Team member added successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error saving user', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      try {
        await api.delete(`/users/${id}`);
        showNotification('Team member removed', 'info');
        fetchData();
      } catch (error) {
        showNotification('Error deleting user', 'error');
      }
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading tracking-tight">Team Members</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium italic">Manage roles, permissions, and client links with Zod validation.</p>
        </div>
        <Button onClick={() => handleOpenModal()} variant="primary" className="gap-2 shadow-xl shadow-primary-500/20 active:scale-95 transition-transform">
          <UserPlus size={18} />
          Add Member
        </Button>
      </div>

      <Card className="!p-0 overflow-hidden border-transparent shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 flex flex-col md:flex-row gap-4 items-center justify-between font-medium">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">Filter :</span>
            <button onClick={() => setSearchTerm('admin')} className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-all shadow-sm">Admins</button>
            <button onClick={() => setSearchTerm('client')} className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-all shadow-sm">Clients</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Member Profile</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Designation</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Client Attachment</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Onboarding</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400 text-sm animate-pulse">Synchronizing team data...</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-all group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-black text-xl shadow-lg border-2 border-primary-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-black text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors capitalize text-sm uppercase tracking-tight">{user.name}</span>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full w-fit">
                          <Mail size={10} className="text-primary-500" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest ${
                        user.role === 'admin' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                        user.role === 'client' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                      }`}>
                        <Shield size={12} strokeWidth={3} />
                        {user.role}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {user.clientId ? (
                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 font-bold bg-gray-50 dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 w-fit">
                        <Building2 size={14} className="text-primary-500" />
                        <span className="truncate max-w-[150px]">{user.clientId.company || user.clientId.name}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-300 font-black uppercase tracking-tighter">Internal Personnel</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-[11px] font-black text-gray-500 dark:text-gray-400 font-mono">
                    {new Date(user.createdAt).toLocaleDateString().replace(/\//g, ' . ')}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2.5">
                      <button onClick={() => handleOpenModal(user)} className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/40 rounded-xl transition-all hover:shadow-lg active:scale-90">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(user._id)} className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded-xl transition-all hover:shadow-lg active:scale-90">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Profile Orchestration' : 'Onboard Team Member'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
          <Input 
            label="Full Display Name"
            {...register('name')}
            error={errors.name?.message}
            placeholder="e.g. Rishank Patel"
          />
          <Input 
            label="Professional Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            placeholder="xyz@company.com"
          />
          <Input 
            label={editingUser ? "Security Refresh (Empty = Unchanged)" : "Master Access Key"}
            type="password"
            {...register('password')}
            error={errors.password?.message}
            placeholder="••••••••••••"
          />
          <div className="grid grid-cols-2 gap-5">
            <SearchableSelect 
              label="System Privilege"
              options={[
                { value: 'admin', label: 'Admin' },
                { value: 'user', label: 'User' },
                { value: 'client', label: 'Client' }
              ]}
              value={watch('role')}
              onChange={(val) => setValue('role', val, { shouldValidate: true })}
              placeholder="Select privilege..."
              error={errors.role?.message}
            />
            {selectedRole === 'Client' && (
              <SearchableSelect 
                label="Affiliated Organization"
                options={clients.map(c => ({ value: c._id, label: c.company || c.name }))}
                value={selectedClientId}
                onChange={(val) => setValue('clientId', val, { shouldValidate: true })}
                placeholder="Select Organization"
                error={errors.clientId?.message}
                required
              />
            )}
          </div>
          <div className="pt-4">
            <Button type="submit" variant="primary" className="w-full py-4 !rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-primary-500/30">
              {editingUser ? 'Synchronize Record' : 'Initialize Account'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
