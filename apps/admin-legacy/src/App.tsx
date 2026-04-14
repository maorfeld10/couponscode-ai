/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { MerchantPage } from './pages/MerchantPage';
import { StoresPage } from './pages/StoresPage';
import { CouponsPage } from './pages/CouponsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CategoryPage } from './pages/CategoryPage';
import { LegalPage } from './pages/LegalPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminMerchants } from './pages/admin/AdminMerchants';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminArticles } from './pages/admin/AdminArticles';
import { AdminEditorial } from './pages/admin/AdminEditorial';
import { AdminLegal } from './pages/admin/AdminLegal';
import { AdminUsers } from './pages/admin/AdminUsers';
import { SiteUsers } from './pages/admin/SiteUsers';
import { AdminAudit } from './pages/admin/AdminAudit';
import { AdminMedia } from './pages/admin/AdminMedia';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminLogin } from './pages/admin/AdminLogin';
import { ScrollToTop } from './components/ScrollToTop';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminGuard } from './components/admin/AdminGuard';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirect hash URLs to clean URLs (e.g. /#/stores -> /stores)
    if (window.location.hash) {
      const hashPath = window.location.hash.substring(1); // remove #
      if (hashPath && hashPath.startsWith('/')) {
        navigate(hashPath, { replace: true });
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-sky-100 selection:text-sky-900">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<><Header /><main><HomePage /></main><Footer /></>} />
        <Route path="/stores" element={<><Header /><main><StoresPage /></main><Footer /></>} />
        <Route path="/coupons" element={<><Header /><main><CouponsPage /></main><Footer /></>} />
        <Route path="/categories" element={<><Header /><main><CategoriesPage /></main><Footer /></>} />
        <Route path="/category/:categoryName" element={<><Header /><main><CategoryPage /></main><Footer /></>} />
        <Route path="/contact-us" element={<><Header /><main><LegalPage /></main><Footer /></>} />
        <Route path="/privacy-policy" element={<><Header /><main><LegalPage /></main><Footer /></>} />
        <Route path="/terms-and-conditions" element={<><Header /><main><LegalPage /></main><Footer /></>} />
        <Route path="/:merchantSlug" element={<><Header /><main><MerchantPage /></main><Footer /></>} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="merchants" element={<AdminMerchants />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="articles" element={<AdminArticles />} />
          <Route path="editorial" element={<AdminEditorial />} />
          <Route path="legal" element={<AdminLegal />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="admin-users" element={<AdminUsers />} />
          <Route path="site-users" element={<SiteUsers />} />
          <Route path="audit" element={<AdminAudit />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
