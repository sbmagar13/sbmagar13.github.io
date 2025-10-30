'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Location {
  lat: number;
  lng: number;
  name: string;
  type: 'deployment' | 'client' | 'datacenter';
}

export default function InteractiveGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  const locations: Location[] = [
    { lat: 37.7749, lng: -122.4194, name: 'San Francisco', type: 'deployment' },
    { lat: 40.7128, lng: -74.0060, name: 'New York', type: 'client' },
    { lat: 51.5074, lng: -0.1278, name: 'London', type: 'datacenter' },
    { lat: 35.6762, lng: 139.6503, name: 'Tokyo', type: 'deployment' },
    { lat: -33.8688, lng: 151.2093, name: 'Sydney', type: 'client' },
    { lat: 1.3521, lng: 103.8198, name: 'Singapore', type: 'datacenter' },
    { lat: 19.4326, lng: -99.1332, name: 'Mexico City', type: 'deployment' },
    { lat: 28.6139, lng: 77.2090, name: 'New Delhi', type: 'client' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 400;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 150;

    let mouseX = 0;
    let mouseY = 0;
    let prevMouseX = 0;
    let prevMouseY = 0;

    // Convert lat/lng to 3D coordinates
    const latLngTo3D = (lat: number, lng: number, r: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);

      return {
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.cos(phi),
        z: r * Math.sin(phi) * Math.sin(theta)
      };
    };

    // Rotate 3D point
    const rotate3D = (point: { x: number; y: number; z: number }, rotX: number, rotY: number) => {
      // Rotate around Y axis
      let x = point.x * Math.cos(rotY) - point.z * Math.sin(rotY);
      let z = point.x * Math.sin(rotY) + point.z * Math.cos(rotY);

      // Rotate around X axis
      const y = point.y * Math.cos(rotX) - z * Math.sin(rotX);
      z = point.y * Math.sin(rotX) + z * Math.cos(rotX);

      return { x, y, z };
    };

    // Project 3D to 2D
    const project = (point: { x: number; y: number; z: number }) => {
      const perspective = 500 / (500 + point.z);
      return {
        x: centerX + point.x * perspective,
        y: centerY + point.y * perspective,
        scale: perspective
      };
    };

    // Mouse handlers
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;

      rotationRef.current.y += deltaX * 0.01;
      rotationRef.current.x += deltaY * 0.01;

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Auto-rotate when not dragging
      if (!isDraggingRef.current) {
        rotationRef.current.y += 0.005;
      }

      // Draw globe outline
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw latitude lines
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        ctx.globalAlpha = 0.1;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;

        for (let lng = 0; lng <= 360; lng += 10) {
          const point3D = latLngTo3D(lat, lng, radius);
          const rotated = rotate3D(point3D, rotationRef.current.x, rotationRef.current.y);
          const projected = project(rotated);

          if (lng === 0) {
            ctx.moveTo(projected.x, projected.y);
          } else {
            if (rotated.z > 0) {
              ctx.lineTo(projected.x, projected.y);
            }
          }
        }
        ctx.stroke();
      }

      // Draw longitude lines
      for (let lng = 0; lng < 360; lng += 30) {
        ctx.beginPath();
        ctx.globalAlpha = 0.1;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;

        for (let lat = -90; lat <= 90; lat += 10) {
          const point3D = latLngTo3D(lat, lng, radius);
          const rotated = rotate3D(point3D, rotationRef.current.x, rotationRef.current.y);
          const projected = project(rotated);

          if (lat === -90) {
            ctx.moveTo(projected.x, projected.y);
          } else {
            if (rotated.z > 0) {
              ctx.lineTo(projected.x, projected.y);
            }
          }
        }
        ctx.stroke();
      }

      // Draw locations
      locations.forEach((location, index) => {
        const point3D = latLngTo3D(location.lat, location.lng, radius);
        const rotated = rotate3D(point3D, rotationRef.current.x, rotationRef.current.y);

        if (rotated.z > 0) {
          const projected = project(rotated);

          // Pulsing effect
          const pulse = Math.sin(Date.now() * 0.002 + index) * 0.3 + 1;

          // Draw location point
          ctx.globalAlpha = 0.8;
          ctx.fillStyle = location.type === 'deployment' ? '#10b981' :
                          location.type === 'client' ? '#3b82f6' : '#f59e0b';

          ctx.shadowBlur = 10;
          ctx.shadowColor = ctx.fillStyle;

          ctx.beginPath();
          ctx.arc(projected.x, projected.y, 4 * projected.scale * pulse, 0, Math.PI * 2);
          ctx.fill();

          // Draw connection lines
          if (index > 0) {
            const prevLocation = locations[index - 1];
            const prevPoint3D = latLngTo3D(prevLocation.lat, prevLocation.lng, radius);
            const prevRotated = rotate3D(prevPoint3D, rotationRef.current.x, rotationRef.current.y);

            if (prevRotated.z > 0) {
              const prevProjected = project(prevRotated);

              ctx.globalAlpha = 0.2;
              ctx.strokeStyle = '#10b981';
              ctx.lineWidth = 1;
              ctx.setLineDash([5, 5]);
              ctx.beginPath();
              ctx.moveTo(prevProjected.x, prevProjected.y);
              ctx.lineTo(projected.x, projected.y);
              ctx.stroke();
              ctx.setLineDash([]);
            }
          }

          ctx.shadowBlur = 0;

          // Draw label
          ctx.globalAlpha = projected.scale * 0.7;
          ctx.fillStyle = '#ffffff';
          ctx.font = `${10 * projected.scale}px monospace`;
          ctx.fillText(location.name, projected.x + 8, projected.y - 8);
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <motion.div
      className="relative bg-gray-900/50 rounded-lg p-4 border border-green-500/30"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-green-400 font-bold mb-2 text-sm">Global Infrastructure</h3>
      <canvas
        ref={canvasRef}
        className="cursor-move"
        style={{ touchAction: 'none' }}
      />
      <div className="mt-4 flex justify-around text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-gray-400">Deployments</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-gray-400">Clients</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <span className="text-gray-400">Data Centers</span>
        </div>
      </div>
    </motion.div>
  );
}