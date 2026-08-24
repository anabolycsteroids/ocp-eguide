'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/i18n';
import { getUserPresence, getPlaces, sendHeartbeat, type BackendPresence, type BackendPlace } from '@/lib/api';
import { GraduationCap, BookOpen, Clock, CheckCircle, Wrench, FileText, Users, Calendar, AlertCircle, TrendingUp, MapPin } from 'lucide-react';
import DashboardMapCard from '@/components/DashboardMapCard';

export default function InternDashboardPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [supervisorPresence, setSupervisorPresence] = useState<BackendPresence | null>(null);
  const [places, setPlaces] = useState<BackendPlace[]>([]);

  const internStats = [
    { label: t('intern.tasksCompleted'), value: '18', target: '25', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: t('intern.trainingHours'), value: '42', target: '60', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('intern.mentorSessions'), value: '8', target: '10', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: t('intern.daysRemaining'), value: '35', target: '90', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const weeklyTasks = [
    { id: 1, task: t('intern.taskMachineSafety'), statusKey: 'intern.statusInProgress', priorityKey: 'intern.priorityHigh', dueDateKey: 'intern.dayToday', mentorKey: 'intern.taskMentorBouzid' },
    { id: 2, task: t('intern.taskCnc'), statusKey: 'intern.statusCompleted', priorityKey: 'intern.priorityMedium', dueDateKey: 'intern.dayYesterday', mentorKey: 'intern.taskMentorAlaoui' },
    { id: 3, task: t('intern.taskLabReport'), statusKey: 'intern.statusPending', priorityKey: 'intern.priorityHigh', dueDateKey: 'intern.dayTomorrow', mentorKey: 'intern.taskMentorFassi' },
    { id: 4, task: t('intern.taskSafetyTraining'), statusKey: 'intern.statusUpcoming', priorityKey: 'intern.priorityLow', dueDate: 'Wed', mentorKey: 'intern.taskMentorSafety' },
    { id: 5, task: t('intern.taskShadow'), statusKey: 'intern.statusScheduled', priorityKey: 'intern.priorityMedium', dueDate: 'Thu', mentorKey: 'intern.taskMentorTazi' },
  ];

  const schedule = [
    { time: '08:00', eventKey: 'intern.schedBriefing', locationKey: 'intern.locWorkshopA', type: 'meeting' },
    { time: '09:00', eventKey: 'intern.schedCncPractice', locationKey: 'intern.locLab3', type: 'training' },
    { time: '12:00', eventKey: 'intern.schedLunch', locationKey: 'intern.locCafeteria', type: 'break' },
    { time: '13:00', eventKey: 'intern.schedMentorMeeting', locationKey: 'intern.locOffice204', type: 'meeting' },
    { time: '14:30', eventKey: 'intern.schedMaintenance', locationKey: 'intern.locWorkshopB', type: 'training' },
    { time: '16:00', eventKey: 'intern.schedDocumentation', locationKey: 'intern.locDesk', type: 'task' },
  ];

  const trainingModules = [
    { nameKey: 'intern.moduleMechFundamentals', progress: 85, statusKey: 'intern.statusInProgress' },
    { nameKey: 'intern.moduleCnc', progress: 60, statusKey: 'intern.statusInProgress' },
    { nameKey: 'intern.moduleSafetyProtocols', progress: 100, statusKey: 'intern.statusCompleted' },
    { nameKey: 'intern.moduleQualityControl', progress: 30, statusKey: 'intern.statusInProgress' },
    { nameKey: 'intern.moduleCad', progress: 0, statusKey: 'intern.statusNotStarted' },
  ];

  const fetchData = useCallback(async () => {
    try {
      const placesRes = await getPlaces();
      setPlaces(placesRes.data || []);
    } catch {}

    try {
      if (user?.id) {
        const supRes = await getUserPresence(user.id);
        setSupervisorPresence(supRes.data);
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    fetchData();
    const heartbeatInterval = setInterval(() => {
      sendHeartbeat().catch(() => {});
    }, 60000);
    sendHeartbeat().catch(() => {});
    return () => clearInterval(heartbeatInterval);
  }, [fetchData]);

  const userName = user?.firstName || 'Ahmed';

  return (
    <DashboardLayout title={t('sidebar.dashboard')}>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{t('intern.welcomeIntern', { name: userName })} 👋</h2>
              <p className="text-blue-100 text-sm">{t('intern.internSubtitle', { dept: 'Mechanical Engineering', week: '5', total: '12' })}</p>
            </div>
          </div>
          <div className="mt-4 bg-white/10 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>{t('intern.internProgress')}</span>
              <span>{t('intern.progressComplete', { pct: '56' })}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-white rounded-full h-2" style={{ width: '56%' }} />
            </div>
          </div>
        </div>

        {/* My Supervisor + Campus Places */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Supervisor Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-600" /> {t('intern.mySupervisor')}
            </h3>
            {supervisorPresence ? (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
                  {supervisorPresence.user.firstName.charAt(0)}{supervisorPresence.user.lastName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{supervisorPresence.user.firstName} {supervisorPresence.user.lastName}</p>
                  <p className="text-xs text-gray-500">{supervisorPresence.user.department}</p>
                  <div className="mt-1">
                    <StatusBadge
                      status={supervisorPresence.status}
                      label={supervisorPresence.statusLabel}
                      note={supervisorPresence.statusNote || undefined}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">{t('intern.loadingSupervisor')}</p>
            )}
          </div>

          {/* Campus Map */}
          <DashboardMapCard compact />
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" /> {t('intern.weeklyTasks')}
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {weeklyTasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{task.task}</h4>
                      <p className="text-xs text-gray-500 mt-1">{t('intern.mentor')}: {t(task.mentorKey)}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className={`text-xs font-medium ${task.priorityKey === 'intern.priorityHigh' ? 'text-red-600' : task.priorityKey === 'intern.priorityMedium' ? 'text-yellow-600' : 'text-green-600'}`}>
                        {t(task.priorityKey)}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        task.statusKey === 'intern.statusCompleted' ? 'bg-green-100 text-green-800' :
                        task.statusKey === 'intern.statusInProgress' ? 'bg-blue-100 text-blue-800' :
                        task.statusKey === 'intern.statusPending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {t(task.statusKey)}
                      </span>
                      <span className="text-xs text-gray-500">{task.dueDateKey ? t(task.dueDateKey) : task.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" /> {t('intern.todaysSchedule')}
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {schedule.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="text-sm font-mono text-gray-500 w-12 shrink-0">{item.time}</div>
                  <div className={`w-1 rounded-full ${
                    item.type === 'meeting' ? 'bg-blue-400' :
                    item.type === 'training' ? 'bg-green-400' :
                    item.type === 'break' ? 'bg-gray-300' : 'bg-purple-400'
                  }`} />
                  <div>
                    <p className="text-sm font-medium">{t(item.eventKey)}</p>
                    <p className="text-xs text-gray-500">{t(item.locationKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Training Modules */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-green-600" /> {t('intern.trainingProgress')}
          </h3>
          <div className="space-y-4">
            {trainingModules.map((module) => (
              <div key={module.nameKey} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{t(module.nameKey)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      module.statusKey === 'intern.statusCompleted' ? 'bg-green-100 text-green-800' :
                      module.statusKey === 'intern.statusInProgress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-500'
                    }`}>{t(module.statusKey)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`rounded-full h-2 transition-all ${
                        module.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium w-10 text-right">{module.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
