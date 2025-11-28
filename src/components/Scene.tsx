import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { XR, createXRStore } from '@react-three/xr';
import { FloatingSphere } from './FloatingSphere';
import { Suspense, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { Backgrounds } from './Backgrounds';
import { GyroGroup } from './GyroGroup';

interface SphereData {
    id: number;
    position: [number, number, number];
    velocity: [number, number, number];
    size: number;
    color: string;
    autoPopTrigger?: number; // Timestamp
}

const COLORS = ["#FFB7B2", "#AEC6CF", "#77DD77", "#FDFD96", "#C3B1E1", "#FFB347"];

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
        Array.from({ length: 10 }, (_, i) => generateSphere(i, false))
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
            camera={{ position: [0, 1.6, 3], fov: 50 }}
            gl={{ preserveDrawingBuffer: true, antialias: true }}
            dpr={[1, 2]} // Limit pixel ratio for performance
        >
            <XR store={store}>
                <Backgrounds />

                {/* Non-AR controls */}
                {!arMode && <OrbitControls />}

                {/* Lighting optimized for Flat Shading */}
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} />
                <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#aaccff" />

                {!arMode && <Environment preset="city" />}

                <GyroGroup>
                    <Suspense fallback={null}>
                        {spheres.map(sphere => (
                            <FloatingSphere
                                key={sphere.id}
                                {...sphere}
                                onPop={() => handlePop(sphere.id)}
                            />
                        ))}
                    </Suspense>
                </GyroGroup>
            </XR>
        </Canvas>
    );
};
