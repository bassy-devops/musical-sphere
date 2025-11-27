import { create } from 'zustand';

interface AppState {
    rotationSpeed: number;
    setRotationSpeed: (speed: number) => void;
    isRecording: boolean;
    setIsRecording: (isRecording: boolean) => void;
    isPlaying: boolean; // For playback if we implement it later
}

export const useStore = create<AppState>((set) => ({
    rotationSpeed: 1, // Base speed
    setRotationSpeed: (speed) => set({ rotationSpeed: speed }),
    isRecording: false,
    setIsRecording: (isRecording) => set({ isRecording }),
    isPlaying: false,
}));
