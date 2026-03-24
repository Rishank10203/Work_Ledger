import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Download, FileText, CheckCircle2, PieChart as PieChartIcon, Loader2 } from 'lucide-react';
import { SearchableSelect } from '../components/SearchableSelect';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '../store/authStore';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const Reports = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  
  // Selection States
  const [selectedMonth, setSelectedMonth] = useState('March 2026');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [analyticsRes, usersRes, projectsRes] = await Promise.all([
        api.get('/time/analytics/project-wise'),
        api.get('/users'),
        api.get('/projects')
      ]);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Intelligence & Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium italic">Strategic data extraction and temporal analysis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card animate className="!p-8 border-none shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-2xl">
              <PieChartIcon size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Temporal Distribution</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Project-wise hour allocation</p>
            </div>
          </div>

          <div className="h-[400px] w-full relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary-500" size={32} />
              </div>
            ) : analytics.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics}
                    dataKey="totalHours"
                    nameKey="projectName"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    paddingAngle={5}
                    stroke="none"
                  >
                    {analytics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '15px' }}
                    itemStyle={{ fontWeight: '900', fontSize: '12px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                <FileText size={48} className="opacity-10 mb-4" />
                <p className="text-sm font-black uppercase tracking-widest">No Temporal Data Found</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card animate className="border-t-4 border-t-primary-500 shadow-md">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Monthly User Timesheet</h3>
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl">
              <FileText className="h-6 w-6" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-2 font-medium">Generate a comprehensive summary of all tracked hours for a specific team member over the selected month.</p>
          <div className="space-y-4 mb-8">
            <SearchableSelect 
              label="Selected Month"
              options={[
                { value: 'March 2026', label: 'March 2026' },
                { value: 'February 2026', label: 'February 2026' }
              ]}
              value={selectedMonth}
              onChange={(val) => setSelectedMonth(val)}
              placeholder="Select Month"
            />
            <SearchableSelect 
              label="Personnel"
              options={users.map(u => ({ value: u._id, label: u.name }))}
              value={selectedUser}
              onChange={(val) => setSelectedUser(val)}
              placeholder="Select User"
            />
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 gap-2 font-bold py-2.5"><Download className="h-4 w-4" /> CSV</Button>
            <Button className="flex-1 gap-2 font-bold py-2.5"><Download className="h-4 w-4" /> PDF</Button>
          </div>
        </Card>

        <Card animate className="border-t-4 border-t-emerald-500 shadow-md">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Client Billing Report</h3>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-2 font-medium">Export all billable hours for a specific client or project to generate invoices. Non-billable time is excluded.</p>
          <div className="space-y-4 mb-8">
            <SearchableSelect 
              label="Mission Objective"
              options={projects.map(p => ({ value: p._id, label: p.name }))}
              value={selectedProject}
              onChange={(val) => setSelectedProject(val)}
              placeholder="Select Project"
            />
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 gap-2 font-bold py-2.5"><Download className="h-4 w-4" /> CSV</Button>
            <Button className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 text-white font-bold py-2.5"><Download className="h-4 w-4" /> PDF</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
