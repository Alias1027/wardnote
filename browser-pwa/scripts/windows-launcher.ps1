# SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
# Shared by the Windows control window and its non-interactive checks.
function Get-WardNoteLauncherSettings {
  param([Parameter(Mandatory = $true)][string]$Root)
  $configPath = Join-Path $Root 'config.local.json'
  $config = if (Test-Path -LiteralPath $configPath) { Get-Content -LiteralPath $configPath -Raw -Encoding UTF8 | ConvertFrom-Json } else { $null }
  $port = if ($env:NOTE_PORT) { [int]$env:NOTE_PORT } elseif ($config.port) { [int]$config.port } else { 8787 }
  $address = if ($config.publicOrigin) { [string]$config.publicOrigin } else { 'http://127.0.0.1:' + $port }
  $data = if ($env:NOTE_DATA_DIR) { $env:NOTE_DATA_DIR } else { Join-Path $Root 'data' }
  [pscustomobject]@{ Address = $address; DataDirectory = $data; ProcessFile = (Join-Path $Root 'work\server-process.json') }
}

function Get-WardNoteLauncherAdvice {
  param([string]$Details)
  if ($Details -match 'different WardNote version') {
    return '此地址正在运行另一版本。请先保存文字和录音，再从旧版本所在文件夹停止服务，然后重试。 / Another version is running. Save text and recordings, stop it from its own folder, then retry.'
  }
  if ($Details -match 'Portable runtime|symbolic links|64-bit Windows') {
    return '便携包不完整、不匹配或不支持此电脑。请从可信来源重新取得完整 Windows 64 位便携包，解压到新文件夹；保留原 data 文件夹。 / Obtain the complete verified Windows x64 portable ZIP and extract to a new folder. Preserve the original data folder.'
  }
  if ($Details -match 'Node.js|node.exe') {
    return '此文件夹没有可用的运行环境。请使用包含 runtime 文件夹的 Windows 64 位便携包。 / Use the Windows x64 portable package that includes the runtime folder.'
  }
  if ($Details -match 'Service did not start|EADDRINUSE|address already in use') {
    return '服务未能启动，可能是地址已被占用。请查看 logs\server-error.log；若另一份 WardNote 正在运行，请先保存工作并从其原文件夹停止。本程序不会自动换端口。 / Check logs\server-error.log. If another copy is running, save work and stop it from its own folder. The port is never changed automatically.'
  }
  if ($Details -match 'different process|start time differs') {
    return '记录的进程与当前进程不一致，因此未停止任何进程。请从正在运行的版本所在文件夹停止。 / The recorded process does not match; nothing was stopped. Use the running copy''s folder.'
  }
  if ($Details -match 'another folder|managed process|already running with different settings') {
    return '此地址已有服务，或本文件夹的服务使用了不同设置。请先保存工作，从启动它的原文件夹停止，再重试。 / This address is already in use, or this folder is running with different settings. Save work and stop that service from its original folder, then retry.'
  }
  return '请确认已完整解压到可写的本地文件夹，并查看下方详情。保留 data 文件夹和 config.local.json，再将错误信息提供给维护人员。 / Extract the full package into a writable local folder. Preserve data and config.local.json, and share the error details with your support contact.'
}

function Start-WardNoteLauncherService {
  param([Parameter(Mandatory = $true)][string]$Root)
  # The established launcher owns runtime verification, origin, data and process state.
  $settings = Get-WardNoteLauncherSettings -Root $Root
  $hasher = [Security.Cryptography.SHA256]::Create()
  try { $identity = [BitConverter]::ToString($hasher.ComputeHash([Text.Encoding]::UTF8.GetBytes($settings.Address.ToLowerInvariant()))).Replace('-', '') } finally { $hasher.Dispose() }
  $mutex = New-Object Threading.Mutex($false, ('Local\WardNote.Launch.' + $identity))
  $locked = $false
  try {
    try { $locked = $mutex.WaitOne(60000) } catch [Threading.AbandonedMutexException] { $locked = $true }
    if (-not $locked) { throw 'Another startup is still in progress. Wait a moment and retry.' }
    & (Join-Path $Root '启动应用.ps1') -NoBrowser -RequireOwnedProcess
  } finally {
    if ($locked) { $mutex.ReleaseMutex() }
    $mutex.Dispose()
  }
}

function Stop-WardNoteLauncherService {
  param([Parameter(Mandatory = $true)][string]$Root, [switch]$SavedWorkConfirmed)
  if (-not $SavedWorkConfirmed) { throw 'Save text and recordings, then explicitly confirm before stopping WardNote.' }
  & (Join-Path $Root '停止应用.ps1')
}

function New-WardNoteDesktopShortcut {
  param([Parameter(Mandatory = $true)][string]$Root)
  $desktop = [Environment]::GetFolderPath('DesktopDirectory')
  if (-not $desktop -or -not (Test-Path -LiteralPath $desktop)) { throw 'Desktop folder is unavailable. Keep using Start-WardNote.cmd in the application folder.' }
  $destination = Join-Path $desktop 'WardNote.lnk'
  if (Test-Path -LiteralPath $destination) { throw 'WardNote.lnk already exists on the desktop. It was not replaced. Keep using it, or remove it yourself before creating a new shortcut.' }
  $shell = New-Object -ComObject WScript.Shell
  try {
    $shortcut = $shell.CreateShortcut($destination)
    $shortcut.TargetPath = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
    $shortcut.Arguments = '-NoProfile -ExecutionPolicy Bypass -STA -WindowStyle Hidden -File "' + (Join-Path $Root 'Start-WardNote.ps1') + '"'
    $shortcut.WorkingDirectory = $Root
    $shortcut.Description = 'WardNote - start and open / 启动并打开'
    $shortcut.WindowStyle = 7
    $shortcut.Save()
  } finally {
    if ($shortcut) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($shortcut) }
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($shell)
  }
  return $destination
}
