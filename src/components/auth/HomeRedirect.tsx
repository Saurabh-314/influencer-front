import { Navigate } from 'react-router-dom';
import MarketingLayout from '@/layouts/MarketingLayout';
import Home from '@/pages/marketing/Home';
import { getRoleDashboardPath, getStoredUser, isAuthenticated } from '@/utils/auth';

export default function HomeRedirect() {
    if (isAuthenticated()) {
        return <Navigate to={getRoleDashboardPath(getStoredUser()?.role)} replace />;
    }

    return (
        <MarketingLayout>
            <Home />
        </MarketingLayout>
    );
}
