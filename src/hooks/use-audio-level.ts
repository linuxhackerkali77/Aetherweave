
'use client';

import { useState, useEffect, useRef } from 'react';

export function useAudioLevel(stream: MediaStream | null): number {
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    if (!stream) {
      setAudioLevel(0);
      return;
    }

    if (!audioContextRef.current) {
        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.", e);
            return;
        }
    }
    const audioContext = audioContextRef.current;

    if (!analyserRef.current) {
      analyserRef.current = audioContext.createAnalyser();
      analyserRef.current.fftSize = 256;
    }
    const analyser = analyserRef.current;

    if (!dataArrayRef.current) {
      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
    }
    const dataArray = dataArrayRef.current;
    
    // Disconnect previous source if it exists
    if (sourceRef.current) {
        sourceRef.current.disconnect();
    }

    try {
        sourceRef.current = audioContext.createMediaStreamSource(stream);
        sourceRef.current.connect(analyser);
    } catch (e) {
        console.error("Error connecting media stream source:", e);
        return;
    }
    

    const getAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      setAudioLevel(average / 128); // Normalize to 0-2 range

      animationFrameIdRef.current = requestAnimationFrame(getAudioLevel);
    };

    getAudioLevel();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
    };
  }, [stream]);

  return audioLevel;
}
