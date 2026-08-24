'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { Users, MapPin, Clock, Shield, Navigation, Phone } from 'lucide-react';

const visitInfo = {
  host: 'Mr. Mohammed Alaoui',
  department: 'Human Resources',
  purpose: 'Collaboration Meeting',
  checkIn: '09:30 AM',
  badge: 'VIS-2024-0865',
  floor: '3rd Floor, Meeting Room 305',
};

const siteLocations = [
  { name: 'Main Reception', type: 'check-in', visited: true },
  { name: 'Cafeteria', type: 'facility', visited: false },
  { name: 'Meeting Room 305', type: 'destination', visited: false },
  { name: 'Parking Area', type: 'facility', visited: true },
];

const safetyRules = [
  'Always wear your collaborator badge',
  'Follow designated visitor paths',
  'No photography without permission',
  'Report any safety concerns immediately',
];

export default function CollaboratorVisitorPage() {
  return (
    <DashboardLayout title="Collaborator Dashboard">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-700 to-red-900 rounded-xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Welcome, Collaborator! 🤝</h2>
              <p className="text-red-100 text-sm">You&apos;re visiting OCP Group today</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-red-600" /> Your Visit Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-500">Host</span>
              <p className="text-sm font-medium mt-1">{visitInfo.host}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-500">Department</span>
              <p className="text-sm font-medium mt-1">{visitInfo.department}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-500">Purpose</span>
              <p className="text-sm font-medium mt-1">{visitInfo.purpose}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-500">Check-in Time</span>
              <p className="text-sm font-medium mt-1">{visitInfo.checkIn}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-500">Badge Number</span>
              <p className="text-sm font-medium mt-1 font-mono">{visitInfo.badge}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-500">Destination</span>
              <p className="text-sm font-medium mt-1">{visitInfo.floor}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Navigation className="w-5 h-5 text-blue-600" /> Site Navigation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {siteLocations.map((loc) => (
                <button
                  key={loc.name}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    loc.visited
                      ? 'bg-green-50 border-green-200 hover:bg-green-100'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <MapPin className={`w-5 h-5 ${loc.visited ? 'text-green-600' : 'text-gray-400'}`} />
                  <div className="text-left">
                    <span className="text-sm font-medium">{loc.name}</span>
                    <p className="text-xs text-gray-500 capitalize">{loc.type}</p>
                  </div>
                  {loc.visited && <span className="ml-auto text-xs text-green-600">✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-red-50 rounded-xl border border-red-200 p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-3 text-red-800">
              <Shield className="w-5 h-5" /> Safety Rules
            </h3>
            <ul className="space-y-2">
              {safetyRules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                  <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                  {rule}
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-red-200">
              <h4 className="text-sm font-medium text-red-800 mb-1">Emergency Contact</h4>
              <p className="text-sm text-red-700">Security: +212 5XX XXX XXX</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
