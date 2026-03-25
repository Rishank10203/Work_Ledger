import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, useAuthStore } from '../store/authStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { useNotification } from '../components/Notification';
import { taskSchema } from '../utils/schemas';
import { SearchableSelect } from '../components/SearchableSelect';
import { Plus, Clock, MoreVertical, LayoutGrid, ListTodo, CheckCircle2, AlertCircle, Edit2, Trash2, Filter, ChevronDown, UserCircle, GripVertical, FolderKanban, CheckCircle, Circle, X, CheckSquare, Paperclip } from 'lucide-react';



const COLUMNS = [
  { id: 'todo', title: 'To Do', icon: ListTodo, color: 'text-gray-400', bg: 'bg-gray-100/50', border: 'border-gray-200' },
  { id: 'inprogress', title: 'In Progress', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50/50', border: 'border-blue-100' },
  { id: 'review', title: 'Review', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50/50', border: 'border-amber-100' },
  { id: 'done', title: 'Done', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50/50', border: 'border-emerald-100' },
];

export const Tasks = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const { showNotification } = useNotification();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [subTasks, setSubTasks] = useState([]);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [newSubTaskFiles, setNewSubTaskFiles] = useState(null);
  const [editingSubTaskId, setEditingSubTaskId] = useState(null);
  const [editingSubTaskTitle, setEditingSubTaskTitle] = useState('');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      priority: 'Medium',
      projectId: '',
      assignedUser: '',
      estimatedHours: 1,
      isBillable: true
    }
  });

  const formProjectId = watch('projectId');
  const formAssignedUser = watch('assignedUser');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [selectedProject]);

  const fetchInitialData = async () => {
    try {
      const [projRes, userRes] = await Promise.all([
        api.get('/projects'),
        api.get('/users')
      ]);
      const fetchedProjects = Array.isArray(projRes.data) ? projRes.data : [];
      const fetchedUsers = Array.isArray(userRes.data) ? userRes.data : [];
      setProjects(fetchedProjects);
      setUsers(fetchedUsers);
      // Auto-select first project if available
      if (fetchedProjects.length > 0 && !selectedProject) {
        setSelectedProject(fetchedProjects[0]._id);
      }
      console.log('[Tasks] User role:', user?.role, '| isAdmin:', user?.role === 'admin');
      console.log('[Tasks] Projects loaded:', fetchedProjects.length, '| Users loaded:', fetchedUsers.length);
    } catch (error) {
      console.error('[fetchInitialData] Error:', error.response?.data || error.message, '| Status:', error.response?.status);
      setProjects([]);
      setUsers([]);
    }
  };

  const fetchTasks = async () => {
    if (!selectedProject) return;
    setLoading(true);
    try {
      console.log('[fetchTasks] Fetching tasks for projectId:', selectedProject);
      const { data } = await api.get(`/tasks/by-project/${selectedProject}`);
      setTasks(Array.isArray(data) ? data : []);
      console.log(`[fetchTasks] Loaded ${data?.length || 0} tasks`);
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      console.error('[fetchTasks] Error:', msg, '| Status:', error.response?.status);
      setTasks([]);
      if (error.response?.status === 403) {
        showNotification('Access Denied: You are not authorized to view these tasks.', 'error');
      } else {
        showNotification('Failed to load tasks. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (task = null) => {
    // All roles can OPEN the modal; backend enforces creation/edit rights
    if (task) {
      setEditingTask(task);
      reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        projectId: task.projectId?._id || task.projectId || selectedProject,
        assignedUser: task.assignedUser?._id || task.assignedUser || '',
        estimatedHours: task.estimatedHours || 1,
        isBillable: task.isBillable
      });
    } else {
      setEditingTask(null);
      reset({
        title: '',
        description: '',
        status: 'todo',
        priority: 'Medium',
        projectId: selectedProject,
        assignedUser: '',
        estimatedHours: 1,
        isBillable: true
      });
    }
    setIsModalOpen(true);
  };

  const onTaskSubmit = async (data) => {
    console.log('[onTaskSubmit] Submitting Task Payload:', data);
    try {
      let response;
      if (editingTask) {
        response = await api.put(`/tasks/${editingTask._id}`, data);
        showNotification('Task updated successfully!');
      } else {
        response = await api.post(`/tasks`, data);
        showNotification('Task created successfully!');
      }
      console.log('[onTaskSubmit] Server Response:', response.data);
      setIsModalOpen(false);
      fetchTasks();
    } catch (error) {
      console.error('[onTaskSubmit] Error:', error.response?.data || error);
      showNotification(error.response?.data?.message || 'Task operation failed', 'error');
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Erase this task entry?')) {
      try {
        await api.delete(`/tasks/${id}`);
        showNotification('Task deleted.', 'info');
        fetchTasks();
      } catch (error) {
        const msg = error.response?.data?.message || 'Delete failed';
        console.error('[handleDeleteTask] Error:', msg);
        showNotification(msg, 'error');
      }
    }
  };
  const handleOpenDetail = async (task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
    
    // IMPORTANT FIX: debugging log and check before fetch
    const taskId = task?._id;
    console.log("Fetching subtasks for taskId:", taskId);
    
    if (!taskId) {
      console.error("Task ID missing");
      return;
    }

    try {
      const { data } = await api.get(`/subtasks/${taskId}`);
      setSubTasks(data);
    } catch (error) {
      console.error('Error fetching subtasks:', error);
    }
  };

  const handleAddSubTask = async (e) => {
    e.preventDefault();
    if (!newSubTaskTitle.trim()) return;

    const formData = new FormData();
    formData.append('taskId', selectedTask._id);
    formData.append('title', newSubTaskTitle);
    
    if (newSubTaskFiles && newSubTaskFiles.length > 0) {
      Array.from(newSubTaskFiles).forEach(file => {
        formData.append('attachments', file);
      });
    }

    try {
      const { data } = await api.post('/subtasks', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSubTasks(prev => [...prev, data]);
      setNewSubTaskTitle('');
      setNewSubTaskFiles(null);
      
      // Update count on card locally
      setTasks(prev => prev.map(t => 
        t._id === selectedTask._id 
        ? { ...t, subTaskCount: (t.subTaskCount || 0) + 1 } 
        : t
      ));
    } catch (error) {
      console.error('Error adding subtask:', error);
    }
  };

  const handleToggleSubTask = async (id) => {
    const targetSubTask = subTasks.find(st => st._id === id);
    const updatedStatus = !targetSubTask.isCompleted;

    // Optimistic update
    setSubTasks(prev => prev.map(st => 
      st._id === id ? { ...st, isCompleted: updatedStatus } : st
    ));

    try {
      await api.put(`/subtasks/${id}`, { isCompleted: updatedStatus });
      
      // Update counts locally
      setTasks(prev => prev.map(t => 
        t._id === selectedTask._id 
        ? { 
            ...t, 
            completedSubTasks: (t.completedSubTasks || 0) + (updatedStatus ? 1 : -1),
            status: (updatedStatus && subTasks.every(st => st._id === id ? true : st.isCompleted)) ? 'done' : t.status
          } 
        : t
      ));
    } catch (error) {
      console.error('Error toggling subtask:', error);
      setSubTasks(prev => prev.map(st => 
        st._id === id ? { ...st, isCompleted: !updatedStatus } : st
      ));
    }
  };

  const handleUpdateSubTask = async (id, updates) => {
    try {
      const { data } = await api.put(`/subtasks/${id}`, updates);
      setSubTasks(prev => prev.map(st => st._id === id ? data : st));
      setEditingSubTaskId(null);
    } catch (error) {
      console.error('Error updating subtask:', error);
    }
  };

  const handleDeleteSubTask = async (id) => {
    const targetSubTask = subTasks.find(st => st._id === id);
    try {
      await api.delete(`/subtasks/${id}`);
      setSubTasks(prev => prev.filter(st => st._id !== id));
      
      // Update count on card locally
      setTasks(prev => prev.map(t => 
        t._id === selectedTask._id 
        ? { 
            ...t, 
            subTaskCount: Math.max(0, (t.subTaskCount || 0) - 1),
            completedSubTasks: targetSubTask.isCompleted ? Math.max(0, (t.completedSubTasks || 0) - 1) : (t.completedSubTasks || 0)
          } 
        : t
      ));
    } catch (error) {
      console.error('Error deleting subtask:', error);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    const newOrder = destination.index;
    
    // Explicitly update status and order in the local state
    setTasks(prev => {
      const updated = prev.map(t => 
        t._id === draggableId ? { ...t, status: newStatus, order: newOrder } : t
      );
      return updated;
    });

    try {
      await api.put(`/tasks/${draggableId}`, { 
        status: newStatus,
        order: newOrder
      });
    } catch (error) {
      console.error('Persistence failed:', error);
      fetchTasks(); 
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'High': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Medium': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
        
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
            <LayoutGrid className="text-primary-600" size={28} />
            Operations Board
          </h1>
          <p className="text-xs text-gray-400 font-medium">Tactical project orchestration interface.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <Filter size={14} className="text-gray-400" />
            <select 
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-transparent text-xs font-bold text-gray-900 dark:text-gray-100 outline-none cursor-pointer min-w-[180px]"
            >
              <option value="">Select Project...</option>
              {Array.isArray(projects) && projects.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          {/* Deploy Task button — visible to all. Server enforces who can actually create */}
          <Button 
            onClick={() => handleOpenModal()} 
            disabled={!selectedProject}
            className="rounded-xl h-10 px-6 shadow-lg shadow-primary-500/20 gap-2 font-bold uppercase tracking-widest text-[10px]"
          >
            <Plus size={16} strokeWidth={3} />
            Deploy Task
          </Button>
        </div>
      </div>

      {!selectedProject ? (
        <div className="flex-1 flex flex-col items-center justify-center p-20 bg-gray-50/50 dark:bg-gray-900/20 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
           <FolderKanban size={64} className="text-gray-200 mb-6" />
           <h2 className="text-xl font-black text-gray-400 uppercase tracking-widest">Initialization Required</h2>
           <p className="text-gray-400 text-sm mt-2">Select a project to active the operations board.</p>
        </div>
      ) : (

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 flex gap-6 sm:gap-8 overflow-x-auto pb-8 -mx-4 px-4 sm:-mx-2 sm:px-2 min-h-[600px] scrollbar-hide snap-x snap-mandatory">
          {COLUMNS.map(column => {
            const columnTasks = Array.isArray(tasks) 
              ? tasks.filter(t => t.status === column.id).sort((a, b) => (a.order || 0) - (b.order || 0))
              : [];
            
            return (
              <div key={column.id} className="w-[85vw] sm:w-80 shrink-0 flex flex-col gap-6 snap-center">
                <div className="flex items-center justify-between px-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-[1rem] ${column.bg} border ${column.border} shadow-sm transition-all`}>
                      <column.icon size={18} className={column.color} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 dark:text-white text-[11px] uppercase tracking-[0.2em]">
                        {column.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                         <span className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse" />
                         <span className="text-[10px] font-bold text-gray-400">{columnTasks.length} Active Records</span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 text-gray-300 hover:text-gray-600 dark:hover:text-gray-400 transition-all rounded-xl hover:bg-white dark:hover:bg-gray-800 shadow-sm border border-transparent hover:border-gray-100">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 flex flex-col gap-5 p-3 rounded-[2rem] transition-all duration-300 min-h-[400px] ${
                        snapshot.isDraggingOver ? 'bg-primary-50/20 dark:bg-primary-900/10 ring-4 ring-primary-500/10 border-2 border-dashed border-primary-500/30' : 'bg-gray-50/30 dark:bg-white/5'
                      }`}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => {
                                console.log('Draggable DIV clicked for task:', task._id);
                                handleOpenDetail(task);
                              }}
                              className="focus:outline-none"
                              style={{ 
                                ...provided.draggableProps.style,
                                marginBottom: '1rem'
                              }}
                            >
                              <Card
                                className={`p-4 group !rounded-[1.25rem] border-transparent hover:border-primary-100 dark:hover:border-primary-800/50 !bg-white dark:!bg-gray-900 shadow-lg shadow-gray-200/10 transition-all duration-300 cursor-pointer ${
                                  snapshot.isDragging ? '!shadow-2xl ring-2 ring-primary-500/20' : ''
                                }`}
                              >
                                <div className="flex flex-col gap-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-2">
                                      <div className="mt-1 text-gray-200 cursor-grab active:cursor-grabbing">
                                        <GripVertical size={14} />
                                      </div>
                                      <h4 className="text-[12px] font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight line-clamp-2">
                                        {task.title}
                                      </h4>
                                    </div>
                                    {isAdmin && (
                                      <div className="flex gap-1" onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('Action buttons clicked - stopping propagation');
                                      }}>
                                        <button onClick={() => {
                                          console.log('Edit task clicked');
                                          handleOpenModal(task);
                                        }} className="p-1 text-gray-300 hover:text-primary-500 transition-colors"><Edit2 size={12} /></button>
                                        <button onClick={() => {
                                          console.log('Delete task clicked');
                                          handleDeleteTask(task._id);
                                        }} className="p-1 text-gray-300 hover:text-rose-500 transition-colors"><Trash2 size={12} /></button>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-3">
                                      <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getPriorityStyles(task.priority)}`}>
                                        {task.priority}
                                      </span>
                                      <div className="flex items-center gap-1 text-gray-400">
                                        <Clock size={10} className="text-primary-400" />
                                        <span className="text-[9px] font-bold">{task.estimatedHours}H</span>
                                      </div>
                                      {task.subTaskCount > 0 && (
                                        <div className="flex items-center gap-1 text-gray-400">
                                          <CheckSquare size={10} className={task.completedSubTasks === task.subTaskCount ? 'text-emerald-500' : 'text-primary-400'} />
                                          <span className="text-[9px] font-bold">{task.completedSubTasks || 0}/{task.subTaskCount}</span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="h-7 w-7 rounded-full bg-primary-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[10px] font-black text-white shadow-md">
                                      {task.assignedUser?.name?.charAt(0).toUpperCase() || 'S'}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
        </DragDropContext>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Tactical Re-assignment' : 'Operational Deployment'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit(onTaskSubmit)} className="space-y-6 pt-2">
          <SearchableSelect 
            label="Target Project (Required)"
            options={projects.map(p => ({ value: p._id, label: p.name }))}
            value={formProjectId}
            onChange={(val) => setValue('projectId', val, { shouldValidate: true })}
            placeholder="Search and select project..."
            error={errors.projectId?.message}
            required
          />
          <Input 
            label="Directive Title"
            {...register('title')}
            error={errors.title?.message}
            placeholder="e.g. Critical System Upgrade"
          />
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] ml-1">Directive Details</label>
            <textarea 
              {...register('description')}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:ring-4 focus:ring-primary-500/10 outline-none transition-all min-h-[120px] placeholder:text-gray-300"
              placeholder="Outline the operational parameters..."
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <SearchableSelect 
              label="Priority Rank"
              options={[
                { value: 'Low', label: 'Low - Baseline' },
                { value: 'Medium', label: 'Medium - Elevated' },
                { value: 'High', label: 'High - Critical' }
              ]}
              value={watch('priority')}
              onChange={(val) => setValue('priority', val, { shouldValidate: true })}
              placeholder="Select priority..."
              error={errors.priority?.message}
            />
            
            <SearchableSelect 
              label="Assign Personnel"
              options={users.map(u => ({ value: u._id, label: u.name }))}
              value={formAssignedUser}
              onChange={(val) => setValue('assignedUser', val, { shouldValidate: true })}
              placeholder="Select team member..."
              error={errors.assignedUser?.message}
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <Input 
              label="Estimated Duration (HRS)"
              type="number"
              step="0.5"
              {...register('estimatedHours')}
              error={errors.estimatedHours?.message}
            />
            <div className="flex items-center gap-3 pt-6 pl-2">
              <input 
                type="checkbox"
                id="isBillable"
                {...register('isBillable')}
                className="h-5 w-5 rounded-lg border-2 border-gray-200 text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
              <label htmlFor="isBillable" className="text-xs font-black text-gray-500 uppercase tracking-widest cursor-pointer">Billable Logic</label>
            </div>
          </div>
          <div className="pt-4">
            <Button type="submit" variant="primary" className="w-full py-4 !rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-primary-500/30">
              {editingTask ? 'Apply Synchronization' : 'Launch Operational Data'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Task Detail Modal (Asana Style) */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedTask?.title || 'Directive Intelligence'}
        maxWidth="max-w-2xl"
      >
        <div className="flex flex-col gap-8 pt-4">
          {/* Header Info */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Status</span>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${COLUMNS.find(c => c.id === selectedTask?.status)?.color?.replace('text-', 'bg-') || 'bg-gray-400'}`} />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200 capitalize">{selectedTask?.status}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Priority</span>
              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border inline-block ${getPriorityStyles(selectedTask?.priority)}`}>
                {selectedTask?.priority}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Assigned To</span>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{selectedTask?.assignedUser?.name || 'Unassigned'}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Duration</span>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{selectedTask?.estimatedHours}H Estimated</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <ListTodo size={18} className="text-primary-500" />
              Operational Checklist
              <span className="ml-auto text-[10px] bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-gray-500">
                {subTasks.filter(st => st.isCompleted).length}/{subTasks.length} Completed
              </span>
            </h3>

            {/* Subtask List */}
            <div className="space-y-1 min-h-[100px]">
              {subTasks.map(st => (
                <div key={st._id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group">
                  <button 
                    onClick={() => handleToggleSubTask(st._id)}
                    className={`transition-colors ${st.isCompleted ? 'text-emerald-500' : 'text-gray-300 hover:text-primary-500'}`}
                  >
                    {st.isCompleted ? <CheckCircle size={20} fill="currentColor" className="text-white bg-emerald-500 rounded-full" /> : <Circle size={20} />}
                  </button>
                  
                  {editingSubTaskId === st._id && isAdmin ? (
                    <input
                      autoFocus
                      className="flex-1 bg-white dark:bg-gray-900 border border-primary-500/30 rounded-lg px-2 py-1 text-sm font-medium outline-none"
                      value={editingSubTaskTitle}
                      onChange={(e) => setEditingSubTaskTitle(e.target.value)}
                      onBlur={() => handleUpdateSubTask(st._id, { title: editingSubTaskTitle })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateSubTask(st._id, { title: editingSubTaskTitle });
                        if (e.key === 'Escape') setEditingSubTaskId(null);
                      }}
                    />
                  ) : (
                    <span 
                      onClick={() => {
                        if (isAdmin) {
                          setEditingSubTaskId(st._id);
                          setEditingSubTaskTitle(st.title);
                        }
                      }}
                      className={`text-sm font-medium flex-1 ${isAdmin ? 'cursor-text' : 'cursor-default'} ${st.isCompleted ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}
                    >
                      {st.title}
                    </span>
                  )}

                  {Array.isArray(st.attachments) && st.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1 px-1">
                      {st.attachments.map(att => (
                        <a 
                          key={att._id}
                          href={`${import.meta.env.VITE_API_URL || ''}${att.url}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg group/attach hover:bg-primary-50 transition-all border border-transparent hover:border-primary-100"
                          title={att.filename}
                        >
                          {att.mimetype?.startsWith('image/') ? (
                            <div className="relative h-6 w-6 group-hover/attach:scale-110 transition-transform">
                              <img src={`${import.meta.env.VITE_API_URL || ''}${att.url}`} className="h-full w-full rounded object-cover shadow-sm" alt={att.filename} />
                            </div>
                          ) : (
                            <div className="p-1 text-gray-400 group-hover/attach:text-primary-500">
                              <Paperclip size={14} />
                            </div>
                          )}
                          <span className="text-[10px] font-medium text-gray-400 max-w-[60px] truncate">{att.filename}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => {
                          console.log('Edit icon clicked for:', st._id);
                          setEditingSubTaskId(st._id);
                          setEditingSubTaskTitle(st.title);
                        }}
                        className="p-2 text-gray-300 hover:text-primary-500"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => {
                          console.log('Delete button clicked for:', st._id);
                          handleDeleteSubTask(st._id);
                        }}
                        className="p-2 text-gray-300 hover:text-rose-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {subTasks.length === 0 && (
                <div className="py-10 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2rem]">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No subtask objectives deployed.</p>
                </div>
              )}
            </div>

            {/* Add Subtask Input */}
            {selectedTask?.status !== 'done' ? (
              <form onSubmit={handleAddSubTask} className="mt-6">
                <div className="relative group">
                  <input
                    type="text"
                    value={newSubTaskTitle}
                    onChange={(e) => setNewSubTaskTitle(e.target.value)}
                    placeholder="Deploy new subtask objective..."
                    className="w-full pl-6 pr-24 py-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary-500/20 rounded-[1.5rem] text-sm font-bold outline-none transition-all shadow-inner"
                  />
                  <div className="absolute right-3 top-3 flex items-center gap-2">
                    <label className="p-2 text-gray-400 hover:text-primary-500 cursor-pointer transition-all rounded-xl hover:bg-white dark:hover:bg-gray-800">
                      <Paperclip className={newSubTaskFiles && newSubTaskFiles.length > 0 ? 'text-emerald-500' : ''} size={16} />
                      <input 
                        type="file" 
                        multiple
                        className="hidden" 
                        onChange={(e) => setNewSubTaskFiles(e.target.files)}
                      />
                    </label>
                    <button 
                      type="submit"
                      className="p-2 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all"
                    >
                      <Plus size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
                {newSubTaskFiles && newSubTaskFiles.length > 0 && (
                  <div className="ml-6 mt-2 space-y-1">
                    {Array.from(newSubTaskFiles).map((file, idx) => (
                      <p key={idx} className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                        <CheckCircle size={10} /> Attachment Ready: {file.name}
                      </p>
                    ))}
                  </div>
                )}
              </form>
            ) : (
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50 rounded-2xl flex items-center gap-3">
                <AlertCircle size={18} className="text-amber-500" />
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                  Task finalized. Checklist modifications restricted.
                </p>
              </div>
            )}
          </div>
          
          <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-[2rem] space-y-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Directive Description</span>
            <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {selectedTask?.description || 'No detailed directive provided for this operation.'}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Tasks;
