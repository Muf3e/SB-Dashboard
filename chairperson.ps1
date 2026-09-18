<#
.SYNOPSIS
    Chairperson Executive Command Center — Global Enterprise AI Holdings
.DESCRIPTION
    Command-line executive portal for the Chairperson of the Board to govern 
    all subsidiaries, review C-Suite intelligence, issue strategic mandates, 
    and ratify critical decision gates from your laptop.
.EXAMPLE
    .\chairperson.ps1 -Briefing
    .\chairperson.ps1 -OrgChart
    .\chairperson.ps1 -Status
    .\chairperson.ps1 -Gates
    .\chairperson.ps1 -Approve -GateId "GATE-001"
    .\chairperson.ps1 -Direct -Venture "TITAN Labs" -Title "Data Expansion" -Mandate "Scale retailer coverage to 25 marketplaces"
#>

param(
    [switch]$Briefing,
    [switch]$OrgChart,
    [switch]$Status,
    [switch]$Gates,
    [switch]$Approve,
    [string]$GateId,
    [switch]$Direct,
    [string]$Venture,
    [string]$Title,
    [string]$Mandate
)

$EcosystemRoot = "C:\AI_Ecosystem"
$GovEngine = Join-Path $EcosystemRoot "corporate-governance\engine.py"

if ($Briefing) {
    python $GovEngine --briefing
    return
}

if ($OrgChart) {
    python $GovEngine --org-chart
    return
}

if ($Gates) {
    python $GovEngine --gates
    return
}

if ($Approve) {
    if (-not $GateId) {
        Write-Host "Error: Please specify -GateId <GATE_ID>" -ForegroundColor Red
        return
    }
    python $GovEngine --approve $GateId
    return
}

if ($Direct) {
    if (-not $Venture -or -not $Title -or -not $Mandate) {
        Write-Host "Usage: .\chairperson.ps1 -Direct -Venture '<Unit>' -Title '<Title>' -Mandate '<Mandate>'" -ForegroundColor Yellow
        return
    }
    python $GovEngine --direct $Venture $Title $Mandate
    return
}

if ($Status) {
    python $GovEngine --status
    return
}

# Default output
python $GovEngine --status

Write-Host "Chairperson Executive Controls:" -ForegroundColor Cyan
Write-Host "  .\chairperson.ps1 -Briefing       -> Generate live C-Suite executive intelligence report"
Write-Host "  .\chairperson.ps1 -OrgChart       -> Render full corporate structure & reporting lines"
Write-Host "  .\chairperson.ps1 -Gates          -> Review pending decision gates awaiting Chairperson vote"
Write-Host "  .\chairperson.ps1 -Approve -GateId <ID> -> Formally ratify an executive decision gate"
Write-Host "  .\chairperson.ps1 -Direct -Venture '<Unit>' -Title '<Title>' -Mandate '<Mandate>'"
Write-Host "  .\chairperson.ps1 -Status         -> Quick operational dashboard of all subsidiaries"
