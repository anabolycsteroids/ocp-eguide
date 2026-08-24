'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { ClipboardList, MapPin, Clock, Shield, Navigation, Phone, HardHat } from 'lucide-react';

const workOrders = [
  { id: 'WO-001', title: 'Electrical Maintenance - Building A', status: 'In Progress', priority: 'High', dueDate: 'Today' },
  { id: 'WO-002', title: 'HVAC Inspection - Warehouse B', status: 'Scheduled', priority: 'Medium', dueDate: 'Tomorrow' },
  { id: 'WO-003', title: 'Plumbing Repair - Cafeteria', status: 'Completed', priority: 'Low', dueDate: 'Yesterday' },
];

const siteLocations = [
  { name: 'Main Gate', type: 'check-in', visited: true },
  { name: 'Building A', type: 'work-site', visited: false },
  { name: 'Warehouse B', type: 'work-site', visited: false },
  { name: 'Cafeteria', type: 'facility', visited: false },
];

const safetyRules = [
  'Always wear hard hat and safety vest',
  'Follow designated contractor routes',
  'Check in at Main Gate before starting work',
  'Report any safety concerns immediately',
  'No unauthorized areas access',
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed': return 'bg-green-100 text-green-800';
    case 'In Progress': return 'bg-blue-100 text-blue-800';
    case 'Scheduled': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function ContractorVisitorPage() {
  return (
    <DashboardLayout title="Contractor Dashboard">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-800 to-red-950 rounded-xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <HardHat className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Welcome, Contractor! 🔧</h2>
              <p className="text-red-100 text-sm">You&apos;re working at OCP Group today</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-red-600" /> Your Work Orders
          </h3>
          <div className="space-y-3">
            {workOrders.map((wo) => (
              <div key={wo.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-gray-500">{wo.id}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(wo.status)}`}>
                        {wo.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium mt-1">{wo.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Due: {wo.dueDate}</p>
                  </div>
                </div>
              </div>
            ))}
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
