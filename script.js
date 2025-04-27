document.addEventListener('DOMContentLoaded', function() {
    // Get all tab buttons and sections
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = {
        terminal: document.getElementById('terminal-section'),
        about: document.getElementById('about-section'),
        projects: document.getElementById('projects-section'),
        techstack: document.getElementById('techstack-section')
    };

    // About section tabs
    const aboutTabs = document.querySelectorAll('.about-tab');
    const aboutContents = document.querySelectorAll('.about-content');

    // Function to switch main tabs
    function switchTab(tabName) {
        // Hide all sections
        Object.values(sections).forEach(section => {
            if (section) section.classList.add('hidden');
        });

        // Show the selected section
        if (sections[tabName]) {
            sections[tabName].classList.remove('hidden');
        }

        // Update active tab styling
        navLinks.forEach(link => {
            if (link.getAttribute('data-tab') === tabName) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Initialize progress bars if about section is shown
        if (tabName === 'about') {
            initProgressBars();
        }
    }

    // Function to switch about tabs
    function switchAboutTab(tabName) {
        // Hide all about content
        aboutContents.forEach(content => {
            content.classList.add('hidden');
        });

        // Show the selected content
        const selectedContent = document.getElementById(`${tabName}-content`);
        if (selectedContent) {
            selectedContent.classList.remove('hidden');
        }

        // Update active tab styling
        aboutTabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabName) {
                tab.classList.add('text-green-500');
                tab.classList.add('border-b-2');
                tab.classList.add('border-green-500');
                tab.classList.remove('text-gray-400');
            } else {
                tab.classList.remove('text-green-500');
                tab.classList.remove('border-b-2');
                tab.classList.remove('border-green-500');
                tab.classList.add('text-gray-400');
            }
        });
    }

    // Add click event listeners to main nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
            
            // Update URL hash
            window.location.hash = tabName;
        });
    });

    // Add click event listeners to about tabs
    aboutTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchAboutTab(tabName);
        });
    });

    // Initialize progress bars
    function initProgressBars() {
        const progressBars = document.querySelectorAll('.progress-value');
        progressBars.forEach(bar => {
            const width = bar.parentElement.parentElement.querySelector('.text-gray-400.font-mono').textContent;
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
        });
    }

    // Terminal functionality
    const terminalPrompt = document.querySelector('.terminal-prompt');
    const terminalBody = document.querySelector('.terminal-body');

    if (terminalPrompt) {
        terminalPrompt.addEventListener('click', function() {
            const command = prompt('Enter a command:');
            if (command) {
                executeCommand(command);
            }
        });
    }

    // Function to execute terminal commands
    function executeCommand(command) {
        // Create new command output
        const outputDiv = document.createElement('div');
        outputDiv.className = 'terminal-output';
        
        // Command prompt
        const promptDiv = document.createElement('div');
        promptDiv.className = 'terminal-prompt';
        promptDiv.textContent = `➜ ${command}`;
        outputDiv.appendChild(promptDiv);
        
        // Command response
        const responseDiv = document.createElement('div');
        responseDiv.className = 'mt-2';
        
        // Process command
        switch(command.trim().toLowerCase()) {
            case 'help':
                responseDiv.innerHTML = `
                    <div class="text-green-500 font-bold">=== AVAILABLE COMMANDS ===</div>
                    <div class="mt-2">
                        <div class="text-yellow-500 font-bold">Core Commands:</div>
                        <div class="ml-2">
                            <span class="text-cyan-500">help</span> - Show this help message<br>
                            <span class="text-cyan-500">clear</span> - Clear the terminal<br>
                            <span class="text-cyan-500">exit</span> - Exit terminal mode
                        </div>
                    </div>
                    <div class="mt-2">
                        <div class="text-yellow-500 font-bold">Profile Commands:</div>
                        <div class="ml-2">
                            <span class="text-cyan-500">about</span> - Show information about me<br>
                            <span class="text-cyan-500">skills</span> - Show my technical skills<br>
                            <span class="text-cyan-500">projects</span> - List my projects<br>
                            <span class="text-cyan-500">contact</span> - Show contact information
                        </div>
                    </div>
                    <div class="mt-2">
                        <div class="text-yellow-500 font-bold">DevOps Commands:</div>
                        <div class="ml-2">
                            <span class="text-cyan-500">deploy [project]</span> - Deploy a project<br>
                            <span class="text-cyan-500">docker [command]</span> - Docker container operations<br>
                            <span class="text-cyan-500">chaos [target]</span> - Trigger chaos monkey<br>
                            <span class="text-cyan-500">monitor [service]</span> - Monitor a service
                        </div>
                    </div>
                    <div class="mt-2">
                        <div class="text-yellow-500 font-bold">Fun Commands:</div>
                        <div class="ml-2">
                            <span class="text-cyan-500">coffee</span> - Get a virtual coffee<br>
                            <span class="text-cyan-500">fortune</span> - Get a random DevOps fortune<br>
                            <span class="text-cyan-500">matrix</span> - Enter the Matrix
                        </div>
                    </div>
                `;
                break;
            case 'clear':
                // Clear all terminal output except the ASCII art
                const asciiArt = terminalBody.querySelector('pre');
                const welcomeMessage = terminalBody.querySelector('.terminal-output:first-of-type');
                terminalBody.innerHTML = '';
                terminalBody.appendChild(asciiArt);
                terminalBody.appendChild(welcomeMessage);
                
                // Add new prompt
                const newPromptDiv = document.createElement('div');
                newPromptDiv.className = 'terminal-prompt';
                newPromptDiv.innerHTML = '➜ <span class="blink">_</span>';
                terminalBody.appendChild(newPromptDiv);
                
                // Don't add the output div for clear command
                return;
            case 'about':
                responseDiv.innerHTML = `
                    <div class="text-green-500 font-bold">=== SYSTEM INFORMATION ===</div>
                    <div class="mt-2">
                        <div><span class="text-cyan-500">Name:</span> Sagar Budhathoki</div>
                        <div><span class="text-cyan-500">Role:</span> Infrastructure Architect & SRE, Python Web Developer, AI Engineer</div>
                        <div><span class="text-cyan-500">Uptime:</span> 99.99% (4+ years in production)</div>
                        <div><span class="text-cyan-500">Kernel:</span> Human v3.7.2</div>
                        <div><span class="text-cyan-500">Memory:</span> 128TB of technical knowledge</div>
                        <div><span class="text-cyan-500">Swap:</span> Coffee-powered memory extension</div>
                    </div>
                `;
                // Also switch to about tab
                setTimeout(() => switchTab('about'), 1000);
                break;
            case 'skills':
                responseDiv.innerHTML = `
                    <div class="text-green-500 font-bold">=== PACKAGE REGISTRY ===</div>
                    <div class="mt-2">
                        <div class="text-yellow-500 font-bold">Infrastructure:</div>
                        <div class="ml-2">
                            • AWS, GCP, Azure (Multi-cloud architecture)<br>
                            • Kubernetes, Docker, Containerd<br>
                            • Terraform, CloudFormation, Pulumi<br>
                            • Linux System Administration
                        </div>
                    </div>
                    <div class="mt-2">
                        <div class="text-yellow-500 font-bold">Python Web Development:</div>
                        <div class="ml-2">
                            • Django (Full-stack web framework)<br>
                            • FastAPI (Modern, high-performance APIs)<br>
                            • Flask (Lightweight web applications)<br>
                            • RESTful API design and implementation
                        </div>
                    </div>
                    <div class="mt-2">
                        <div class="text-yellow-500 font-bold">AI & Machine Learning:</div>
                        <div class="ml-2">
                            • AI Agents & MCP Technologies<br>
                            • LLM Integration & Prompt Engineering<br>
                            • Automation with AI capabilities
                        </div>
                    </div>
                `;
                // Also switch to techstack tab
                setTimeout(() => switchTab('techstack'), 1000);
                break;
            case 'projects':
                responseDiv.innerHTML = `
                    <div class="text-green-500 font-bold">=== PRODUCTION ENVIRONMENT ===</div>
                    <div class="mt-2">
                        <div class="text-yellow-500">[1] Kubernetes Cluster Automation</div>
                        <div class="ml-2">
                            <div><span class="text-cyan-500">Namespace:</span> Infrastructure</div>
                            <div><span class="text-cyan-500">Tech:</span> Kubernetes, Terraform, ArgoCD, Helm</div>
                            <div><span class="text-cyan-500">Status:</span> Running (99.99% uptime)</div>
                        </div>
                    </div>
                    <div class="mt-2">
                        <div class="text-yellow-500">[2] CI/CD Pipeline Overhaul</div>
                        <div class="ml-2">
                            <div><span class="text-cyan-500">Namespace:</span> DevOps</div>
                            <div><span class="text-cyan-500">Tech:</span> GitHub Actions, Jenkins, Docker</div>
                            <div><span class="text-cyan-500">Status:</span> Running (98.5% success rate)</div>
                        </div>
                    </div>
                    <div class="mt-2">
                        <div class="text-yellow-500">[3] Enterprise API Platform</div>
                        <div class="ml-2">
                            <div><span class="text-cyan-500">Namespace:</span> Development</div>
                            <div><span class="text-cyan-500">Tech:</span> Python, Django, FastAPI, PostgreSQL</div>
                            <div><span class="text-cyan-500">Status:</span> Running (99.95% uptime)</div>
                        </div>
                    </div>
                `;
                // Also switch to projects tab
                setTimeout(() => switchTab('projects'), 1000);
                break;
            case 'contact':
                responseDiv.innerHTML = `
                    <div class="text-green-500 font-bold">=== CONNECTION DETAILS ===</div>
                    <div class="mt-2">
                        <div><span class="text-cyan-500">Name:</span> Sagar Budhathoki</div>
                        <div><span class="text-cyan-500">Email:</span> mail@budhathokisagar.com.np</div>
                        <div><span class="text-cyan-500">GitHub:</span> https://github.com/sbmagar13</div>
                        <div><span class="text-cyan-500">LinkedIn:</span> https://linkedin.com/in/sbmagar13</div>
                        <div><span class="text-cyan-500">Twitter:</span> https://twitter.com/S_agarM_agar</div>
                    </div>
                    <div class="mt-2">
                        <div class="text-yellow-500">Preferred Communication Protocol:</div>
                        <div class="ml-2">SSH into my inbox with a clear subject line and I'll respond within 24 hours.</div>
                    </div>
                `;
                break;
            case 'exit':
                responseDiv.innerHTML = `
                    <div class="text-yellow-500">Exiting terminal mode...</div>
                    <div class="text-green-500">Switching to GUI interface.</div>
                `;
                // Switch to about tab
                setTimeout(() => switchTab('about'), 1000);
                break;
            case 'coffee':
                responseDiv.innerHTML = `
                    <div class="text-green-500 font-bold">=== COFFEE DEPLOYMENT PIPELINE ===</div>
                    <div class="text-yellow-500 mt-2">Initiating coffee microservice deployment...</div>
                    <div class="mt-2">
                        <div class="text-cyan-500">[1/6]</div> Provisioning water resources to 94°C... <span class="text-green-500">✓ Done</span><br>
                        <div class="text-cyan-500">[2/6]</div> Containerizing coffee beans (Alpine grind)... <span class="text-green-500">✓ Done</span><br>
                        <div class="text-cyan-500">[3/6]</div> Establishing bean-to-water handshake... <span class="text-green-500">✓ Connected</span><br>
                        <div class="text-cyan-500">[4/6]</div> Extracting caffeine payload (27s)... <span class="text-green-500">✓ Extracted</span><br>
                        <div class="text-cyan-500">[5/6]</div> Load balancing to your mug... <span class="text-green-500">✓ Distributed</span><br>
                        <div class="text-cyan-500">[6/6]</div> Running health checks... <span class="text-green-500">✓ Aromatic</span>
                    </div>
                    <div class="text-green-500 font-bold mt-2">Coffee v2.5.7 successfully deployed!</div>
                    <pre class="text-cyan-500 mt-2">
         {
      {   }
       }_{ __{
    .-{   }   }-.
   (   }     {   )
   |'-.       .-'|
   |   |     |   |
   |   |     |   |
   |   |     |   |
   |   |     |   |
   |   '-._.-'   |
   |             |
   |             |
   -.           .-
     '-._____.-'
                    </pre>
                    <div class="text-yellow-500 mt-2">Enjoy your virtual coffee!</div>
                `;
                break;
            case 'fortune':
                const fortunes = [
                    "The best way to predict the future is to implement it.",
                    "A good SRE knows how to break things. A great SRE knows what will break without intervention.",
                    "Given enough eyeballs, all bugs are shallow. Given enough coffee, all PRs get reviewed.",
                    "The cloud is just someone else's computer, but with better uptime than yours.",
                    "Weeks of coding can save you hours of planning.",
                    "In DevOps, we trust the process because we automated and tested it thoroughly.",
                    "There are two hard problems in computer science: cache invalidation, naming things, and off-by-one errors.",
                    "If it hurts, do it more often. Especially deployments.",
                    "Your infrastructure should be cattle, not pets. Unless you're running a pet store website."
                ];
                const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
                responseDiv.innerHTML = `
                    <div class="text-green-500 font-bold">=== DEVOPS FORTUNE ===</div>
                    <div class="text-yellow-500 mt-2">" ${randomFortune} "</div>
                    <div class="text-gray-500 mt-2">Your DevOps fortune cookie has been consumed. No refunds.</div>
                `;
                break;
            case 'matrix':
                responseDiv.innerHTML = `
                    <div class="text-green-500 font-bold">=== ENTERING THE MATRIX ===</div>
                    <div class="mt-2">
                        <div class="text-green-500">01101000 01100101 01101100 01101100 01101111</div>
                        <div class="text-green-500">01110111 01101111 01110010 01101100 01100100</div>
                        <div class="text-green-500">01100100 01100101 01110110 01101111 01110000 01110011</div>
                        <div class="text-green-500">01101011 01110101 01100010 01100101 01110010 01101110 01100101 01110100 01100101 01110011</div>
                        <div class="text-green-500">01110100 01100101 01110010 01110010 01100001 01100110 01101111 01110010 01101101</div>
                    </div>
                    <div class="text-yellow-500 mt-2">Wake up, DevOps Engineer...</div>
                    <div class="text-yellow-500">The Matrix has you...</div>
                    <div class="text-yellow-500">Follow the white rabbit to Kubernetes...</div>
                    <div class="text-gray-500 mt-2">Remember: There is no spoon, only infrastructure as code.</div>
                `;
                break;
            default:
                if (command.startsWith('deploy')) {
                    const project = command.split(' ')[1] || 'default';
                    responseDiv.innerHTML = `
                        <div class="text-green-500 font-bold">=== DEPLOYMENT PIPELINE ===</div>
                        <div class="text-yellow-500 mt-2">Initiating deployment for Project ${project}...</div>
                        <div class="mt-2">
                            <div class="text-cyan-500">[1/7]</div> Running tests... <span class="text-green-500">✓ Passed</span><br>
                            <div class="text-cyan-500">[2/7]</div> Building artifacts... <span class="text-green-500">✓ Completed</span><br>
                            <div class="text-cyan-500">[3/7]</div> Scanning for vulnerabilities... <span class="text-green-500">✓ No issues found</span><br>
                            <div class="text-cyan-500">[4/7]</div> Pushing to registry... <span class="text-green-500">✓ Uploaded</span><br>
                            <div class="text-cyan-500">[5/7]</div> Updating infrastructure... <span class="text-green-500">✓ Applied</span><br>
                            <div class="text-cyan-500">[6/7]</div> Deploying to production... <span class="text-green-500">✓ Deployed</span><br>
                            <div class="text-cyan-500">[7/7]</div> Running smoke tests... <span class="text-green-500">✓ Verified</span>
                        </div>
                        <div class="text-green-500 font-bold mt-2">Deployment completed successfully!</div>
                        <div class="mt-2">
                            <div><span class="text-cyan-500">Deployment ID:</span> d-${Math.random().toString(36).substring(2, 10)}</div>
                            <div><span class="text-cyan-500">Duration:</span> 3m 42s</div>
                            <div><span class="text-cyan-500">Status:</span> <span class="text-green-500">HEALTHY</span></div>
                        </div>
                        <div class="text-yellow-500 mt-2">Monitoring deployment for the next 15 minutes...</div>
                    `;
                } else if (command.startsWith('docker')) {
                    const dockerCmd = command.split(' ')[1] || 'run';
                    responseDiv.innerHTML = `
                        <div class="text-green-500 font-bold">=== DOCKER CONTAINERIZATION ===</div>
                        <div class="text-yellow-500 mt-2">Initiating Docker ${dockerCmd} operation...</div>
                        <div class="mt-2">
                            <div class="text-cyan-500">[1/5]</div> Creating application network... <span class="text-green-500">✓ Created</span><br>
                            <div class="text-cyan-500">[2/5]</div> Pulling container images... <span class="text-green-500">✓ Downloaded</span><br>
                            <div class="text-cyan-500">[3/5]</div> Starting database container... <span class="text-green-500">✓ Running</span><br>
                            <div class="text-cyan-500">[4/5]</div> Starting application containers... <span class="text-green-500">✓ Running</span><br>
                            <div class="text-cyan-500">[5/5]</div> Configuring network connections... <span class="text-green-500">✓ Connected</span>
                        </div>
                        <div class="text-green-500 font-bold mt-2">Docker containers running successfully!</div>
                        <div class="mt-2">
                            <div><span class="text-cyan-500">Container Network:</span> app-network</div>
                            <div><span class="text-cyan-500">Running Containers:</span> 4</div>
                            <div><span class="text-cyan-500">Status:</span> <span class="text-green-500">HEALTHY</span></div>
                        </div>
                    `;
                } else if (command.startsWith('chaos')) {
                    const target = command.split(' ')[1] || 'random';
                    responseDiv.innerHTML = `
                        <div class="text-green-500 font-bold">=== CHAOS MONKEY EXPERIMENT ===</div>
                        <div class="text-red-500 font-bold mt-2">🐒 Releasing the Chaos Monkey! 🐒</div>
                        <div class="mt-2">
                            <div><span class="text-yellow-500">Target Service:</span> ${target}</div>
                            <div><span class="text-yellow-500">Chaos Type:</span> pod-failure</div>
                            <div><span class="text-yellow-500">Duration:</span> 5 minutes</div>
                            <div><span class="text-yellow-500">Scope:</span> 25% of service instances</div>
                        </div>
                        <div class="mt-2">
                            <div class="text-cyan-500">[1/5]</div> Preparing experiment... <span class="text-green-500">✓ Ready</span><br>
                            <div class="text-cyan-500">[2/5]</div> Verifying monitoring... <span class="text-green-500">✓ Active</span><br>
                            <div class="text-cyan-500">[3/5]</div> Executing chaos... <span class="text-green-500">✓ Injected</span><br>
                            <div class="text-cyan-500">[4/5]</div> Monitoring service health... <span class="text-yellow-500">⚠ Degraded but functioning</span><br>
                            <div class="text-cyan-500">[5/5]</div> Restoring normal operation... <span class="text-green-500">✓ Recovered</span>
                        </div>
                        <div class="text-green-500 font-bold mt-2">Experiment completed successfully!</div>
                        <div class="text-yellow-500 mt-2">Results:</div>
                        <div class="ml-2">
                            - Service degraded but remained available<br>
                            - Failover mechanisms activated properly<br>
                            - 95% of requests succeeded during chaos<br>
                            - Recovery time: 12.3 seconds
                        </div>
                    `;
                } else if (command.startsWith('monitor')) {
                    const service = command.split(' ')[1] || 'all';
                    responseDiv.innerHTML = `
                        <div class="text-green-500 font-bold">=== SYSTEM MONITORING DASHBOARD ===</div>
                        <div class="text-gray-400 mt-2">Last updated: ${new Date().toISOString()}</div>
                        <div class="text-yellow-500 mt-2">Service Status:</div>
                        <div class="ml-2">
                            <div><span class="text-cyan-500">api-gateway</span> <span class="text-green-500">● HEALTHY</span></div>
                            <div><span class="text-cyan-500">auth-service</span> <span class="text-green-500">● HEALTHY</span></div>
                            <div><span class="text-cyan-500">user-service</span> <span class="text-yellow-500">● DEGRADED</span></div>
                            <div><span class="text-cyan-500">payment-service</span> <span class="text-green-500">● HEALTHY</span></div>
                        </div>
                        <div class="text-yellow-500 mt-2">System Metrics:</div>
                        <div class="ml-2">
                            <div><span class="text-cyan-500">CPU Usage:</span> [█████████████-----] 65%</div>
                            <div><span class="text-cyan-500">Memory Usage:</span> [███████████████---] 78%</div>
                            <div><span class="text-cyan-500">Network Traffic:</span> [████████--------] 42%</div>
                            <div><span class="text-cyan-500">Disk I/O:</span> [██████------------] 30%</div>
                        </div>
                        <div class="text-yellow-500 mt-2">Alerts:</div>
                        <div class="ml-2">
                            <div class="text-yellow-500">⚠ user-service latency above threshold (120ms > 100ms)</div>
                            <div class="text-yellow-500">⚠ user-service error rate above threshold (2.30% > 1.00%)</div>
                        </div>
                    `;
                } else {
                    responseDiv.innerHTML = `
                        <div class="text-red-500">Command not found: ${command}</div>
                        <div class="text-gray-400">Type 'help' to see available commands.</div>
                    `;
                }
        }
        
        outputDiv.appendChild(responseDiv);
        
        // Add output to terminal
        terminalBody.insertBefore(outputDiv, terminalBody.lastElementChild);
        
        // Scroll to bottom
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    // Create animated particles
    function createParticles() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';
        document.body.appendChild(particleContainer);
        
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random size
            const size = Math.random() * 5 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Random position
            const posX = Math.random() * window.innerWidth;
            const posY = Math.random() * window.innerHeight;
            particle.style.left = `${posX}px`;
            particle.style.top = `${posY}px`;
            
            // Random opacity
            particle.style.opacity = Math.random() * 0.5 + 0.1;
            
            // Add to container
            particleContainer.appendChild(particle);
            
            // Animate
            animateParticle(particle);
        }
    }

    // Animate a particle
    function animateParticle(particle) {
        const duration = Math.random() * 15000 + 10000; // 10-25 seconds
        const targetX = Math.random() * window.innerWidth;
        const targetY = Math.random() * window.innerHeight;
        
        particle.animate([
            { transform: 'translate(0, 0)' },
            { transform: `translate(${targetX - parseFloat(particle.style.left)}px, ${targetY - parseFloat(particle.style.top)}px)` }
        ], {
            duration: duration,
            easing: 'ease-in-out',
            fill: 'forwards'
        }).onfinish = () => {
            // Update position
            particle.style.left = `${targetX}px`;
            particle.style.top = `${targetY}px`;
            
            // Animate again
            animateParticle(particle);
        };
    }

    // 3D card effect
    function init3DCards() {
        const cards = document.querySelectorAll('.card-3d');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            });
        });
    }

    // Initialize the page
    function initPage() {
        // Check URL hash for initial tab
        const hash = window.location.hash.substring(1);
        if (hash && sections[hash]) {
            switchTab(hash);
        } else {
            switchTab('terminal');
        }
        
        // Initialize about tab
        switchAboutTab('metrics');
        
        // Create particles
        createParticles();
        
        // Initialize 3D cards
        init3DCards();
        
        // Animate progress bars with delay
        setTimeout(initProgressBars, 500);
    }

    // Initialize the page
    initPage();
});
