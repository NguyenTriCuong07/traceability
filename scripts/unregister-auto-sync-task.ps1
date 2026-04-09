param(
    [string]$TaskName = 'TraceabilityAutoSync'
)

$ErrorActionPreference = 'Stop'

$null = schtasks /Delete /F /TN $TaskName
Write-Host "Task '$TaskName' deleted."
