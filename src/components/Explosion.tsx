import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D } from 'three';

interface ExplosionProps {
    color: string;
    count?: number;
    onComplete: () => void;
}

export const Explosion = ({ color, count = 20, onComplete }: ExplosionProps) => {
    const meshRef = useRef<InstancedMesh>(null);
    const dummy = useMemo(() => new Object3D(), []);

    // Re-thinking particle system for R3F without heavy state.
    // Let's use a ref for positions to avoid re-renders.
    const particleData = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            position: [0, 0, 0],
            velocity: [
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8
            ],
            life: 1.0,
            scale: Math.random() * 0.4 + 0.1
        }));
    }, [count]);

    useFrame((_state, delta) => {
        if (!meshRef.current) return;

        let aliveCount = 0;

        particleData.forEach((p, i) => {
            if (p.life > 0) {
                aliveCount++;
                p.life -= delta * 2.0; // Decay

                // Move
                p.position[0] += p.velocity[0] * delta;
                p.position[1] += p.velocity[1] * delta;
                p.position[2] += p.velocity[2] * delta;

                // Update dummy
                dummy.position.set(p.position[0], p.position[1], p.position[2]);
                const currentScale = p.scale * p.life;
                dummy.scale.setScalar(currentScale);
                dummy.updateMatrix();

                meshRef.current!.setMatrixAt(i, dummy.matrix);
            } else {
                // Hide
                dummy.scale.setScalar(0);
                dummy.updateMatrix();
                meshRef.current!.setMatrixAt(i, dummy.matrix);
            }
        });

        meshRef.current.instanceMatrix.needsUpdate = true;

        if (aliveCount === 0) {
            onComplete();
        }
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.8} />
        </instancedMesh>
    );
};
