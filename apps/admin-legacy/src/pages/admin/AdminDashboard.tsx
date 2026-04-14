import React from 'react';
import { 
  Users, 
  Store, 
  Ticket, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Settings
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
        trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
      }`}>
        {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {change}
      </div>
    </div>
    <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
    <p className="text-2xl font-headline font-bold text-gray-900">{value}</p>
  </motion.div>
);

export const AdminDashboard: React.FC = () => {
  const stats = [
    { title: 'Total Merchants', value: '124', change: '+12%', icon: Store, trend: 'up' },
    { title: 'Active Coupons', value: '842', change: '+5.4%', icon: Ticket, trend: 'up' },
    { title: 'Total Users', value: '12,450', change: '+18%', icon: Users, trend: 'up' },
    { title: 'Conversion Rate', value: '3.2%', change: '-0.8%', icon: TrendingUp, trend: 'down' },
  ];

  const recentActivity = [
    { id: 1, type: 'coupon', action: 'New coupon added', target: 'Amazon - 20% Off', time: '2 mins ago', status: 'success' },
    { id: 2, type: 'merchant', action: 'Merchant updated', target: 'Nike Store', time: '15 mins ago', status: 'info' },
    { id: 3, type: 'user', action: 'New user registered', target: 'john.doe@example.com', time: '1 hour ago', status: 'success' },
    { id: 4, type: 'system', action: 'System alert', target: 'Database backup completed', time: '3 hours ago', status: 'warning' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back, here's what's happening today.</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md flex items-center gap-2">
          <Ticket className="w-4 h-4" />
          Quick Add Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-headline font-bold text-gray-900">Recent Activity</h2>
            <button className="text-primary text-sm font-semibold hover:underline">View all</button>
          </div>
          <div className="space-y-6">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  activity.status === 'success' ? 'bg-green-50 text-green-600' :
                  activity.status === 'warning' ? 'bg-amber-50 text-amber-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {activity.status === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                   activity.status === 'warning' ? <AlertCircle className="w-5 h-5" /> :
                   <Clock className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{activity.action}</p>
                  <p className="text-xs text-gray-500 truncate">{activity.target}</p>
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-headline font-bold text-gray-900 mb-6">Quick Links</h2>
          <div className="space-y-3">
            {[
              { label: 'Manage Merchants', path: '/admin/merchants', icon: Store },
              { label: 'Manage Coupons', path: '/admin/coupons', icon: Ticket },
              { label: 'System Settings', path: '/admin/settings', icon: Settings },
            ].map((link, index) => (
              <Link 
                key={index}
                to={link.path}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-primary/5 rounded-xl transition-all group border border-transparent hover:border-primary/10"
              >
                <div className="flex items-center gap-3">
                  <link.icon className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors">{link.label}</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
