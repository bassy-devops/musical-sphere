import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Group, MathUtils, Vector3 } from 'three';

export const GyroGroup = ({ children }: { children: React.ReactNode }) => {
    const groupRef = useRef<Group>(null);

    // Target offset based on gyro
    const targetRotation = useRef(new Vector3(0, 0, 0));
    const targetPosition = useRef(new Vector3(0, 0, 0));

    useEffect(() => {
        const handleOrientation = (event: DeviceOrientationEvent) => {
            if (!event.beta || !event.gamma) return;

            // Beta: Front/Back tilt (-180 to 180).
            // Gamma: Left/Right tilt (-90 to 90).

            // We want to rotate/move the group opposite to tilt to simulate looking around
            // or move it to create parallax.
            // Let's try moving the group slightly.

            const x = MathUtils.clamp(event.gamma / 45, -1, 1);
            const y = MathUtils.clamp((event.beta - 45) / 45, -1, 1);

            // Move group slightly opposite to tilt
            targetPosition.current.set(x * 2, y * 2, 0);

            // Also rotate slightly?
            targetRotation.current.set(y * 0.5, x * 0.5, 0);
        };

        const requestPermission = async () => {
            if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
                try {
                    const permissionState = await (DeviceOrientationEvent as any).requestPermission();
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                    }
                } catch (e) {
                    console.error(e);
                }
            } else {
                window.addEventListener('deviceorientation', handleOrientation);
            }
        };

        requestPermission();

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, []);

    useFrame((_, delta) => {
        if (groupRef.current) {
            // Lerp position
            groupRef.current.position.lerp(targetPosition.current, delta * 2);
            // Lerp rotation
            // groupRef.current.rotation.x = MathUtils.lerp(groupRef.current.rotation.x, targetRotation.current.x, delta * 2);
            // groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, targetRotation.current.y, delta * 2);
        }
    });

    return <group ref={groupRef}>{children}</group>;
};
