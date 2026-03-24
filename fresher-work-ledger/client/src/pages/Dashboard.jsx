import React, { useEffect, useState } from 'react';
import { useAuthStore, api } from '../store/authStore';
import { Card } from '../components/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FolderKanban, Briefcase, Clock, Users } from 'lucide-react';



export const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ projects: 0, tasks: 0, time: 0, users: 0, chartData: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/dashboard/stats');
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <Card animate className="flex items-center p-6 space-x-5 border-none shadow-xl hover:scale-[1.02] transition-all bg-white dark:bg-gray-800/50 backdrop-blur-md">
      <div className={`p-4 rounded-2xl ${colorClass} transition-transform group-hover:rotate-12`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{title}</p>
        <p className="text-2xl font-black font-sans text-gray-900 dark:text-white tabular-nums tracking-tighter">
          {loading ? (
            <span className="h-8 w-16 bg-gray-100 animate-pulse rounded block"></span>
          ) : value}
        </p>
      </div>
    </Card>
  );

  return (
    <div className="space-y-10 p-4 md:p-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
            Dashboard <span className="text-primary-600">Pulse</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            Welcome back, <span className="text-gray-900 dark:text-white font-bold">{user?.name}</span>. Here's your workflow at a glance.
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">System Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Active Projects" value={stats.projects} icon={FolderKanban} colorClass="bg-blue-500 text-white shadow-lg shadow-blue-500/20" />
        <StatCard title="Tasks Pending" value={stats.tasks} icon={Briefcase} colorClass="bg-orange-500 text-white shadow-lg shadow-orange-500/20" />
        <StatCard title="Hours (7d)" value={`${stats.totalHours || 0}h`} icon={Clock} colorClass="bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" />
        <StatCard title="Team Members" value={stats.teamMembers || 0} icon={Users} colorClass="bg-violet-500 text-white shadow-lg shadow-violet-500/20" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <Card animate className="xl:col-span-2 !p-8 border-none shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Productivity Trends</h3>
              <p className="text-xs text-gray-400 font-medium">Daily hours logged across the team</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-primary-500" />
              <span className="text-xs font-bold text-gray-500">Billable Hours</span>
            </div>
          </div>
          
          <div className="h-[320px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Array.isArray(stats.chartData) ? stats.chartData : []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                <XAxis dataKey="name" tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 600}} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 600}} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  cursor={{fill: '#F3F4F6', opacity: 0.6}} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', backgroundColor: '#fff', padding: '12px'}} 
                  itemStyle={{fontSize: '12px', fontWeight: 'bold', color: '#2563eb'}}
                />
                <Bar dataKey="hours" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card animate className="!p-8 border-transparent shadow-xl">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Queue Status</h3>
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-extrabold uppercase tracking-widest text-gray-400">
                <span>Task Arrival Rate</span>
                <span className="text-emerald-500">+12%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[65%] rounded-full" />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-extrabold uppercase tracking-widest text-gray-400">
                <span>Throughput</span>
                <span className="text-blue-500">8.5/day</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[42%] rounded-full" />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">Active Projects</p>
              <div className="space-y-4">
                {stats.recentProjects && stats.recentProjects.length > 0 ? (
                  stats.recentProjects.map((p) => (
                    <div key={p._id} className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary-500 shrink-0" />
                      <div>
                        <p className="text-[11px] font-bold text-gray-900 dark:text-white line-clamp-1">{p.name}</p>
                        <p className="text-[9px] text-gray-400 font-medium">{p.status}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-center text-gray-400 font-medium">No projects found</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
