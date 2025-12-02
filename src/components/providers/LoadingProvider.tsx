
'use client';
import { useState, useCallback, useRef, ReactNode, useMemo } from 'react';
import { LoadingContext, TutorialPageId } from '@/hooks/use-loading';
import { useRouter } from 'next/navigation';

export function LoadingProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [tutorialPageId, setTutorialPageId] = useState<TutorialPageId | null>(null);
    const animationFrameRef = useRef<number>();
    const router = useRouter();

    const startPageLoad = useCallback((pageId: TutorialPageId) => {
        setIsLoading(true);
        setTutorialPageId(pageId);
        setProgress(0);

        let startTime: number | null = null;
        const duration = 2000 + Math.random() * 1000; // 2-3 seconds load time

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const newProgress = Math.min((elapsed / duration) * 100, 100);
            setProgress(newProgress);

            if (newProgress < 100) {
                animationFrameRef.current = requestAnimationFrame(animate);
            }
        };
        animationFrameRef.current = requestAnimationFrame(animate);
    }, []);

    const finishPageLoad = useCallback((path: string) => {
        setProgress(100);
        
        // Ensure redirection happens, then fade out.
        router.replace(path);
        
        setTimeout(() => {
            setIsLoading(false);
            setTutorialPageId(null);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        }, 500); // Wait for fade-out animation
    }, [router]);

    const contextValue = useMemo(() => ({
        isLoading,
        progress,
        tutorialPageId,
        startPageLoad,
        finishPageLoad,
    }), [isLoading, progress, tutorialPageId, startPageLoad, finishPageLoad]);

    return (
        <LoadingContext.Provider value={contextValue}>
            {children}
        </LoadingContext.Provider>
    );
}
