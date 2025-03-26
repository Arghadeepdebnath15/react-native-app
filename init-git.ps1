# Initialize git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: Product Review App"

# Instructions for how to connect to GitHub
Write-Host "`nRepository initialized with initial commit.`n"
Write-Host "To push to GitHub:"
Write-Host "1. Create a new repository on GitHub (without README, license, or gitignore)"
Write-Host "2. Run the following commands:"
Write-Host "   git remote add origin YOUR_GITHUB_REPO_URL"
Write-Host "   git branch -M main"
Write-Host "   git push -u origin main"
Write-Host ""
Write-Host "Then you can deploy:"
Write-Host "- Frontend: Connect your GitHub repo to Netlify and select the 'product-review-app' directory"
Write-Host "- Backend: Connect your GitHub repo to Render and select the 'backend' directory" 