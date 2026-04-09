param(
    [string]$RepoPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
    [int]$IntervalMs = 5000,
    [string]$NodePath = 'node',
    [switch]$IncludeUntracked
)

$ErrorActionPreference = 'Stop'

if ($IntervalMs -lt 1000) {
    throw 'IntervalMs must be >= 1000.'
}

if (-not (Test-Path $RepoPath)) {
    throw "RepoPath does not exist: $RepoPath"
}

Set-Location $RepoPath

if (-not (Test-Path (Join-Path $RepoPath '.git'))) {
    throw "Not a git repository: $RepoPath"
}

$env:AUTO_SYNC_INTERVAL_MS = "$IntervalMs"
$env:AUTO_SYNC_INCLUDE_UNTRACKED = if ($IncludeUntracked) { '1' } else { '0' }

$logDir = Join-Path $RepoPath 'logs'
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

$logFile = Join-Path $logDir 'auto-sync.log'
$startText = "[{0}] Starting auto-sync process in {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $RepoPath
$startText | Out-File -FilePath $logFile -Append -Encoding UTF8

$scriptPath = Join-Path $RepoPath 'scripts\auto-sync-github.js'
if (-not (Test-Path $scriptPath)) {
    throw "Missing script: $scriptPath"
}

& $NodePath $scriptPath *>> $logFile
