import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('Received MCP request');
  
  try {
    // Parse the request body
    const body = await request.json();
    const { server_name, tool_name, arguments: args } = body;
    
    console.log(`MCP request details:`, { server_name, tool_name, arguments: args });
    
    // Check if the requested server is supported
    if (server_name !== 'devops-assistant') {
      console.error(`Unknown MCP server: ${server_name}`);
      return NextResponse.json(
        { error: `Unknown MCP server: ${server_name}` },
        { status: 400 }
      );
    }
    
    // Return hardcoded responses based on the tool name
    if (tool_name === 'answer_question') {
      return NextResponse.json({
        content: [
          {
            type: 'text',
            text: `# DevOps Answer

I've processed your question: "${args.question}"

This is a response from the API route. In a production environment, this would be the actual response from the MCP server.

## Key Points
- The MCP integration is working
- The DevOps Assistant can now communicate with the MCP server
- You can ask questions about DevOps concepts, tools, and best practices

Let me know if you need more specific information!`
          }
        ]
      });
    } else if (tool_name === 'generate_config') {
      const configType = args.type || 'docker-compose';
      return NextResponse.json({
        content: [
          {
            type: 'text',
            text: `# ${configType.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Configuration

I've generated a ${configType} configuration based on your requirements.

\`\`\`
# This is a sample configuration for testing
# In a production environment, this would be the actual configuration from the MCP server
version: '3'
services:
  app:
    image: node:14
    volumes:
      - ./:/app
    working_dir: /app
    command: npm start
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
\`\`\`

You can customize this configuration further based on your specific requirements.`
          }
        ]
      });
    } else if (tool_name === 'get_devops_info') {
      const category = args.category || 'kubernetes';
      const concept = args.concept || '';
      return NextResponse.json({
        content: [
          {
            type: 'text',
            text: `# ${category.charAt(0).toUpperCase() + category.slice(1)} ${concept ? '- ' + concept : ''}

I've retrieved information about ${concept || category}.

## Overview
This is a response from the API route. In a production environment, this would be the actual information from the MCP server.

## Best Practices
- Best practice 1: Always use version control for infrastructure code
- Best practice 2: Implement CI/CD pipelines for automated testing and deployment
- Best practice 3: Use infrastructure as code for reproducible environments

${concept ? '## Examples\n\n```\n# Example code would be here\n```' : ''}

Let me know if you need more specific information!`
          }
        ]
      });
    } else if (tool_name === 'troubleshoot') {
      const system = args.system || 'kubernetes';
      const problem = args.problem || 'general issue';
      return NextResponse.json({
        content: [
          {
            type: 'text',
            text: `# Troubleshooting ${system}: ${problem}

I've analyzed your issue and here are some troubleshooting steps.

## Possible Causes
- Configuration errors in the ${system} setup
- Resource constraints or limitations
- Version incompatibilities between components

## Solutions
- Verify your configuration files for syntax errors
- Check system logs for error messages
- Ensure all components are compatible with each other
- Consider upgrading to the latest stable version

Let me know if you need more specific guidance!`
          }
        ]
      });
    } else {
      // Default response for unknown tools
      return NextResponse.json({
        content: [
          {
            type: 'text',
            text: `# MCP Tool Response

I've processed your request to use the "${tool_name}" tool.

This is a response from the API route. In a production environment, this would be the actual response from the MCP server.

## Request Details
- Tool: ${tool_name}
- Server: ${server_name}

Let me know if you need more specific information!`
          }
        ]
      });
    }
  } catch (error) {
    console.error('Error processing MCP request:', error);
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
