'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Axes are years of production use, not invented percentages.
// Each background ring is one year; the outer ring is maxYears.
interface SkillRadarProps {
  skills: Array<{
    name: string;
    years: number;
  }>;
  maxYears?: number;
}

export default function SkillRadar({ skills, maxYears = 5 }: SkillRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 380 wide, not 300: the side-axis labels ('Observability 3y') are
    // drawn centered at maxRadius + 20 from center and clip off a 300px
    // bitmap. The extra 40px per side gives the longest label room.
    canvas.width = 380;
    canvas.height = 300;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = 120;

    const drawRadar = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background circles, one ring per year
      for (let i = 1; i <= maxYears; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (maxRadius / maxYears) * i, 0, Math.PI * 2);
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Year scale labels along the vertical axis
      ctx.fillStyle = '#6b7280';
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      for (let i = 1; i <= maxYears; i++) {
        const ringY = centerY - (maxRadius / maxYears) * i;
        ctx.fillText(`${i}y`, centerX + 4, ringY + 3);
      }

      // Draw axis lines
      const numAxes = skills.length;
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;

      for (let i = 0; i < numAxes; i++) {
        const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
        const x = centerX + Math.cos(angle) * maxRadius;
        const y = centerY + Math.sin(angle) * maxRadius;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Draw skill labels with years
        const labelRadius = maxRadius + 20;
        const labelX = centerX + Math.cos(angle) * labelRadius;
        const labelY = centerY + Math.sin(angle) * labelRadius;

        ctx.fillStyle = '#9ca3af';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${skills[i].name} ${skills[i].years}y`, labelX, labelY);
      }

      // Draw skill polygon
      ctx.beginPath();
      for (let i = 0; i < numAxes; i++) {
        const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
        const radius = (Math.min(skills[i].years, maxYears) / maxYears) * maxRadius;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      // Fill with gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fill();

      // Stroke the polygon
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw skill points
      for (let i = 0; i < numAxes; i++) {
        const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
        const radius = (Math.min(skills[i].years, maxYears) / maxYears) * maxRadius;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    drawRadar();
  }, [skills, maxYears]);

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <canvas
        ref={canvasRef}
        className="border border-gray-700 rounded-lg bg-gray-800"
      />
      <p className="text-xs text-gray-400 mt-2 text-center">
        Distance from center = years of production use · outer ring = {maxYears} years
      </p>
    </motion.div>
  );
}
