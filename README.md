# sagarbudhathoki.com

Source for my personal site at https://sagarbudhathoki.com.

It's a terminal-driven DevOps portfolio. The landing page boots into a fake shell where you can poke around with `help`, `about`, `projects`, `skills`, and `blog`. There's also a separate `/experience3d` route that loads a heavier Three.js scene.

## Stack

- Next.js 15 (App Router, static export)
- React 19, TypeScript
- Tailwind 4
- framer-motion for transitions
- @react-three/fiber + drei for the 3D route (dynamic-loaded so it doesn't block the landing bundle)
- xterm for the terminal feel
- gray-matter + remark for the blog posts in `content/blog/`

## Local dev

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Build

```bash
npm run build
```

Outputs static files to `out/`. The build also touches `out/.nojekyll` so GitHub Pages serves the underscore-prefixed Next.js assets.

## Deploy

Deploys run on every push to `main` via `.github/workflows/deploy.yml`. The workflow builds, writes the `CNAME` for `sagarbudhathoki.com`, and pushes to the `gh-pages` branch.

To deploy manually: `npm run deploy` (uses the `gh-pages` package).

## Project layout

```
src/
  app/                # Next.js routes
    page.tsx          # terminal-first landing
    experience3d/     # heavier 3D route
    sitemap.ts        # SEO
    robots.ts         # SEO
  components/
    Terminal/         # the fake shell + commands
    About/ Projects/ Tools/ Blog/   # sections
    Effects/          # NeuralNetwork, ParticleField, MatrixRain
    Avatar/ Hero/ Loading/ Mobile/  # 3D-route pieces
  lib/ hooks/ utils/
content/blog/         # markdown posts
public/               # static assets
examples/             # portfolio sample infra (Docker, k8s, Terraform). Not used to deploy this site.
```

## Adding a blog post

Drop a markdown file with frontmatter into `content/blog/`. Restart dev or rebuild.

## License

Personal portfolio. Code is mine. Feel free to read it for ideas, don't clone it wholesale.
