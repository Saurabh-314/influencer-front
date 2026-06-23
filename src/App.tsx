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


const queryClient = new QueryClient();


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={<DashboardLayout children={<Navigate to="/dashboard" replace />} />} />
            <Route path="/dashboard" element={<DashboardLayout children={<Dashboard />} />} />
            <Route path="/campaigns" element={<DashboardLayout children={<Campaigns />} />} />
            <Route path="/campaigns/:id" element={<DashboardLayout children={<CampaignDetail />} />} />
            <Route path="/leaderboard" element={<DashboardLayout children={<Leaderboard />} />} />
            <Route path="/analytics" element={<DashboardLayout children={<Analytics />} />} />
            <Route path="/accounts" element={<DashboardLayout children={<Accounts />} />} />
            <Route path="/accounts/:id" element={<DashboardLayout children={<SocialAccountDetail />} />} />
            <Route path="/settings" element={<DashboardLayout children={<Settings />} />} />


            {/* Admin Routes */}
            <Route path="/admin" element={<div>Admin Dashboard</div>} />
          </Routes>
        </BrowserRouter>
      </JotaiProvider>
    </QueryClientProvider>
  );
}

export default App;
