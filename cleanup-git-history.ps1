# Quick Fix: Remove Secrets from Git History
# This script resets to before the problematic commit and re-applies clean changes

Write-Host "🚨 Git History Cleanup Script" -ForegroundColor Yellow
Write-Host ""
Write-Host "This will remove commits with exposed secrets from Git history." -ForegroundColor Red
Write-Host "⚠️  WARNING: This rewrites Git history!" -ForegroundColor Red
Write-Host ""

# Show current status
Write-Host "Current commits:" -ForegroundColor Cyan
git log --oneline -5

Write-Host ""
Write-Host "Problematic commit: d0734e1 (contains secrets)" -ForegroundColor Red
Write-Host ""

# Ask for confirmation
$confirm = Read-Host "Do you want to proceed? This will delete commits after d051502. (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "Aborted." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Step 1: Resetting to commit d051502 (before secrets)..." -ForegroundColor Green
git reset --hard d051502

Write-Host ""
Write-Host "Step 2: Re-applying security changes..." -ForegroundColor Green
git cherry-pick 2fbc3dc

Write-Host ""
Write-Host "✅ Git history cleaned!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Verify your .env file exists with your credentials"
Write-Host "2. Test the application locally: dotnet run"
Write-Host "3. Force push to GitHub: git push origin master --force"
Write-Host ""
Write-Host "⚠️  IMPORTANT: Rotate all exposed credentials before pushing!" -ForegroundColor Red
Write-Host "   - Google OAuth Client ID & Secret"
Write-Host "   - Gmail App Password"
Write-Host "   - JWT Secret Token"
Write-Host ""
