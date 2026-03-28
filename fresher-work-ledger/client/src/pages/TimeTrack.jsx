import React, { useState, useEffect } from 'react';
import { api } from '../store/authStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Play, Square, Plus, Clock as ClockIcon, Trash2, Edit2, Calendar, Tag, Briefcase, FileText } from 'lucide-react';
import { SearchableSelect } from '../components/SearchableSelect';



export const TimeTrack = () => {
  const [entries, setEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  
  const [timerDescription, setTimerDescription] = useState('');
  const [timerProjectId, setTimerProjectId] = useState('');
  const [timerTaskId, setTimerTaskId] = useState('');
  const [isBillable, setIsBillable] = useState(true);

  // Manual Entry States
  const [manualProjectId, setManualProjectId] = useState('');
  const [manualTaskId, setManualTaskId] = useState('');

  useEffect(() => {
    fetchData();
    checkActiveTimer();
  }, []);

  useEffect(() => {
    let interval;
    if (activeTimer) {
      interval = setInterval(() => {
        const start = new Date(activeTimer.startTime);
        const now = new Date();
        setTimerSeconds(Math.floor((now - start) / 1000));
      }, 1000);
    } else {
      setTimerSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const fetchData = async () => {
    try {
      const [entriesRes, projectsRes] = await Promise.all([
        api.get('/time'),
        api.get('/projects')
      ]);
      const entriesData = Array.isArray(entriesRes.data) ? entriesRes.data : [];
      const projectsData = Array.isArray(projectsRes.data) ? projectsRes.data : [];
      
      setEntries(entriesData);
      setProjects(projectsData);
      if (projectsData.length > 0) setTimerProjectId(projectsData[0]._id);
    } catch (error) {
      console.error('Error fetching time data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkActiveTimer = async () => {
    try {
      const { data } = await api.get('/time');
      const active = Array.isArray(data) ? data.find(e => e.isActive) : null;
      if (active) {
        setActiveTimer(active);
        setTimerDescription(active.description || '');
        setTimerProjectId(active.projectId?._id || active.projectId || '');
        setTimerTaskId(active.taskId?._id || active.taskId || '');
        setIsBillable(active.isBillable);
      }
    } catch (error) {
      console.error('Error checking active timer:', error);
    }
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = async () => {
    if (!timerProjectId || !timerTaskId) {
      alert('Please select both a Project and a Task before starting the timer.');
      return;
    }
    try {
      const { data } = await api.post('/time/start', {
        description: timerDescription,
        projectId: timerProjectId,
        taskId: timerTaskId,
        isBillable
      });
      setActiveTimer(data);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to start timer';
      console.error('[TIMER] Start failed:', error.response?.data || error.message);
      alert(msg);
    }
  };

  const handleStopTimer = async () => {
    if (!activeTimer) return;
    try {
      await api.put(`/time/stop/${activeTimer._id}`);
      setActiveTimer(null);
      fetchData();
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (window.confirm('Delete this time entry?')) {
      try {
        await api.delete(`/time/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    }
  };

  // Step 8: useEffect FIX
  useEffect(() => {
    if (!timerProjectId) {
      setTasks([]);
      setTimerTaskId('');
      return;
    }

    const fetchTasks = async () => {
      try {
        const res = await api.get(`/tasks/by-project/${timerProjectId}`);
        setTasks(res.data);
        console.log("Selected Project:", timerProjectId);
        console.log("Tasks found:", res.data);
        
        // Auto-select first task if needed
        if (res.data.length > 0 && !res.data.some(t => t._id === timerTaskId)) {
          setTimerTaskId(res.data[0]._id);
        }
      } catch (err) {
        console.error("Task fetch failed:", err);
      }
    };

    fetchTasks();
  }, [timerProjectId]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      description: formData.get('description'),
      projectId: manualProjectId,
      taskId: manualTaskId,
      isBillable: formData.get('isBillable') === 'on',
      startTime: formData.get('startTime'),
      durationHours: formData.get('durationHours')
    };

    try {
      await api.post('/time/manual', data);
      setIsManualModalOpen(false);
      setManualProjectId('');
      setManualTaskId('');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Manual entry failed');
    }
  };

  const handleEditClick = (entry) => {
    setEditingEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      description: formData.get('description'),
      projectId: editingEntry?.projectId?._id || editingEntry?.projectId,
      taskId: editingEntry?.taskId?._id || editingEntry?.taskId,
      isBillable: formData.get('isBillable') === 'on',
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime')
    };

    try {
      await api.put(`/time/${editingEntry._id}`, data);
      setIsEditModalOpen(false);
      setEditingEntry(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading tracking-tight">Time Tracking</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monitor your productivity and billable hours.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => setIsManualModalOpen(true)}>
          <Plus size={18} />
          Manual Entry
        </Button>
      </div>

      <Modal 
        isOpen={isManualModalOpen} 
        onClose={() => setIsManualModalOpen(false)}
        title="Manual Time Entry"
      >
        <form onSubmit={handleManualSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
            <input name="description" required className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl outline-none" placeholder="What did you do?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SearchableSelect 
              label="Project"
              options={projects.map(p => ({ value: p._id, label: p.name }))}
              value={manualProjectId}
              onChange={(val) => setManualProjectId(val)}
              placeholder="Select Project"
              required
            />
            <SearchableSelect 
              label="Task"
              options={tasks.map(t => ({ value: t._id, label: t.title }))}
              value={manualTaskId}
              onChange={(val) => setManualTaskId(val)}
              placeholder="Select Task"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Start Time</label>
              <input type="datetime-local" name="startTime" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl outline-none" />
            </div>
            <div className="space-y-1 text-gray-400 flex items-center justify-center pt-6 text-[10px] uppercase font-black">
              OR
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Manual Duration (Hours)</label>
            <input type="number" step="0.1" name="durationHours" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl outline-none" placeholder="e.g. 2.5" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isBillable" id="manualBillable" defaultChecked />
            <label htmlFor="manualBillable" className="text-xs font-bold text-gray-500 uppercase">Billable</label>
          </div>
          <Button type="submit" className="w-full py-3 !rounded-xl">Save Entry</Button>
        </form>
      </Modal>

      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Time Entry"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
            <input name="description" defaultValue={editingEntry?.description} required className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SearchableSelect 
              label="Project"
              options={projects.map(p => ({ value: p._id, label: p.name }))}
              value={editingEntry?.projectId?._id || editingEntry?.projectId}
              onChange={(val) => setEditingEntry({ ...editingEntry, projectId: val })}
              placeholder="Select Project"
              required
            />
            <SearchableSelect 
              label="Task"
              options={tasks.map(t => ({ value: t._id, label: t.title }))}
              value={editingEntry?.taskId?._id || editingEntry?.taskId}
              onChange={(val) => setEditingEntry({ ...editingEntry, taskId: val })}
              placeholder="Select Task"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Start Time</label>
              <input type="datetime-local" name="startTime" defaultValue={editingEntry?.startTime ? new Date(new Date(editingEntry.startTime).getTime() - new Date(editingEntry.startTime).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} required className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">End Time</label>
              <input type="datetime-local" name="endTime" defaultValue={editingEntry?.endTime ? new Date(new Date(editingEntry.endTime).getTime() - new Date(editingEntry.endTime).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} required className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isBillable" id="editBillable" defaultChecked={editingEntry?.isBillable} />
            <label htmlFor="editBillable" className="text-xs font-bold text-gray-500 uppercase tracking-widest">Billable</label>
          </div>
          <Button type="submit" className="w-full py-4 !rounded-xl font-bold uppercase tracking-widest text-xs">Update Sync</Button>
        </form>
      </Modal>

      {/* Timer Card */}
      <Card className="!p-0 border-transparent shadow-2xl bg-white dark:bg-gray-800 relative z-10">
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-700">
          <div className="flex-1 p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
              <input 
                type="text"
                placeholder="What are you working on right now?"
                value={timerDescription}
                onChange={(e) => setTimerDescription(e.target.value)}
                disabled={!!activeTimer}
                className="w-full bg-transparent text-lg font-bold text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 outline-none focus:placeholder-transparent transition-all"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <SearchableSelect 
                label="Project"
                options={projects.map(p => ({ value: p._id, label: p.name }))}
                value={timerProjectId}
                onChange={(val) => setTimerProjectId(val)}
                placeholder="Select Project"
                disabled={!!activeTimer}
              />
              <SearchableSelect 
                label="Task"
                options={tasks.map(t => ({ value: t._id, label: t.title }))}
                value={timerTaskId}
                onChange={(val) => setTimerTaskId(val)}
                placeholder="Select Task"
                disabled={!!activeTimer}
              />
              <div className="flex items-end pb-1.5">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="peer hidden" 
                      checked={isBillable}
                      onChange={(e) => setIsBillable(e.target.checked)}
                      disabled={!!activeTimer}
                    />
                    <div className="h-5 w-9 bg-gray-200 dark:bg-gray-700 rounded-full peer-checked:bg-emerald-500 transition-colors" />
                    <div className="absolute left-1 top-1 h-3 w-3 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight group-hover:text-emerald-500 transition-colors">Billable</span>
                </label>
              </div>
            </div>
          </div>

          <div className="lg:w-80 p-8 flex flex-col items-center justify-center gap-5 bg-gray-50/50 dark:bg-gray-800/30">
            <div className="text-5xl font-mono font-black text-gray-900 dark:text-white tabular-nums tracking-tighter">
              {formatTime(timerSeconds)}
            </div>
            
            {activeTimer ? (
              <Button 
                onClick={handleStopTimer}
                className="w-full h-14 !rounded-2xl bg-red-500 hover:bg-red-600 shadow-xl shadow-red-500/20 text-white gap-3"
              >
                <Square className="fill-current" size={20} />
                <span className="font-bold tracking-tight uppercase text-sm">Stop Tracking</span>
              </Button>
            ) : (
              <Button 
                onClick={handleStartTimer}
                className="w-full h-14 !rounded-2xl bg-primary-600 hover:bg-primary-700 shadow-xl shadow-primary-500/20 text-white gap-3"
              >
                <Play className="fill-current ml-1" size={20} />
                <span className="font-bold tracking-tight uppercase text-sm">Start Session</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* History Card */}
      <Card className="flex-1 flex flex-col !p-0 border-transparent shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-gray-800/20">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Time Logs</h3>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700">Today: 0h 0m</span>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[500px] divide-y divide-gray-50 dark:divide-gray-800">
          {Array.isArray(entries) && entries.filter(e => !e.isActive).map((entry) => (
            <div key={entry._id} className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-all group flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="h-10 w-10 shrink-0 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-primary-500 transition-colors shadow-sm">
                  <ClockIcon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate line-clamp-1">{entry.description || "No description"}</h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase">
                      <Briefcase size={10} /> {entry.projectId?.name || "No Project"}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                      <Tag size={10} /> {entry.taskId?.title || "No Task"}
                    </div>
                    {entry.isBillable && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[9px] font-black uppercase tracking-tighter">$ Billable</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex flex-col items-end">
                  <span className="text-lg font-mono font-bold text-gray-900 dark:text-white tabular-nums tracking-tighter">
                    {formatTime(entry.durationSeconds)}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 mt-0.5">
                    <Calendar size={10} />
                    {new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditClick(entry)} className="p-2 text-gray-300 hover:text-blue-500 transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => handleDeleteEntry(entry._id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
          {entries.filter(e => !e.isActive).length === 0 && !loading && (
            <div className="py-20 flex flex-col items-center justify-center text-gray-300 gap-3">
              <ClockIcon size={48} className="opacity-10" />
              <p className="text-sm font-bold tracking-tight uppercase">No time logs yet</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
