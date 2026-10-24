$ErrorActionPreference = 'Stop'
$taskRoot = $PSScriptRoot
$taskStatePath = Join-Path $taskRoot 'work\server-process.json'
if (-not (Test-Path -LiteralPath $taskStatePath)) { Write-Output 'No managed WardNote process.'; exit }
$taskState = Get-Content -LiteralPath $taskStatePath -Raw -Encoding UTF8 | ConvertFrom-Json
$taskProcess = Get-Process -Id $taskState.pid -ErrorAction SilentlyContinue
if (-not $taskProcess) { Write-Output 'WardNote is already stopped.'; exit }
$taskCommand = Get-CimInstance Win32_Process -Filter ('ProcessId=' + [int]$taskState.pid)
$taskExpectedServer = Join-Path $taskRoot 'app\server.mjs'
$taskExpectedCommand = '^"?' + [regex]::Escape([string]$taskState.node) + '"?\s+"' + [regex]::Escape($taskExpectedServer) + '"\s*$'
if ($taskState.server -ne $taskExpectedServer -or $taskProcess.Path -ne $taskState.node -or -not $taskCommand -or $taskCommand.CommandLine -notmatch $taskExpectedCommand) { throw 'PID belongs to a different process; not stopping it.' }
# PowerShell 7 may deserialize ISO timestamps as DateTime; PowerShell 5 keeps strings.
if ($taskState.startedUtcTicks) {
  $taskExpectedTicks = [long]$taskState.startedUtcTicks
} elseif ($taskState.started -is [DateTime]) {
  $taskExpectedTicks = $taskState.started.ToUniversalTime().Ticks
} else {
  $taskExpectedTicks = [DateTimeOffset]::Parse([string]$taskState.started).UtcDateTime.Ticks
}
if ($taskProcess.StartTime.ToUniversalTime().Ticks -ne $taskExpectedTicks) { throw 'Process start time differs; not stopping it.' }
Stop-Process -Id $taskProcess.Id
Remove-Item -LiteralPath $taskStatePath
Write-Output 'WardNote stopped. Saved records remain in the data directory.'
