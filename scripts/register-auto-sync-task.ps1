param(
    [string]$TaskName = 'TraceabilityAutoSync',
    [string]$RepoPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
    [int]$IntervalMs = 5000,
    [switch]$IncludeUntracked,
    [switch]$StartNow
)

$ErrorActionPreference = 'Stop'

if ($IntervalMs -lt 1000) {
    throw 'IntervalMs must be >= 1000.'
}

if (-not (Test-Path $RepoPath)) {
    throw "RepoPath does not exist: $RepoPath"
}

$nodeCommand = Get-Command node -ErrorAction Stop
$nodePath = $nodeCommand.Source
$runnerPath = Join-Path $PSScriptRoot 'run-auto-sync.ps1'

if (-not (Test-Path $runnerPath)) {
    throw "Missing runner script: $runnerPath"
}

$includeArg = if ($IncludeUntracked) { ' -IncludeUntracked' } else { '' }
$taskArgument = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$runnerPath`" -RepoPath `"$RepoPath`" -IntervalMs $IntervalMs -NodePath `"$nodePath`"$includeArg"

$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument $taskArgument
$trigger = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERNAME"
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Hours 0)
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null
Write-Host "Task '$TaskName' created/updated for user $env:USERDOMAIN\$env:USERNAME"

if ($StartNow) {
    Start-ScheduledTask -TaskName $TaskName
    Write-Host "Task '$TaskName' started."
}

Write-Host "Check logs at: $(Join-Path $RepoPath 'logs\\auto-sync.log')"
