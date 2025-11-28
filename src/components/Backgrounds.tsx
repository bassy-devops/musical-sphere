import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { VideoTexture, Color } from 'three';
import { Sparkles, Stars, Cloud } from '@react-three/drei';
import { useStore } from '../store/useStore';

export const Backgrounds = () => {
    const { backgroundMode } = useStore();
    const { scene } = useThree();

    // Handle Camera Background
    useEffect(() => {
        if (backgroundMode === 'camera') {
            const video = document.createElement('video');
            video.autoplay = true;
            video.playsInline = true;
            video.muted = true;

            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                .then(stream => {
                    video.srcObject = stream;
                    video.play();
                    const texture = new VideoTexture(video);
                    scene.background = texture;
                })
                .catch(err => {
                    console.error("Camera access denied:", err);
                    // Fallback if camera fails
                    scene.background = new Color('#111');
                });

            return () => {
                const stream = video.srcObject as MediaStream;
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                scene.background = null;
            };
        } else {
            scene.background = null; // Clear background for other modes
        }
    }, [backgroundMode, scene]);

    if (backgroundMode === 'beautiful') {
        return (
            <>
                <color attach="background" args={['#201c33']} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Sparkles count={100} scale={12} size={4} speed={0.4} opacity={0.5} color="#FFB7B2" />
                <Cloud opacity={0.5} speed={0.4} segments={20} position={[0, 5, -10]} color="#AEC6CF" />
                {/* Add a subtle fog for depth */}
                <fog attach="fog" args={['#201c33', 5, 20]} />
            </>
        );
    }

    if (backgroundMode === 'default') {
        return <color attach="background" args={['#111']} />;
    }

    return null;
};
