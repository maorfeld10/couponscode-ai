import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  User, 
  Calendar, 
  Clock, 
  MoreVertical,
  Shield,
  FileText,
  Ticket,
  Store,
  Layout,
  BookOpen,
  PlusCircle,
  Edit3,
  CheckCircle2,
  XCircle,
  EyeOff,
  Trash2,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import * as supabaseService from '../../services/supabaseService';
import { AuditLog } from '../../types/database';

export const AdminAudit: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEntity, setFilterEntity] = useState('all');
  const [filterAction, setFilterAction] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await supabaseService.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'merchant': return <Store className="w-4 h-4" />;
      case 'coupon': return <Ticket className="w-4 h-4" />;
      case 'legal': return <FileText className="w-4 h-4" />;
      case 'article': return <BookOpen className="w-4 h-4" />;
      case 'editorial_page': return <Layout className="w-4 h-4" />;
      case 'admin_user': return <Shield className="w-4 h-4" />;
      default: return <History className="w-4 h-4" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <PlusCircle className="w-3 h-3 text-green-500" />;
      case 'edited': return <Edit3 className="w-3 h-3 text-blue-500" />;
      case 'published': return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
      case 'hidden': return <EyeOff className="w-3 h-3 text-amber-500" />;
      case 'deleted': return <Trash2 className="w-3 h-3 text-red-500" />;
      default: return <Clock className="w-3 h-3 text-gray-500" />;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = (log.admin_email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          (log.entity_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesEntity = filterEntity === 'all' || log.entity_type === filterEntity;
    const matchesAction = filterAction === 'all' || log.action_type === filterAction;
    return matchesSearch && matchesEntity && matchesAction;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-gray-900">Audit Log</h1>
          <p className="text-gray-500 text-sm">Track admin change history and operational activity.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
          <Clock className="w-3 h-3" />
          Last updated: {loading ? 'Updating...' : 'Just now'}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={fetchData} className="ml-auto text-sm font-bold underline">Retry</button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by user or entity..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full text-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select 
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-600 focus:outline-none cursor-pointer"
              >
                <option value="all">All Entities</option>
                <option value="merchant">Merchants</option>
                <option value="coupon">Coupons</option>
                <option value="legal">Legal</option>
                <option value="article">Articles</option>
                <option value="editorial_page">Editorial</option>
                <option value="admin_user">Admins</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select 
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-600 focus:outline-none cursor-pointer"
              >
                <option value="all">All Actions</option>
                <option value="created">Created</option>
                <option value="edited">Edited</option>
                <option value="published">Published</option>
                <option value="hidden">Hidden</option>
                <option value="deleted">Deleted</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Admin User</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Entity Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Entity Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{log.admin_email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action_type)}
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-600">{log.action_type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-100 rounded-lg text-gray-500">
                          {getEntityIcon(log.entity_type)}
                        </div>
                        <span className="text-xs font-medium text-gray-600 capitalize">{log.entity_type.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">{log.entity_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-xs text-gray-900 font-medium">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {new Date(log.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                          <Clock className="w-3 h-3" />
                          {new Date(log.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all" title={log.details}>
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredLogs.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-headline font-bold text-gray-900 mb-1">No logs found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Actions</p>
          <p className="text-3xl font-headline font-bold text-gray-900">{logs.length}</p>
          <div className="flex items-center gap-1 text-xs text-green-600 font-bold">
            <PlusCircle className="w-3 h-3" />
            Live tracking active
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Admins</p>
          <p className="text-3xl font-headline font-bold text-gray-900">
            {new Set(logs.map(l => l.admin_email)).size}
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-500 font-bold">
            <User className="w-3 h-3" />
            Internal staff
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">System Health</p>
          <p className="text-3xl font-headline font-bold text-emerald-600">Stable</p>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
            <CheckCircle2 className="w-3 h-3" />
            Operational
          </div>
        </div>
      </div>
    </div>
  );
};
