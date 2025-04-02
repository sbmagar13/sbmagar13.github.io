document.addEventListener('DOMContentLoaded', function() {
    // Get all tab buttons and sections
    const tabButtons = document.querySelectorAll('[data-tab]');
    const sections = {
        terminal: document.getElementById('terminal-section'),
        about: document.getElementById('about-section'),
        projects: document.getElementById('projects-section'),
        techstack: document.getElementById('techstack-section')
    };

    // Function to switch tabs
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
        tabButtons.forEach(button => {
            if (button.getAttribute('data-tab') === tabName) {
                button.classList.add('tab-active');
            } else {
                button.classList.remove('tab-active');
            }
        });
    }

    // Add click event listeners to tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Handle terminal commands that switch sections
    const terminalInput = document.querySelector('.terminal-prompt');
    if (terminalInput) {
        terminalInput.addEventListener('click', function() {
            const command = prompt('Enter a command:');
            if (command) {
                // Process command
                if (command === 'about') {
                    switchTab('about');
                } else if (command === 'projects') {
                    switchTab('projects');
                } else if (command === 'skills') {
                    switchTab('techstack');
                } else if (command === 'exit') {
                    // Do nothing, just for demo
                    alert('Exiting terminal mode...');
                }
            }
        });
    }

    // Initialize with terminal tab active
    switchTab('terminal');
});
