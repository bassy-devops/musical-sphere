import { create } from 'zustand';

interface AppState {
    rotationSpeed: number;
    setRotationSpeed: (speed: number) => void;
    isRecording: boolean;
    setIsRecording: (isRecording: boolean) => void;
    isPlaying: boolean; // For playback if we implement it later
    backgroundMode: 'default' | 'camera' | 'beautiful';
    setBackgroundMode: (mode: 'default' | 'camera' | 'beautiful') => void;
}

export const useStore = create<AppState>((set) => ({
    rotationSpeed: 1, // Base speed
    setRotationSpeed: (speed) => set({ rotationSpeed: speed }),
    isRecording: false,
    setIsRecording: (isRecording) => set({ isRecording }),
    isPlaying: false,
    backgroundMode: 'default',
    setBackgroundMode: (mode) => set({ backgroundMode: mode }),
}));
