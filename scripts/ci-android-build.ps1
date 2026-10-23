[CmdletBinding()]
param(
  [string]$JavaHome = $env:WARDNOTE_JAVA_HOME,
  [string]$AndroidSdk = $env:ANDROID_HOME,
  [string]$TemporaryRoot = $env:RUNNER_TEMP
)
$ErrorActionPreference = 'Stop'
$project = [IO.Path]::GetFullPath((Split-Path $PSScriptRoot -Parent))
if (!$JavaHome) { $JavaHome = $env:JAVA_HOME_17_X64 }
if (!$JavaHome) { throw 'Set WARDNOTE_JAVA_HOME or pass -JavaHome for JDK 17.' }
if (!$AndroidSdk) { $AndroidSdk = $env:ANDROID_SDK_ROOT }
if (!$AndroidSdk) { throw 'Set ANDROID_HOME or pass -AndroidSdk for SDK Platform 35 and Build Tools 35.0.0.' }
$javac = Join-Path $JavaHome 'bin\javac.exe'
$javaVersion = (& $javac -version 2>&1) -join "`n"
if ($LASTEXITCODE -ne 0 -or $javaVersion -notmatch '^javac 17\.') { throw 'This CI workflow requires JDK 17.' }
if (!$TemporaryRoot) { $TemporaryRoot = Join-Path $project '.test-tmp' }
$temporary = [IO.Path]::GetFullPath($TemporaryRoot)
if (Test-Path -LiteralPath $temporary) {
  if ((Get-Item -LiteralPath $temporary -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Linked temporary root refused.' }
}
New-Item -ItemType Directory -Path $temporary -Force | Out-Null
$run = Join-Path $temporary ('wardnote-ci-' + [guid]::NewGuid().ToString('N'))
$isolatedProject = Join-Path $run 'project'
$privateDirectory = Join-Path $run 'temporary-signing'
$oldTemp = $env:TEMP; $oldTmp = $env:TMP
try {
  foreach ($directory in @($isolatedProject,$privateDirectory,(Join-Path $isolatedProject 'scripts'),(Join-Path $isolatedProject 'logs'))) { New-Item -ItemType Directory -Path $directory -Force | Out-Null }
  foreach ($name in @('android','web')) { Copy-Item -LiteralPath (Join-Path $project $name) -Destination (Join-Path $isolatedProject $name) -Recurse }
  Copy-Item -LiteralPath (Join-Path $project 'package.json') -Destination (Join-Path $isolatedProject 'package.json')
  foreach ($name in @('build-android.ps1','verify-android-apk.ps1')) { Copy-Item -LiteralPath (Join-Path $project ('scripts\' + $name)) -Destination (Join-Path $isolatedProject ('scripts\' + $name)) }
  $key = Join-Path $privateDirectory 'temporary-ci-identity.p12'
  $passwordFile = Join-Path $privateDirectory 'password.txt'
  # Explicit new, isolated identity. Never reads a maintainer signing key or password.
  & (Join-Path $isolatedProject 'scripts\build-android.ps1') -ToolsDirectory (Join-Path $run 'tools') -JavaHome $JavaHome -AndroidSdk $AndroidSdk -SigningKey $key -SigningPasswordFile $passwordFile -CreatePreviewKey
  & (Join-Path $isolatedProject 'scripts\verify-android-apk.ps1') -ToolsDirectory (Join-Path $run 'tools') -JavaHome $JavaHome -AndroidSdk $AndroidSdk
  $report = Get-Content -LiteralPath (Join-Path $isolatedProject 'logs\android-apk-verification.json') -Raw | ConvertFrom-Json
  $report | Add-Member -NotePropertyName signingPurpose -NotePropertyValue 'Ephemeral CI identity, not a released upgrade-signing identity. APK/key/password are deleted after checks.'
  $report | Add-Member -NotePropertyName sourceArtifactsUntouched -NotePropertyValue $true
  New-Item -ItemType Directory -Path (Join-Path $project 'logs') -Force | Out-Null
  $report | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $project 'logs\ci-android-build-results.json') -Encoding utf8
  Write-Output 'Isolated compile, temporary signature and APK verification passed. No release signing material was used.'
} finally {
  $env:TEMP = $oldTemp; $env:TMP = $oldTmp
  if (Test-Path -LiteralPath $run) {
    $resolved = (Resolve-Path -LiteralPath $run).Path
    if (!$resolved.StartsWith($temporary.TrimEnd('\') + '\',[StringComparison]::OrdinalIgnoreCase) -or (Split-Path $resolved -Leaf) -notmatch '^wardnote-ci-[0-9a-f]{32}$') { throw 'Refusing cleanup outside the generated CI directory.' }
    if ((Get-Item -LiteralPath $resolved -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Refusing linked CI directory cleanup.' }
    if (@(Get-ChildItem -LiteralPath $resolved -Recurse -Force | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }).Count) { throw 'Refusing CI cleanup containing a linked path.' }
    Remove-Item -LiteralPath $resolved -Recurse -Force
  }
}
