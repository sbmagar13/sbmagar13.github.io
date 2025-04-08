## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on GitHub Pages

This project is configured for deployment to GitHub Pages using GitHub Actions. Here's how to deploy:

1. Push your code to a GitHub repository
2. Make sure your repository is set up for GitHub Pages:
   - Go to your repository settings
   - Navigate to "Pages"
   - Set the source to "GitHub Actions"
3. Push to the `main` branch to trigger the deployment workflow

The GitHub Action will:
1. Build the Next.js project with static export
2. Deploy the built files to the `gh-pages` branch
3. Make the site available at `https://yourusername.github.io/brain-portfolio`

### Manual Deployment

You can also manually deploy by running:

```bash
npm run build
# This will create the 'out' directory with static files
```

Then push the contents of the `out` directory to the `gh-pages` branch of your repository.

### Troubleshooting GitHub Pages Deployment

If you encounter issues with the GitHub Pages deployment:

1. **Empty page or 404 error**:
   - Check that the `.nojekyll` file exists in the `out` directory
   - Verify that the GitHub Pages source is set to the `gh-pages` branch
   - Make sure the `basePath` in `next.config.ts` is set correctly (should be `/brain-portfolio` for GitHub Pages)

2. **Missing assets**:
   - Check that the paths to assets are correct in your code
   - For images and other static assets, make sure they're in the `public` directory

3. **Debugging**:
   - Try accessing `/test.html` on your GitHub Pages site to check if static files are being served correctly
   - Check the GitHub Actions logs for any errors during the build and deployment process

4. **Fixing issues**:
   - After making changes, push to the `main` branch to trigger a new deployment
   - You can also manually run the GitHub Action from the "Actions" tab in your repository
