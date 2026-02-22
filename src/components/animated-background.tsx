"use client";

import { useEffect, useRef } from "react";

export function AnimatedBackground() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Set canvas size
		const setCanvasSize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};
		setCanvasSize();
		window.addEventListener("resize", setCanvasSize);

		// Animation variables
		let animationFrameId: number;
		let time = 0;

		// Gradient orbs
		const orbs = [
			{ x: 0.1, y: 0.1, radius: 0.3, color: "226, 0, 116", speed: 0.0002 },
			{ x: 0.9, y: 0.1, radius: 0.25, color: "0, 200, 255", speed: 0.00015 },
			{ x: 0.5, y: 0.9, radius: 0.2, color: "255, 213, 0", speed: 0.00025 }
		];

		const animate = () => {
			time++;
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			orbs.forEach((orb, index) => {
				const offsetX = Math.sin(time * orb.speed + index) * 0.1;
				const offsetY = Math.cos(time * orb.speed + index) * 0.1;

				const x = (orb.x + offsetX) * canvas.width;
				const y = (orb.y + offsetY) * canvas.height;
				const radius = orb.radius * Math.min(canvas.width, canvas.height);

				const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
				gradient.addColorStop(0, `rgba(${orb.color}, 0.15)`);
				gradient.addColorStop(0.5, `rgba(${orb.color}, 0.05)`);
				gradient.addColorStop(1, `rgba(${orb.color}, 0)`);

				ctx.fillStyle = gradient;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
			});

			animationFrameId = requestAnimationFrame(animate);
		};

		animate();

		return () => {
			window.removeEventListener("resize", setCanvasSize);
			cancelAnimationFrame(animationFrameId);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className="fixed inset-0 pointer-events-none z-0"
			style={{ opacity: 0.6 }}
		/>
	);
}
