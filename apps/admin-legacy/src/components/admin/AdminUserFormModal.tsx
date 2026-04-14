import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Shield, CheckCircle2 } from 'lucide-react';
import { AdminUser } from '../../types/database';
import { motion, AnimatePresence } from 'motion/react';

interface AdminUserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: AdminUser | null;
  onSave: (user: Partial<AdminUser>) => void;
}

export const AdminUserFormModal: React.FC<AdminUserFormModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  onSave 
}) => {
  const [formData, setFormData] = useState<Partial<AdminUser>>({
    full_name: '',
    email: '',
    role: 'editor',
    status: 'invited',
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({
        full_name: '',
        email: '',
        role: 'editor',
        status: 'invited',
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col"
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-headline font-bold text-gray-900">
                {user ? 'Edit Admin User' : 'Add Admin User'}
              </h2>
              <p className="text-sm text-gray-500">Configure internal access and permissions.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  required
                  value={formData.full_name || ''}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="email" 
                  required
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. john@topcoupons.ai"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Role</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select 
                    required
                    value={formData.role || 'editor'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="editor">Editor</option>
                    <option value="coupon_manager">Coupon Manager</option>
                    <option value="content_manager">Content Manager</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Status</label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select 
                    required
                    value={formData.status || 'invited'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="invited">Invited</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
              <p className="text-xs text-amber-800 leading-relaxed">
                <span className="font-bold">Note:</span> Admin users have access to sensitive platform data. Ensure you assign the minimum required role for each user. Invited users will receive an email to set up their password.
              </p>
            </div>
          </form>

          <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {user ? 'Update User' : 'Add User'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
