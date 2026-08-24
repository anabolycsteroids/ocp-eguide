'use client';

import DashboardLayout from '@/components/DashboardLayout';
import DashboardMapCard from '@/components/DashboardMapCard';
import { useI18n } from '@/i18n';
import { Shield, Navigation, Users, QrCode, AlertTriangle } from 'lucide-react';

export default function VisitorDashboardPage() {
  const { t } = useI18n();

  const safetyRules = [
    t('visitor.ruleBadge'),
    t('visitor.ruleHost'),
    t('visitor.rulePaths'),
    t('visitor.rulePhoto'),
    t('visitor.ruleReport'),
  ];

  return (
    <DashboardLayout title={t('dashboard.visitorDashboard')}>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-700 rounded-xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{t('visitor.welcomeVisitor')} 🏢</h2>
              <p className="text-teal-100 text-sm">{t('visitor.visitingOcp')}</p>
            </div>
          </div>
        </div>

        {/* Visit Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <QrCode className="w-5 h-5 text-teal-600" /> {t('visitor.yourVisitDetails')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-500">{t('visitor.host')}</span>
              <p className="text-sm font-medium mt-1">Mr. Ahmed Tazi</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-500">{t('visitor.department')}</span>
              <p className="text-sm font-medium mt-1">Operations</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-500">{t('visitor.purpose')}</span>
              <p className="text-sm font-medium mt-1">{t('dashboard.businessMeeting')}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-500">{t('visitor.checkInTime')}</span>
              <p className="text-sm font-medium mt-1">09:00 AM</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-500">{t('visitor.badgeNumber')}</span>
              <p className="text-sm font-medium mt-1 font-mono">VIS-2024-0847</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-500">{t('visitor.destination')}</span>
              <p className="text-sm font-medium mt-1">3rd Floor, Room 305</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Navigation - Interactive Map */}
          <div className="lg:col-span-2">
            <DashboardMapCard />
          </div>

          {/* Safety Rules */}
          <div className="bg-red-50 rounded-xl border border-red-200 p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-3 text-red-800">
              <Shield className="w-5 h-5" /> {t('visitor.safetyRules')}
            </h3>
            <ul className="space-y-2">
              {safetyRules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  {rule}
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-red-200">
              <h4 className="text-sm font-medium text-red-800 mb-1">{t('visitor.emergencyContact')}</h4>
              <p className="text-sm text-red-700">{t('visitor.securityPhone')}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
