'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface NeuralNetworkProps {
  nodeCount?: number;
  className?: string;
}

interface Node {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  connections: Node[];
  pulsePhase: number;
  color: string;
  update(mouseX: number, mouseY: number, canvasWidth: number, canvasHeight: number): void;
  draw(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void;
  drawConnections(ctx: CanvasRenderingContext2D, nodes: Node[], canvasWidth: number, canvasHeight: number): void;
}

export default function NeuralNetwork({ nodeCount = 50, className = '' }: NeuralNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    // Node class for neural network visualization
    class Node {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      radius: number;
      connections: Node[];
      pulsePhase: number;
      color: string;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.z = Math.random() * 1000;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.vz = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 3 + 2;
        this.connections = [];
        this.pulsePhase = Math.random() * Math.PI * 2;

        const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update(mouseX: number, mouseY: number, canvasWidth: number, canvasHeight: number) {
        // Move nodes
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;

        // Bounce off walls
        if (this.x < 0 || this.x > canvasWidth) this.vx *= -1;
        if (this.y < 0 || this.y > canvasHeight) this.vy *= -1;
        if (this.z < 0 || this.z > 1000) this.vz *= -1;

        // Mouse interaction
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 200) {
          const force = (200 - distance) / 200;
          this.vx += (dx / distance) * force * 0.1;
          this.vy += (dy / distance) * force * 0.1;
        }

        // Limit velocity
        const maxSpeed = 2;
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > maxSpeed) {
          this.vx = (this.vx / speed) * maxSpeed;
          this.vy = (this.vy / speed) * maxSpeed;
        }

        // Update pulse
        this.pulsePhase += 0.05;
      }

      draw(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
        const perspective = 1000 / (1000 + this.z);
        const x = this.x * perspective + (canvasWidth * (1 - perspective)) / 2;
        const y = this.y * perspective + (canvasHeight * (1 - perspective)) / 2;
        const radius = this.radius * perspective;

        // Pulsing effect
        const pulse = Math.sin(this.pulsePhase) * 0.3 + 1;

        // Draw glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;

        // Draw node
        ctx.globalAlpha = 0.8 * perspective;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, radius * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Draw core
        ctx.globalAlpha = 1 * perspective;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.3 * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
      }

      drawConnections(ctx: CanvasRenderingContext2D, nodes: Node[], canvasWidth: number, canvasHeight: number) {
        nodes.forEach(node => {
          const dx = this.x - node.x;
          const dy = this.y - node.y;
          const dz = this.z - node.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < 150 && distance > 0) {
            const perspective1 = 1000 / (1000 + this.z);
            const perspective2 = 1000 / (1000 + node.z);

            const x1 = this.x * perspective1 + (canvasWidth * (1 - perspective1)) / 2;
            const y1 = this.y * perspective1 + (canvasHeight * (1 - perspective1)) / 2;
            const x2 = node.x * perspective2 + (canvasWidth * (1 - perspective2)) / 2;
            const y2 = node.y * perspective2 + (canvasHeight * (1 - perspective2)) / 2;

            ctx.globalAlpha = (1 - distance / 150) * 0.3 * Math.min(perspective1, perspective2);

            // Create gradient for connection
            const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, node.color);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            // Draw data packets
            if (Math.random() > 0.98) {
              const t = (Date.now() % 1000) / 1000;
              const px = x1 + (x2 - x1) * t;
              const py = y1 + (y2 - y1) * t;

              ctx.globalAlpha = 1;
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(px, py, 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        });
      }
    }

    // Create nodes
    nodesRef.current = Array.from({ length: nodeCount }, () => new Node(canvas.width, canvas.height));

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let animationId: number;
    const animate = () => {
      // Clear with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw connections
      nodesRef.current.forEach((node: Node) => {
        node.update(mouseRef.current.x, mouseRef.current.y, canvas.width, canvas.height);
        node.drawConnections(ctx, nodesRef.current, canvas.width, canvas.height);
      });

      // Draw nodes
      nodesRef.current.forEach((node: Node) => {
        node.draw(ctx, canvas.width, canvas.height);
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    window.addEventListener('resize', resizeCanvas);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [nodeCount]);

  return (
    <motion.canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      style={{ zIndex: 0 }}
    />
  );
}