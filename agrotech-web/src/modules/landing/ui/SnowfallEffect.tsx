import { useEffect, useRef, useState } from 'react';

export const SnowfallEffect = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDecember, setIsDecember] = useState(false);

    useEffect(() => {
        const month = new Date().getMonth();
        setIsDecember(month === 11); // 11 = December
    }, []);

    useEffect(() => {
        if (!isDecember || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        const particles: { x: number; y: number; radius: number; speed: number; opacity: number }[] = [];
        const particleCount = 100;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        // Initial resize
        resize();
        window.addEventListener('resize', resize);

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 3 + 1,
                speed: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.3
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(110, 231, 183, ${p.opacity})`; // emerald-300
                ctx.fill();

                p.y += p.speed;
                // Simular viento suave
                p.x += Math.sin(p.y * 0.01) * 0.5;

                // Reset si sale de pantalla
                if (p.y > canvas.height) {
                    p.y = -10;
                    p.x = Math.random() * canvas.width;
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isDecember]);

    if (!isDecember) return null;

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-20 pointer-events-none"
            style={{ width: '100%', height: '100%' }}
        />
    );
};
