param([switch]$NoBrowser, [switch]$RequireOwnedProcess)
$ErrorActionPreference = 'Stop'
$taskRoot = $PSScriptRoot
$taskServer = Join-Path $taskRoot 'app\server.mjs'
$taskLogDir = Join-Path $taskRoot 'logs'
$taskConfigPath = Join-Path $taskRoot 'config.local.json'
$taskConfig = if (Test-Path -LiteralPath $taskConfigPath) { Get-Content -LiteralPath $taskConfigPath -Raw -Encoding UTF8 | ConvertFrom-Json } else { $null }
$taskPort = if ($env:NOTE_PORT) { [int]$env:NOTE_PORT } elseif ($taskConfig.port) { [int]$taskConfig.port } else { 8787 }
$taskUrl = if ($taskConfig.publicOrigin) { $taskConfig.publicOrigin } else { 'http://127.0.0.1:' + $taskPort }
function Get-WardNoteStartupStatus {
  param([int]$TimeoutMilliseconds = 2000)
  $request = [Net.HttpWebRequest]::Create($taskUrl.TrimEnd('/') + '/api/status')
  # A system proxy must not send a local health check away from this computer.
  if ($request.RequestUri.IsLoopback) { $request.Proxy = $null }
  $request.Timeout = $TimeoutMilliseconds
  $request.ReadWriteTimeout = $TimeoutMilliseconds
  $response = $request.GetResponse()
  try {
    $reader = New-Object IO.StreamReader($response.GetResponseStream())
    try { return ($reader.ReadToEnd() | ConvertFrom-Json) } finally { $reader.Dispose() }
  } finally { $response.Dispose() }
}
$taskPackage = Get-Content -LiteralPath (Join-Path $taskRoot 'app\package.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$taskExpectedVersion = [string]$taskPackage.version
if (-not $taskExpectedVersion) { throw 'Application version is missing. Extract the complete package again.' }
$taskBundledNode = Join-Path $taskRoot 'runtime\node\node.exe'
$taskPortableManifest = Join-Path $taskRoot 'portable-manifest.json'
$taskNode = $null
if ((Test-Path -LiteralPath $taskBundledNode) -or (Test-Path -LiteralPath $taskPortableManifest)) {
  if (-not (Test-Path -LiteralPath $taskBundledNode) -or -not (Test-Path -LiteralPath $taskPortableManifest)) { throw 'Portable runtime is incomplete. Extract the complete verified package again; saved records must be preserved.' }
  foreach ($taskRuntimePath in @((Join-Path $taskRoot 'runtime'), (Join-Path $taskRoot 'runtime\node'), $taskBundledNode, $taskPortableManifest)) {
    if ((Get-Item -LiteralPath $taskRuntimePath).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Portable runtime cannot use symbolic links or junctions.' }
  }
  $taskPortable = Get-Content -LiteralPath $taskPortableManifest -Raw -Encoding UTF8 | ConvertFrom-Json
  $taskExpectedNodeHash = '3602f2bb1a10f2cbab4c36886218a33c1ab3db87290e73b033c46c77147d0237'
  if ($taskPortable.format -ne 'wardnote-portable/1' -or $taskPortable.target -ne 'windows-x64' -or $taskPortable.runtime.executableSHA256 -ne $taskExpectedNodeHash -or (Get-FileHash -LiteralPath $taskBundledNode -Algorithm SHA256).Hash.ToLower() -ne $taskExpectedNodeHash) { throw 'Portable runtime verification failed. Do not use a substituted runtime.' }
  if (-not [Environment]::Is64BitOperatingSystem) { throw 'This portable package requires 64-bit Windows.' }
  $taskNode = $taskBundledNode
}
$taskExisting = $false
$taskStatus = $null
$taskStatePath = Join-Path $taskRoot 'work\server-process.json'
$taskOwnedRunning = $false
if ($RequireOwnedProcess -and (Test-Path -LiteralPath $taskStatePath)) {
  $taskRecorded = Get-Content -LiteralPath $taskStatePath -Raw -Encoding UTF8 | ConvertFrom-Json
  $taskRecordedProcess = Get-Process -Id $taskRecorded.pid -ErrorAction SilentlyContinue
  if ($taskRecordedProcess) {
    $taskRecordedCommand = Get-CimInstance Win32_Process -Filter ('ProcessId=' + [int]$taskRecorded.pid)
    $taskExpectedCommand = '^"?' + [regex]::Escape([string]$taskRecorded.node) + '"?\s+"' + [regex]::Escape($taskServer) + '"\s*$'
    if ($taskRecorded.server -ne $taskServer -or $taskRecordedProcess.Path -ne $taskRecorded.node -or $taskRecordedProcess.StartTime.ToUniversalTime().Ticks.ToString() -ne [string]$taskRecorded.startedUtcTicks -or -not $taskRecordedCommand -or $taskRecordedCommand.CommandLine -notmatch $taskExpectedCommand) { throw 'The managed process does not belong to this folder; no process was changed.' }
    $taskExpectedData = if ($env:NOTE_DATA_DIR) { $env:NOTE_DATA_DIR } else { Join-Path $taskRoot 'data' }
    if ($taskRecorded.port -and ([int]$taskRecorded.port -ne $taskPort -or $taskRecorded.origin -ne $taskUrl -or $taskRecorded.dataDirectory -ne $taskExpectedData)) { throw 'This folder is already running with different settings. Save work and stop its existing service first.' }
    $taskOwnedRunning = $true
  }
}
try { $taskStatus = Get-WardNoteStartupStatus } catch {}
if ($taskStatus -and $taskStatus.app -eq 'wardnote-local') {
  if ([string]$taskStatus.version -ne $taskExpectedVersion) { throw 'A different WardNote version is already running at this address. Save work and recordings, then stop the old service from its own installation before starting this package. No service was stopped automatically.' }
  if ($RequireOwnedProcess -and -not $taskOwnedRunning) { throw 'WardNote at this address was started by another folder or has no matching managed process. Save work and stop it from its original folder first.' }
  $taskExisting = $true
}
if (-not $taskExisting) {
  if ($taskOwnedRunning) { throw 'The managed process is running but is not ready at its configured address. See logs\server-error.log. No second service was started.' }
  if (-not $taskNode) {
    $taskCandidates = @($env:NOTE_NODE, $taskConfig.nodePath, (Join-Path $env:ProgramFiles 'nodejs\node.exe'))
    $taskNode = $taskCandidates | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1
  }
  if (-not $taskNode) { $taskCommand = Get-Command node.exe -ErrorAction SilentlyContinue; if ($taskCommand) { $taskNode = $taskCommand.Source } }
  if (-not $taskNode) { throw 'Node.js 24+ was not found. Install it or set NOTE_NODE to node.exe.' }
  $taskVersion = & $taskNode -p 'parseInt(process.versions.node)'
  if ([int]$taskVersion -lt 24) { throw 'Node.js 24 or later is required.' }
  New-Item -ItemType Directory -Path $taskLogDir -Force | Out-Null
  New-Item -ItemType Directory -Path (Join-Path $taskRoot 'work') -Force | Out-Null
  $taskProcess = Start-Process -FilePath $taskNode -ArgumentList @('"' + $taskServer + '"') -WorkingDirectory (Join-Path $taskRoot 'app') -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $taskLogDir 'server-output.log') -RedirectStandardError (Join-Path $taskLogDir 'server-error.log')
  $taskStartedUtc = $taskProcess.StartTime.ToUniversalTime()
  $taskDataDirectory = if ($env:NOTE_DATA_DIR) { $env:NOTE_DATA_DIR } else { Join-Path $taskRoot 'data' }
  @{ pid = $taskProcess.Id; server = $taskServer; node = $taskNode; started = $taskStartedUtc.ToString('o'); startedUtcTicks = $taskStartedUtc.Ticks.ToString(); port = $taskPort; origin = $taskUrl; dataDirectory = $taskDataDirectory } | ConvertTo-Json | Set-Content -LiteralPath $taskStatePath -Encoding utf8
  $taskReady = $false
  for ($taskTry = 0; $taskTry -lt 30; $taskTry++) {
    $taskProcess.Refresh()
    if ($taskProcess.HasExited) { break }
    try { $taskStatus = Get-WardNoteStartupStatus -TimeoutMilliseconds 1000; if ($taskStatus.app -eq 'wardnote-local' -and [string]$taskStatus.version -eq $taskExpectedVersion) { $taskReady = $true; break } } catch {}
    Start-Sleep -Milliseconds 300
  }
  if (-not $taskReady) {
    # Clean up only the child from this attempt; preserve other services and saved data.
    $taskProcess.Refresh()
    if (-not $taskProcess.HasExited) { Stop-Process -Id $taskProcess.Id; [void]$taskProcess.WaitForExit(5000) }
    if (Test-Path -LiteralPath $taskStatePath) {
      $taskFailedState = Get-Content -LiteralPath $taskStatePath -Raw -Encoding UTF8 | ConvertFrom-Json
      if ([int]$taskFailedState.pid -eq $taskProcess.Id -and $taskFailedState.startedUtcTicks -eq $taskStartedUtc.Ticks.ToString()) { Remove-Item -LiteralPath $taskStatePath }
    }
    throw ('Service did not start. See ' + (Join-Path $taskLogDir 'server-error.log'))
  }
}
Write-Output ('WardNote is ready: ' + $taskUrl)
$taskDataDirectory = if ($env:NOTE_DATA_DIR) { $env:NOTE_DATA_DIR } else { Join-Path $taskRoot 'data' }
Write-Output ('Data directory: ' + $taskDataDirectory)
if (-not $NoBrowser) { Start-Process $taskUrl }
