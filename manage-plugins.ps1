<#
.SYNOPSIS
    Global Plugin & Ecosystem Manager for all development projects.
.DESCRIPTION
    Lists, searches, installs, and links tools/skills from C:\AI_Ecosystem to any project.
.EXAMPLE
    .\manage-plugins.ps1 -List
    .\manage-plugins.ps1 -Link -Tool "heygen-skills" -TargetProject "C:\path\to\my-project"
#>

param(
    [switch]$List,
    [switch]$Test,
    [string]$Search,
    [string]$Install,
    [string]$Category = "skills-and-reach",
    [switch]$Link,
    [string]$Tool,
    [string]$TargetProject
)

$EcosystemRoot = "C:\AI_Ecosystem"

if ($Test) {
    Write-Host "`n=== 🧪 Running Ecosystem Repository Health Checks (46 Repos) ===" -ForegroundColor Cyan
    $testScript = Join-Path $EcosystemRoot "scripts\test-ecosystem.py"
    if (Test-Path $testScript) {
        python $testScript
    } else {
        Write-Host "Test script not found at $testScript" -ForegroundColor Red
    }
    return
}

if ($List) {
    Write-Host "`n=== 🌐 Installed Ecosystem Repositories (46 Total) ===" -ForegroundColor Cyan
    Get-ChildItem -Path $EcosystemRoot -Directory | Where-Object { $_.Name -notlike ".*" -and $_.Name -notin @("scripts", "corporate-governance", "bin", "config", "dashboard", "titan_backend") } | ForEach-Object {
        $cat = $_.Name
        Get-ChildItem -Path $_.FullName -Directory | Select-Object @{Name="Category";Expression={$cat}}, Name
    } | Format-Table -AutoSize
    return
}

if ($Search) {
    Write-Host "`nSearching GitHub for: $Search..." -ForegroundColor Cyan
    try {
        $uri = "https://api.github.com/search/repositories?q=" + [System.Uri]::EscapeDataString($Search) + "&sort=stars&order=desc&per_page=5"
        $res = Invoke-RestMethod -Uri $uri -Headers @{"User-Agent"="PowerShell"}
        $res.items | Select-Object full_name, stargazers_count, language, description | Format-Table -AutoSize
    } catch {
        Write-Host "Search failed: $_" -ForegroundColor Red
    }
    return
}

if ($Install) {
    $dest = Join-Path $EcosystemRoot (Join-Path $Category ($Install.Split('/')[-1].Replace('.git', '')))
    Write-Host "Cloning $Install into $dest..." -ForegroundColor Cyan
    git clone --depth 1 --single-branch $Install $dest
    return
}

if ($Link) {
    if (-not $Tool -or -not $TargetProject) {
        Write-Host "Usage: .\manage-plugins.ps1 -Link -Tool <tool-name> -TargetProject <project-path>" -ForegroundColor Yellow
        return
    }
    $sourceDir = Get-ChildItem -Path $EcosystemRoot -Recurse -Directory -Filter $Tool | Select-Object -First 1
    if (-not $sourceDir) {
        Write-Host "Tool '$Tool' not found in $EcosystemRoot." -ForegroundColor Red
        return
    }
    $targetSkillsDir = Join-Path $TargetProject ".agents\skills\$Tool"
    if (-not (Test-Path (Split-Path $targetSkillsDir))) {
        New-Item -ItemType Directory -Path (Split-Path $targetSkillsDir) -Force | Out-Null
    }
    cmd /c mklink /J "$targetSkillsDir" "$($sourceDir.FullName)"
    Write-Host "Linked $($sourceDir.FullName) -> $targetSkillsDir" -ForegroundColor Green
    return
}

Write-Host "Usage:" -ForegroundColor Yellow
Write-Host "  .\manage-plugins.ps1 -List"
Write-Host "  .\manage-plugins.ps1 -Test"
Write-Host "  .\manage-plugins.ps1 -Search 'query'"
Write-Host "  .\manage-plugins.ps1 -Install 'https://github.com/user/repo.git' -Category 'agents'"
Write-Host "  .\manage-plugins.ps1 -Link -Tool 'heygen-skills' -TargetProject 'C:\Users\Mustafa\...\my-project'"
