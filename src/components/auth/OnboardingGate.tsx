import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getStoredUser, needsOnboarding } from '@/utils/auth';

export function OnboardingGate({ children }: { children: ReactNode }) {
    const user = getStoredUser();
    if (needsOnboarding(user)) {
        return <Navigate to="/onboarding" replace />;
    }
    return children;
}
