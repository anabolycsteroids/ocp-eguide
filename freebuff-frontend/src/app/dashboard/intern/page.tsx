'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { GraduationCap, BookOpen, Clock, CheckCircle, Users, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

const internStats = [
  { label: 'Tasks Completed', value: '12', target: '20', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Training Hours', value: '28', target: '40', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Mentor Sessions', value: '5', target: '8', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Days Remaining', value: '45', target: '90', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
];

const weeklyTasks = [
  { id: 1, task: 'Complete Onboarding Orientation Module', status: 'In Progress', priority: 'High', dueDate: 'Today', mentor: 'HR Dept' },
  { id: 2, task: 'Shadow Senior Team Member', status: 'Scheduled', priority: 'Medium', dueDate: 'Tomorrow', mentor: 'Dept Lead' },
  { id: 3, task: 'Submit Weekly Reflection Journal', status: 'Pending', priority: 'Low', dueDate: 'Fri', mentor: 'Supervisor' },
  { id: 4, task: 'Attend Department Meeting', status: 'Upcoming', priority: 'Medium', dueDate: 'Wed', mentor: 'Team Lead' },
  { id: 5, task: 'Complete Safety Training Quiz', status: 'Pending', priority: 'High', dueDate: 'Thu', mentor: 'Safety Dept' },
];

const trainingModules = [
  { name: 'Company Overview & Culture', progress: 100, status: 'Completed' },
  { name: 'Safety & Compliance', progress: 75, status: 'In Progress' },
  { name: 'Department Orientation', progress: 40, status: 'In Progress' },
  { name: 'Tools & Systems Training', progress: 20, status: 'In Progress' },
  { name: 'Project Fundamentals', progress: 0, status: 'Not Started' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed': return 'bg-green-100 text-green-800';
    case 'In Progress': return 'bg-blue-100 text-blue-800';
    case 'Pending': return 'bg-yellow-100 text-yellow-800';
    case 'Upcoming': case 'Scheduled': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High': return 'text-red-600';
    case 'Medium': return 'text-yellow-600';
    case 'Low': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

export default function InternDashboardPage() {
  return (
    <DashboardLayout title="Intern Dashboard">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Welcome, Intern! 🎓</h2>
              <p className="text-purple-100 text-sm">Your learning journey at OCP starts here</p>
            </div>
          </div>
          <div className="mt-4 bg-white/10 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Onboarding Progress</span>
              <span>35% Complete</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-white rounded-full h-2" style={{ width: '35%' }} />
            </div>
          </div>
        </div>

        {/* Stats */}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tasks */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" /> Weekly Tasks
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
                      <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Training Modules */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-green-600" /> Training Progress
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
                        module.progress === 100 ? 'bg-green-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors">
              <BookOpen className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <span className="text-sm font-medium">Start Training</span>
            </button>
            <button className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
              <Users className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <span className="text-sm font-medium">Book Mentor</span>
            </button>
            <button className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <span className="text-sm font-medium">View Schedule</span>
            </button>
            <button className="p-4 bg-orange-50 rounded-lg text-center hover:bg-orange-100 transition-colors">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <span className="text-sm font-medium">Get Help</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
