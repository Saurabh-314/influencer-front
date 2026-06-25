import { Navigate } from 'react-router-dom';
import { getRoleDashboardPath, getStoredUser, isAuthenticated } from '@/utils/auth';

export default function RoleRedirect() {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    const user = getStoredUser();
    return <Navigate to={getRoleDashboardPath(user?.role)} replace />;
}
