import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { XR, createXRStore } from '@react-three/xr';
import { FloatingSphere } from './FloatingSphere';
import { Suspense, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { audioEngine } from '../audio/AudioEngine';

interface SphereData {
    id: number;
    position: [number, number, number];
    velocity: [number, number, number];
    size: number;
    color: string;
    autoPopTrigger?: number; // Timestamp
}

const COLORS = ["#ff00cc", "#3333ff", "#00ff99", "#ffcc00", "#ff3333", "#00ccff"];

const generateSphere = (id: number, arMode: boolean = false): SphereData => {
    // AR mode: smaller spawn area around user (within 2m radius, at user height)
    // Non-AR: larger area for desktop view
    const spawnRadius = arMode ? 1.5 : 10;
    const heightRange = arMode ? [0.5, 1.5] : [-10, 10];

    return {
        id,
        position: [
            (Math.random() - 0.5) * spawnRadius * 2,
            heightRange[0] + Math.random() * (heightRange[1] - heightRange[0]),
            (Math.random() - 0.5) * spawnRadius * 2
        ],
        velocity: [
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
        ],
        size: 0.2 + Math.random() * 0.3, // Smaller spheres for AR
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
};

export const Scene = () => {
    const [spheres, setSpheres] = useState<SphereData[]>(() =>
        Array.from({ length: 15 }, (_, i) => generateSphere(i, false))
    );
    const [arMode, setArMode] = useState(false);

    // Create XR store
    const store = useMemo(() => createXRStore(), []);

    const spheresRef = useRef(spheres);
    useEffect(() => {
        spheresRef.current = spheres;
    }, [spheres]);

    const handlePop = useCallback((id: number) => {
        // Remove popped sphere and add a new one
        setSpheres(prev => {
            const filtered = prev.filter(s => s.id !== id);
            const newId = Math.max(...prev.map(s => s.id), 0) + 1;
            return [...filtered, generateSphere(newId, arMode)];
        });
    }, [arMode]);

    useEffect(() => {
        audioEngine.onNoteTrigger(() => {
            const currentSpheres = spheresRef.current;
            if (currentSpheres.length === 0) return;

            // Find closest to center (0,0,0)
            let closestId = -1;
            let minDist = Infinity;

            currentSpheres.forEach(s => {
                const dist = Math.sqrt(s.position[0] ** 2 + s.position[1] ** 2 + s.position[2] ** 2);
                if (dist < minDist) {
                    minDist = dist;
                    closestId = s.id;
                }
            });

            if (closestId !== -1) {
                // Trigger auto-pop on this sphere
                setSpheres(prev => prev.map(s =>
                    s.id === closestId ? { ...s, autoPopTrigger: Date.now() } : s
                ));
            }
        });
    }, []);

    // Listen for XR session changes
    useEffect(() => {
        const unsubscribe = store.subscribe((state) => {
            // Listen for XR session changes
            const isInAR = !!state;
            if (isInAR) {
                setArMode(true);
                setSpheres(spheres =>
                    spheres.map(s => ({ ...generateSphere(s.id, true) }))
                );
            } else {
                setArMode(false);
            }
        });
        return () => unsubscribe();
    }, [store]);

    return (
        <Canvas
            shadows
            camera={{ position: [0, 1.6, 3], fov: 50 }}
            gl={{ preserveDrawingBuffer: true }}
        >
            <XR store={store}>
                <color attach="background" args={['#111']} />

                {/* Non-AR controls */}
                {!arMode && <OrbitControls />}

                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />

                {!arMode && <Environment preset="city" />}

                <Suspense fallback={null}>
                    {spheres.map(sphere => (
                        <FloatingSphere
                            key={sphere.id}
                            {...sphere}
                            onPop={() => handlePop(sphere.id)}
                        />
                    ))}
                </Suspense>

                {!arMode && <ContactShadows position={[0, -4.5, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />}

                {/* Disable post-processing in AR for performance */}
                {!arMode && (
                    <EffectComposer enableNormalPass={false}>
                        <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} />
                        <Vignette eskil={false} offset={0.1} darkness={1.1} />
                    </EffectComposer>
                )}
            </XR>
        </Canvas>
    );
};
