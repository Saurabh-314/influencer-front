import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Campaigns from './pages/campaigns';
import CampaignDetail from './pages/campaigns/CampaignDetail';
import Leaderboard from './pages/leaderboard';
import Analytics from './pages/analytics';
import Accounts from './pages/accounts';
import SocialAccountDetail from './pages/accounts/SocialAccountDetail';
import Settings from './pages/settings';
import PrivacyPolicy from './pages/privacy-policy';
import BrandLayout from './layouts/BrandLayout';
import CreatorLayout from './layouts/CreatorLayout';
import AdminLayout from './layouts/AdminLayout';
// import BrandCreateCampaign from './pages/brand/CreateCampaign';
import CreatorDashboard from './pages/creator/Dashboard';
import CreatorInsights from './pages/creator/Insights';
import RoleRedirect from './components/auth/RoleRedirect';


const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<RoleRedirect />} />
            <Route path="/dashboard" element={<DashboardLayout children={<Dashboard />} />} />
            <Route path="/campaigns" element={<DashboardLayout children={<Campaigns />} />} />
            <Route path="/campaigns/:id" element={<DashboardLayout children={<CampaignDetail />} />} />
            <Route path="/leaderboard" element={<DashboardLayout children={<Leaderboard />} />} />
            <Route path="/analytics" element={<DashboardLayout children={<Analytics />} />} />
            <Route path="/accounts" element={<DashboardLayout children={<Accounts />} />} />
            <Route path="/accounts/:id" element={<DashboardLayout children={<SocialAccountDetail />} />} />
            <Route path="/settings" element={<DashboardLayout children={<Settings />} />} />
            <Route path="/privacy-policy" element={<DashboardLayout children={<PrivacyPolicy />} />} />



            {/* Brand Routes */}
            <Route path="/brand" element={<BrandLayout children={<Navigate to="/brand/dashboard" replace />} />} />
            <Route path="/brand/dashboard" element={<BrandLayout children={<div>Brand Overview</div>} />} />
            <Route path="/brand/campaigns" element={<BrandLayout children={<Campaigns />} />} />
            <Route path="/brand/campaigns/:id" element={<BrandLayout children={<CampaignDetail />} />} />
            <Route path="/brand/creators" element={<BrandLayout children={<div>Brand Creators</div>} />} />
            <Route path="/brand/analytics" element={<BrandLayout children={<div>Brand Analytics</div>} />} />

            {/* Creator Routes */}
            <Route path="/creator" element={<CreatorLayout children={<Navigate to="/creator/dashboard" replace />} />} />
            <Route path="/creator/dashboard" element={<CreatorLayout children={<CreatorDashboard />} />} />
            <Route path="/creator/insights/:id" element={<CreatorLayout children={<CreatorInsights />} />} />
            <Route path="/creator/campaigns" element={<CreatorLayout children={<div>Creator Campaigns</div>} />} />
            <Route path="/creator/payments" element={<CreatorLayout children={<div>Creator Payments</div>} />} />
            <Route path="/creator/messages" element={<CreatorLayout children={<div>Creator Messages</div>} />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminLayout children={<div>Admin Dashboard</div>} />} />
            <Route path="/admin/users" element={<AdminLayout children={<div>Admin Users</div>} />} />
            <Route path="/admin/settings" element={<AdminLayout children={<div>Admin Settings</div>} />} />
          </Routes>
        </BrowserRouter>
      </JotaiProvider>
    </QueryClientProvider>
  );
}

export default App;
