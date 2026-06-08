# examples/

Portfolio sample infrastructure. **None of this is used to deploy this site**, the live site is a static export pushed to GitHub Pages by `.github/workflows/deploy.yml`.

These files exist to show how I'd containerize, orchestrate, and provision the same kind of Next.js app in a real environment.

- `Dockerfile` and `docker-compose.yml`, multi-stage container build and local compose setup
- `k8s/`, Kubernetes manifests (deployment, service, ingress)
- `terraform/`, IaC for the cloud side
- `monitoring/`, Prometheus / Grafana scaffolding

Treat them as readable artifacts, not runnable infrastructure for this repo.
