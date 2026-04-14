import React from 'react';
import { Save, Shield, Bell, Globe, Database, User } from 'lucide-react';
import { motion } from 'motion/react';

export const AdminSettings: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-headline font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm">Configure your application and admin preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-2">
          <h2 className="text-lg font-bold text-gray-900">General Settings</h2>
          <p className="text-sm text-gray-500">Basic configuration for your TopCoupons.ai instance.</p>
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Site Name</label>
            <input 
              type="text" 
              defaultValue="TopCoupons.ai"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Support Email</label>
            <input 
              type="email" 
              defaultValue="support@topcoupons.ai"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="flex justify-end">
            <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-2">
          <h2 className="text-lg font-bold text-gray-900">Security</h2>
          <p className="text-sm text-gray-500">Manage authentication and access control.</p>
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {[
              { title: 'Two-Factor Authentication', description: 'Add an extra layer of security to your account.', icon: Shield, enabled: true },
              { title: 'Session Timeout', description: 'Automatically log out after 30 minutes of inactivity.', icon: Clock, enabled: false },
              { title: 'IP Whitelisting', description: 'Restrict admin access to specific IP addresses.', icon: Globe, enabled: false },
            ].map((item, index) => (
              <div key={index} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked={item.enabled} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Clock = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
