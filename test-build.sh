#!/bin/bash

echo "Testing Next.js static export build..."
npm run build

if [ -d "out" ]; then
  echo "✅ Build successful! Static files generated in the 'out' directory."
  echo "The project is ready to be deployed to GitHub Pages."
  echo "To deploy, push your code to GitHub and the GitHub Action will handle the deployment."
else
  echo "❌ Build failed. Please check the error messages above."
fi
