import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaUser, FaPaperPlane, FaSpinner, FaCode, FaServer, FaDocker, FaCloudUploadAlt } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import '../../styles/devops-assistant.css';

// Declare global function for MCP tool use
declare global {
  interface Window {
    use_mcp_tool?: (params: {
      server_name: string;
      tool_name: string;
      arguments: any;
    }) => Promise<any>;
    startPipelineDeployment?: () => void;
    startDockerAnimation?: () => void;
  }
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const DevOpsAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: "# Welcome to the DevOps AI Assistant! 👋\n\nI'm here to help you with DevOps concepts, configurations, and best practices. You can ask me about:\n\n- Kubernetes, Docker, and containerization\n- CI/CD pipelines and automation\n- Infrastructure as Code (Terraform, CloudFormation)\n- Cloud platforms (AWS, Azure, GCP)\n- Monitoring and observability\n- Deployment strategies\n\nHow can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
  // Get response from the DevOps AI Assistant using MCP
  setTimeout(async () => {
    try {
      let responseText = '';
      
      // Check if MCP is available
      if (window.use_mcp_tool) {
        // Determine which MCP tool to use based on the query
        const lowerQuery = input.toLowerCase();
        
        try {
          // For configuration generation
          if (lowerQuery.includes('generate') || lowerQuery.includes('create')) {
            if (lowerQuery.includes('docker') && lowerQuery.includes('compose')) {
              // Generate Docker Compose configuration
              const options: any = {};
              
              if (lowerQuery.includes('mern')) {
                options.services = ['web', 'api', 'db'];
                options.webImage = 'node:18-alpine';
                options.dbImage = 'mongo:latest';
              }
              
              const result = await window.use_mcp_tool({
                server_name: "devops-assistant",
                tool_name: "generate_config",
                arguments: {
                  type: "docker-compose",
                  options: options
                }
              });
              responseText = result.content[0].text;
            } else if (lowerQuery.includes('kubernetes') && lowerQuery.includes('deployment')) {
              // Generate Kubernetes Deployment configuration
              const options: any = {
                name: 'app',
                replicas: 3,
                image: 'nginx:latest'
              };
              
              const result = await window.use_mcp_tool({
                server_name: "devops-assistant",
                tool_name: "generate_config",
                arguments: {
                  type: "kubernetes-deployment",
                  options: options
                }
              });
              responseText = result.content[0].text;
            } else if (lowerQuery.includes('kubernetes') && lowerQuery.includes('service')) {
              // Generate Kubernetes Service configuration
              const options: any = {
                name: 'app',
                port: 80,
                type: 'ClusterIP'
              };
              
              const result = await window.use_mcp_tool({
                server_name: "devops-assistant",
                tool_name: "generate_config",
                arguments: {
                  type: "kubernetes-service",
                  options: options
                }
              });
              responseText = result.content[0].text;
            } else if (lowerQuery.includes('dockerfile')) {
              // Generate Dockerfile
              const options: any = {};
              
              if (lowerQuery.includes('node') || lowerQuery.includes('javascript')) {
                options.baseImage = 'node:18-alpine';
              } else if (lowerQuery.includes('python')) {
                options.baseImage = 'python:3.11-slim';
              }
              
              const result = await window.use_mcp_tool({
                server_name: "devops-assistant",
                tool_name: "generate_config",
                arguments: {
                  type: "dockerfile",
                  options: options
                }
              });
              responseText = result.content[0].text;
            } else if (lowerQuery.includes('github') && lowerQuery.includes('action')) {
              // Generate GitHub Actions workflow
              const result = await window.use_mcp_tool({
                server_name: "devops-assistant",
                tool_name: "generate_config",
                arguments: {
                  type: "github-actions-workflow",
                  options: {}
                }
              });
              responseText = result.content[0].text;
            } else if (lowerQuery.includes('terraform') || lowerQuery.includes('aws')) {
              // Generate Terraform AWS configuration
              const result = await window.use_mcp_tool({
                server_name: "devops-assistant",
                tool_name: "generate_config",
                arguments: {
                  type: "terraform-aws",
                  options: {}
                }
              });
              responseText = result.content[0].text;
            } else {
              // Use answer_question for general generation requests
              const result = await window.use_mcp_tool({
                server_name: "devops-assistant",
                tool_name: "answer_question",
                arguments: {
                  question: input
                }
              });
              responseText = result.content[0].text;
            }
          }
          // For troubleshooting
          else if (lowerQuery.includes('troubleshoot') || lowerQuery.includes('fix') || lowerQuery.includes('solve') || lowerQuery.includes('debug')) {
            let system = 'kubernetes';
            
            if (lowerQuery.includes('docker')) {
              system = 'docker';
            } else if (lowerQuery.includes('ci') || lowerQuery.includes('cd') || lowerQuery.includes('pipeline')) {
              system = 'ci-pipeline';
            } else if (lowerQuery.includes('terraform')) {
              system = 'terraform';
            }
            
            const result = await window.use_mcp_tool({
              server_name: "devops-assistant",
              tool_name: "troubleshoot",
              arguments: {
                system: system,
                problem: input
              }
            });
            responseText = result.content[0].text;
          }
          // For specific DevOps information
          else if (lowerQuery.includes('kubernetes') || lowerQuery.includes('k8s')) {
            let concept = '';
            
            if (lowerQuery.includes('pod') && lowerQuery.includes('lifecycle')) {
              concept = 'pod-lifecycle';
            } else if (lowerQuery.includes('deployment')) {
              concept = 'deployment';
            } else if (lowerQuery.includes('service')) {
              concept = 'service';
            } else if (lowerQuery.includes('ingress')) {
              concept = 'ingress';
            }
            
            const result = await window.use_mcp_tool({
              server_name: "devops-assistant",
              tool_name: "get_devops_info",
              arguments: {
                category: "kubernetes",
                concept: concept,
                includeExamples: true
              }
            });
            responseText = result.content[0].text;
          } else if (lowerQuery.includes('docker')) {
            let concept = '';
            
            if (lowerQuery.includes('compose')) {
              concept = 'docker-compose';
            } else if (lowerQuery.includes('container')) {
              concept = 'container';
            } else if (lowerQuery.includes('image')) {
              concept = 'image';
            }
            
            const result = await window.use_mcp_tool({
              server_name: "devops-assistant",
              tool_name: "get_devops_info",
              arguments: {
                category: "docker",
                concept: concept,
                includeExamples: true
              }
            });
            responseText = result.content[0].text;
          } else if (lowerQuery.includes('ci') || lowerQuery.includes('cd') || lowerQuery.includes('pipeline')) {
            const result = await window.use_mcp_tool({
              server_name: "devops-assistant",
              tool_name: "get_devops_info",
              arguments: {
                category: "cicd",
                concept: "",
                includeExamples: true
              }
            });
            responseText = result.content[0].text;
          } else if (lowerQuery.includes('terraform') || lowerQuery.includes('iac') || lowerQuery.includes('infrastructure as code')) {
            const result = await window.use_mcp_tool({
              server_name: "devops-assistant",
              tool_name: "get_devops_info",
              arguments: {
                category: "iac",
                concept: "",
                includeExamples: true
              }
            });
            responseText = result.content[0].text;
          } else if (lowerQuery.includes('monitor') || lowerQuery.includes('observability') || lowerQuery.includes('logging')) {
            const result = await window.use_mcp_tool({
              server_name: "devops-assistant",
              tool_name: "get_devops_info",
              arguments: {
                category: "monitoring",
                concept: "",
                includeExamples: true
              }
            });
            responseText = result.content[0].text;
          } else {
            // For general questions, use the answer_question tool
            const result = await window.use_mcp_tool({
              server_name: "devops-assistant",
              tool_name: "answer_question",
              arguments: {
                question: input
              }
            });
            responseText = result.content[0].text;
          }
        } catch (error) {
          console.error('Error calling MCP tool:', error);
          responseText = `I encountered an error while processing your request. Please try again or rephrase your question.`;
        }
      } else {
        // Fallback if MCP is not available
        responseText = `I'm currently unable to connect to my knowledge base. Please try again later.

As a DevOps AI Assistant, I can normally provide information about:

- Infrastructure as Code (Terraform, CloudFormation, Pulumi)
- Container orchestration (Docker, Kubernetes)
- CI/CD pipelines (Jenkins, GitHub Actions, GitLab CI)
- Cloud platforms (AWS, Azure, GCP)
- Monitoring and observability
- Automation and scripting
- Security best practices
- Deployment strategies`;
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    } catch (error) {
      console.error('Error in DevOps Assistant:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: "I'm sorry, I encountered an error while processing your request. Please try again later.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  // Custom renderer for code blocks
  const CodeBlock = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center border-b border-gray-700">
        <div className="bg-green-500 p-2 rounded-full">
          <FaRobot className="text-white text-xl" />
        </div>
        <div className="ml-3">
          <h2 className="text-white font-bold">DevOps AI Assistant</h2>
          <p className="text-gray-400 text-sm">Powered by MCP Server Technology</p>
        </div>
        <div className="ml-auto flex space-x-2">
          <div className="bg-gray-700 p-2 rounded-full">
            <FaServer className="text-gray-400" />
          </div>
          <div className="bg-gray-700 p-2 rounded-full">
            <FaDocker className="text-gray-400" />
          </div>
          <div className="bg-gray-700 p-2 rounded-full">
            <FaCloudUploadAlt className="text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* Messages Container */}
      <div className="p-4 h-[500px] overflow-y-auto bg-gray-900">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-200'
              }`}
            >
              <div className="flex items-center mb-1">
                <div 
                  className={`p-1 rounded-full ${
                    message.sender === 'user' 
                      ? 'bg-blue-500' 
                      : 'bg-green-500'
                  }`}
                >
                  {message.sender === 'user' 
                    ? <FaUser className="text-white text-xs" /> 
                    : <FaRobot className="text-white text-xs" />
                  }
                </div>
                <span className="text-xs ml-2 opacity-75">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              
              <div className="devops-message prose prose-invert max-w-none">
                <ReactMarkdown 
                  components={CodeBlock}
                >
                  {message.text}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-800 rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center">
                <div className="bg-green-500 p-1 rounded-full">
                  <FaRobot className="text-white text-xs" />
                </div>
                <div className="ml-2 flex items-center">
                  <div className="typing-dot bg-gray-400"></div>
                  <div className="typing-dot bg-gray-400 animation-delay-200"></div>
                  <div className="typing-dot bg-gray-400 animation-delay-400"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="border-t border-gray-700 p-4 bg-gray-800">
        <form onSubmit={handleSubmit} className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about DevOps concepts, tools, or best practices..."
            className="flex-1 bg-gray-700 text-white rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg px-4 py-2 flex items-center"
            disabled={isTyping}
          >
            {isTyping ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaPaperPlane />
            )}
          </button>
        </form>
        <div className="mt-2 text-xs text-gray-500 flex items-center">
          <FaCode className="mr-1" />
          <span>Supports markdown and code highlighting</span>
        </div>
      </div>
      
      {/* CSS classes are defined in global CSS */}
    </div>
  );
};

export default DevOpsAssistant;
