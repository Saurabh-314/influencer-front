import type { NavigateFunction } from 'react-router-dom';

export type UserRole = 'admin' | 'creator' | 'brand';

export type StoredUser = {
    id?: string;
    name?: string;
    email?: string;
    role?: UserRole | string;
};

export function getStoredUser(): StoredUser | null {
    try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
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
            return '/login';
    }
}

export function logout(navigate: NavigateFunction) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
}
