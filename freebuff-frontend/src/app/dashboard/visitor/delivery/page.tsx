'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Package, Truck, MapPin, Clock, CheckCircle, AlertCircle, Navigation, Phone, Shield } from 'lucide-react';

const deliveryStats = [
  { label: 'Deliveries Today', value: '12', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Completed', value: '8', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'In Transit', value: '3', icon: Truck, color: 'text-orange-600', bg: 'bg-orange-50' },
  { label: 'Pending', value: '1', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
];

const deliveries = [
  { id: 'DLV-001', vendor: 'Industrial Parts Co.', destination: 'Warehouse B', status: 'Delivered', time: '08:30', dock: 'Bay 3' },
  { id: 'DLV-002', vendor: 'Chem Supply Ltd.', destination: 'Lab 201', status: 'In Transit', time: '09:15', dock: 'Bay 1' },
  { id: 'DLV-003', vendor: 'Office Solutions', destination: 'Admin Building', status: 'In Transit', time: '10:00', dock: 'Loading Dock' },
  { id: 'DLV-004', vendor: 'Safety Equipment Inc.', destination: 'Safety Office', status: 'Scheduled', time: '11:30', dock: 'Bay 2' },
  { id: 'DLV-005', vendor: 'Maintenance Supplies', destination: 'Workshop A', status: 'Delivered', time: '07:45', dock: 'Bay 4' },
];

const siteMap = [
  { name: 'Main Gate', status: 'Check-in point', x: 10, y: 50 },
  { name: 'Warehouse B', status: 'Delivery zone', x: 40, y: 30 },
  { name: 'Lab 201', status: 'Pending delivery', x: 60, y: 60 },
  { name: 'Admin Building', status: 'In transit', x: 70, y: 40 },
  { name: 'Loading Dock', status: 'Active', x: 30, y: 70 },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Delivered': return 'bg-green-100 text-green-800';
    case 'In Transit': return 'bg-blue-100 text-blue-800';
    case 'Scheduled': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function DeliveryDashboardPage() {
  return (
    <DashboardLayout title="Delivery Dashboard">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-700 rounded-xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <Truck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Delivery Portal 📦</h2>
              <p className="text-orange-100 text-sm">Track and manage your deliveries at OCP</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {deliveryStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-gray-100`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-sm text-gray-600">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Delivery List */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" /> Today&apos;s Deliveries
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {deliveries.map((delivery) => (
                <div key={delivery.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-500">{delivery.id}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(delivery.status)}`}>
                          {delivery.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium mt-1">{delivery.vendor}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">→ {delivery.destination} • {delivery.dock}</p>
                    </div>
                    <span className="text-xs text-gray-500">{delivery.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Navigation className="w-5 h-5 text-green-600" /> Site Navigation
              </h3>
              <div className="space-y-2">
                {siteMap.map((loc) => (
                  <div key={loc.name} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <div className="flex-1">
                      <span className="text-sm font-medium">{loc.name}</span>
                      <p className="text-xs text-gray-500">{loc.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Reminder */}
            <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-2 text-yellow-800">
                <Shield className="w-5 h-5" /> Safety Reminder
              </h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Wear safety vest at all times</li>
                <li>• Follow designated delivery routes</li>
                <li>• Check in at Main Gate</li>
                <li>• No unauthorized areas</li>
              </ul>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <Phone className="w-5 h-5 text-red-600" /> Emergency Contact
              </h3>
              <p className="text-sm text-gray-600">Security Desk: <span className="font-medium">+212 5XX XXX XXX</span></p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
