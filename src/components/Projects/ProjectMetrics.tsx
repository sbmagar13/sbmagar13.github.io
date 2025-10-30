'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaServer, FaCode, FaCogs, FaChartLine, FaRocket, FaCloud } from 'react-icons/fa';

interface ProjectStats {
  totalProjects: number;
  runningProjects: number;
  aiProjects: number;
  infrastructureProjects: number;
  averageUptime: number;
  linesOfCode: number;
  deploymentsThisMonth: number;
  currentLoad: number;
}

export default function ProjectMetrics() {
  const [stats, setStats] = useState<ProjectStats>({
    totalProjects: 12,
    runningProjects: 7,
    aiProjects: 6,
    infrastructureProjects: 4,
    averageUptime: 98.7,
    linesOfCode: 47832,
    deploymentsThisMonth: 23,
    currentLoad: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        currentLoad: Math.max(0, Math.min(100, prev.currentLoad + (Math.random() - 0.5) * 10)),
        averageUptime: Math.max(95, Math.min(99.9, prev.averageUptime + (Math.random() - 0.5) * 0.5))
      }));
    }, 3000);

    // Initialize with random load
    setStats(prev => ({ ...prev, currentLoad: 35 + Math.random() * 30 }));

    return () => clearInterval(interval);
  }, []);

  const metricCards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: <FaServer />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      suffix: ''
    },
    {
      title: 'Running',
      value: stats.runningProjects,
      icon: <FaRocket />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      suffix: ''
    },
    {
      title: 'AI Projects',
      value: stats.aiProjects,
      icon: <FaCogs />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      suffix: ''
    },
    {
      title: 'Infrastructure',
      value: stats.infrastructureProjects,
      icon: <FaCloud />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      suffix: ''
    },
    {
      title: 'Avg Uptime',
      value: stats.averageUptime,
      icon: <FaChartLine />,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      suffix: '%'
    },
    {
      title: 'Lines of Code',
      value: Math.floor(stats.linesOfCode / 1000),
      icon: <FaCode />,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      suffix: 'K+'
    }
  ];

  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold text-green-400 mb-4">Project Metrics Dashboard</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.title}
            className={`${metric.bgColor} border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`${metric.color} text-lg`}>{metric.icon}</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {metric.value.toFixed(metric.suffix === '%' ? 1 : 0)}{metric.suffix}
            </div>
            <div className="text-xs text-gray-400">{metric.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Real-time Load Monitor */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-300">System Load</h4>
          <span className="text-xs text-gray-400">Real-time</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="w-full bg-gray-700 rounded-full h-3">
              <motion.div
                className={`h-3 rounded-full ${
                  stats.currentLoad > 80 ? 'bg-red-500' :
                  stats.currentLoad > 60 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${stats.currentLoad}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div className="text-right">
            <motion.div
              className="text-lg font-mono font-bold text-white"
              key={stats.currentLoad}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {Math.round(stats.currentLoad)}%
            </motion.div>
            <div className="text-xs text-gray-400">CPU/Memory</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-400">{stats.deploymentsThisMonth}</div>
            <div className="text-xs text-gray-400">Deployments</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-400">
              {(stats.linesOfCode / 1000).toFixed(1)}K
            </div>
            <div className="text-xs text-gray-400">Lines Written</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-400">99.8%</div>
            <div className="text-xs text-gray-400">Success Rate</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}