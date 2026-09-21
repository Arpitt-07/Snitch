import React from 'react';
import { AuthProvider } from './AuthContext';
import { CursorProvider } from './CursorContext';
import { AppReadyProvider } from './AppReadyContext';
import { StoreProvider } from '@/store/StoreProvider';

export function AppProvider({ children, initialUser }) {
    return (
        <StoreProvider>
            <AuthProvider initialUser={initialUser}>
                <CursorProvider>
                    <AppReadyProvider>
                        {children}
                    </AppReadyProvider>
                </CursorProvider>
            </AuthProvider>
        </StoreProvider>
    );
}
