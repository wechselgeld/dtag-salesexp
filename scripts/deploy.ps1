# Helper script for the Staging/Production workflow

param (
    [Parameter(Mandatory=$true)]
    [ValidateSet("staging", "production")]
    $Target
)

function Get-CurrentBranch {
    $branch = git rev-parse --abbrev-ref HEAD
    return $branch
}

$currentBranch = Get-CurrentBranch

if ($Target -eq "staging") {
    Write-Host "[STAGING] Deploying to STAGING..." -ForegroundColor Cyan
    
    pnpm run db:push:staging

    # 1. Ensure we are on staging or a feature branch
    Write-Host "Pushing $currentBranch to origin staging..."
    git push origin "${currentBranch}:staging"
    
    Write-Host "[OK] Pushed to staging. Vercel will now deploy the Preview." -ForegroundColor Green
    Write-Host "Check the Vercel Dashboard for progress."
}

if ($Target -eq "production") {
    Write-Host "[PROD] Deploying to PRODUCTION..." -ForegroundColor Red
    
    # 1. Ask for confirmation
    $confirmation = Read-Host "Are you sure you want to merge STAGING into MAIN and deploy to PROD? (y/n)"
    if ($confirmation -ne "y") {
        Write-Host "[CANCEL] Aborted." -ForegroundColor Yellow
        exit
    }

    # 2. Perform merge
    Write-Host "Switching to main..."
    git checkout main
    Write-Host "Pulling latest main..."
    git pull origin main
    
    Write-Host "Merging staging into main..."
    git merge staging
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Merge conflict! Please resolve manually." -ForegroundColor Red
        exit
    }

    pnpm run db:push:prod

    Write-Host "Pushing to main..."
    git push origin main
    
    Write-Host "Switching back to $currentBranch..."
    git checkout $currentBranch

    Write-Host "[SUCCESS] PRODUCTION deployment triggered!" -ForegroundColor Green
}
