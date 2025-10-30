'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaMicrochip, FaMemory, FaDatabase, FaNetworkWired, FaChartLine, FaClock } from 'react-icons/fa';

interface Metric {
  name: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
  trend: 'up' | 'down' | 'stable';
}

export default function LiveMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([
    { name: 'CPU Usage', value: 0, unit: '%', icon: <FaMicrochip />, color: 'text-green-400', trend: 'stable' },
    { name: 'Memory', value: 0, unit: 'GB', icon: <FaMemory />, color: 'text-blue-400', trend: 'stable' },
    { name: 'Network', value: 0, unit: 'Mbps', icon: <FaNetworkWired />, color: 'text-purple-400', trend: 'stable' },
    { name: 'Uptime', value: 0, unit: 'days', icon: <FaClock />, color: 'text-yellow-400', trend: 'up' },
    { name: 'Projects', value: 0, unit: '', icon: <FaDatabase />, color: 'text-cyan-400', trend: 'up' },
    { name: 'Performance', value: 0, unit: '%', icon: <FaChartLine />, color: 'text-pink-400', trend: 'stable' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        let newValue = metric.value;
        let newTrend = metric.trend;

        switch (metric.name) {
          case 'CPU Usage':
            newValue = Math.max(15, Math.min(85, metric.value + (Math.random() - 0.5) * 10));
            newTrend = newValue > metric.value ? 'up' : newValue < metric.value ? 'down' : 'stable';
            break;
          case 'Memory':
            newValue = Math.max(2.1, Math.min(7.8, metric.value + (Math.random() - 0.5) * 0.3));
            break;
          case 'Network':
            newValue = Math.max(50, Math.min(950, metric.value + (Math.random() - 0.5) * 100));
            break;
          case 'Uptime':
            newValue = metric.value + 0.001; // Slowly increasing
            break;
          case 'Projects':
            newValue = Math.max(147, Math.min(156, Math.round(metric.value + (Math.random() - 0.3) * 0.5)));
            break;
          case 'Performance':
            newValue = Math.max(92, Math.min(99.9, metric.value + (Math.random() - 0.5) * 2));
            break;
        }

        return { ...metric, value: newValue, trend: newTrend };
      }));
    }, 2000);

    // Initialize with random values
    setMetrics(prev => prev.map(metric => ({
      ...metric,
      value: metric.name === 'CPU Usage' ? 45 + Math.random() * 20 :
             metric.name === 'Memory' ? 4.2 + Math.random() * 2 :
             metric.name === 'Network' ? 300 + Math.random() * 400 :
             metric.name === 'Uptime' ? 1247.5 :
             metric.name === 'Projects' ? 152 :
             95 + Math.random() * 4
    })));

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
        <FaChartLine className="mr-2" />
        Live System Metrics
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-green-500/30 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className={`${metric.color} mr-2`}>{metric.icon}</span>
                <span className="text-sm text-gray-300">{metric.name}</span>
              </div>
              <span className={`text-xs ${getTrendColor(metric.trend)}`}>
                {getTrendIcon(metric.trend)}
              </span>
            </div>

            <div className="flex items-baseline">
              <motion.span
                className={`text-2xl font-mono font-bold ${metric.color}`}
                key={metric.value}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {metric.name === 'Memory' || metric.name === 'Uptime'
                  ? metric.value.toFixed(1)
                  : Math.round(metric.value)}
              </motion.span>
              <span className="text-sm text-gray-400 ml-1">{metric.unit}</span>
            </div>

            {/* Progress bar for percentage metrics */}
            {(metric.unit === '%') && (
              <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
                <motion.div
                  className={`h-1.5 rounded-full ${
                    metric.name === 'CPU Usage' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gray-800/50 rounded border border-gray-700">
        <p className="text-xs text-gray-400 text-center">
          📊 Real-time metrics simulation • Updates every 2 seconds
        </p>
      </div>
    </div>
  );
}