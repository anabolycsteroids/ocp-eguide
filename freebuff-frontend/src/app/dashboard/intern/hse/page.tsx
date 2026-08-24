'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { HardHat, BookOpen, Clock, CheckCircle, Users, Shield } from 'lucide-react';
import DashboardMapCard from '@/components/DashboardMapCard';

const internStats = [
  { label: 'Tasks Completed', value: '18', target: '25', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Training Hours', value: '45', target: '60', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Safety Certifications', value: '3', target: '5', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Days Remaining', value: '35', target: '90', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
];

const weeklyTasks = [
  { id: 1, task: 'Safety Audit Assistance', status: 'In Progress', priority: 'High', dueDate: 'Today', mentor: 'Safety Dir.' },
  { id: 2, task: 'Risk Assessment Training', status: 'Completed', priority: 'High', dueDate: 'Yesterday', mentor: 'HSE Manager' },
  { id: 3, task: 'Emergency Drill Coordination', status: 'Pending', priority: 'High', dueDate: 'Tomorrow', mentor: 'Safety Dir.' },
  { id: 4, task: 'Incident Report Review', status: 'Upcoming', priority: 'Medium', dueDate: 'Wed', mentor: 'HSE Manager' },
];

const trainingModules = [
  { name: 'HSE Fundamentals', progress: 90, status: 'In Progress' },
  { name: 'Risk Assessment', progress: 100, status: 'Completed' },
  { name: 'Emergency Response', progress: 65, status: 'In Progress' },
  { name: 'Environmental Compliance', progress: 40, status: 'In Progress' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed': return 'bg-green-100 text-green-800';
    case 'In Progress': return 'bg-blue-100 text-blue-800';
    case 'Pending': return 'bg-yellow-100 text-yellow-800';
    case 'Upcoming': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function HSEInternPage() {
  return (
    <DashboardLayout title="Intern Dashboard — HSE">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-pink-600 to-pink-800 rounded-xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <HardHat className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Welcome, Nadia! 👋</h2>
              <p className="text-pink-100 text-sm">HSE Intern • Week 6 of 12</p>
            </div>
          </div>
          <div className="mt-4 bg-white/10 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Internship Progress</span>
              <span>62% Complete</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-white rounded-full h-2" style={{ width: '62%' }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {internStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-gray-100`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-sm text-gray-600">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold">{stat.value}<span className="text-sm font-normal text-gray-500">/{stat.target}</span></div>
              </div>
            );
          })}
        </div>

        <DashboardMapCard compact />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold flex items-center gap-2">
                <HardHat className="w-5 h-5 text-pink-600" /> Weekly Tasks
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {weeklyTasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{task.task}</h4>
                      <p className="text-xs text-gray-500 mt-1">Mentor: {task.mentor}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className="text-xs text-gray-500">{task.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-pink-600" /> Training Progress
            </h3>
            <div className="space-y-4">
              {trainingModules.map((module) => (
                <div key={module.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{module.name}</span>
                    <span className="text-xs text-gray-500">{module.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`rounded-full h-2 transition-all ${
                        module.progress === 100 ? 'bg-green-500' : 'bg-pink-500'
                      }`}
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
