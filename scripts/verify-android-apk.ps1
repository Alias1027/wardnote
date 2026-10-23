[CmdletBinding()]
param(
  [string]$ToolsDirectory = (Join-Path (Split-Path $PSScriptRoot -Parent) '..\wardnote-android-buildtools'),
  [string]$JavaHome = '',
  [string]$AndroidSdk = '',
  [string]$Apk = '',
  [string]$PreviousApk = ''
)
$ErrorActionPreference = 'Stop'
$project = [IO.Path]::GetFullPath((Split-Path $PSScriptRoot -Parent))
$release = Get-Content -LiteralPath (Join-Path $project 'package.json') -Raw | ConvertFrom-Json
if (!$Apk) { $Apk = Join-Path $project ('artifacts\wardnote-android-' + $release.version + '.apk') }
$tools = [IO.Path]::GetFullPath($ToolsDirectory)
if (!$JavaHome) { $JavaHome = Join-Path $tools 'jdk\jdk-17.0.20.1+1' }
if (!$AndroidSdk) { $AndroidSdk = Join-Path $tools 'sdk' }
$java = Join-Path $JavaHome 'bin\java.exe'
$sdk = Join-Path $AndroidSdk 'build-tools\35.0.0'
$manifest = & (Join-Path $sdk 'aapt2.exe') dump xmltree $Apk --file AndroidManifest.xml
if ($LASTEXITCODE) { throw 'Unable to inspect packaged manifest.' }
$manifestText = $manifest -join "`n"
foreach ($required in @('package="org.wardnote.offline.preview"','minSdkVersion\(.*\)=26','targetSdkVersion\(.*\)=35','debuggable\(.*\)=false','allowBackup\(.*\)=false','usesCleartextTraffic\(.*\)=false','supportsRtl\(.*\)=true')) {
  if ($manifestText -notmatch $required) { throw "Manifest requirement missing: $required" }
}
if ($manifestText -match 'E: uses-permission') { throw 'This offline preview must not request Android permissions.' }
if ($manifestText -notmatch ('versionCode\(.*\)=' + $release.androidVersionCode + '(\s|$)') -or $manifestText -notmatch [regex]::Escape($release.version)) { throw 'Packaged version does not match package.json.' }
$signature = & $java -jar (Join-Path $sdk 'lib\apksigner.jar') verify --verbose --print-certs $Apk
if ($LASTEXITCODE) { throw 'Signature verification failed.' }
& (Join-Path $sdk 'zipalign.exe') -c -p 4 $Apk
if ($LASTEXITCODE) { throw 'APK alignment failed.' }
$upgrade = $null
if ($PreviousApk) {
  $previousSignature = & $java -jar (Join-Path $sdk 'lib\apksigner.jar') verify --verbose --print-certs $PreviousApk
  if ($LASTEXITCODE) { throw 'Previous APK signature is invalid.' }
  $oldManifest = (& (Join-Path $sdk 'aapt2.exe') dump xmltree $PreviousApk --file AndroidManifest.xml) -join "`n"
  if ($LASTEXITCODE) { throw 'Cannot read previous APK manifest.' }
  $certPattern = 'Signer #1 certificate SHA-256 digest: ([a-f0-9]+)'
  $oldCert = [regex]::Match(($previousSignature -join "`n"),$certPattern).Groups[1].Value
  $newCert = [regex]::Match(($signature -join "`n"),$certPattern).Groups[1].Value
  $oldCode = [regex]::Match($oldManifest,'versionCode\(.*\)=(\d+)').Groups[1].Value
  if (!$oldCert -or $oldCert -ne $newCert -or !$oldCode -or [int]$oldCode -ge $release.androidVersionCode -or $oldManifest -notmatch 'package="org.wardnote.offline.preview"') { throw 'Unsafe update identity, signature or versionCode.' }
  $upgrade = [ordered]@{previousApk=[IO.Path]::GetFileName($PreviousApk); previousSha256=(Get-FileHash -LiteralPath $PreviousApk -Algorithm SHA256).Hash.ToLowerInvariant(); previousVersionCode=[int]$oldCode; currentVersionCode=$release.androidVersionCode; samePackageAndSigningCertificate=$true; certificateSha256=$newCert; scope='Package metadata verification; Android installation/update runtime not tested'}
}
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [IO.Compression.ZipFile]::OpenRead($Apk)
$checked = 0
$expected = @{}
try {
  $web = Join-Path $project 'web'
  foreach ($file in Get-ChildItem -LiteralPath $web -Recurse -File) {
    $relative = $file.FullName.Substring($web.Length + 1).Replace('\','/')
    $name = 'assets/web/' + $relative
    $expected[$name] = $true
    $entry = $archive.GetEntry($name)
    if (!$entry) { throw "Bundled web asset missing: $relative" }
    $stream = $entry.Open()
    $sha = [Security.Cryptography.SHA256]::Create()
    try { $actualHash = [BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-','').ToLowerInvariant() }
    finally { $sha.Dispose(); $stream.Dispose() }
    $expectedHash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actualHash -ne $expectedHash) { throw "Bundled asset differs from source: $relative" }
    $checked++
  }
  foreach ($entry in $archive.Entries) {
    if ($entry.FullName.StartsWith('assets/web/') -and !$expected.ContainsKey($entry.FullName)) { throw "Unexpected web asset: $($entry.FullName)" }
    if ($entry.FullName -match '(?i)\.(p12|jks|keystore|db|sqlite)$|password\.txt|patient-data') { throw "Private file found in APK: $($entry.FullName)" }
  }
  foreach ($locale in @('ar','es','fr','hi','ru','ur')) {
    if (!$archive.GetEntry('assets/web/locales/' + $locale + '.js')) { throw "Locale asset missing: $locale" }
  }
} finally { $archive.Dispose() }
$hash = (Get-FileHash -LiteralPath $Apk -Algorithm SHA256).Hash.ToLowerInvariant()
$sidecar = (Get-Content -LiteralPath ($Apk + '.sha256') -Raw).Split(' ')[0].Trim()
if ($hash -ne $sidecar) { throw 'APK checksum sidecar mismatch.' }
$report = [ordered]@{
  version = $release.version
  versionCode = $release.androidVersionCode
  upgrade = $upgrade
  checkedAt = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK')
  file = [IO.Path]::GetFileName($Apk)
  bytes = (Get-Item -LiteralPath $Apk).Length
  sha256 = $hash
  webAssetsByteMatched = $checked
  packageName = 'org.wardnote.offline.preview'
  minimumSdk = 26
  targetSdk = 35
  requestedPermissions = @()
  debuggable = $false
  automaticBackup = $false
  cleartextTraffic = $false
  signatureVerification = ($signature -join "`n")
  zipAlignment = 'passed'
  scope = 'Host-side package verification only; no emulator, real Android device, clinical or OEM recorder validation.'
}
$report | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $project 'logs\android-apk-verification.json') -Encoding utf8
Write-Output "APK verified: $checked bundled web assets match source byte-for-byte; no requested Android permissions; signature/alignment/SHA256 passed."
