'use client';

// Extend the Window interface to include our custom property
declare global {
  interface Window {
    startPipelineDeployment?: () => void;
  }
}

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaDocker, FaServer, FaCheckCircle, FaExclamationTriangle, FaExpand, FaCompress } from 'react-icons/fa';

interface PipelineStage {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'pending' | 'running' | 'success' | 'failed';
  duration?: string;
}

interface CiCdPipelineProps {
  initialActiveStage?: number;
}

// Create a global function to trigger deployment
export const triggerDeployment = () => {
  // Check if the global function exists and call it
  if (typeof window !== 'undefined' && window.startPipelineDeployment) {
    console.log('Calling global startPipelineDeployment function');
    window.startPipelineDeployment();
  } else {
    console.log('Global startPipelineDeployment function not found');
  }
};

const CiCdPipeline: React.FC<CiCdPipelineProps> = ({ initialActiveStage = 0 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  const [activeStage, setActiveStage] = useState(initialActiveStage);
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
          // Add new packet at the start, but limit the total number of packets
          if (prev.length >= 15) {
            // If we already have 15 or more packets, just move the existing ones
            return prev.filter(p => p < 100);
          }
          const newPackets = [...prev, 0];
          // Remove packets that have completed the journey
          return newPackets.filter(p => p < 100);
        });
      }
    }, 800);
    
    // Clear all packets when component unmounts
    return () => {
      clearInterval(interval);
      setCodePackets([]);
    };
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
    
    return () => {
      clearInterval(interval);
      // Also clear packets when unmounting
      setCodePackets([]);
    };
  }, [activeStage, stages.length]);
  
  // Track number of pipeline runs and visibility
  const [runCount, setRunCount] = useState(0);
  const MAX_RUNS = 2; // Maximum number of times to run the pipeline
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  // Set up intersection observer to detect when component is visible
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Store the ref value in a variable to use in cleanup
    const currentRef = containerRef.current;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasBeenVisible) {
          // Component is visible for the first time
          setHasBeenVisible(true);
          
          // Start the pipeline from the build stage
          setActiveStage(1);
        }
      },
      { threshold: 0.2 } // Trigger when at least 20% of the component is visible
    );
    
    observer.observe(currentRef);
    
    return () => {
      observer.unobserve(currentRef);
    };
  }, [hasBeenVisible]);
  
  // Reset the pipeline after completion or failure
  useEffect(() => {
    if (
      (activeStage === stages.length - 1 && stages[activeStage].status === 'success') ||
      stages.some(stage => stage.status === 'failed')
    ) {
      // Check if we've reached the maximum number of runs
      if (runCount < MAX_RUNS) {
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
          setRunCount(prev => prev + 1); // Increment run count
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [activeStage, stages, runCount]);
  
  // Function to start deployment animation
  const startDeployment = useCallback(() => {
    console.log('Starting deployment animation in CiCdPipeline');
    // Reset the pipeline to initial state and reset run count
    setStages(prev => 
      prev.map((stage, i) => ({
        ...stage,
        status: i === 0 ? 'success' : 'pending',
        duration: i === 0 ? '2m 15s' : undefined
      }))
    );
    setActiveStage(1); // Start from the build stage
    setCodePackets([]); // Clear any existing code packets
    setRunCount(0); // Reset run count when manually starting
    console.log('Pipeline reset and animation started');
  }, []);
  
  // Fullscreen change detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Cleanup
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
      }
    }
  };
  
  // Expose the startDeployment function to the global window object
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Exposing startPipelineDeployment function to window');
      window.startPipelineDeployment = startDeployment;
    }
    
    // Clean up
    return () => {
      if (typeof window !== 'undefined') {
        delete window.startPipelineDeployment;
      }
    };
  }, [startDeployment]);

  return (
    <div className="bg-gray-900 text-gray-100 p-6 rounded-lg border border-green-500 shadow-lg shadow-green-500/20 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-green-500 mb-2">CI/CD Pipeline</h2>
        <p className="text-gray-400">
          Visualizing the continuous integration and deployment workflow.
        </p>
      </div>
      
      {/* Pipeline Visualization */}
      <div 
        ref={containerRef}
        className={`relative ${isFullscreen ? 'fixed inset-0 z-50 p-6' : 'p-6'} bg-gray-800 rounded-lg border border-gray-700 ${isFullscreen ? 'rounded-none' : ''}`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h3 className="text-lg font-semibold text-green-400">Pipeline Status</h3>
          <div className="flex items-center mt-2 sm:mt-0 space-x-4">
            <div>
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
              <span className="text-sm text-green-400">Active Pipeline</span>
            </div>
            <button 
              onClick={toggleFullscreen}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? 
                <FaCompress className="text-green-400" /> : 
                <FaExpand className="text-green-400" />
              }
            </button>
          </div>
        </div>
        
        {/* Pipeline Stages */}
        <div className={`relative mb-8 ${isFullscreen ? 'py-4' : ''}`}>
          {/* Pipeline Line */}
          <div className={`absolute ${isFullscreen ? 'top-[38px] sm:top-[50px]' : 'top-7 sm:top-9'} left-0 right-0 h-1 bg-gray-700 z-0`}></div>
          
          {/* Code Packets Animation */}
          {codePackets.map((position, i) => (
            <motion.div
              key={i}
              className={`absolute ${isFullscreen ? 'top-[37px] sm:top-[49px]' : 'top-[28px] sm:top-[36px]'} h-2 w-2 bg-green-500 rounded-full z-10 shadow-lg shadow-green-500/50`}
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
                  {stage.status === 'running' && !isFullscreen ? (
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
        <div className={`bg-gray-900 border border-gray-700 rounded-lg p-4 ${isFullscreen ? 'h-[calc(30vh)]' : ''}`}>
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
          <div className={`bg-black rounded-md p-2 sm:p-3 font-mono text-xs sm:text-sm ${isFullscreen ? 'h-[calc(20vh)]' : 'h-28 sm:h-32'} overflow-y-auto`}>
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
