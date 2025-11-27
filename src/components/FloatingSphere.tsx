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
                const speed = velocityRef.current.length();
                const note = audioEngine.startNote(size, speed);
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
            <sphereGeometry args={[1, 32, 32]} />
            <meshPhysicalMaterial
                color={color}
                metalness={0.1}
                roughness={0.1}
                clearcoat={1}
                clearcoatRoughness={0.1}
                emissive={color}
                emissiveIntensity={0.2}
            />
        </mesh>
    );
};
