'use client';

import { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

interface ProjectNode {
  id: string;
  name: string;
  type: 'infrastructure' | 'ai' | 'devops' | 'web' | 'observability';
  status: 'running' | 'maintenance' | 'in-progress' | 'completed';
  x: number;
  y: number;
  connections: string[];
}

export default function ProjectsGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const projects = useMemo(() => [
    {
      id: 'kubernetes-cluster',
      name: 'K8s Cluster',
      type: 'infrastructure',
      status: 'running',
      x: 200,
      y: 150,
      connections: ['monitoring', 'ci-cd', 'terraform']
    },
    {
      id: 'monitoring',
      name: 'Monitoring',
      type: 'observability',
      status: 'running',
      x: 400,
      y: 100,
      connections: ['kubernetes-cluster', 'ai-assistant']
    },
    {
      id: 'ci-cd',
      name: 'CI/CD Pipeline',
      type: 'devops',
      status: 'running',
      x: 350,
      y: 250,
      connections: ['kubernetes-cluster', 'terraform', 'web-platform']
    },
    {
      id: 'ai-assistant',
      name: 'AI Assistant',
      type: 'ai',
      status: 'in-progress',
      x: 600,
      y: 150,
      connections: ['monitoring', 'mcp-framework']
    },
    {
      id: 'terraform',
      name: 'Terraform',
      type: 'infrastructure',
      status: 'maintenance',
      x: 150,
      y: 300,
      connections: ['kubernetes-cluster', 'ci-cd']
    },
    {
      id: 'web-platform',
      name: 'Web Platform',
      type: 'web',
      status: 'running',
      x: 500,
      y: 350,
      connections: ['ci-cd', 'mcp-framework']
    },
    {
      id: 'mcp-framework',
      name: 'MCP Framework',
      type: 'ai',
      status: 'in-progress',
      x: 700,
      y: 300,
      connections: ['ai-assistant', 'web-platform']
    }
  ], []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 400;

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'running': return '#10b981';
        case 'maintenance': return '#f59e0b';
        case 'in-progress': return '#3b82f6';
        case 'completed': return '#6b7280';
        default: return '#10b981';
      }
    };

    const getTypeColor = (type: string) => {
      switch (type) {
        case 'infrastructure': return '#8b5cf6';
        case 'ai': return '#f59e0b';
        case 'devops': return '#10b981';
        case 'web': return '#3b82f6';
        case 'observability': return '#ef4444';
        default: return '#10b981';
      }
    };

    let time = 0;

    const animate = () => {
      ctx.fillStyle = 'rgba(17, 24, 39, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 0.02;

      // Draw connections
      projects.forEach(project => {
        project.connections.forEach(connectionId => {
          const targetProject = projects.find(p => p.id === connectionId);
          if (targetProject) {
            const alpha = 0.3 + Math.sin(time + project.x * 0.01) * 0.2;

            ctx.globalAlpha = alpha;
            ctx.strokeStyle = '#374151';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);

            ctx.beginPath();
            ctx.moveTo(project.x, project.y);
            ctx.lineTo(targetProject.x, targetProject.y);
            ctx.stroke();

            // Draw data flow particles
            const t = (time * 2 + project.x * 0.01) % 1;
            const particleX = project.x + (targetProject.x - project.x) * t;
            const particleY = project.y + (targetProject.y - project.y) * t;

            ctx.globalAlpha = 1;
            ctx.fillStyle = getStatusColor(project.status);
            ctx.beginPath();
            ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      });

      ctx.setLineDash([]);

      // Draw project nodes
      projects.forEach(project => {
        const pulse = Math.sin(time * 2 + project.x * 0.01) * 0.2 + 1;

        // Outer ring (type indicator)
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = getTypeColor(project.type);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(project.x, project.y, 25 * pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Inner circle (status indicator)
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = getStatusColor(project.status);
        ctx.beginPath();
        ctx.arc(project.x, project.y, 15, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(project.x, project.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#e5e7eb';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(project.name, project.x, project.y + 45);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [projects]);

  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold text-green-400 mb-4">Project Ecosystem Graph</h3>
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <canvas
          ref={canvasRef}
          className="w-full h-auto rounded border border-gray-600"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-400">Running</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-gray-400">Maintenance</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-400">In Progress</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            <span className="text-gray-400">Infrastructure</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            <span className="text-gray-400">AI/ML</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}