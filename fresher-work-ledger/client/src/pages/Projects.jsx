import React, { useState, useEffect } from 'react';
import { api } from '../store/authStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { useNotification } from '../components/Notification';
import { projectSchema } from '../utils/schemas';
import { SearchableSelect } from '../components/SearchableSelect';
import { Plus, FolderKanban, Trash2, Edit2, Calendar, Layout, Building2 } from 'lucide-react';



export const Projects = () => {
  const { showNotification } = useNotification();
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'Active',
      clientId: '',
      startDate: '',
      endDate: ''
    }
  });

  const selectedClientId = watch('clientId');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projRes, clientRes] = await Promise.all([
        api.get('/projects'),
        api.get('/clients')
      ]);
      setProjects(Array.isArray(projRes.data) ? projRes.data : []);
      setClients(Array.isArray(clientRes.data) ? clientRes.data : []);
    } catch (error) {
      console.error('[Projects] Error fetching data:', error.response?.data || error.message);
      setProjects([]);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      reset({
        name: project.name,
        description: project.description || '',
        status: project.status,
        clientId: project.clientId?._id || project.clientId || '',
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        endDate: project.endDate ? project.endDate.split('T')[0] : ''
      });
    } else {
      setEditingProject(null);
      reset({
        name: '',
        description: '',
        status: 'Active',
        clientId: '',
        startDate: '',
        endDate: ''
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    console.log("Submitting Project Payload:", data);
    try {
      let response;
      if (editingProject) {
        response = await api.put(`/projects/${editingProject._id}`, data);
        showNotification('Project updated successfully');
      } else {
        response = await api.post(`/projects`, data);
        showNotification('New project created');
      }
      console.log("Server Response:", response.data);
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Submission Error:", error.response?.data || error);
      showNotification(error.response?.data?.message || 'Error saving project', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/projects/${id}`);
        showNotification('Project deleted', 'info');
        fetchData();
      } catch (error) {
        showNotification('Error deleting project', 'error');
      }
    }
  };

  return (
    <div className="h-full flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white font-heading tracking-tight uppercase">Project Ecosystem</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium italic">High-performance project orchestration and monitoring.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2.5 py-4 px-6 shadow-2xl shadow-primary-500/30 active:scale-95 transition-all !rounded-2xl font-black uppercase tracking-widest text-xs">
          <Plus size={20} strokeWidth={3} />
          Initialize Project
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map(i => <Card key={i} className="h-64 animate-pulse bg-white/50 dark:bg-gray-800/40 border-none shadow-sm" />)
        ) : (
          Array.isArray(projects) && projects.map(project => (
            <Card key={project._id} animate className="group flex flex-col !rounded-[2rem] border-transparent shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl relative overflow-hidden p-7 border border-white/20">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                <div className="flex gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                  <button onClick={() => handleOpenModal(project)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/40 rounded-xl transition-all">
                    <Edit2 size={16} strokeWidth={2.5} />
                  </button>
                  <button onClick={() => handleDelete(project._id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded-xl transition-all">
                    <Trash2 size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-5 mb-6">
                <div className="h-14 w-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-500/20 group-hover:rotate-12 transition-all duration-500 shrink-0">
                  <FolderKanban size={28} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white truncate uppercase tracking-tight leading-tight">{project.name}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-primary-600 dark:text-primary-400 mt-0.5 tracking-[0.1em]">
                    <Building2 size={12} strokeWidth={3} />
                    {project.clientId?.company || project.clientId?.name || 'Internal Dev'}
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed font-medium mb-6 min-h-[32px]">
                {project.description || 'No strategy documented for this project yet.'}
              </p>

              <div className="space-y-5 mt-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700">
                    <Calendar size={14} className="text-primary-500" strokeWidth={2.5} />
                    <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase">
                      {project.endDate ? new Date(project.endDate).toLocaleDateString().replace(/\//g, ' . ') : 'Open Ended'}
                    </span>
                  </div>
                  <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border-2 shadow-sm ${
                    project.status === 'Active' ? 'bg-emerald-50 border-emerald-100 text-emerald-600 shadow-emerald-500/10' : 
                    project.status === 'Completed' ? 'bg-blue-50 border-blue-100 text-blue-600 shadow-blue-500/10' :
                    'bg-amber-50 border-amber-100 text-amber-600 shadow-amber-500/10'
                  }`}>
                    {project.status}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-400">Development Velocity</span>
                    <span className="text-primary-600">82%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden border border-gray-50 dark:border-gray-700">
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full w-[82%] shadow-[0_0_15px_rgba(15,118,110,0.3)]" />
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Strategic Realignment' : 'Project Initialization'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
          <Input 
            label="Project Mission Name"
            {...register('name')}
            error={errors.name?.message}
            placeholder="e.g. Operation Alpha"
          />
          <SearchableSelect 
            label="Client / Organization"
            options={clients.map(c => ({ value: c._id, label: c.company || c.name }))}
            value={selectedClientId}
            onChange={(val) => setValue('clientId', val, { shouldValidate: true })}
            placeholder="Search and select a partner..."
            error={errors.clientId?.message}
            required
          />
          <div className="grid grid-cols-2 gap-5">
            <Input 
              label="Mission Start"
              type="date"
              {...register('startDate')}
              error={errors.startDate?.message}
            />
            <Input 
              label="Operational Deadline"
              type="date"
              {...register('endDate')}
              error={errors.endDate?.message}
            />
          </div>
            <SearchableSelect 
              label="Deployment Status"
              options={[
                { value: 'Active', label: 'Operational / Active' },
                { value: 'On Hold', label: 'Tactical Pause / On Hold' },
                { value: 'Completed', label: 'Mission Success / Completed' }
              ]}
              value={watch('status')}
              onChange={(val) => setValue('status', val, { shouldValidate: true })}
              placeholder="Select status..."
              error={errors.status?.message}
            />
          <div className="space-y-1.5">
             <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] ml-1">Strategy Overview</label>
             <textarea 
              {...register('description')}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all min-h-[100px] placeholder:text-gray-300"
              placeholder="Outline the mission parameters and objectives..."
            />
          </div>
          <div className="pt-4">
            <Button type="submit" variant="primary" className="w-full py-4 !rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-primary-500/30">
              {editingProject ? 'Execute Realignment' : 'Confirm Launch'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
