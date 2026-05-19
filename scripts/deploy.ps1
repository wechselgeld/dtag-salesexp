# Helper script for the Staging/Production workflow

param (
    [Parameter(Mandatory = $true)]
    [ValidateSet("staging", "production")]
    $Target
)

# 1. Helper function to check if Git repository is clean
function Get-GitStatusClean {
    $status = git status --porcelain
    return [string]::IsNullOrEmpty($status)
}

# 2. Helper function to get current branch name
function Get-CurrentBranch {
    $branch = git rev-parse --abbrev-ref HEAD
    return $branch
}

$currentBranch = Get-CurrentBranch

# 3. Check for uncommitted changes and handle committing
$isClean = Get-GitStatusClean
if (-not $isClean) {
    Write-Host "You have uncommitted changes in your repository." -ForegroundColor Yellow
    $commitMsg = Read-Host "Please enter a commit message to save your changes"
    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        $commitMsg = "deploy: automated update before deployment at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        Write-Host "No commit message provided. Using default: '$commitMsg'" -ForegroundColor Gray
    }
    
    Write-Host "Adding changes and committing..." -ForegroundColor Cyan
    git add -A
    git commit -m $commitMsg
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to commit changes. Aborting deployment." -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Changes committed successfully." -ForegroundColor Green
} else {
    Write-Host "[OK] Working directory is clean." -ForegroundColor Green
}

# 4. Handle Staging Deployment
if ($Target -eq "staging") {
    Write-Host "[STAGING] Deploying to STAGING..." -ForegroundColor Cyan
    
    # Run database schema push for Staging
    Write-Host "Running STAGING database push..." -ForegroundColor Yellow
    pnpm run db:push:staging
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Staging database push failed. Aborting deployment." -ForegroundColor Red
        exit 1
    }

    # Push current branch to origin staging
    Write-Host "Pushing current branch '$currentBranch' to remote 'staging'..." -ForegroundColor Yellow
    git push origin "${currentBranch}:staging"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to push to remote staging. Aborting deployment." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "[OK] Pushed to staging branch. Vercel will now deploy the Preview." -ForegroundColor Green
}

# 5. Handle Production Deployment
if ($Target -eq "production") {
    Write-Host "[PROD] Deploying to PRODUCTION..." -ForegroundColor Red
    
    $confirmation = Read-Host "Are you sure you want to push to staging and then merge and deploy to master (PROD)? (y/n)"
    if ($confirmation -ne "y") {
        Write-Host "[CANCEL] Aborted." -ForegroundColor Yellow
        exit 0
    }

    # 1. First, automatically push to staging to ensure staging is in sync
    Write-Host "[PROD -> STAGING] Pushing current branch '$currentBranch' to remote 'staging'..." -ForegroundColor Yellow
    git push origin "${currentBranch}:staging"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to push to staging. Aborting production deployment." -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Staging branch is updated." -ForegroundColor Green

    # 2. Switch to master, pull, and merge staging
    if ($currentBranch -eq "master") {
        # Already on master, just push master
        Write-Host "Already on 'master' branch. Pulling latest master..." -ForegroundColor Yellow
        git pull origin master
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Failed to pull latest master. Aborting deployment." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Switching to master branch..." -ForegroundColor Yellow
        git checkout master
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Failed to checkout master. Aborting deployment." -ForegroundColor Red
            exit 1
        }

        Write-Host "Pulling latest master from remote..." -ForegroundColor Yellow
        git pull origin master
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Failed to pull latest master. Switching back to '$currentBranch'." -ForegroundColor Red
            git checkout $currentBranch
            exit 1
        }

        Write-Host "Fetching latest staging branch from remote..." -ForegroundColor Yellow
        git fetch origin staging
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Failed to fetch remote staging. Switching back to '$currentBranch'." -ForegroundColor Red
            git checkout $currentBranch
            exit 1
        }

        Write-Host "Merging remote 'origin/staging' into 'master'..." -ForegroundColor Yellow
        git merge origin/staging -m "Merge remote-tracking branch 'origin/staging' into master"
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Merge conflict occurred during merge! Please resolve manually. Switching back to original branch..." -ForegroundColor Red
            git merge --abort
            git checkout $currentBranch
            exit 1
        }
    }

    # 3. Run production database schema push
    Write-Host "Running PRODUCTION database push..." -ForegroundColor Yellow
    pnpm run db:push:prod
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Production database push failed! Switching back to original branch..." -ForegroundColor Red
        if ($currentBranch -ne "master") {
            git checkout $currentBranch
        }
        exit 1
    }

    # 4. Push to master
    Write-Host "Pushing master branch to remote..." -ForegroundColor Yellow
    git push origin master
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to push to remote master!" -ForegroundColor Red
        if ($currentBranch -ne "master") {
            git checkout $currentBranch
        }
        exit 1
    }

    # 5. Switch back to original branch if we weren't on master
    if ($currentBranch -ne "master") {
        Write-Host "Switching back to original branch '$currentBranch'..." -ForegroundColor Yellow
        git checkout $currentBranch
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[WARNING] Could not switch back to '$currentBranch' automatically. Please checkout manually." -ForegroundColor Yellow
        }
    }

    Write-Host "[SUCCESS] PRODUCTION deployment triggered and database schema pushed successfully!" -ForegroundColor Green
}
