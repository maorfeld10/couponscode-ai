import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Edit2, 
  Trash2, 
  ShieldCheck, 
  UserMinus, 
  Mail, 
  MoreVertical,
  Shield,
  UserCheck,
  UserX,
  Clock,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import * as supabaseService from '../../services/supabaseService';
import { AdminUser } from '../../types/database';
import { AdminUserFormModal } from '../../components/admin/AdminUserFormModal';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await supabaseService.getAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching admin users:', err);
      setError('Failed to load admin users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (userData: Partial<AdminUser>) => {
    try {
      // Strip metadata fields
      const { id, created_at, updated_at, ...saveData } = userData as any;

      if (selectedUser) {
        await supabaseService.updateAdminUser(selectedUser.id, saveData);
        await supabaseService.createAuditLog({
          admin_email: 'yogev@intango.com',
          action_type: 'edited',
          entity_type: 'admin_user',
          entity_id: selectedUser.id,
          entity_name: saveData.full_name || selectedUser.full_name,
          details: `Admin user ${saveData.full_name} updated`
        });
      } else {
        const newUser = await supabaseService.createAdminUser(saveData);
        await supabaseService.createAuditLog({
          admin_email: 'yogev@intango.com',
          action_type: 'created',
          entity_type: 'admin_user',
          entity_id: newUser.id,
          entity_name: newUser.full_name,
          details: `Admin user ${newUser.full_name} created`
        });
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving admin user:', err);
      alert('Failed to save admin user.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this admin user?')) {
      try {
        await supabaseService.deleteAdminUser(id);
        await fetchData();
      } catch (err) {
        console.error('Error deleting admin user:', err);
        alert('Failed to delete admin user.');
      }
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await supabaseService.updateAdminUser(user.id, { status: newStatus });
      await fetchData();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <span className="px-2 py-1 bg-purple-50 text-purple-600 text-[10px] font-bold uppercase rounded-lg flex items-center gap-1 w-fit"><Shield className="w-3 h-3" /> Super Admin</span>;
      case 'editor':
        return <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-lg flex items-center gap-1 w-fit"><Edit2 className="w-3 h-3" /> Editor</span>;
      case 'coupon_manager':
        return <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-lg flex items-center gap-1 w-fit"><ShieldCheck className="w-3 h-3" /> Coupon Mgr</span>;
      case 'content_manager':
        return <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase rounded-lg flex items-center gap-1 w-fit"><ShieldCheck className="w-3 h-3" /> Content Mgr</span>;
      default:
        return <span className="px-2 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold uppercase rounded-lg w-fit">{role}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase rounded-lg flex items-center gap-1 w-fit"><UserCheck className="w-3 h-3" /> Active</span>;
      case 'inactive':
        return <span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded-lg flex items-center gap-1 w-fit"><UserX className="w-3 h-3" /> Inactive</span>;
      case 'invited':
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded-lg flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Invited</span>;
      default:
        return <span className="px-2 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold uppercase rounded-lg w-fit">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-gray-900">Admin Users</h1>
          <p className="text-gray-500 text-sm">Manage internal company access and permissions.</p>
        </div>
        <button 
          onClick={handleAddUser}
          className="bg-primary text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Admin User
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={fetchData} className="ml-auto text-sm font-bold underline">Retry</button>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-blue-900">Internal Access Only</p>
          <p className="text-xs text-blue-700">This section is for managing company employees. Only Super Admins can modify these records. Your current role: <span className="font-bold">Super Admin</span>.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full text-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <Shield className="w-4 h-4 text-gray-400" />
              <select 
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-600 focus:outline-none cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="editor">Editor</option>
                <option value="coupon_manager">Coupon Manager</option>
                <option value="content_manager">Content Manager</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-600 focus:outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="invited">Invited</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">
                          {(user.full_name || user.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{user.full_name || 'No Name'}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {user.status === 'active' ? (
                          <button 
                            onClick={() => handleToggleStatus(user)}
                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Deactivate"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleToggleStatus(user)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                            title="Activate"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        {user.status === 'invited' && (
                          <button 
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Resend Invite"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filteredUsers.length === 0 && !loading && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-headline font-bold text-gray-900 mb-1">No admin users found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      <AdminUserFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
      />
    </div>
  );
};
