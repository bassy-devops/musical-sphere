import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { useGesture } from '@use-gesture/react';
import { audioEngine } from '../audio/AudioEngine';
import { Explosion } from './Explosion';

interface FloatingSphereProps {
    position: [number, number, number];
    velocity: [number, number, number];
    size: number;
    color: string;
    onPop: () => void;
    autoPopTrigger?: number;
}

export const FloatingSphere = ({ position, velocity, size, color, onPop, autoPopTrigger }: FloatingSphereProps) => {
    const meshRef = useRef<Mesh>(null);
    const velocityRef = useRef(new Vector3(...velocity));
    const [popping, setPopping] = useState(false);
    const [spawned, setSpawned] = useState(false);
    const [currentScale, setCurrentScale] = useState(0);
    const activeNoteRef = useRef<string | null>(null);

    // Spawn animation
    useEffect(() => {
        setSpawned(true);
    }, []);

    // Auto-pop trigger
    useEffect(() => {
        if (autoPopTrigger) {
            setPopping(true);
        }
    }, [autoPopTrigger]);

    useFrame((_state, delta) => {
        if (meshRef.current && !popping) {
            // Spawn lerp
            if (spawned && currentScale < size) {
                const newScale = Math.min(size, currentScale + delta * 2);
                setCurrentScale(newScale);
                meshRef.current.scale.setScalar(newScale);
            } else if (!spawned) {
                meshRef.current.scale.setScalar(0);
            } else {
                // Ensure scale is correct if not animating
                meshRef.current.scale.setScalar(size);
            }

            // Move
            meshRef.current.position.addScaledVector(velocityRef.current, delta);

            // Rotate
            meshRef.current.rotation.x += delta * 0.5;
            meshRef.current.rotation.y += delta * 0.5;

            // Bounce off walls (approximate bounds)
            const bounds = 8;
            if (Math.abs(meshRef.current.position.x) > bounds) velocityRef.current.x *= -1;
            if (Math.abs(meshRef.current.position.y) > bounds) velocityRef.current.y *= -1;
            if (Math.abs(meshRef.current.position.z) > bounds) velocityRef.current.z *= -1;
        }
    });

    const bind = useGesture({
        onPointerDown: () => {
            if (!popping) {
                const note = audioEngine.startNote(color);
                activeNoteRef.current = note;
            }
        },
        onPointerUp: () => {
            if (activeNoteRef.current) {
                audioEngine.stopNote(activeNoteRef.current);
                activeNoteRef.current = null;
            }
            if (!popping) {
                setPopping(true);
            }
        },
        // Handle drag end / leave as well to stop sound?
        onPointerLeave: () => {
            if (activeNoteRef.current) {
                audioEngine.stopNote(activeNoteRef.current);
                activeNoteRef.current = null;
            }
        }
    });

    if (popping) {
        return (
            <group position={meshRef.current?.position || new Vector3(...position)}>
                <Explosion color={color} onComplete={onPop} />
            </group>
        );
    }

    return (
        <mesh
            ref={meshRef}
            position={position}
            scale={0}
            {...bind()}
            castShadow
            receiveShadow
        >
            {/* Body - Reduced segments for performance */}
            <sphereGeometry args={[1, 24, 24]} />
            <meshToonMaterial color={color} />

            {/* Ears Container */}
            <group rotation={[0, 0, 0]}>
                {/* Left Ear */}
                <mesh position={[-0.7, 0.8, 0]} castShadow>
                    <sphereGeometry args={[0.4, 16, 16]} />
                    <meshToonMaterial color={color} />
                </mesh>
                <mesh position={[-0.7, 0.8, 0.3]}>
                    <sphereGeometry args={[0.25, 16, 16]} />
                    <meshToonMaterial color="#ffffff" opacity={0.5} transparent depthWrite={false} />
                </mesh>

                {/* Right Ear */}
                <mesh position={[0.7, 0.8, 0]} castShadow>
                    <sphereGeometry args={[0.4, 16, 16]} />
                    <meshToonMaterial color={color} />
                </mesh>
                <mesh position={[0.7, 0.8, 0.3]}>
                    <sphereGeometry args={[0.25, 16, 16]} />
                    <meshToonMaterial color="#ffffff" opacity={0.5} transparent depthWrite={false} />
                </mesh>
            </group>

            {/* Face Container */}
            <group position={[0, 0.1, 0.85]}>
                {/* Snout */}
                <mesh position={[0, -0.1, 0.1]} scale={[1.2, 0.8, 0.5]}>
                    <sphereGeometry args={[0.35, 16, 16]} />
                    <meshToonMaterial color="#ffffff" />
                </mesh>

                {/* Nose */}
                <mesh position={[0, 0, 0.25]}>
                    <sphereGeometry args={[0.12, 12, 12]} />
                    <meshToonMaterial color="#333" />
                </mesh>

                {/* Eyes */}
                <mesh position={[-0.35, 0.2, 0.05]}>
                    <sphereGeometry args={[0.12, 12, 12]} />
                    <meshToonMaterial color="#111" />
                </mesh>
                <mesh position={[0.35, 0.2, 0.05]}>
                    <sphereGeometry args={[0.12, 12, 12]} />
                    <meshToonMaterial color="#111" />
                </mesh>

                {/* Eye Highlights */}
                <mesh position={[-0.38, 0.25, 0.14]}>
                    <sphereGeometry args={[0.04, 8, 8]} />
                    <meshToonMaterial color="white" />
                </mesh>
                <mesh position={[0.32, 0.25, 0.14]}>
                    <sphereGeometry args={[0.04, 8, 8]} />
                    <meshToonMaterial color="white" />
                </mesh>

                {/* Cheeks */}
                <mesh position={[-0.5, -0.1, 0]}>
                    <sphereGeometry args={[0.15, 12, 12]} />
                    <meshToonMaterial color="#ff99cc" opacity={0.6} transparent depthWrite={false} />
                </mesh>
                <mesh position={[0.5, -0.1, 0]}>
                    <sphereGeometry args={[0.15, 12, 12]} />
                    <meshToonMaterial color="#ff99cc" opacity={0.6} transparent depthWrite={false} />
                </mesh>
            </group>

            {/* Tail */}
            <mesh position={[0, -0.5, -0.9]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshToonMaterial color={color} />
            </mesh>
        </mesh>
    );
};
