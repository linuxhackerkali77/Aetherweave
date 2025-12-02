
'use client';

import { createContext, useContext } from 'react';

export type TutorialPageId = 'auth-check' | 'dashboard' | 'chat' | 'news';

export interface LoadingContextType {
    isLoading: boolean;
    progress: number;
    tutorialPageId: TutorialPageId | null;
    startPageLoad: (pageId: TutorialPageId) => void;
    finishPageLoad: (path: string) => void;
}

export const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};
