// MCP Initialization Script
// This script checks for the Cline environment's window.use_mcp_tool function
// and provides a fallback implementation if it's not available

(function() {
  console.log('Initializing MCP functionality...');
  
  // Store the original use_mcp_tool function if it exists
  const originalUseMcpTool = window.use_mcp_tool;
  
  // Define our implementation that will try to use the original function first
  window.use_mcp_tool = async function(params) {
    console.log('Calling MCP tool:', params);
    
    try {
      // If the original function exists, use it
      if (typeof originalUseMcpTool === 'function') {
        console.log('Using original MCP tool function');
        return await originalUseMcpTool(params);
      }
      
      // Otherwise, try to communicate with the MCP server directly
      console.log('Original MCP tool function not available, trying API route');
      
      // Make a fetch request to the MCP server via our API route
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          server_name: params.server_name,
          tool_name: params.tool_name,
          arguments: params.arguments
        }),
      });
      
      // Check if the response is ok
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Parse the response
      const result = await response.json();
      console.log('MCP tool response:', result);
      
      return result;
    } catch (error) {
      console.error('Error calling MCP tool:', error);
      
      // Return a fallback response
      return {
        content: [
          {
            type: 'text',
            text: `I'm currently unable to connect to my knowledge base. Please try again later.

As a DevOps AI Assistant, I can normally provide information about:

- Infrastructure as Code (Terraform, CloudFormation, Pulumi)
- Container orchestration (Docker, Kubernetes)
- CI/CD pipelines (Jenkins, GitHub Actions, GitLab CI)
- Cloud platforms (AWS, Azure, GCP)
- Monitoring and observability
- Automation and scripting
- Security best practices
- Deployment strategies`
          }
        ]
      };
    }
  };
  
  console.log('MCP initialization complete');
})();
