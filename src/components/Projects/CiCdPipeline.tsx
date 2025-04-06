'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaDocker, FaServer, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

interface PipelineStage {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'pending' | 'running' | 'success' | 'failed';
  duration?: string;
}

const CiCdPipeline = () => {
  const [stages, setStages] = useState<PipelineStage[]>([
    { 
      id: 'code', 
      name: 'Code', 
      icon: <FaGithub className="text-white" />, 
      status: 'success',
      duration: '2m 15s'
    },
    { 
      id: 'build', 
      name: 'Build', 
      icon: <FaDocker className="text-blue-400" />, 
      status: 'pending' 
    },
    { 
      id: 'test', 
      name: 'Test', 
      icon: <FaCheckCircle className="text-yellow-400" />, 
      status: 'pending' 
    },
    { 
      id: 'deploy', 
      name: 'Deploy', 
      icon: <FaServer className="text-green-400" />, 
      status: 'pending' 
    }
  ]);

  const [activeStage, setActiveStage] = useState(0);
  const [codeBlocks] = useState<{ [key: string]: string[] }>({
    code: [
      'git commit -m "Update user interface"',
      'git push origin main'
    ],
    build: [
      'npm ci',
      'npm run build',
      'docker build -t app:latest .'
    ],
    test: [
      'npm run test',
      'npm run lint',
      'npm run e2e-tests'
    ],
    deploy: [
      'kubectl apply -f k8s/',
      'kubectl rollout status deployment/app',
      'echo "Deployment complete!"'
    ]
  });

  // Animation for code moving through pipeline
  const [codePackets, setCodePackets] = useState<number[]>([]);
  
  // Simulate pipeline execution
  useEffect(() => {
    if (activeStage >= stages.length) return;
    
    // Update current stage to running
    setStages(prev => 
      prev.map((stage, i) => 
        i === activeStage 
          ? { ...stage, status: 'running' } 
          : stage
      )
    );
    
    // Simulate stage completion
    const timer = setTimeout(() => {
      // Mark current stage as complete
      setStages(prev => 
        prev.map((stage, i) => 
          i === activeStage 
            ? { 
                ...stage, 
                status: Math.random() > 0.9 ? 'failed' : 'success',
                duration: `${Math.floor(Math.random() * 3) + 1}m ${Math.floor(Math.random() * 50) + 10}s`
              } 
            : stage
        )
      );
      
      // Move to next stage if not failed
      const currentStageStatus = Math.random() > 0.9 ? 'failed' : 'success';
      if (currentStageStatus === 'success' && activeStage < stages.length - 1) {
        setActiveStage(prev => prev + 1);
      }
    }, 3000); // Each stage takes 3 seconds
    
    return () => clearTimeout(timer);
  }, [activeStage, stages.length]);
  
  // Generate code packets for animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeStage < stages.length) {
        setCodePackets(prev => {
          // Add new packet at the start
          const newPackets = [...prev, 0];
          // Remove packets that have completed the journey
          return newPackets.filter(p => p < 100);
        });
      }
    }, 800);
    
    return () => clearInterval(interval);
  }, [activeStage, stages.length]);
  
  // Move existing packets along the pipeline
  useEffect(() => {
    const interval = setInterval(() => {
      setCodePackets(prev => 
        prev.map(packet => {
          // Move packets faster when they're in the active stage area
          const packetPosition = packet / (100 / (stages.length));
          const packetStage = Math.floor(packetPosition);
          
          // Speed up packets in the active stage
          const speed = packetStage === activeStage ? 2 : 1;
          return packet + speed;
        })
      );
    }, 50);
    
    return () => clearInterval(interval);
  }, [activeStage, stages.length]);
  
  // Reset the pipeline after completion or failure
  useEffect(() => {
    if (
      (activeStage === stages.length - 1 && stages[activeStage].status === 'success') ||
      stages.some(stage => stage.status === 'failed')
    ) {
      const timer = setTimeout(() => {
        setStages(prev => 
          prev.map((stage, i) => ({
            ...stage,
            status: i === 0 ? 'success' : 'pending',
            duration: i === 0 ? '2m 15s' : undefined
          }))
        );
        setActiveStage(1);
        setCodePackets([]);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [activeStage, stages]);

  return (
    <div className="bg-gray-900 text-gray-100 p-6 rounded-lg border border-green-500 shadow-lg shadow-green-500/20 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-green-500 mb-2">CI/CD Pipeline</h2>
        <p className="text-gray-400">
          Visualizing the continuous integration and deployment workflow.
        </p>
      </div>
      
      {/* Pipeline Visualization */}
      <div className="relative p-6 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h3 className="text-lg font-semibold text-green-400">Pipeline Status</h3>
          <div className="flex items-center mt-2 sm:mt-0">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
            <span className="text-sm text-green-400">Active Pipeline</span>
          </div>
        </div>
        
        {/* Pipeline Stages */}
        <div className="relative mb-8">
          {/* Pipeline Line */}
          <div className="absolute top-7 sm:top-9 left-0 right-0 h-1 bg-gray-700 z-0"></div>
          
          {/* Code Packets Animation */}
          {codePackets.map((position, i) => (
            <motion.div
              key={i}
              className="absolute top-[26px] sm:top-[34px] h-2 w-2 bg-green-500 rounded-full z-10 shadow-lg shadow-green-500/50"
              style={{ 
                left: `${position}%`,
                opacity: position > 95 ? (100 - position) / 5 : 1 // Fade out at the end
              }}
            />
          ))}
          
          {/* Stages */}
          <div className="flex justify-between relative z-10">
            {stages.map((stage) => (
              <div key={stage.id} className="flex flex-col items-center">
                <div 
                  className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-2 border-2 ${
                    stage.status === 'running' ? 'border-blue-500 bg-blue-900/30' :
                    stage.status === 'success' ? 'border-green-500 bg-green-900/30' :
                    stage.status === 'failed' ? 'border-red-500 bg-red-900/30' :
                    'border-gray-600 bg-gray-800'
                  }`}
                >
                  {stage.status === 'running' ? (
                    <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                  ) : null}
                  <div className="text-lg sm:text-2xl">
                    {stage.status === 'failed' ? (
                      <FaExclamationTriangle className="text-red-500" />
                    ) : (
                      stage.icon
                    )}
                  </div>
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-300">{stage.name}</div>
                {stage.duration && (
                  <div className="text-[10px] sm:text-xs text-gray-400 mt-1">{stage.duration}</div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Current Stage Details */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-md font-semibold text-blue-400">
              {activeStage < stages.length ? `${stages[activeStage].name} Stage` : 'Pipeline Complete'}
            </h4>
            <div className={`px-2 py-1 text-xs rounded-full ${
              stages[activeStage]?.status === 'running' ? 'bg-blue-900 text-blue-400' :
              stages[activeStage]?.status === 'success' ? 'bg-green-900 text-green-400' :
              stages[activeStage]?.status === 'failed' ? 'bg-red-900 text-red-400' :
              'bg-gray-700 text-gray-400'
            }`}>
              {stages[activeStage]?.status === 'running' ? 'In Progress' :
               stages[activeStage]?.status === 'success' ? 'Successful' :
               stages[activeStage]?.status === 'failed' ? 'Failed' : 'Pending'}
            </div>
          </div>
          
          {/* Code execution */}
          <div className="bg-black rounded-md p-2 sm:p-3 font-mono text-xs sm:text-sm h-28 sm:h-32 overflow-y-auto">
            {activeStage < stages.length && codeBlocks[stages[activeStage].id]?.map((line, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.5 }}
                className="mb-1 text-gray-300"
              >
                <span className="text-green-500">$</span> {line}
              </motion.div>
            ))}
            
            {stages[activeStage]?.status === 'running' && (
              <div className="h-4 flex items-center">
                <span className="text-green-500">$</span>
                <span className="ml-2 inline-block w-2 h-4 bg-green-500 animate-pulse"></span>
              </div>
            )}
            
            {stages[activeStage]?.status === 'failed' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500"
              >
                Error: Test failed - Check logs for details
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CiCdPipeline;
