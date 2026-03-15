# Helper script for the Staging/Production workflow

param (
    [Parameter(Mandatory = $true)]
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
    
    # 1. Run migrations for Staging
    pnpm run db:migrate:staging

    # 2. Ensure we are on staging or a feature branch
    Write-Host "Pushing $currentBranch to origin staging..."
    git push origin "${currentBranch}:staging"
    
    Write-Host "[OK] Pushed to staging. Vercel will now deploy the Preview." -ForegroundColor Green
    Write-Host "Check the Vercel Dashboard for progress."
}

if ($Target -eq "production") {
    Write-Host "[PROD] Deploying to PRODUCTION..." -ForegroundColor Red
    
    # 1. Ask for confirmation
    $confirmation = Read-Host "Are you sure you want to merge STAGING into MASTER and deploy to PROD? (y/n)"
    if ($confirmation -ne "y") {
        Write-Host "[CANCEL] Aborted." -ForegroundColor Yellow
        exit
    }

    # 2. Perform merge
    Write-Host "Switching to master..."
    git checkout master
    Write-Host "Pulling latest master..."
    git pull origin master
    
    Write-Host "Merging staging into master..."
    git merge staging
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Merge conflict! Please resolve manually." -ForegroundColor Red
        exit
    }

    # 3. Run migrations for Production
    Write-Host "Running PRODUCTION migrations..." -ForegroundColor Yellow
    pnpm run db:migrate:prod

    # 4. Push to master
    Write-Host "Pushing to master..."
    git push origin master

    Write-Host "Switching back to $currentBranch..."
    git checkout $currentBranch

    Write-Host "[SUCCESS] PRODUCTION deployment triggered and database updated!" -ForegroundColor Green
}
