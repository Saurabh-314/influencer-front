import { Navigate } from 'react-router-dom';
import MarketingLayout from '@/layouts/MarketingLayout';
import Home from '@/pages/marketing/Home';
import { getPostAuthPath, getStoredUser, isAuthenticated } from '@/utils/auth';

export default function HomeRedirect() {
    if (isAuthenticated()) {
        return <Navigate to={getPostAuthPath(getStoredUser())} replace />;
    }

    return (
        <MarketingLayout>
            <Home />
        </MarketingLayout>
    );
}
