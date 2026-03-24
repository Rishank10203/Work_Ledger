import React, { useState, useEffect } from 'react';
import { api } from '../store/authStore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PhoneInput from 'react-phone-input-2';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { useNotification } from '../components/Notification';
import { clientSchema } from '../utils/schemas';
import { Plus, Mail, Building2, User, Globe, Phone, Edit2, Trash2 } from 'lucide-react';



export const Clients = () => {
  const { showNotification } = useNotification();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const { control, register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      phone: '',
      website: '',
      address: ''
    }
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data } = await api.get('/clients');
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (client = null) => {
    if (client) {
      setEditingClient(client);
      reset({
        name: client.name,
        email: client.email,
        company: client.company || '',
        phone: client.phone || '',
        website: client.website || '',
        address: client.address || ''
      });
    } else {
      setEditingClient(null);
      reset({
        name: '',
        email: '',
        company: '',
        phone: '',
        website: '',
        address: ''
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingClient) {
        await api.put(`/clients/${editingClient._id}`, data);
        showNotification('Client updated successfully');
      } else {
        await api.post(`/clients`, data);
        showNotification('Client added successfully');
      }
      setIsModalOpen(false);
      fetchClients();
    } catch (error) {
      const message = error.response?.data?.message || 'Error saving client';
      showNotification(message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await api.delete(`/clients/${id}`);
        showNotification('Client removed', 'info');
        fetchClients();
      } catch (error) {
        showNotification('Error deleting client', 'error');
      }
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading tracking-tight">Clients</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium italic">Manage your customer base with advanced validation.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2 shadow-xl shadow-primary-500/20 active:scale-95 transition-transform">
          <Plus size={18} />
          Add Client
        </Button>
      </div>

      <Card className="!p-0 border-transparent shadow-2xl overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Client / Company</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Contact Info</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center whitespace-nowrap">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400 text-sm animate-pulse">Loading clients...</td>
                </tr>
              ) : (Array.isArray(clients) && clients.length === 0) ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400 text-sm italic">No clients found. Click "Add Client" to get started.</td>
                </tr>
              ) : (
                Array.isArray(clients) && clients.map((client) => (
                  <tr key={client._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-all group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/40 dark:to-primary-800/20 flex items-center justify-center text-primary-600 dark:text-primary-400 shadow-sm border border-primary-100/50 dark:border-primary-800/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          <Building2 size={22} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-black text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors uppercase tracking-tight text-sm">{client.company || 'Private Client'}</span>
                          <span className="text-[11px] text-gray-500 font-bold flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full w-fit">
                            <User size={10} /> {client.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 font-bold">
                          <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded-md"><Mail size={12} className="text-primary-500" /></div>
                          {client.email}
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-500 font-black">
                             <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded-md"><Phone size={10} className="text-emerald-500" /></div>
                             {client.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-100 dark:border-emerald-800/50">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Active</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2.5">
                        <button 
                          onClick={() => handleOpenModal(client)}
                          className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all hover:shadow-lg active:scale-90"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(client._id)}
                          className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all hover:shadow-lg active:scale-90"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? 'Edit Client Record' : 'Register New Client'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
          <div className="grid grid-cols-2 gap-5">
            <Input 
              label="Contact Person"
              {...register('name')}
              error={errors.name?.message}
              placeholder="e.g. John Doe"
            />
            <Input 
              label="Company Legal Name"
              {...register('company')}
              error={errors.company?.message}
              placeholder="e.g. Acme Corp"
            />
          </div>
          <Input 
            label="Business Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            placeholder="billing@company.com"
          />
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] ml-1">Phone Number</label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    country={'us'}
                    value={field.value}
                    onChange={field.onChange}
                    inputClass="premium-phone-input"
                  />
                )}
              />
              {errors.phone && <p className="text-[10px] font-bold text-rose-500 ml-1 mt-1">{errors.phone.message}</p>}
            </div>
            <Input 
              label="Official Website"
              {...register('website')}
              error={errors.website?.message}
              placeholder="https://company.com"
            />
          </div>
          <div>
            <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] ml-1 mb-1.5 block">Business Address</label>
            <textarea 
              {...register('address')}
              className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${
                errors.address ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-gray-200 dark:border-gray-700'
              } rounded-2xl text-sm focus:outline-hidden focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all min-h-[100px] placeholder:text-gray-300`}
              placeholder="Headquarters address..."
            />
          </div>
          <div className="pt-4">
            <Button type="submit" variant="primary" className="w-full py-4 !rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-primary-500/30">
              {editingClient ? 'Update Record' : 'Save Client'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
