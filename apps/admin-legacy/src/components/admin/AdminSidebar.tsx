import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  Ticket, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Users,
  FileText,
  BookOpen,
  Layout,
  History,
  Image as ImageIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAdminAuth } from './AdminGuard';

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, setCollapsed }) => {
  const { signOut } = useAdminAuth();
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Store, label: 'Merchants', path: '/admin/merchants' },
    { icon: Ticket, label: 'Coupons', path: '/admin/coupons' },
    { icon: BookOpen, label: 'Articles', path: '/admin/articles' },
    { icon: Layout, label: 'Editorial', path: '/admin/editorial' },
    { icon: FileText, label: 'Legal', path: '/admin/legal' },
    { icon: ImageIcon, label: 'Media', path: '/admin/media' },
    { icon: ShieldCheck, label: 'Admin Users', path: '/admin/admin-users' },
    { icon: Users, label: 'Site Users', path: '/admin/site-users' },
    { icon: History, label: 'Audit Log', path: '/admin/audit' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <aside 
      className={`bg-white border-r border-gray-200 h-screen sticky top-0 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Ticket className="text-white w-5 h-5" />
            </div>
            <span className="font-headline font-bold text-xl text-primary">Admin</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
            <Ticket className="text-white w-5 h-5" />
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className={`w-5 h-5 shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full"
        >
          <LogOut className={`w-5 h-5 shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:shadow-md transition-all duration-200 text-gray-400 hover:text-primary hidden md:block"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
};
