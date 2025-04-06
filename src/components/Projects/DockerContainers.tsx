'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDocker, FaNetworkWired, FaServer, FaDatabase, FaCode, FaExpand, FaCompress } from 'react-icons/fa';

// Extend the Window interface to include our custom property
declare global {
  interface Window {
    startDockerAnimation?: () => void;
  }
}

interface Container {
  id: string;
  name: string;
  type: 'app' | 'database' | 'cache' | 'proxy';
  status: 'creating' | 'running' | 'paused' | 'stopped';
  position: { x: number; y: number };
  connections: string[];
}

// Create a global function to trigger animation
export const triggerDockerAnimation = () => {
  if (typeof window !== 'undefined' && window.startDockerAnimation) {
    console.log('Calling global startDockerAnimation function');
    window.startDockerAnimation();
  } else {
    console.log('Global startDockerAnimation function not found');
  }
};

const DockerContainers: React.FC = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [networkPackets, setNetworkPackets] = useState<{from: string; to: string; progress: number; id: string}[]>([]);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [commandLogs, setCommandLogs] = useState<string[]>([]);
  const [activeCommand, setActiveCommand] = useState<string | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Detect mobile devices and handle fullscreen changes
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Fullscreen change detection
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
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
  
  // Auto-scroll terminal logs to bottom when new logs are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandLogs]);
  
  // Container type to icon mapping
  const containerIcons = {
    app: <FaCode className="text-blue-400" />,
    database: <FaDatabase className="text-green-400" />,
    cache: <FaServer className="text-yellow-400" />,
    proxy: <FaNetworkWired className="text-purple-400" />
  };
  
  // Container type to color mapping
  const containerColors = {
    app: 'border-blue-500 bg-blue-900/30',
    database: 'border-green-500 bg-green-900/30',
    cache: 'border-yellow-500 bg-yellow-900/30',
    proxy: 'border-purple-500 bg-purple-900/30'
  };
  
  // Docker commands for the animation - wrapped in useMemo to avoid recreation on every render
  const dockerCommands = React.useMemo(() => [
    'docker network create app-network',
    'docker volume create db-data',
    'docker pull postgres:latest',
    'docker pull redis:alpine',
    'docker pull nginx:latest',
    'docker pull node:18-alpine',
    'docker run -d --name db --network app-network -v db-data:/var/lib/postgresql/data postgres:latest',
    'docker run -d --name cache --network app-network redis:alpine',
    'docker run -d --name api --network app-network -p 3000:3000 node:18-alpine',
    'docker run -d --name proxy --network app-network -p 80:80 nginx:latest',
    'docker ps',
    'docker network inspect app-network'
  ], []);
  
  // Function to create a container
  const createContainer = (type: 'app' | 'database' | 'cache' | 'proxy', name: string, position: { x: number; y: number }) => {
    const newContainer: Container = {
      id: `container-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name,
      type,
      status: 'creating',
      position,
      connections: []
    };
    
    setContainers(prev => [...prev, newContainer]);
    
    // After a delay, change status to running
    setTimeout(() => {
      setContainers(prev => 
        prev.map(c => 
          c.id === newContainer.id 
            ? { ...c, status: 'running' } 
            : c
        )
      );
    }, 1500);
    
    return newContainer.id;
  };
  
  // Function to connect containers
  const connectContainers = (fromId: string, toId: string) => {
    setContainers(prev => 
      prev.map(c => {
        if (c.id === fromId && !c.connections.includes(toId)) {
          return { ...c, connections: [...c.connections, toId] };
        }
        return c;
      })
    );
    
    // Create network packet animation with a unique ID
    const newPacketId = `packet-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    setNetworkPackets(prev => [
      ...prev, 
      { from: fromId, to: toId, progress: 0, id: newPacketId }
    ]);
    
    // Animate packet
    const interval = setInterval(() => {
      setNetworkPackets(prev => {
        const updatedPackets = prev.map(packet => {
          if (packet.id === newPacketId) {
            const newProgress = packet.progress + 2;
            return { ...packet, progress: newProgress };
          }
          return packet;
        });
        
        // Remove completed packets
        return updatedPackets.filter(packet => packet.progress <= 100);
      });
    }, 20);
    
    // Clear interval after animation completes
    setTimeout(() => {
      clearInterval(interval);
    }, 2000);
  };
  
  // Function to orchestrate containers
  const orchestrateContainers = useCallback(() => {
    setIsOrchestrating(true);
    setContainers([]);
    setNetworkPackets([]);
    setCommandLogs([]);
    
    // Execute commands with delays
    let commandIndex = 0;
    
    const executeNextCommand = () => {
      if (commandIndex >= dockerCommands.length) {
        setActiveCommand(null);
        setIsOrchestrating(false);
        return;
      }
      
      const command = dockerCommands[commandIndex];
      setActiveCommand(command);
      
      // Add command to logs
      setCommandLogs(prev => [...prev, `$ ${command}`]);
      
      // Process command
      if (command.includes('docker run')) {
        const containerName = command.split('--name ')[1].split(' ')[0];
        let containerType: 'app' | 'database' | 'cache' | 'proxy' = 'app';
        
        if (containerName === 'db') containerType = 'database';
        else if (containerName === 'cache') containerType = 'cache';
        else if (containerName === 'proxy') containerType = 'proxy';
        else if (containerName === 'api') containerType = 'app';
        
        // Calculate position based on container type and screen size
        const positions = isMobile ? {
          database: { x: 10, y: 30 },
          cache: { x: 10, y: 120 },
          app: { x: 120, y: 75 },
          proxy: { x: 230, y: 75 }
        } : {
          database: { x: 20, y: 50 },
          cache: { x: 20, y: 150 },
          app: { x: 180, y: 100 },
          proxy: { x: 340, y: 100 }
        };
        
        // Create the container with a delay
        setTimeout(() => {
          createContainer(containerType, containerName, positions[containerType]);
          
          // Add success message to logs
          setCommandLogs(prev => [...prev, `Container ${containerName} created successfully`]);
          
          // Create connections after all containers are created
          if (commandIndex === dockerCommands.length - 4) {
            setTimeout(() => {
              // Find container IDs
              const dbId = containers.find(c => c.name === 'db')?.id;
              const cacheId = containers.find(c => c.name === 'cache')?.id;
              const apiId = containers.find(c => c.name === 'api')?.id;
              const proxyId = containers.find(c => c.name === 'proxy')?.id;
              
              // Create connections
              if (dbId && apiId) connectContainers(apiId, dbId);
              if (cacheId && apiId) connectContainers(apiId, cacheId);
              if (apiId && proxyId) connectContainers(proxyId, apiId);
            }, 1000);
          }
        }, 500);
      } else if (command.includes('docker network create') || command.includes('docker volume create')) {
        // Add success message for network/volume creation
        setTimeout(() => {
          const resourceName = command.split(' ').pop() || '';
          setCommandLogs(prev => [...prev, `${resourceName} created successfully`]);
        }, 500);
      } else if (command.includes('docker pull')) {
        // Add download progress for pulls
        const imageName = command.split(' ').pop() || '';
        
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 20;
          if (progress <= 100) {
            setCommandLogs(prev => [...prev, `Pulling ${imageName}: ${progress}%`]);
          } else {
            clearInterval(progressInterval);
            setCommandLogs(prev => [...prev, `Downloaded ${imageName} successfully`]);
          }
        }, 300);
      } else if (command.includes('docker ps')) {
        // Add container list output
        setTimeout(() => {
          setCommandLogs(prev => [
            ...prev, 
            'CONTAINER ID   IMAGE              COMMAND     STATUS          PORTS                  NAMES',
            '1a2b3c4d5e6f   postgres:latest    "postgres"  Up 2 minutes    5432/tcp               db',
            '2b3c4d5e6f7g   redis:alpine       "redis"     Up 2 minutes    6379/tcp               cache',
            '3c4d5e6f7g8h   node:18-alpine     "node"      Up 2 minutes    0.0.0.0:3000->3000/tcp api',
            '4d5e6f7g8h9i   nginx:latest       "nginx"     Up 2 minutes    0.0.0.0:80->80/tcp     proxy'
          ]);
        }, 500);
      } else if (command.includes('docker network inspect')) {
        // Add network inspection output
        setTimeout(() => {
          setCommandLogs(prev => [
            ...prev, 
            '[\n    {\n        "Name": "app-network",',
            '        "Containers": {',
            '            "1a2b3c4d5e6f": { "Name": "db", "IPv4Address": "172.18.0.2/16" },',
            '            "2b3c4d5e6f7g": { "Name": "cache", "IPv4Address": "172.18.0.3/16" },',
            '            "3c4d5e6f7g8h": { "Name": "api", "IPv4Address": "172.18.0.4/16" },',
            '            "4d5e6f7g8h9i": { "Name": "proxy", "IPv4Address": "172.18.0.5/16" }',
            '        }\n    }\n]'
          ]);
        }, 500);
      }
      
      // Move to next command after delay
      setTimeout(() => {
        commandIndex++;
        executeNextCommand();
      }, 2000);
    };
    
    // Start executing commands
    executeNextCommand();
  }, [containers, dockerCommands, isMobile]);
  
  // Expose the startDockerAnimation function to the global window object
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Exposing startDockerAnimation function to window');
      window.startDockerAnimation = orchestrateContainers;
    }
    
    // Clean up
    return () => {
      if (typeof window !== 'undefined') {
        delete window.startDockerAnimation;
      }
    };
  }, [orchestrateContainers]);
  
  // Start animation on component mount
  useEffect(() => {
    // Start with a slight delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      orchestrateContainers();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [orchestrateContainers]);
  
  // Calculate connection paths between containers
  const getConnectionPath = (fromId: string, toId: string) => {
    const fromContainer = containers.find(c => c.id === fromId);
    const toContainer = containers.find(c => c.id === toId);
    
    if (!fromContainer || !toContainer) return '';
    
    // Calculate center points based on container size
    const containerSize = isMobile ? 32 : 40;
    const fromX = fromContainer.position.x + containerSize;
    const fromY = fromContainer.position.y + containerSize;
    const toX = toContainer.position.x + containerSize;
    const toY = toContainer.position.y + containerSize;
    
    return `M${fromX},${fromY} C${(fromX + toX) / 2},${fromY} ${(fromX + toX) / 2},${toY} ${toX},${toY}`;
  };
  
  // Calculate packet position along the path
  const getPacketPosition = (fromId: string, toId: string, progress: number) => {
    const fromContainer = containers.find(c => c.id === fromId);
    const toContainer = containers.find(c => c.id === toId);
    
    if (!fromContainer || !toContainer) return { x: 0, y: 0 };
    
    // Calculate center points based on container size
    const containerSize = isMobile ? 32 : 40;
    const fromX = fromContainer.position.x + containerSize;
    const fromY = fromContainer.position.y + containerSize;
    const toX = toContainer.position.x + containerSize;
    const toY = toContainer.position.y + containerSize;
    
    // Bezier curve calculation for position at progress
    const t = progress / 100;
    const bezierX = (1 - t) * (1 - t) * fromX + 2 * (1 - t) * t * ((fromX + toX) / 2) + t * t * toX;
    const bezierY = (1 - t) * (1 - t) * fromY + 2 * (1 - t) * t * ((fromY + toY) / 2) + t * t * toY;
    
    return { x: bezierX, y: bezierY };
  };

  return (
    <div className="bg-gray-900 text-gray-100 p-6 rounded-lg border border-green-500 shadow-lg shadow-green-500/20 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-green-500 mb-2">Docker Containerization</h2>
        <p className="text-gray-400">
          Visualizing containerized microservices architecture with Docker.
        </p>
      </div>
      
      {/* Container Visualization */}
      <div 
        ref={containerRef}
        className={`relative ${isFullscreen ? 'fixed inset-0 z-50 p-6' : 'p-4 sm:p-6'} bg-gray-800 rounded-lg border border-gray-700 ${isFullscreen ? 'rounded-none' : ''}`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h3 className="text-lg font-semibold text-green-400">Container Orchestration</h3>
          <div className="flex items-center mt-2 sm:mt-0 space-x-4">
            <div>
              {isOrchestrating ? (
                <>
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1.5 animate-pulse"></span>
                  <span className="text-sm text-blue-400">Orchestrating Containers</span>
                </>
              ) : (
                <>
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                  <span className="text-sm text-green-400">Ready</span>
                </>
              )}
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
        
        {/* Container Visualization Area */}
        <div className={`relative ${isFullscreen ? 'h-[calc(70vh)]' : 'h-[250px] sm:h-[300px]'} bg-gray-900 rounded-lg border border-gray-700 mb-4 overflow-hidden`}>
          {/* Network Lines */}
          <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
            {containers.flatMap(container => 
              container.connections.map(targetId => (
                <path
                  key={`${container.id}-${targetId}`}
                  d={getConnectionPath(container.id, targetId)}
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  className="opacity-60"
                />
              ))
            )}
          </svg>
          
          {/* Network Packets */}
          {networkPackets.map(packet => {
            const position = getPacketPosition(packet.from, packet.to, packet.progress);
            return (
              <motion.div
                key={packet.id}
                className="absolute w-2 h-2 bg-green-500 rounded-full z-20 shadow-lg shadow-green-500/50"
                style={{
                  left: position.x - 4,
                  top: position.y - 4
                }}
              />
            );
          })}
          
          {/* Containers */}
          <AnimatePresence>
            {containers.map(container => (
              <motion.div
                key={container.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: container.position.x,
                  y: container.position.y
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                className={`absolute ${isMobile ? 'w-16 h-16' : 'w-20 h-20'} rounded-lg flex flex-col items-center justify-center border-2 ${containerColors[container.type]}`}
                style={{ left: 0, top: 0 }}
              >
                {container.status === 'creating' && (
                  <div className="absolute inset-0 rounded-lg border-2 border-blue-500 border-t-transparent animate-spin"></div>
                )}
                <div className={`${isMobile ? 'text-xl' : 'text-2xl'} mb-1`}>
                  {container.type === 'app' ? containerIcons.app :
                   container.type === 'database' ? containerIcons.database :
                   container.type === 'cache' ? containerIcons.cache :
                   containerIcons.proxy}
                </div>
                <div className="text-xs font-medium text-gray-300">{container.name}</div>
                <div className="absolute -top-2 -right-2">
                  <FaDocker className={`text-blue-500 ${isMobile ? 'text-base' : 'text-lg'}`} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Network Label */}
          {containers.length > 0 && (
            <div className="absolute bottom-2 right-2 bg-gray-800 bg-opacity-80 px-2 py-1 rounded text-xs text-gray-400 flex items-center">
              <FaNetworkWired className="mr-1 text-green-400" />
              app-network
            </div>
          )}
        </div>
        
        {/* Command Terminal */}
        <div 
          ref={terminalRef}
          id="docker-terminal"
          className={`bg-black rounded-md p-2 sm:p-3 font-mono text-xs sm:text-sm ${isFullscreen ? 'h-[20vh]' : 'h-32 sm:h-40'} overflow-y-auto`}
        >
          {commandLogs.map((log, i) => (
            <div key={i} className="mb-1 text-gray-300 break-words">
              {log}
            </div>
          ))}
          
          {activeCommand && (
            <div className="h-4 flex items-center">
              <span className="text-green-500">$</span>
              <span className="ml-2 inline-block w-2 h-4 bg-green-500 animate-pulse"></span>
            </div>
          )}
        </div>
        
        {/* Control Button */}
        <div className="mt-4 flex justify-center">
          <button 
            onClick={orchestrateContainers}
            disabled={isOrchestrating}
            className={`px-4 py-2 rounded flex items-center text-sm sm:text-base ${
              isOrchestrating 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-700 text-blue-100 hover:bg-blue-600 transition-colors'
            }`}
          >
            <FaDocker className="mr-2" />
            {isOrchestrating ? 'Orchestrating...' : 'Restart Orchestration'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DockerContainers;
