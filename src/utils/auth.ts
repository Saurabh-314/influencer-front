import type { NavigateFunction } from 'react-router-dom';

export type UserRole = 'admin' | 'creator' | 'brand';

const VALID_ROLES: UserRole[] = ['creator', 'brand', 'admin'];

export type StoredUser = {
    id?: string;
    name?: string;
    email?: string;
    role?: UserRole | string;
};

export function isValidRole(role?: string): role is UserRole {
    return VALID_ROLES.includes(role as UserRole);
}

export function getStoredUser(): StoredUser | null {
    try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function clearAuth(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
}

/** Remove partial or invalid auth left in localStorage (e.g. token without user/role). */
export function normalizeAuthState(): void {
    const hasToken = !!localStorage.getItem('accessToken');
    if (hasToken && !isAuthenticated()) {
        clearAuth();
    }
}

export function isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken') && isValidRole(getStoredUser()?.role);
}

export function getRoleDashboardPath(role?: string): string {
    switch (role) {
        case 'creator':
            return '/creator/dashboard';
        case 'admin':
            return '/admin/dashboard';
        case 'brand':
            return '/brand/dashboard';
        default:
            return '/';
    }
}

export function logout(navigate: NavigateFunction) {
    clearAuth();
    navigate('/login');
}
