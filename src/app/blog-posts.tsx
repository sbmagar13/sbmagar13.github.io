import { BlogPost } from '@/utils/blog';

// Hardcoded blog posts data to avoid fs module issues
const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Kubernetes Troubleshooting Patterns",
    excerpt: "A comprehensive guide to diagnosing and resolving common Kubernetes issues in production environments.",
    date: "2025-03-15",
    readTime: "3 min",
    tags: ["kubernetes", "devops", "troubleshooting"],
    featured: true,
    slug: "kubernetes-troubleshooting-patterns",
    content: `# Kubernetes Troubleshooting Patterns

A comprehensive guide to diagnosing and resolving common Kubernetes issues in production environments.

## Introduction

Kubernetes has become the de facto standard for container orchestration, but with its power comes complexity. In this article, we'll explore systematic approaches to troubleshooting Kubernetes issues in production environments.

## Common Issues and Solutions

### Pod Scheduling Problems

When pods won't schedule, check:

\`\`\`bash
kubectl describe pod <pod-name>
\`\`\`

Look for events that indicate why the scheduler couldn't place the pod.

### Network Connectivity Issues

Network policies, service mesh configurations, and CNI issues can all cause connectivity problems.

\`\`\`bash
kubectl exec -it <pod-name> -- curl -v <service-name>
\`\`\`

### Resource Constraints

Resource pressure is a common cause of instability:

\`\`\`bash
kubectl top nodes
kubectl top pods
\`\`\`

## Advanced Debugging Techniques

For more complex issues, consider:

1. Using ephemeral debug containers
2. Analyzing logs with tools like Loki or Elasticsearch
3. Implementing distributed tracing with Jaeger or Zipkin

## Conclusion

By following these patterns, you can systematically approach Kubernetes troubleshooting, reducing MTTR and improving system reliability.`
  },
  {
    id: 2,
    title: "The Art of Blameless Postmortems",
    excerpt: "How to conduct effective postmortems that focus on learning rather than blame, improving team culture and system reliability.",
    date: "2025-02-28",
    readTime: "3 min",
    tags: ["culture", "incidents", "learning"],
    featured: true,
    slug: "blameless-postmortems",
    content: `# The Art of Blameless Postmortems

How to conduct effective postmortems that focus on learning rather than blame, improving team culture and system reliability.

## Introduction

Incidents are inevitable in complex systems. What matters is how we learn from them. Blameless postmortems are a powerful tool for turning incidents into opportunities for growth and improvement.

## The Principles of Blameless Postmortems

### Focus on Systems, Not People

People generally don't make mistakes because they're careless or incompetent. They make mistakes because:

- The system allowed the mistake to happen
- The system made the mistake likely to happen
- The system failed to catch the mistake

### Assume Good Intentions

Everyone is trying to do their best with the information they had at the time. Start from this assumption and work backward to understand why actions made sense to people in the moment.

## Conducting Effective Postmortems

1. **Establish a timeline**: What happened, when, and in what order?
2. **Identify contributing factors**: What conditions allowed this incident to occur?
3. **Determine remediation items**: What can we change to prevent similar incidents?
4. **Share learnings widely**: How can we ensure the entire organization benefits?

## Example Template

\`\`\`markdown
# Incident Postmortem: [Brief Description]

## Timeline
- 14:32 - First alert triggered
- 14:35 - Engineer acknowledged alert
- ...

## Root Causes and Contributing Factors
1. [Factor 1]
2. [Factor 2]
...

## What Went Well
- [Positive aspect 1]
- [Positive aspect 2]
...

## What Could Be Improved
- [Area for improvement 1]
- [Area for improvement 2]
...

## Action Items
- [ ] [Action 1] (Owner: [Name], Due: [Date])
- [ ] [Action 2] (Owner: [Name], Due: [Date])
...
\`\`\`

## Conclusion

Blameless postmortems transform incidents from sources of fear and finger-pointing into opportunities for learning and improvement. By focusing on systems rather than individuals, we create a culture of psychological safety that ultimately leads to more reliable systems and more effective teams.`
  },
  {
    id: 3,
    title: "Terraform at Scale: Lessons Learned",
    excerpt: "Scaling infrastructure as code across large organizations: patterns, pitfalls, and practical solutions.",
    date: "2025-01-10",
    readTime: "4 min",
    tags: ["terraform", "iac", "scaling"],
    featured: true,
    slug: "terraform-at-scale",
    content: `# Terraform at Scale: Lessons Learned

Scaling infrastructure as code across large organizations: patterns, pitfalls, and practical solutions.

## Introduction

As organizations grow, managing infrastructure becomes increasingly complex. Terraform has emerged as a powerful tool for infrastructure as code (IaC), but scaling Terraform across large teams and complex environments presents unique challenges. This article shares lessons learned from implementing Terraform at scale.

## Key Challenges

### State Management

One of the first challenges organizations face is state management. As your infrastructure grows, a single state file becomes:

- A performance bottleneck
- A single point of failure
- A source of contention between teams

### Module Organization

As your Terraform codebase grows, module organization becomes critical:

\`\`\`hcl
# Example module structure
modules/
├── networking/
│   ├── vpc/
│   ├── subnets/
│   └── security-groups/
├── compute/
│   ├── ec2/
│   └── ecs/
└── data/
    ├── rds/
    └── dynamodb/
\`\`\`

### Governance and Compliance

Ensuring that all infrastructure meets security and compliance requirements becomes challenging at scale.

## Effective Patterns

### Remote State with Fine-Grained Workspaces

Break your state into logical, team-aligned workspaces:

\`\`\`hcl
# backend.tf
terraform {
  backend "s3" {
    bucket         = "my-terraform-states"
    key            = "team1/networking/vpc.tfstate"
    region         = "us-west-2"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
\`\`\`

### Standardized Module Interface

Create modules with consistent, well-documented interfaces:

\`\`\`hcl
# Example of a well-designed module interface
module "vpc" {
  source = "../../modules/networking/vpc"
  
  # Required parameters
  name        = "production"
  cidr_block  = "10.0.0.0/16"
  
  # Optional parameters with sensible defaults
  enable_dns_support   = true
  enable_dns_hostnames = true
  
  # Output usage example in comments
  # vpc_id = module.vpc.vpc_id
}
\`\`\`

### Automated Testing and Validation

Implement a robust CI/CD pipeline that includes:

1. Syntax validation
2. Security scanning
3. Policy enforcement (e.g., with OPA or Sentinel)
4. Cost estimation
5. Integration testing

## Organizational Strategies

### Platform Team Model

Create a dedicated platform team responsible for:

- Developing and maintaining core modules
- Setting standards and best practices
- Providing tools and automation
- Supporting application teams

### Community of Practice

Establish a Terraform community of practice to:

- Share knowledge and experiences
- Collaboratively solve problems
- Review and improve practices
- Onboard new team members

## Conclusion

Scaling Terraform across a large organization requires thoughtful planning and investment in tooling, processes, and people. By addressing state management, module organization, and governance challenges with proven patterns, you can successfully implement infrastructure as code at scale.

Remember that technical solutions alone aren't enough—organizational strategies like platform teams and communities of practice are equally important for long-term success.`
  },
  {
    id: 5,
    title: "AI Agents in DevOps: Current State and Future",
    excerpt: "Exploring how AI agents are transforming DevOps practices and what the future holds.",
    date: "2025-03-20",
    readTime: "2 min",
    tags: ["ai", "agents", "automation", "future"],
    featured: true,
    slug: "ai-agents-in-devops",
    content: `# AI Agents in DevOps: Current State and Future

Exploring how AI agents are transforming DevOps practices and what the future holds.

## Introduction

Artificial Intelligence is revolutionizing every aspect of software development and operations. In this article, we'll explore the current state of AI agents in DevOps and make predictions about where this technology is headed.

## Current Applications

### Intelligent Monitoring and Alerting

AI-powered monitoring systems can:

- Detect anomalies that rule-based systems would miss
- Reduce alert fatigue through smart grouping and prioritization
- Predict potential issues before they impact users

### Automated Incident Response

Modern AI agents can:

\`\`\`typescript
// Example of an AI agent handling an incident
async function handleIncident(incident: Incident) {
  // Analyze the incident
  const analysis = await aiAgent.analyze(incident);
  
  // Determine if automated remediation is possible
  if (analysis.canAutoRemediate) {
    await aiAgent.executeRemediationPlan(analysis.remediationPlan);
    return;
  }
  
  // If not, route to the appropriate team with context
  await aiAgent.routeToHumans(analysis.recommendedTeam, analysis.context);
}
\`\`\`

### Code Generation and Review

AI agents can now:

- Generate boilerplate infrastructure code
- Review pull requests for security and performance issues
- Suggest optimizations based on observed patterns

## The Future of AI in DevOps

### Fully Autonomous Operations

In the near future, we'll likely see:

- Self-healing systems that can diagnose and fix most issues without human intervention
- Continuous optimization of infrastructure based on workload patterns
- Predictive scaling that anticipates demand before it happens

### Human-AI Collaboration

The most effective teams will:

1. Use AI for routine tasks and pattern recognition
2. Leverage human creativity and judgment for complex decisions
3. Create feedback loops where humans train AI systems and AI systems augment human capabilities

## Ethical Considerations

As we integrate AI more deeply into our operations, we must consider:

- Transparency and explainability of AI decisions
- Maintaining human oversight for critical systems
- Ensuring AI systems don't perpetuate or amplify biases

## Conclusion

AI agents are already transforming DevOps practices, and this trend will only accelerate. The most successful organizations will be those that thoughtfully integrate AI capabilities while maintaining human expertise and oversight where it matters most.`
  },
  {
    id: 4,
    title: "Configure Postfix on Ubuntu",
    excerpt: "Mail service self hosted.",
    date: "2024-12-17",
    readTime: "4 min",
    tags: ["mail", "linux", "self-hosted"],
    featured: false,
    slug: "configure-postfix-on-ubuntu",
    content: `# Configure Postfix on Ubuntu (24.04 | 22.04 | 20.04)

What's up, guys!!

Today, I'll talk about how to install and configure Postfix on Ubuntu, so that you can use it to send mail using [Gmail](https://gmail.com/). If you're using a Linux system, you probably heard of Postfix. Postfix is one of the most popular **Mail Transfer Agent** (MTA) that is used to route and deliver email on a Linux system. Also, it's open-source and widely used by approx. 33% of internet mail servers.

## Prerequisites

Before installing and configuring postfix, you need to have some pre-requirements:

- A Linux server (**Ubuntu 22.04** in my case)
- A Google account with two-factor authentication

## Google Account Set Up

First, before proceeding to set up Postfix, you need to set up your google account.

- Open a web browser and log into your [google account](https://myaccount.google.com/).
- Navigate to ***Security*** from the sidebar menu and scroll down and click on ***App passwords.***
- You have to enable two-factor authentication if you haven't already.

- Now **generate** a new password. *(Log in with Gmail password if prompted.)*

- Save the password for your newly created app.

## Postfix - Installation

### Step-1: Postfix and Mailutils installation

Let's install ***postfix*** and ***mailutils***(or mailx for Fedora):

\`\`\`bash
$ sudo apt update
$ sudo apt install postfix mailutils -y
\`\`\`

### Step-2: Gmail Set Up for Postfix

Once you have successfully installed Postfix, now it's time to set up Gmail authentication. For security purposes, you need to put the app password created before in the configuration file and lock it down. This is done so that no one can see your app password. 

To do so:

\`\`\`bash
$ sudo nano /etc/postfix/sasl_passwd
\`\`\`

And add this line:

\`\`\`bash
[smtp.gmail.com]:587   sagar.exclamation@cloudyfox.com:uhpyqdiozquddfmc
\`\`\`

Save and exit the file. Now, make the file accessible only by root to be safer.

\`\`\`bash
$ sudo chmod 600 /etc/postfix/sasl_passwd
\`\`\`

## Postfix - Configurations

### Step-1: Configure SMTP to Postfix

Till now, you have set up Gmail authentication and installed Postfix and mailutils so far. Now, you have configuration file \`/etc/postfix/main.cf\` for postfix, in which you'll be writing some extra stuff to make postfix work with Gmail.

- Open [\`main.cf\`](http://main.cf) file using editor of your choice (vim or nano):

\`\`\`bash
$ sudo nano /etc/postfix/main.cf
\`\`\`

- See the following lines, if not add them:

\`\`\`bash
# Add gmail SMTP server
relayhost = [smtp.gmail.com]:587
# Enable SASL authentication
smtp_sasl_auth_enable = yes
# Disallow methods that allow anonymous authentication
smtp_sasl_security_options = noanonymous
# Location of sasl_passwd
smtp_sasl_password_maps = hash:/etc/postfix/sasl/sasl_passwd
# Enable STARTTLS encryption
smtp_tls_security_level = encrypt
# Location of CA certificates
smtp_tls_CAfile = /etc/ssl/certs/ca-certificates.crt
\`\`\`

- Save and exit the file.

### Step-2: Set Up App Password File to Postfix

Feed password file created earlier into Postfix using \`postmap\`. Postmap is included in mailutils or mailx utilities.

 

\`\`\`bash
$ sudo postmap /etc/postfix/sasl_passwd
\`\`\`

### Step-3: Restart the Postfix and Test

Now after all configurations are set up, restart the postfix:

\`\`\`bash
$ sudo systemctl restart postfix.service
\`\`\`

Test the mail server:

\`\`\`bash
$ echo "Just a test mail" | mail -s "Test Mail" sagar.exclamation@gmail.com
\`\`\`

Here, \`mail\` is another utility tool installed with mailutils or mailx. You'll get a test mail in mentioned gmail account.

OR, 

You can test postfix email sending with Gmail using Postfix's \`sendmail\` implementations:

\`\`\`bash
sendmail recipient@elsewhere.com
From: you@example.com
Subject: Test mail
This is a test email
.
\`\`\`

Here, \`.\` is used to end the process, as there will be no prompt between lines.

You can check the logs by opening syslog:

\`\`\`bash
$ sudo tail -f /var/log/syslog
\`\`\`

## Summary

- Postfix is a popular open-source Mail Transfer Agent (MTA) used by ~33% of internet mail servers
- Setup requires Ubuntu server and Google account with 2FA enabled
- Process involves generating Gmail app password, installing Postfix and mailutils, and configuring SMTP settings
- Key configuration files: /etc/postfix/sasl_passwd for Gmail credentials and /etc/postfix/main.cf for SMTP settings
- Mail can be tested using either the mail command or Postfix's sendmail implementation
- System logs can be monitored through /var/log/syslog`
  }
];

export default async function BlogPosts() {
  // This component doesn't render anything, it just provides data
  return { posts: blogPosts };
}
