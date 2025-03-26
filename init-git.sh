#!/bin/bash

# Initialize git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: Product Review App"

# Instructions for how to connect to GitHub
echo ""
echo "Repository initialized with initial commit."
echo ""
echo "To push to GitHub:"
echo "1. Create a new repository on GitHub (without README, license, or gitignore)"
echo "2. Run the following commands:"
echo "   git remote add origin YOUR_GITHUB_REPO_URL"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "Then you can deploy:"
echo "- Frontend: Connect your GitHub repo to Netlify and select the 'product-review-app' directory"
echo "- Backend: Connect your GitHub repo to Render and select the 'backend' directory" 