
'use client';
import { useEffect, useState, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLoading } from '@/hooks/use-loading';
import LoadingBar from './loading-bar';
import TutorialPopup from './tutorial-popup';
import { tutorialContent } from '@/lib/tutorial-content';
import { appEventEmitter } from '@/lib/event-emitter';

interface PopupState {
  id: number;
  content: { title: string; description: string; icon: any };
  x: number;
  y: number;
  width: number;
  height: number;
}

const POPUP_WIDTH = 220;
const POPUP_HEIGHT = 100;
const PADDING = 20;

export default function Loader() {
  const { isLoading, progress, tutorialPageId } = useLoading();
  const [popups, setPopups] = useState<PopupState[]>([]);
  const popupIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const tutorialSteps = useMemo(() => {
    return tutorialPageId ? tutorialContent[tutorialPageId] : [];
  }, [tutorialPageId]);

  const doesCollide = (newPopup: Omit<PopupState, 'id' | 'content'>, existingPopups: PopupState[]) => {
    for (const p of existingPopups) {
      if (
        newPopup.x < p.x + p.width &&
        newPopup.x + newPopup.width > p.x &&
        newPopup.y < p.y + p.height &&
        newPopup.y + newPopup.height > p.y
      ) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    if (isLoading && tutorialSteps.length > 0) {
      let stepIndex = 0;

      const spawnPopup = () => {
        if (stepIndex >= tutorialSteps.length) {
          if (popupIntervalRef.current) clearInterval(popupIntervalRef.current);
          return;
        }

        const content = tutorialSteps[stepIndex];
        let newPopup: Omit<PopupState, 'id' | 'content'>;
        let attempts = 0;

        do {
          newPopup = {
            x: PADDING + Math.random() * (window.innerWidth - POPUP_WIDTH - PADDING * 2),
            y: PADDING + Math.random() * (window.innerHeight - POPUP_HEIGHT - PADDING * 2),
            width: POPUP_WIDTH + 2 * PADDING,
            height: POPUP_HEIGHT + 2 * PADDING,
          };
          attempts++;
        } while (doesCollide(newPopup, popups) && attempts < 50);

        setPopups(prev => [...prev, { ...newPopup, id: Date.now(), content }]);
        appEventEmitter.emit('ui:sound', 'success');

        stepIndex++;
      };

      spawnPopup();
      popupIntervalRef.current = setInterval(spawnPopup, 700);

    } else if (!isLoading) {
      if (popupIntervalRef.current) clearInterval(popupIntervalRef.current);
      setPopups([]);
    }

    return () => {
      if (popupIntervalRef.current) clearInterval(popupIntervalRef.current);
    };
  }, [isLoading, tutorialSteps]); // Removed popups from dependencies

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background pointer-events-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
        >
          <div className="absolute top-0 left-0 w-full h-full">
            <AnimatePresence>
              {popups.map(popup => (
                <TutorialPopup key={popup.id} {...popup} />
              ))}
            </AnimatePresence>
          </div>
          
          <LoadingBar progress={progress} />
          
        </motion.div>
      )}
    </AnimatePresence>
  );
}
