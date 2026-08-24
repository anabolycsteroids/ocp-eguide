'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Shield, AlertTriangle, Lock, Eye, Activity, Server, Wifi, Monitor } from 'lucide-react';

const securityMetrics = [
  { label: 'Active Threats', value: '3', change: '+1', color: 'text-red-600', bg: 'bg-red-50' },
  { label: 'Blocked Attempts', value: '127', change: '+23', color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'System Uptime', value: '99.9%', change: '0%', color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Firewall Rules', value: '842', change: '+12', color: 'text-purple-600', bg: 'bg-purple-50' },
];

const alerts = [
  { id: 1, severity: 'Critical', message: 'Unauthorized access attempt from 192.168.1.105', time: '2 min ago', zone: 'Server Room A' },
  { id: 2, severity: 'Warning', message: 'Failed login attempts exceeded threshold', time: '15 min ago', zone: 'Building B' },
  { id: 3, severity: 'Critical', message: 'Suspicious file download detected', time: '32 min ago', zone: 'HR Floor' },
  { id: 4, severity: 'Info', message: 'Certificate expiring in 7 days', time: '1 hr ago', zone: 'VPN Gateway' },
  { id: 5, severity: 'Warning', message: 'Unusual network traffic pattern', time: '2 hr ago', zone: 'Factory Floor' },
];

const cameras = [
  { id: 1, name: 'Main Entrance', zone: 'Building A', status: 'Online', recording: true },
  { id: 2, name: 'Parking Lot', zone: 'Exterior', status: 'Online', recording: true },
  { id: 3, name: 'Server Room', zone: 'Building C', status: 'Online', recording: true },
  { id: 4, name: 'Reception Desk', zone: 'Building A', status: 'Offline', recording: false },
  { id: 5, name: 'Warehouse', zone: 'Building D', status: 'Online', recording: true },
];

const networkDevices = [
  { name: 'Gateway Router', status: 'Online', ip: '10.0.0.1', type: 'Router' },
  { name: 'Core Switch', status: 'Online', ip: '10.0.0.2', type: 'Switch' },
  { name: 'WiFi AP - Floor 1', status: 'Online', ip: '10.0.1.10', type: 'Access Point' },
  { name: 'WiFi AP - Floor 2', status: 'Online', ip: '10.0.1.11', type: 'Access Point' },
  { name: 'Backup Server', status: 'Maintenance', ip: '10.0.0.50', type: 'Server' },
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'Critical': return 'bg-red-100 text-red-800';
    case 'Warning': return 'bg-yellow-100 text-yellow-800';
    case 'Info': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function ITSecurityPage() {
  const [selectedTab, setSelectedTab] = useState<'alerts' | 'cameras' | 'network'>('alerts');

  return (
    <DashboardLayout title="IT Security">
      <div className="space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {securityMetrics.map((metric) => (
            <div key={metric.label} className={`${metric.bg} rounded-xl p-4 border border-gray-100`}>
              <div className="text-sm text-gray-600">{metric.label}</div>
              <div className="text-2xl font-bold mt-1">{metric.value}</div>
              <div className={`text-sm mt-1 ${metric.color}`}>{metric.change} today</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex border-b border-gray-200">
            {(['alerts', 'cameras', 'network'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-6 py-3 text-sm font-medium capitalize ${
                  selectedTab === tab
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'alerts' ? '🚨 Security Alerts' : tab === 'cameras' ? '📹 CCTV Cameras' : '🌐 Network Status'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {selectedTab === 'alerts' && (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                      alert.severity === 'Critical' ? 'text-red-500' :
                      alert.severity === 'Warning' ? 'text-yellow-500' : 'text-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className="text-sm text-gray-500">{alert.zone}</span>
                      </div>
                      <p className="text-sm text-gray-800">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                    </div>
                    <button className="px-3 py-1 text-sm text-green-600 bg-green-50 rounded-lg hover:bg-green-100">
                      Investigate
                    </button>
                  </div>
                ))}
              </div>
            )}

            {selectedTab === 'cameras' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cameras.map((camera) => (
                  <div key={camera.id} className="bg-gray-900 rounded-lg overflow-hidden">
                    <div className="aspect-video bg-gray-800 flex items-center justify-center relative">
                      <Monitor className="w-12 h-12 text-gray-600" />
                      {camera.recording && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-600 px-2 py-0.5 rounded text-xs text-white">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          REC
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">{camera.name}</h4>
                          <p className="text-xs text-gray-500">{camera.zone}</p>
                        </div>
                        <span className={`w-2 h-2 rounded-full ${
                          camera.status === 'Online' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedTab === 'network' && (
              <div className="space-y-3">
                {networkDevices.map((device) => (
                  <div key={device.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      {device.type === 'Router' ? <Wifi className="w-5 h-5 text-blue-500" /> :
                       device.type === 'Switch' ? <Server className="w-5 h-5 text-green-500" /> :
                       <Monitor className="w-5 h-5 text-purple-500" />}
                      <div>
                        <h4 className="text-sm font-medium">{device.name}</h4>
                        <p className="text-xs text-gray-500">{device.ip}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">{device.type}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        device.status === 'Online' ? 'bg-green-100 text-green-800' :
                        device.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {device.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
